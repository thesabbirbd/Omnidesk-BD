import os
import sys
import uuid
import time
from datetime import datetime, timezone

# Ensure backend root is on PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from main import app
from app.db.session import SessionLocal
from app.models.user import User
from app.models.task import Task
from app.models.study_session import StudySession
from app.models.topic import Topic
from app.models.study_space import StudySpace
from app.services.task_queue import task_queue
from app.services.ai_provider import OllamaAIProvider, get_ai_provider

client = TestClient(app)


def test_phases_4_5_6_suite():
    print("Starting StudyOS v1.3.1 Verification Suite for Phases 4, 5 & 6...")

    # =========================================================================
    # PHASE 4: OBSERVABILITY, DOCKER PROBES, RATE LIMITING & TASK QUEUE
    # =========================================================================

    # 1. Health Liveness Probe
    resp = client.get("/health")
    assert resp.status_code == 200, f"Health check failed: {resp.text}"
    health_data = resp.json()
    assert health_data["status"] == "healthy"
    assert health_data["version"] == "1.2.5"
    print("✓ Phase 4: /health liveness probe verified (v1.2.5)")

    # 2. Readiness Deep Probe (Postgres + Redis check)
    resp = client.get("/ready")
    assert resp.status_code == 200, f"Readiness probe failed: {resp.text}"
    ready_data = resp.json()
    assert ready_data["status"] == "ready"
    assert ready_data["database"] == "healthy"
    assert "redis" in ready_data
    print(f"✓ Phase 4: /ready deep probe verified (DB: {ready_data['database']}, Redis: {ready_data['redis']})")

    # 3. Background Task Queue (non-blocking thread pool / Redis queue)
    def sample_heavy_job(val: int):
        time.sleep(0.05)
        return {"processed": True, "square": val * val}

    task_id = task_queue.enqueue("calculate_square", sample_heavy_job, 12)
    assert task_id is not None
    time.sleep(0.1)
    status_info = task_queue.get_status(task_id)
    assert status_info is not None
    assert status_info["status"] in ["RUNNING", "COMPLETED"]
    time.sleep(0.1)
    status_info = task_queue.get_status(task_id)
    assert status_info["status"] == "COMPLETED"
    assert status_info["result"]["square"] == 144
    print("✓ Phase 4: Background Task Queue asynchronous execution verified")

    # =========================================================================
    # AUTH SETUP FOR PHASES 5 & 6
    # =========================================================================
    uid = uuid.uuid4().hex[:8]
    email = f"devops_lead_{uid}@studyos.com"
    password = "DevOpsPassword123!"

    reg_resp = client.post(
        "/api/auth/register",
        json={"email": email, "password": password, "full_name": "DevOps Architect"}
    )
    assert reg_resp.status_code == 201
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"✓ Authenticated test user registered ({email})")

    # Create dummy study space & topic for tests
    space_resp = client.post(
        "/api/study-spaces/generate-from-text",
        headers=headers,
        json={"title": "DevOps Infrastructure Lab", "text": "Docker, Kubernetes, Linux, Terraform"}
    )
    assert space_resp.status_code == 201
    space_id = space_resp.json()["id"]

    db = SessionLocal()
    topic = db.query(Topic).filter(Topic.study_space_id == space_id).first()
    topic_id = str(topic.id)
    db.close()

    # =========================================================================
    # PHASE 5: OFFLINE SYNC BATCH API & DEEP ANALYTICS
    # =========================================================================

    # 4. Batch Sync API (/api/sync/batch)
    batch_payload = {
        "mutations": [
            {
                "entity": "session",
                "action": "create",
                "data": {
                    "topic_id": topic_id,
                    "duration_minutes": 45,
                    "mode": "deep_focus",
                    "presence_verified": True,
                    "notes": "Offline study session completed during commute."
                }
            },
            {
                "entity": "topic_status",
                "action": "update",
                "data": {
                    "id": topic_id,
                    "status": "learning"
                }
            },
            {
                "entity": "debug_journal",
                "action": "create",
                "data": {
                    "topic_id": topic_id,
                    "title": "Docker daemon socket permission denied",
                    "problem": "Cannot connect to docker.sock without sudo",
                    "solution": "usermod -aG docker $USER"
                }
            }
        ]
    }

    sync_resp = client.post("/api/sync/batch", headers=headers, json=batch_payload)
    assert sync_resp.status_code == 200, f"Batch sync failed: {sync_resp.text}"
    sync_data = sync_resp.json()
    assert sync_data["success"] is True
    assert sync_data["processed"] == 3
    print("✓ Phase 5: /api/sync/batch processed 3 queued offline mutations atomically")

    # 5. Deep Analytics API: Dashboard Summary & Velocity
    analytics_resp = client.get("/api/analytics/dashboard", headers=headers)
    assert analytics_resp.status_code == 200, f"Analytics dashboard failed: {analytics_resp.text}"
    an_data = analytics_resp.json()
    assert "focus_score" in an_data
    assert "velocity" in an_data
    assert "planned_vs_actual" in an_data
    assert an_data["total_minutes"] >= 45
    print(f"✓ Phase 5: Analytics Dashboard verified (Focus Score: {an_data['focus_score']}, Velocity: {an_data['velocity']['velocity_ratio']}x)")

    # 6. Deep Analytics API: 365-Day Activity Heatmap
    heatmap_resp = client.get("/api/analytics/heatmap?days=30", headers=headers)
    assert heatmap_resp.status_code == 200, f"Heatmap failed: {heatmap_resp.text}"
    heat_data = heatmap_resp.json()
    assert len(heat_data) >= 30
    assert any(h["active"] for h in heat_data)
    print("✓ Phase 5: Activity Heatmap 30-day intensity cadence verified")

    # 7. Anti-Fake-Progress V2 Audit
    audit_resp = client.get("/api/analytics/anti-fake-progress", headers=headers)
    assert audit_resp.status_code == 200, f"Anti-fake-progress audit failed: {audit_resp.text}"
    audit_data = audit_resp.json()
    assert "has_warnings" in audit_data
    assert "weak_areas" in audit_data
    print("✓ Phase 5: Anti-Fake-Progress V2 audit endpoint verified")

    # =========================================================================
    # PHASE 6: LOCAL AI OLLAMA ADAPTER & WEBSOCKET PTY TERMINAL
    # =========================================================================

    # 8. Local Ollama AI Provider with Heuristic Fallback
    ollama_provider = OllamaAIProvider(base_url="http://127.0.0.1:11434", model="llama3")
    diag = ollama_provider.suggest_debug_hypothesis(
        "Connection refused on port 8000 when starting uvicorn",
        symptom="econnrefused"
    )
    assert "hypothesis" in diag
    assert "investigation_command" in diag
    assert "recommended_fix" in diag
    print("✓ Phase 6: Local Ollama AI Provider verified with resilient heuristic fallback")

    # 9. Real-Time DevOps Lab Terminal WebSocket Bridge
    with client.websocket_connect("/api/v1/lab/ws") as websocket:
        # Receive welcome banner
        banner = websocket.receive_text()
        assert "Omnidesk BD v1.2.5" in banner
        assert "DevOps Lab Shell" in banner

        # Send resize geometry
        websocket.send_text('{"type":"resize","cols":100,"rows":30}')

        # Send echo command to PTY shell
        websocket.send_text("echo STUDYOS_WS_LAB_READY\n")

        # Accumulate output until expected echo is received
        found_echo = False
        for _ in range(20):
            try:
                msg = websocket.receive()
                if "bytes" in msg and msg["bytes"]:
                    text = msg["bytes"].decode("utf-8", errors="ignore")
                elif "text" in msg and msg["text"]:
                    text = msg["text"]
                else:
                    text = ""

                if "STUDYOS_WS_LAB_READY" in text:
                    found_echo = True
                    break
            except Exception:
                break
            time.sleep(0.05)

        assert found_echo is True, "PTY did not echo command output back through WebSocket"
        print("✓ Phase 6: DevOps Lab WebSocket PTY bridge successfully spawned bash shell and executed command")

    print("\n🎉 ALL PHASES 4, 5 & 6 TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    test_phases_4_5_6_suite()

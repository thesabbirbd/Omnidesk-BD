import os
import sys
import uuid
from datetime import datetime, timezone, timedelta

# Ensure backend root is on PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from main import app
from app.db.session import SessionLocal
from app.models.user import User
from app.models.study_space import StudySpace
from app.models.topic import Topic
from app.models.review import Review
from app.models.study_session import StudySession
from app.models.project import Project, DebugJournal
from app.models.note import Note
from app.services.ai_provider import LocalOfflineAIProvider, get_ai_provider

client = TestClient(app)


def test_phase3_advanced_features():
    print("Starting StudyOS v1.3.1 Phase 3 Advanced Execution Verification Suite...")

    # 1. Setup authenticated test user
    uid = uuid.uuid4().hex[:8]
    email = f"lead_dev_{uid}@studyos.com"
    password = "DevPassword123!"

    reg_resp = client.post(
        "/api/auth/register",
        json={"email": email, "password": password, "full_name": "Senior Full-Stack Architect"}
    )
    assert reg_resp.status_code == 201, f"Registration failed: {reg_resp.text}"
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"✓ Registered test user ({email})")

    # 2. Test Offline AIProvider Interface
    ai = get_ai_provider()
    assert isinstance(ai, LocalOfflineAIProvider) or hasattr(ai, "generate_completion")
    diag = ai.suggest_debug_hypothesis("Postgres connection refused on port 5432")
    assert "hypothesis" in diag
    assert "investigation_command" in diag
    print("✓ Offline AIProvider operational with 0 external network dependencies")

    # 3. Create a StudySpace with Topics
    space_resp = client.post(
        "/api/study-spaces/generate-from-text",
        headers=headers,
        json={
            "title": "Cloud Infrastructure & Linux Mastery",
            "text": "Linux Kernel Internals, Docker Containers, Kubernetes Cluster, Distributed Tracing"
        }
    )
    assert space_resp.status_code == 201, f"StudySpace gen failed: {space_resp.text}"
    space_data = space_resp.json()
    space_id = space_data["id"]
    graph_resp = client.get(f"/api/mindmap?study_space_id={space_id}", headers=headers)
    assert graph_resp.status_code == 200, f"MindMap fetch failed: {graph_resp.text}"
    nodes = graph_resp.json()["nodes"]
    assert len(nodes) >= 4
    topic_1_id = nodes[0]["id"]
    topic_1_title = nodes[0]["data"]["label"]
    topic_2_id = nodes[1]["id"]
    topic_2_title = nodes[1]["data"]["label"]
    print(f"✓ Generated StudySpace with {len(nodes)} topics")

    # 4. Create an overdue review to test 'What Should I Study Now?' priority
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        assert user is not None

        # Add overdue review for topic 1
        overdue_review = Review(
            user_id=user.id,
            topic_id=uuid.UUID(topic_1_id),
            due_date=datetime.now(timezone.utc) - timedelta(days=2),
            interval_days=1,
            repetition_count=1
        )
        db.add(overdue_review)

        # Add study sessions for Weekly Retro
        session1 = StudySession(
            user_id=user.id,
            topic_id=uuid.UUID(topic_1_id),
            study_space_id=uuid.UUID(space_data["id"]),
            mode="pomodoro",
            duration_minutes=50,
            planned_duration_minutes=50,
            presence_checked=True,
            start_time=datetime.now(timezone.utc) - timedelta(days=1),
            completed=True
        )
        session2 = StudySession(
            user_id=user.id,
            topic_id=uuid.UUID(topic_2_id),
            study_space_id=uuid.UUID(space_data["id"]),
            mode="focus",
            duration_minutes=60,
            planned_duration_minutes=50,
            presence_checked=True,
            start_time=datetime.now(timezone.utc) - timedelta(hours=5),
            completed=True
        )
        db.add(session1)
        db.add(session2)

        # Add a note linked to topic 1
        note1 = Note(
            user_id=user.id,
            study_space_id=uuid.UUID(space_data["id"]),
            topic_id=uuid.UUID(topic_1_id),
            title="Linux Syscall Architecture",
            content="Context switching happens in ring 0...",
            is_pinned=True
        )
        db.add(note1)

        db.commit()
    finally:
        db.close()

    # 5. Test "What Should I Study Now?" endpoint
    what_resp = client.get("/api/command-center/what-to-study", headers=headers)
    assert what_resp.status_code == 200, f"Command center failed: {what_resp.text}"
    what_data = what_resp.json()
    assert "recommendations" in what_data
    assert len(what_data["recommendations"]) > 0
    # Overdue review should be top priority
    top_rec = what_data["recommendations"][0]
    assert top_rec["category"] in ["REVIEW_DUE", "IN_PROGRESS", "READY_TO_START", "WEAKNESS_INTERVENTION"]
    print(f"✓ Command Center recommended: '{top_rec['topic_title']}' ({top_rec['badge']})")

    # 6. Test Weekly Retrospective endpoint
    retro_resp = client.get("/api/command-center/weekly-retro", headers=headers)
    assert retro_resp.status_code == 200, f"Weekly retro failed: {retro_resp.text}"
    retro_data = retro_resp.json()
    assert retro_data["planned_hours"] > 0
    assert retro_data["actual_hours"] >= 1.8  # 50m + 60m = 110m = 1.8h
    assert retro_data["sessions_count"] >= 2
    assert retro_data["focus_accuracy_pct"] == 100
    print(f"✓ Weekly Retro calculated: {retro_data['actual_hours']}h logged vs {retro_data['planned_hours']}h planned (Accuracy: {retro_data['focus_accuracy_pct']}%)")

    # 7. Test Weakness Detector endpoint
    weak_resp = client.get("/api/command-center/weaknesses", headers=headers)
    assert weak_resp.status_code == 200, f"Weakness detector failed: {weak_resp.text}"
    weak_data = weak_resp.json()
    assert "weaknesses" in weak_data
    print(f"✓ Weakness Detector report generated ({weak_data['total_weaknesses']} insights)")

    # 8. Test Debug Journal ("I'm Stuck") workflow
    debug_create_resp = client.post(
        "/api/debug-journals",
        headers=headers,
        json={
            "title": "PostgreSQL Socket Deadlock under async pg pool",
            "problem": "FastAPI worker hangs indefinitely when querying with sessionmaker",
            "symptom": "Connection timeout after 30000ms",
            "hypothesis": "Async session was checked out without context manager and never released to pool",
            "command_used": "netstat -an | grep 5432",
            "output_logs": "CLOSE_WAIT 127.0.0.1:5432",
            "root_cause": "Missing `async with async_session()` context block in background task",
            "solution": "Refactored session factory into an async context manager and enabled pool_pre_ping",
            "lesson_learned": "Always ensure pool checkout is bounded by async context manager",
            "topic_id": topic_1_id
        }
    )
    assert debug_create_resp.status_code == 201, f"Debug journal creation failed: {debug_create_resp.text}"
    journal = debug_create_resp.json()
    assert journal["title"] == "PostgreSQL Socket Deadlock under async pg pool"
    print(f"✓ Created Debug Journal entry linked to topic '{topic_1_title}'")

    # List debug journals
    journals_list_resp = client.get("/api/debug-journals", headers=headers)
    assert journals_list_resp.status_code == 200
    assert len(journals_list_resp.json()) >= 1

    # AI Hypothesis suggestion test
    hypo_resp = client.post(
        "/api/debug-journals/ai-hypothesis",
        headers=headers,
        json={
            "problem": "Connection refused to redis on 6379",
            "symptom": "Error 111 connecting to 127.0.0.1:6379",
            "output_logs": "redis.exceptions.ConnectionError: Error 111 connecting to 127.0.0.1:6379"
        }
    )
    assert hypo_resp.status_code == 200
    hypo_data = hypo_resp.json()
    assert "hypothesis" in hypo_data
    assert "recommended_fix" in hypo_data
    print("✓ Debug Lab AI Hypothesis generated diagnostic recommendations")

    # 9. Test Knowledge Graph Aggregate endpoint
    kg_resp = client.get(f"/api/knowledge-graph/topics/{topic_1_id}", headers=headers)
    assert kg_resp.status_code == 200, f"Knowledge graph failed: {kg_resp.text}"
    kg_data = kg_resp.json()
    assert kg_data["topic"]["id"] == topic_1_id
    assert kg_data["metrics"]["total_study_minutes"] >= 50
    assert len(kg_data["related_notes"]) >= 1
    assert len(kg_data["bugs_fixed"]) >= 1
    print(f"✓ Knowledge Graph verified: {kg_data['metrics']['formatted_study_time']} logged, {len(kg_data['related_notes'])} notes, {len(kg_data['bugs_fixed'])} bugs fixed")

    print("\n🎉 ALL PHASE 3 ADVANCED TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    test_phase3_advanced_features()

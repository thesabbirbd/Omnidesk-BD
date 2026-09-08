import sys
import os
import uuid
from fastapi.testclient import TestClient

# Ensure backend root is on PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from app.db.session import SessionLocal
from app.models.user import User
from app.models.study_space import StudySpace
from app.models.topic import Topic, SourceType
from app.models.task import Task
from app.models.study_session import StudySession


def run_phase1_verification():
    client = TestClient(app)
    print("\n" + "=" * 60)
    print("🚀 Starting StudyOS v1.2.4 Phase 1 Comprehensive Verification Suite")
    print("=" * 60)

    # 1. Setup Test Users
    unique_suffix = uuid.uuid4().hex[:8]
    user_a_email = f"alice_{unique_suffix}@studyos.io"
    user_b_email = f"bob_{unique_suffix}@studyos.io"
    test_password = "Password123!"

    # Register User A
    resp_a = client.post("/api/v1/auth/register", json={
        "email": user_a_email,
        "password": test_password,
        "full_name": "Alice Architect"
    })
    assert resp_a.status_code == 201, f"Failed to register User A: {resp_a.text}"
    token_a = resp_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}
    user_a_id = resp_a.json()["user"]["id"]
    print(f"✓ Registered User A (UUID: {user_a_id})")

    # Register User B
    resp_b = client.post("/api/v1/auth/register", json={
        "email": user_b_email,
        "password": test_password,
        "full_name": "Bob Tenancy"
    })
    assert resp_b.status_code == 201, f"Failed to register User B: {resp_b.text}"
    token_b = resp_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}
    user_b_id = resp_b.json()["user"]["id"]
    print(f"✓ Registered User B (UUID: {user_b_id})")

    # =========================================================================
    # PACKET 1B: Multilingual Architecture
    # =========================================================================
    print("\n--- Testing Packet 1B: Multilingual Architecture ---")
    space_payload = {
        "title": "Cloud Native Architecture in Go & Kubernetes",
        "description": "Multilingual study track for distributed systems.",
        "category": "Backend / DevOps",
        "interface_language": "bn",
        "learning_language": "de",
        "source_language": "en"
    }
    space_resp = client.post("/api/v1/study-spaces", json=space_payload, headers=headers_a)
    assert space_resp.status_code == 201, f"Create space failed: {space_resp.text}"
    space_data = space_resp.json()
    space_id = space_data["id"]
    assert space_data["interface_language"] == "bn"
    assert space_data["learning_language"] == "de"
    assert space_data["source_language"] == "en"
    print(f"✓ StudySpace created with multilingual fields: interface=bn, learning=de, source=en")

    # Fetch detail and verify multilingual fields persist
    get_space_resp = client.get(f"/api/v1/study-spaces/{space_id}", headers=headers_a)
    assert get_space_resp.status_code == 200
    detail = get_space_resp.json()
    assert detail["interface_language"] == "bn"
    assert detail["learning_language"] == "de"
    assert detail["source_language"] == "en"
    print(f"✓ StudySpace GET /{space_id} correctly retrieved persisted multilingual metadata")

    # =========================================================================
    # PACKET 1D: Data Provenance (Topics & Tasks)
    # =========================================================================
    print("\n--- Testing Packet 1D: Data Provenance Metadata ---")
    topic_payload = {
        "study_space_id": space_id,
        "title": "Distributed Consensus & Raft",
        "description": "In-depth consensus algorithms and leader election.",
        "difficulty": "ADVANCED",
        "estimated_minutes": 90,
        "source_type": "SOURCE_EXTRACTED",
        "source_reference": "Designing Data-Intensive Applications, Page 312",
        "confidence_score": 0.98
    }
    topic_resp = client.post("/api/v1/topics", json=topic_payload, headers=headers_a)
    assert topic_resp.status_code == 201, f"Create topic failed: {topic_resp.text}"
    topic_data = topic_resp.json()
    topic_id = topic_data["id"]
    assert topic_data["user_id"] == user_a_id
    assert topic_data["source_type"] == "SOURCE_EXTRACTED"
    assert topic_data["source_reference"] == "Designing Data-Intensive Applications, Page 312"
    assert topic_data["confidence_score"] == 0.98
    print(f"✓ Topic created with provenance: source_type=SOURCE_EXTRACTED, confidence=0.98, user_id={user_a_id}")

    # Create Task with provenance
    task_payload = {
        "title": "Implement Leader Election in Raft Simulator",
        "topic_id": topic_id,
        "priority": 1,
        "estimated_minutes": 60,
        "source_type": "AI_INFERRED",
        "source_reference": "Raft paper section 5.2",
        "confidence_score": 0.89
    }
    task_resp = client.post("/api/v1/tasks", json=task_payload, headers=headers_a)
    assert task_resp.status_code == 201, f"Create task failed: {task_resp.text}"
    task_data = task_resp.json()
    task_id = task_data["id"]
    assert task_data["user_id"] == user_a_id
    assert task_data["source_type"] == "AI_INFERRED"
    assert task_data["source_reference"] == "Raft paper section 5.2"
    assert task_data["confidence_score"] == 0.89
    print(f"✓ Task created with provenance: source_type=AI_INFERRED, confidence=0.89, user_id={user_a_id}")

    # =========================================================================
    # PACKET 1C: User Isolation & Cross-Tenant Boundary Enforcement
    # =========================================================================
    print("\n--- Testing Packet 1C: User Isolation & Security Boundaries ---")
    
    # 1. User B tries to read User A's StudySpace -> must fail (404/403)
    hack_space = client.get(f"/api/v1/study-spaces/{space_id}", headers=headers_b)
    assert hack_space.status_code in (403, 404), f"Security breach! User B read User A's StudySpace: {hack_space.status_code}"
    print(f"✓ Cross-user StudySpace GET prevented (Status {hack_space.status_code})")

    # 2. User B tries to delete User A's StudySpace -> must fail
    hack_del_space = client.delete(f"/api/v1/study-spaces/{space_id}", headers=headers_b)
    assert hack_del_space.status_code in (403, 404)
    print(f"✓ Cross-user StudySpace DELETE prevented (Status {hack_del_space.status_code})")

    # 3. User B tries to read User A's Topic -> must fail
    hack_topic = client.get(f"/api/v1/topics/{topic_id}", headers=headers_b)
    assert hack_topic.status_code in (403, 404)
    print(f"✓ Cross-user Topic GET prevented (Status {hack_topic.status_code})")

    # 4. User B tries to update User A's Topic -> must fail
    hack_update_topic = client.put(f"/api/v1/topics/{topic_id}", json={"title": "Hacked Topic"}, headers=headers_b)
    assert hack_update_topic.status_code in (403, 404)
    print(f"✓ Cross-user Topic PUT prevented (Status {hack_update_topic.status_code})")

    # 5. User B tries to toggle or delete User A's Task -> must fail
    hack_task = client.patch(f"/api/v1/tasks/{task_id}/toggle", headers=headers_b)
    assert hack_task.status_code in (403, 404)
    print(f"✓ Cross-user Task toggle prevented (Status {hack_task.status_code})")

    hack_del_task = client.delete(f"/api/v1/tasks/{task_id}", headers=headers_b)
    assert hack_del_task.status_code in (403, 404)
    print(f"✓ Cross-user Task DELETE prevented (Status {hack_del_task.status_code})")

    # 6. User B tries to link a new task to User A's Topic -> must fail
    hack_create_task = client.post("/api/v1/tasks", json={
        "title": "Malicious Task on Alice Topic",
        "topic_id": topic_id
    }, headers=headers_b)
    assert hack_create_task.status_code in (403, 404)
    print(f"✓ Cross-user Task creation on foreign Topic prevented (Status {hack_create_task.status_code})")

    # 7. Start a StudySession for User A and verify User B cannot stop it
    sess_resp = client.post("/api/v1/sessions/start", json={
        "topic_id": topic_id,
        "mode": "pomodoro"
    }, headers=headers_a)
    assert sess_resp.status_code == 201, f"Session start failed: {sess_resp.text}"
    session_id = sess_resp.json()["id"]
    print(f"✓ User A started StudySession (UUID: {session_id})")

    hack_stop_sess = client.post(f"/api/v1/sessions/{session_id}/stop", headers=headers_b)
    assert hack_stop_sess.status_code in (403, 404)
    print(f"✓ Cross-user Session STOP prevented (Status {hack_stop_sess.status_code})")

    # =========================================================================
    # UserIsolationMiddleware Impersonation Detection
    # =========================================================================
    print("\n--- Testing UserIsolationMiddleware Impersonation Interception ---")
    
    # Send X-User-ID header that differs from token's sub
    impersonate_headers = {
        "Authorization": f"Bearer {token_b}",
        "X-User-ID": str(user_a_id)  # Bob claims to be Alice via header
    }
    impersonate_resp = client.get("/api/v1/topics", headers=impersonate_headers)
    assert impersonate_resp.status_code == 403, f"Expected 403, got {impersonate_resp.status_code}"
    assert "Cross-user tenant impersonation" in impersonate_resp.json()["detail"]
    print(f"✓ UserIsolationMiddleware blocked header impersonation attack with 403 Forbidden")

    # Send conflicting user_id query parameter
    query_hack_resp = client.get(f"/api/v1/topics?user_id={user_a_id}", headers=headers_b)
    assert query_hack_resp.status_code == 403
    assert "Cannot access or manipulate another user's resources" in query_hack_resp.json()["detail"]
    print(f"✓ UserIsolationMiddleware blocked query parameter tenancy mismatch with 403 Forbidden")

    # =========================================================================
    # Universal Course Generator Provenance Integration
    # =========================================================================
    print("\n--- Testing Course Generator Provenance Pipeline ---")
    gen_resp = client.post("/api/v1/study-spaces/generate-from-text", json={
        "text": "1. Docker Networking. 2. Kubernetes Services. 3. Istio Service Mesh.",
        "title": "Cloud Networking Track",
        "category": "DevOps & Cloud"
    }, headers=headers_a)
    assert gen_resp.status_code == 201, f"Generate from text failed: {gen_resp.text}"
    gen_space = gen_resp.json()
    assert gen_space["interface_language"] == "en"
    print(f"✓ Generator created StudySpace with provenance: {gen_space['title']}")

    # Check generated topics have provenance tags
    topics_list_resp = client.get(f"/api/v1/topics?study_space_id={gen_space['id']}", headers=headers_a)
    assert topics_list_resp.status_code == 200
    gen_topics = topics_list_resp.json()
    assert len(gen_topics) >= 2
    for gt in gen_topics:
        assert gt["user_id"] == user_a_id
        assert gt["source_type"] in ("AI_INFERRED", "USER_CREATED", "SOURCE_EXTRACTED")
        assert gt["confidence_score"] > 0.5
    print(f"✓ Generated {len(gen_topics)} topics verified with source_type and confidence scores")

    print("\n" + "=" * 60)
    print("🎉 ALL PHASE 1 COMPREHENSIVE VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    run_phase1_verification()

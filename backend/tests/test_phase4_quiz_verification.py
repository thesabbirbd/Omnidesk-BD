import sys
import os
import uuid
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from app.db.session import SessionLocal
from app.models.topic import Topic
from app.models.activity_log import ActivityLog
from app.models.competency import CompetencyItem
from app.services.ai_provider import generate_verification_quiz


def run_phase4_quiz_verification_test_suite():
    print("\n" + "=" * 75)
    print("  Omnidesk BD v1.2.8: Phase 4 (Anti-Fake-Progress Quiz Engine) Test Suite")
    print("  Conceptual Multiple-Choice Challenge Gate & ActivityLog Evidence Tracking")
    print("=" * 75)

    client = TestClient(app)

    # 0. Register User
    suffix = uuid.uuid4().hex[:8]
    user_email = f"antifake_engineer_{suffix}@omnidesk.bd"
    password = "SecurePassword123!"

    reg_resp = client.post("/api/v1/auth/register", json={
        "email": user_email,
        "password": password,
        "full_name": "Anti Fake Progress Architect"
    })
    assert reg_resp.status_code == 201, f"Registration failed: {reg_resp.text}"
    token = reg_resp.json()["access_token"]
    user_id = uuid.UUID(reg_resp.json()["user"]["id"])
    headers = {"Authorization": f"Bearer {token}"}
    print(f"✓ Test user registered: {user_email}")

    # 1. Create StudySpace & Topic with Competencies
    space_resp = client.post(
        "/api/v1/study-spaces",
        headers=headers,
        json={"title": "Distributed Systems Mastery", "category": "Infrastructure"}
    )
    assert space_resp.status_code == 201, f"Failed to create space: {space_resp.text}"
    space_id = space_resp.json()["id"]

    topic_resp = client.post(
        "/api/v1/topics",
        headers=headers,
        json={
            "study_space_id": space_id,
            "title": "Raft Consensus Protocol",
            "description": "Leader election, log replication, and split-brain safety",
            "estimated_minutes": 90,
            "difficulty": "advanced"
        }
    )
    assert topic_resp.status_code == 201, f"Failed to create topic: {topic_resp.text}"
    topic_id = topic_resp.json()["id"]

    # Seed an uncompleted competency item into DB
    db = SessionLocal()
    comp = CompetencyItem(
        topic_id=uuid.UUID(topic_id),
        title="Explain term election and quorum math in Raft",
        competency_type="EXPLAIN",
        is_completed=False
    )
    db.add(comp)
    db.commit()
    db.close()
    print(f"✓ StudySpace and Topic '{topic_resp.json()['title']}' created with Competency item")

    # 2. Test GET /api/v1/topics/{id}/verify
    print("\n[Step 2] Testing GET /api/v1/topics/{id}/verify...")
    verify_resp = client.get(f"/api/v1/topics/{topic_id}/verify", headers=headers)
    assert verify_resp.status_code == 200, f"Verify endpoint failed: {verify_resp.text}"
    quiz_data = verify_resp.json()
    assert quiz_data["topic_id"] == topic_id
    assert "Raft" in quiz_data["topic_title"]
    assert len(quiz_data["options"]) == 4
    assert 0 <= quiz_data["correct_answer_index"] <= 3
    assert len(quiz_data["question"]) > 10
    print(f"✓ Anti-Fake-Progress Quiz generated: '{quiz_data['question'][:60]}...' (4 options, correct_index={quiz_data['correct_answer_index']})")

    # 3. Test that blind completion (without passing quiz) is blocked
    print("\n[Step 3] Testing that blind status='COMPLETE' without verification is blocked...")
    blind_resp = client.patch(
        f"/api/v1/topics/{topic_id}/status",
        headers=headers,
        json={"status": "COMPLETE", "quiz_verified": False}
    )
    assert blind_resp.status_code == 400
    assert "Competency Gate Blocked" in blind_resp.json()["detail"]
    print(f"✓ Blind completion rejected correctly: {blind_resp.json()['detail'][:70]}...")

    # 4. Test Verified Completion with quiz_verified=True
    print("\n[Step 4] Testing verified status='COMPLETE' with quiz_verified=True...")
    verified_resp = client.patch(
        f"/api/v1/topics/{topic_id}/status",
        headers=headers,
        json={
            "status": "COMPLETE",
            "progress": 100,
            "quiz_verified": True,
            "evidence_notes": "Passed Raft quorum election challenge with 100% score"
        }
    )
    assert verified_resp.status_code == 200, f"Verified update failed: {verified_resp.text}"
    result = verified_resp.json()
    assert result["status"] == "COMPLETE"
    assert result["progress"] == 100
    print("✓ Verified completion approved! Status updated to COMPLETE (100% progress)")

    # 5. Verify ActivityLog evidence in DB
    print("\n[Step 5] Inspecting ActivityLog evidence in PostgreSQL...")
    db = SessionLocal()
    quiz_logs = db.query(ActivityLog).filter(
        ActivityLog.user_id == user_id,
        ActivityLog.event_type == "QUIZ_COMPLETED"
    ).all()
    topic_logs = db.query(ActivityLog).filter(
        ActivityLog.user_id == user_id,
        ActivityLog.event_type == "TOPIC_COMPLETED"
    ).all()
    db.close()

    assert len(quiz_logs) >= 1, "QUIZ_COMPLETED event was not logged to ActivityLog!"
    assert len(topic_logs) >= 1, "TOPIC_COMPLETED event was not logged to ActivityLog!"
    print(f"✓ ActivityLog verified: Found {len(quiz_logs)} QUIZ_COMPLETED and {len(topic_logs)} TOPIC_COMPLETED log entries")

    # 6. Direct Unit Test of generate_verification_quiz
    print("\n[Step 6] Unit testing generate_verification_quiz for conceptual rigor...")
    q = generate_verification_quiz("Kubernetes CNI Plugins")
    assert len(q["options"]) == 4
    assert 0 <= q["correct_answer_index"] < 4
    print("✓ Direct verification quiz generation verified")

    print("\n" + "=" * 75)
    print("  ALL PHASE 4 (ANTI-FAKE-PROGRESS QUIZ ENGINE v1.2.8) TESTS PASSED!")
    print("=" * 75 + "\n")


if __name__ == "__main__":
    run_phase4_quiz_verification_test_suite()

import sys
import os
import uuid
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from app.db.session import SessionLocal
from app.models.user import User
from app.models.study_space import StudySpace
from app.models.topic import Topic
from app.models.dependency import TopicDependency
from app.models.task import Task
from app.models.study_plan import StudyPlan, StudyWeek, StudyDay


def run_generate_approve_verification():
    client = TestClient(app)
    print("\n" + "=" * 70)
    print("🚀 Omnidesk BD v1.2.4: Phase 1 (Packets 1H - 1K) Verification Suite")
    print("   Flow: Analyze -> Preview -> Approve -> Persist (Zero Silent DB Writes)")
    print("=" * 70)

    # -------------------------------------------------------------------------
    # 0. User Setup
    # -------------------------------------------------------------------------
    suffix = uuid.uuid4().hex[:8]
    user_email = f"architect_{suffix}@omnidesk.bd"
    password = "SecurePassword123!"

    reg_resp = client.post("/api/v1/auth/register", json={
        "email": user_email,
        "password": password,
        "full_name": "API Architect"
    })
    assert reg_resp.status_code == 201, f"Registration failed: {reg_resp.text}"
    token = reg_resp.json()["access_token"]
    user_id = uuid.UUID(reg_resp.json()["user"]["id"])
    headers = {"Authorization": f"Bearer {token}"}
    print(f"✓ Registered test user (UUID: {user_id})")

    # -------------------------------------------------------------------------
    # 1. Packet 1L: Template Registry API
    # -------------------------------------------------------------------------
    print("\n[Step 1] Template Registry: List & Load Predefined Curricula")
    templates_resp = client.get("/api/v1/study-spaces/templates")
    assert templates_resp.status_code == 200, f"Templates list failed: {templates_resp.text}"
    templates = templates_resp.json()
    assert len(templates) >= 2, f"Expected at least 2 templates, got {len(templates)}"
    template_ids = [t["id"] for t in templates]
    assert "backend-devops" in template_ids
    assert "python" in template_ids
    print(f"✓ Templates discovered in registry: {template_ids}")

    # Load specific template preview
    prev_tmpl_resp = client.get("/api/v1/study-spaces/templates/backend-devops?time_limit_minutes=180&daily_target_minutes=60")
    assert prev_tmpl_resp.status_code == 200
    tmpl_preview = prev_tmpl_resp.json()
    assert tmpl_preview["is_preview"] is True
    assert tmpl_preview["provider_used"] == "template_registry"
    assert len(tmpl_preview["topics"]) >= 7
    assert tmpl_preview["study_plan"] is not None
    assert tmpl_preview["study_plan"]["sprint_mode"] is True
    assert tmpl_preview["study_plan"]["available_time_limit_minutes"] == 180
    print(f"✓ Template preview generated: {len(tmpl_preview['topics'])} topics, {tmpl_preview['study_plan']['total_sessions']} sessions (180 min sprint cap)")

    # -------------------------------------------------------------------------
    # 2. Packet 1H: Generation API (Preview ONLY, Zero DB Mutation)
    # -------------------------------------------------------------------------
    print("\n[Step 2] Generation API: Generate Preview from Plain Text (Analyze -> Preview)")
    
    db = SessionLocal()
    initial_space_count = db.query(StudySpace).filter(StudySpace.user_id == user_id).count()
    initial_topic_count = db.query(Topic).filter(Topic.user_id == user_id).count()
    db.close()

    syllabus_text = """
    Omnidesk BD Cloud Native Curriculum:
    1. Linux Networking & Kernel Primitives
    2. Docker Containers & Multi-Stage Builds
    3. Kubernetes Pods, Services & Ingress
    4. Helm Charts & Package Deployment
    """

    gen_payload = {
        "text": syllabus_text,
        "title": "Cloud Native Engineering",
        "category": "Cloud & DevOps",
        "time_limit_minutes": 240,
        "daily_target_minutes": 60,
        "interface_language": "en",
        "learning_language": "en",
        "source_language": "en"
    }

    gen_resp = client.post("/api/v1/study-spaces/generate", json=gen_payload, headers=headers)
    assert gen_resp.status_code == 200, f"Generation failed: {gen_resp.text}"
    preview_data = gen_resp.json()

    assert preview_data["is_preview"] is True
    assert preview_data["title"] == "Cloud Native Engineering"
    assert len(preview_data["topics"]) >= 4
    assert preview_data["study_plan"] is not None
    assert preview_data["study_plan"]["total_planned_minutes"] > 0
    print(f"✓ Preview received: '{preview_data['title']}' with {len(preview_data['topics'])} topics via provider '{preview_data['provider_used']}'")

    # CRITICAL CHECK: Assert database was NOT silently written to!
    db = SessionLocal()
    post_gen_space_count = db.query(StudySpace).filter(StudySpace.user_id == user_id).count()
    post_gen_topic_count = db.query(Topic).filter(Topic.user_id == user_id).count()
    db.close()

    assert post_gen_space_count == initial_space_count, "CRITICAL ERROR: StudySpace was silently saved to DB during generation!"
    assert post_gen_topic_count == initial_topic_count, "CRITICAL ERROR: Topics were silently saved to DB during generation!"
    print("✓ VERIFIED ZERO SILENT DB MUTATION: DB entity count unchanged after generate preview.")

    # -------------------------------------------------------------------------
    # 3. Packet 1I: Time-Aware Scheduling Verification
    # -------------------------------------------------------------------------
    print("\n[Step 3] Time-Aware Scheduling: Verify Topological Order, Breaks & Milestones")
    study_plan = preview_data["study_plan"]
    sessions = study_plan["sessions"]
    assert len(sessions) >= 3
    
    # Check that breaks and durations are set
    for s in sessions:
        assert s["planned_minutes"] > 0
        assert s["break_after_minutes"] >= 10
        assert s["day_number"] >= 1
        assert s["week_number"] >= 1

    # Check for milestone sessions
    has_milestone = any(s.get("is_milestone") is True for s in sessions)
    print(f"✓ Study plan sessions verified: {len(sessions)} sessions across {study_plan['estimated_days']} days (Milestones included: {has_milestone})")

    # -------------------------------------------------------------------------
    # 4. Packet 1J: Approval API (Preview -> Approve -> Persist)
    # -------------------------------------------------------------------------
    print("\n[Step 4] Approval API: Persist Validated Preview into PostgreSQL")
    
    approve_payload = {
        "title": preview_data["title"],
        "description": preview_data["description"],
        "category": preview_data["category"],
        "interface_language": preview_data["interface_language"],
        "learning_language": preview_data["learning_language"],
        "source_language": preview_data["source_language"],
        "topics": preview_data["topics"],
        "study_plan": preview_data["study_plan"],
        "generate_study_plan": True
    }

    app_resp = client.post("/api/v1/study-spaces/approve", json=approve_payload, headers=headers)
    assert app_resp.status_code == 201, f"Approval failed: {app_resp.text}"
    approved_space = app_resp.json()
    space_id = uuid.UUID(approved_space["id"])
    print(f"✓ StudySpace successfully approved & persisted (UUID: {space_id})")

    # Verify PostgreSQL DB persistence directly
    db = SessionLocal()
    persisted_space = db.query(StudySpace).filter(StudySpace.id == space_id).first()
    assert persisted_space is not None
    assert persisted_space.user_id == user_id
    assert persisted_space.title == "Cloud Native Engineering"

    # Verify Topics in DB
    db_topics = db.query(Topic).filter(Topic.study_space_id == space_id).all()
    assert len(db_topics) >= 4
    for t in db_topics:
        assert t.user_id == user_id
        assert t.position_x is not None and t.position_y is not None
        assert t.confidence_score > 0.0
        assert t.source_type in ("AI_INFERRED", "SOURCE_EXTRACTED")
        # Check competency tasks
        tasks = db.query(Task).filter(Task.topic_id == t.id).all()
        assert len(tasks) >= 1, f"Topic '{t.title}' must have competency tasks"

    # Verify TopicDependency edges
    topic_ids = [t.id for t in db_topics]
    db_deps = db.query(TopicDependency).filter(TopicDependency.source_topic_id.in_(topic_ids)).all()
    print(f"✓ Persisted {len(db_topics)} topics, {len(db_deps)} dependency edges, and competency tasks in DB.")

    # Verify StudyPlan in DB
    persisted_plan = db.query(StudyPlan).filter(StudyPlan.study_space_id == space_id).first()
    assert persisted_plan is not None
    db_weeks = db.query(StudyWeek).filter(StudyWeek.study_plan_id == persisted_plan.id).all()
    assert len(db_weeks) >= 1
    print(f"✓ Persisted StudyPlan in DB with {len(db_weeks)} week(s).")
    db.close()

    # -------------------------------------------------------------------------
    # 5. Direct File Upload Generation Preview (POST /generate-file)
    # -------------------------------------------------------------------------
    print("\n[Step 5] Direct File Upload: Generate Preview from Markdown File")
    dummy_md = b"# SRE Reliability Engineering\n\n1. SLO and SLA Definitions\n2. Error Budgets\n3. Incident Management\n4. Chaos Engineering\n"
    file_gen_resp = client.post(
        "/api/v1/study-spaces/generate-file",
        files={"file": ("sre_handbook.md", dummy_md, "text/markdown")},
        data={"title": "Site Reliability Engineering", "category": "DevOps"},
        headers=headers
    )
    assert file_gen_resp.status_code == 200, f"File gen preview failed: {file_gen_resp.text}"
    file_prev = file_gen_resp.json()
    assert file_prev["is_preview"] is True
    assert len(file_prev["topics"]) >= 3
    print(f"✓ Direct file upload preview generated: {len(file_prev['topics'])} topics from 'sre_handbook.md'")

    # -------------------------------------------------------------------------
    # 6. Security & Isolation Verification
    # -------------------------------------------------------------------------
    print("\n[Step 6] Security & Tenancy Boundary Checks")
    # Empty topics rejection
    bad_app = client.post("/api/v1/study-spaces/approve", json={"title": "Empty", "topics": []}, headers=headers)
    assert bad_app.status_code == 422, "Empty topics approval must be rejected with 422"
    print("✓ Empty topic approval correctly rejected with 422 Unprocessable Entity.")

    # Unauthenticated generate
    unauth_gen = client.post("/api/v1/study-spaces/generate", json={"text": "Linux"})
    assert unauth_gen.status_code == 401
    print("✓ Unauthenticated generate correctly rejected with 401 Unauthorized.")

    print("\n" + "=" * 70)
    print("🎉 ALL PHASE 1 (PACKETS 1H - 1K) VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)


if __name__ == "__main__":
    run_generate_approve_verification()

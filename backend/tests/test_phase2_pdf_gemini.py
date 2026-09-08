import sys
import os
import uuid
import asyncio
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from app.db.session import SessionLocal
from app.models.study_space import StudySpace
from app.models.topic import Topic
from app.ingestion.parsers import PDFParser
from app.services.ai_provider import (
    GeminiProvider,
    LocalOfflineAIProvider,
    generate_verification_quiz,
    get_ai_provider
)


def create_in_memory_pdf() -> bytes:
    import fitz  # PyMuPDF
    doc = fitz.open()
    page = doc.new_page()
    content = ("Omnidesk BD Cloud Native & Kubernetes Architecture Course\n\n"
                "Overview:\n"
                "This curriculum covers container orchestration, cluster networking, and service mesh.\n\n"
                "Topic 1: Kubernetes Pod Scheduling & Affinity\n"
                "Explore node affinity, taints, tolerations, and custom schedulers.\n\n"
                "Topic 2: Custom Resource Definitions (CRDs) & Operator Pattern\n"
                "Design domain-specific controllers and automate state reconciliation.\n\n"
                "Topic 3: Service Mesh & Distributed Tracing\n"
                "Deploy Istio and Jaeger for end-to-end mTLS and telemetry.\n")
    page.insert_text((50, 72), content)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


def run_phase2_verification_suite():
    print("\n" + "=" * 75)
    print("  Omnidesk BD v1.2.5: Phase 2 (Document Ingestion & AI Generation API) Suite")
    print("  PyMuPDF Ingestion + Gemini 1.5 Flash Free Tier / Fallback + Anti-Fake Quiz")
    print("=" * 75)

    client = TestClient(app)

    # ----------------------------------------------------------------------
    # 0. User Setup
    # ----------------------------------------------------------------------
    suffix = uuid.uuid4().hex[:8]
    user_email = f"phase2_engineer_{suffix}@omnidesk.bd"
    password = "SecurePassword123!"

    reg_resp = client.post("/api/v1/auth/register", json={
        "email": user_email,
        "password": password,
        "full_name": "Phase 2 AI Engineer"
    })
    assert reg_resp.status_code == 201, f"User registration failed: {reg_resp.text}"
    token = reg_resp.json()["access_token"]
    user_id = uuid.UUID(reg_resp.json()["user"]["id"])
    headers = {"Authorization": f"Bearer {token}"}
    print(f"✓ Test user registered: {user_email} (UUID: {user_id})")

    # ----------------------------------------------------------------------
    # 1. PyMuPDF Ingestion Verification
    # ----------------------------------------------------------------------
    print("\n[Step 1] Verifying PyMuPDF PDFParser Extraction...")
    pdf_bytes = create_in_memory_pdf()
    assert len(pdf_bytes) > 500, "PDF bytes should not be empty"
    
    sync_text = PDFParser.extract_text(pdf_bytes, max_chars=10000)
    assert "Omnidesk BD Cloud Native & Kubernetes Architecture" in sync_text
    assert "Kubernetes Pod Scheduling" in sync_text
    print(f"隔 PyMuPDF synchronous extraction successful ({len(sync_text)} characters extracted)")

    async_text = asyncio.run(PDFParser.extract_text_async(pdf_bytes, max_chars=10000))
    assert sync_text == async_text
    print(f"✓ PyMuPDF async threadpool extraction verified (matches sync output)")

    # ----------------------------------------------------------------------
    # 2. PDF Upload to POST /api/v1/study-spaces/generate (Volatile Preview)
    # ----------------------------------------------------------------------
    print("\n[Step 2] Testing Multipart PDF Upload to POST /api/v1/study-spaces/generate...")

    db = SessionLocal()
    initial_spaces = db.query(StudySpace).filter(StudySpace.user_id == user_id).count()
    initial_topics = db.query(Topic).filter(Topic.user_id == user_id).count()
    db.close()

    upload_resp = client.post(
        "/api/v1/study-spaces/generate",
        headers=headers,
        data={
            "title": "Cloud Native Mastery",
            "category": "DevOps / Cloud",
            "time_limit_minutes": "180",
            "daily_target_minutes": "60"
        },
        files={
            "file": ("cloud_native.pdf", pdf_bytes, "application/pdf")
        }
    )
    assert upload_resp.status_code == 200, f"PDF upload generation failed: {upload_resp.text}"
    preview = upload_resp.json()

    assert preview["is_preview"] is True, "Response MUST be a volatile preview"
    assert preview["title"] == "Cloud Native Mastery"
    assert len(preview["topics"]) >= 1, "Must extract topics from uploaded PDF"
    assert preview["total_estimated_minutes"] > 0
    assert preview["study_plan"] is not None 
    assert preview["study_plan"]["sprint_mode"] is True
    print(f"隔 Volatile preview returned: {len(preview['topics'])} topics, {preview['total_estimated_minutes']} total minutes")
    print(f"  First topic: '{preview['topics'][0]['title']}' with {len(preview['topics'][0]['subtopics'])} subtopics")

    # Verify zero silent DB writes
    db = SessionLocal()
    post_spaces = db.query(StudySpace).filter(StudySpace.user_id == user_id).count()
    post_topics = db.query(Topic).filter(Topic.user_id == user_id).count()
    db.close()
    assert post_spaces == initial_spaces == 0, "CRITICAL VIOLATION: StudySpace was silently saved to DB!"
    assert post_topics == initial_topics == 0, "CRITICAL VIOLATION: Topics were silently saved to DB!"
    print("✓ Zero DB Mutation Verified: StudySpaces count = 0, Topics count = 0")

    # ----------------------------------------------------------------------
    # 3. Anti-Fake-Progress Verification Quiz (/api/v1/ai/quiz)
    # ----------------------------------------------------------------------
    print("\n[Step 3] Verifying Anti-Fake-Progress Conceptual Quiz API...")
    subtopic_test = "Kubernetes Pod Scheduling & Affinity"
    quiz_resp = client.post(
        "/api/v1/ai/quiz",
        headers=headers,
        json={"subtopic": subtopic_test}
    )
    assert quiz_resp.status_code == 200, f"Quiz generation failed: {quiz_resp.text}"
    quiz = quiz_resp.json()

    assert quiz["subtopic"] == subtopic_test
    assert len(quiz["question"]) > 10, "Quiz question must be descriptive"
    options = quiz.get("options", [])
    assert len(options) == 4, f"Quiz must contain exactly 4 options, got {len(options)}"
    assert 0 <= quiz["correct_answer_index"] < 4, "Correct answer index must be in range [0, 3]"
    assert len(quiz.get("explanation", "")) > 0, "Explanation should be provided"
    print(f"✓ Conceptual verification quiz validated for '{subtopic_test}':")
    print(f"  Question: {quiz['question']}")
    idx = quiz['correct_answer_index']
    print(f"  Correct option [{idx}]: {options[idx]}")

    # ---------------------------------------------------------------------
    # 4. Direct Helper Function Test
    # ---------------------------------------------------------------------
    print("\n[Step 4] Verifying generate_verification_quiz helper...")
    quiz_helper_res = generate_verification_quiz("Database Indexing Strategies")
    assert len(quiz_helper_res["options"]) == 4
    assert 0 <= quiz_helper_res["correct_answer_index"] < 4
    print("✓ generate_verification_quiz() helper verified")

    # ---------------------------------------------------------------------
    # 5. Gemini Provider Fallback & Free Tier Configuration
    # ---------------------------------------------------------------------
    print("\n[Step 5] Testing Gemini Provider Fallback Resilience...")
    gemini = GeminiProvider(api_key="dummy_invalid_key_for_testing")
    assert gemini.model_name == "gemini-1.5-flash"
    # When API key fails, fallback to offline curriculum extraction
    curriculum = gemini.extract_curriculum("Docker containers and Linux cgroups", title="Docker Basics")
    assert "title" in curriculum
    assert "topics" in curriculum
    assert len(curriculum["topics"]) >= 1
    print("✇ GeminiProvider graceful fallback to deterministic schema verified without crashing")

    print("\n" + "=" * 75)
    print("  ALL PHASE 2 TESTS PASSED PERFECTLY!")
    print("=" * 75 + "\n")


if __name__ == "__main__":
    run_phase2_verification_suite()

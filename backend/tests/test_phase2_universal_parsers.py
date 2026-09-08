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
from app.ingestion.parsers import PDFParser, TXTParser, MarkdownParser
from app.services.ai_provider import (
    GeminiProvider,
    LocalOfflineAIProvider,
    generate_study_topics,
    get_ai_provider
)


def run_universal_parsers_test_suite():
    print("\n" + "=" * 75)
    print("  Omnidesk BD v1.2.6: Phase 2 (Universal Input Expansion) Test Suite")
    print("  TXT, Markdown, and Raw Topic Name Roadmap Generation via Gemini 1.5 Flash")
    print("=" * 75)

    client = TestClient(app)

    # 0. User Registration
    suffix = uuid.uuid4().hex[:8]
    user_email = f"universal_engineer_{suffix}@omnidesk.bd"
    password = "SecurePassword123!"

    reg_resp = client.post("/api/v1/auth/register", json={
        "email": user_email,
        "password": password,
        "full_name": "Universal Input Engineer"
    })
    assert reg_resp.status_code == 201, f"Registration failed: {reg_resp.text}"
    token = reg_resp.json()["access_token"]
    user_id = uuid.UUID(reg_resp.json()["user"]["id"])
    headers = {"Authorization": f"Bearer {token}"}
    print(f"✓ Test user registered: {user_email}")

    # 1. TXTParser Unit Verification
    print("\n[Step 1] Verifying TXTParser extraction...")
    txt_content = (
        "Module 1: Advanced Linux Networking\n"
        "Understanding iptables, nftables, network namespaces, and veth pairs.\n\n"
        "Module 2: eBPF Kernel Tracing\n"
        "Writing XDP programs and hooking kprobes for microsecond telemetry.\n"
    ).encode("utf-8")
    txt_extracted = TXTParser.extract_text(txt_content)
    assert "Advanced Linux Networking" in txt_extracted
    assert "eBPF Kernel Tracing" in txt_extracted
    async_txt = asyncio.run(TXTParser.extract_text_async(txt_content))
    assert async_txt == txt_extracted
    print(f"✓ TXTParser sync and async text extraction verified ({len(txt_extracted)} chars)")

    # 2. MarkdownParser Unit Verification
    print("\n[Step 2] Verifying MarkdownParser extraction...")
    md_content = (
        "---\n"
        "title: Microservices Design\n"
        "---\n\n"
        "# Domain Driven Design Architecture\n\n"
        "## Bounded Contexts & Ubiquitous Language\n"
        "Isolating core domains and establishing context mapping.\n\n"
        "## Event Sourcing & CQRS\n"
        "Separating write models and read replicas with Kafka event streams.\n"
    ).encode("utf-8")
    md_extracted = MarkdownParser.extract_text(md_content)
    assert "Domain Driven Design Architecture" in md_extracted
    assert "Event Sourcing & CQRS" in md_extracted
    async_md = asyncio.run(MarkdownParser.extract_text_async(md_content))
    assert async_md == md_extracted
    print(f"✓ MarkdownParser sync and async text extraction verified ({len(md_extracted)} chars)")

    # 3. Raw Topic Name Input -> Gemini Generation (Bypassing File Parsers)
    print("\n[Step 3] Testing Raw Topic Name generation (e.g. 'Python Basics')...")
    db = SessionLocal()
    init_spaces = db.query(StudySpace).filter(StudySpace.user_id == user_id).count()
    init_topics = db.query(Topic).filter(Topic.user_id == user_id).count()
    db.close()

    topic_resp = client.post(
        "/api/v1/study-spaces/generate",
        headers=headers,
        json={
            "topic_name": "Python Basics",
            "category": "Programming",
            "daily_target_minutes": 60
        }
    )
    assert topic_resp.status_code == 200, f"Topic name generation failed: {topic_resp.text}"
    topic_preview = topic_resp.json()
    assert topic_preview["is_preview"] is True
    assert "Python Basics" in topic_preview["title"]
    assert len(topic_preview["topics"]) >= 2
    print(f"✓ Topic Name generation succeeded: {len(topic_preview['topics'])} topics returned for 'Python Basics'")

    # 4. Multipart TXT File Upload -> Generation
    print("\n[Step 4] Testing Multipart TXT File Upload to /generate...")
    txt_upload_resp = client.post(
        "/api/v1/study-spaces/generate",
        headers=headers,
        data={"title": "Linux Kernel & Networking", "category": "Infrastructure"},
        files={"file": ("linux_networking.txt", txt_content, "text/plain")}
    )
    assert txt_upload_resp.status_code == 200, f"TXT upload failed: {txt_upload_resp.text}"
    txt_preview = txt_upload_resp.json()
    assert txt_preview["is_preview"] is True
    assert len(txt_preview["topics"]) >= 1
    print(f"✓ TXT file upload generation succeeded: {len(txt_preview['topics'])} topics returned")

    # 5. Multipart Markdown File Upload -> Generation
    print("\n[Step 5] Testing Multipart Markdown File Upload to /generate...")
    md_upload_resp = client.post(
        "/api/v1/study-spaces/generate",
        headers=headers,
        data={"title": "Microservices & DDD", "category": "Architecture"},
        files={"file": ("microservices.md", md_content, "text/markdown")}
    )
    assert md_upload_resp.status_code == 200, f"Markdown upload failed: {md_upload_resp.text}"
    md_preview = md_upload_resp.json()
    assert md_preview["is_preview"] is True
    assert len(md_preview["topics"]) >= 1
    print(f"✓ Markdown file upload generation succeeded: {len(md_preview['topics'])} topics returned")

    # 6. Verify Zero Silent DB Mutation
    db = SessionLocal()
    post_spaces = db.query(StudySpace).filter(StudySpace.user_id == user_id).count()
    post_topics = db.query(Topic).filter(Topic.user_id == user_id).count()
    db.close()
    assert post_spaces == init_spaces == 0, "StudySpace was saved to DB during preview!"
    assert post_topics == init_topics == 0, "Topics were saved to DB during preview!"
    print("✓ Zero DB Mutation Verified: All generation calls returned volatile previews (is_preview=True)")

    # 7. Unit test GeminiProvider.generate_study_topics with topic goal prefix
    print("\n[Step 7] Testing GeminiProvider.generate_study_topics() prefix logic...")
    gemini = GeminiProvider(api_key="mock_key_for_offline_test")
    # Test fallback path
    curriculum = gemini.generate_study_topics("BBA Finance Basics", is_topic_name=True)
    assert "BBA Finance Basics" in curriculum["title"]
    assert len(curriculum["topics"]) >= 2
    print("✓ GeminiProvider.generate_study_topics() topic goal logic verified")

    print("\n" + "=" * 75)
    print("  ALL PHASE 2 (UNIVERSAL INPUT EXPANSION v1.2.6) TESTS PASSED!")
    print("=" * 75 + "\n")


if __name__ == "__main__":
    run_universal_parsers_test_suite()

import os
import sys
import tempfile
import pymupdf  # PyMuPDF

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.ingestion import ingestion_engine, ParsedDocument
from app.ingestion.parsers.pdf_parser import PDFParser
from app.ingestion.parsers.markdown_parser import MarkdownParser
from app.ingestion.parsers.txt_parser import TXTParser
from app.ingestion.parsers.youtube_parser import YouTubeTranscriptProvider
from app.ai import (
    ai_service,
    AIService,
    OfflineHeuristicProvider,
    CurriculumAnalysisResult,
)


def run_pipeline_test():
    print("\n" + "=" * 70)
    print("🚀 Omnidesk BD v1.2.4: Phase 1 (Packets 1E - 1G) Verification Suite")
    print("=" * 70)

    # -------------------------------------------------------------------------
    # 1. Test Ingestion: Plain Text Syllabus
    # -------------------------------------------------------------------------
    print("\n[Step 1] Ingestion: Plain Text Syllabus")
    txt_content = """Omnidesk BD DevOps Masterclass Syllabus:
1. Linux Fundamentals and CLI Commands
2. Docker Containers and Image Creation
3. Kubernetes Cluster Orchestration and Helm
4. CI/CD Automation with GitHub Actions
5. Observability with Prometheus and Grafana
"""
    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
        f.write(txt_content)
        txt_path = f.name

    try:
        txt_doc = ingestion_engine.parse_source(txt_path, title="DevOps Syllabus")
        assert isinstance(txt_doc, ParsedDocument)
        assert len(txt_doc.chunks) >= 1
        assert "Linux Fundamentals" in txt_doc.full_text
        assert txt_doc.checksum is not None
        print(f"✓ Plain text parsed successfully: {len(txt_doc.chunks)} chunks, SHA256: {txt_doc.checksum[:12]}...")
    finally:
        os.remove(txt_path)

    # -------------------------------------------------------------------------
    # 2. Test Ingestion: Markdown with Frontmatter & Sections
    # -------------------------------------------------------------------------
    print("\n[Step 2] Ingestion: Markdown Course Outline")
    md_content = """---
title: Full Stack Python Mastery
author: Omnidesk BD
level: Intermediate
---

# Introduction to Modern Python
Python 3.12 syntax, type hinting, and virtual environment setup.

## FastAPI Web Development
Building asynchronous REST APIs with Pydantic v2 and dependency injection.

## SQLAlchemy and PostgreSQL
Object-Relational Mapping, connection pooling, and Alembic migrations.

## Celery and Redis Task Queues
Distributed background tasks, scheduling, and message broker patterns.
"""
    with tempfile.NamedTemporaryFile(mode="w", suffix=".md", delete=False) as f:
        f.write(md_content)
        md_path = f.name

    try:
        md_doc = ingestion_engine.parse_source(md_path)
        assert isinstance(md_doc, ParsedDocument)
        assert len(md_doc.chunks) >= 3
        assert md_doc.metadata.get("frontmatter", {}).get("author") == "Omnidesk BD"
        print(f"✓ Markdown parsed successfully: {len(md_doc.chunks)} sections, Frontmatter extracted.")
    finally:
        os.remove(md_path)

    # -------------------------------------------------------------------------
    # 3. Test Ingestion: Real PDF with PyMuPDF
    # -------------------------------------------------------------------------
    print("\n[Step 3] Ingestion: PyMuPDF PDF Generation & Extraction")
    pdf_path = tempfile.mktemp(suffix=".pdf")
    try:
        # Generate dummy PDF using PyMuPDF
        pdf_doc_writer = pymupdf.open()
        page = pdf_doc_writer.new_page()
        page.insert_text(
            (50, 72),
            "Omnidesk BD Cloud Architect Certification Course\n\n"
            "Chapter 1: AWS VPC Networking and Security Groups\n"
            "Chapter 2: Docker Microservices and Elastic Container Service\n"
            "Chapter 3: Terraform Infrastructure as Code (IaC)\n"
            "Chapter 4: Kubernetes EKS Production Deployment\n",
            fontsize=12
        )
        pdf_doc_writer.save(pdf_path)
        pdf_doc_writer.close()

        pdf_doc = ingestion_engine.parse_source(pdf_path)
        assert isinstance(pdf_doc, ParsedDocument)
        assert pdf_doc.page_count == 1
        assert "AWS VPC Networking" in pdf_doc.full_text
        print(f"✓ PDF extracted via PyMuPDF: {pdf_doc.page_count} page(s), {len(pdf_doc.chunks)} chunk(s).")
    finally:
        if os.path.exists(pdf_path):
            os.remove(pdf_path)

    # -------------------------------------------------------------------------
    # 4. Test Ingestion: YouTube Parser Graceful Fallback
    # -------------------------------------------------------------------------
    print("\n[Step 4] Ingestion: YouTube Parser Graceful Error & Fallback Handling")
    yt_parser = YouTubeTranscriptProvider()
    # Test video ID extraction
    vid_id = yt_parser.extract_video_id("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    assert vid_id == "dQw4w9WgXcQ"
    short_vid_id = yt_parser.extract_video_id("https://youtu.be/dQw4w9WgXcQ?t=42")
    assert short_vid_id == "dQw4w9WgXcQ"
    print(f"✓ YouTube video ID extraction verified: {vid_id}")

    # Test unavailable / dummy video ID parsing (should not crash, returns metadata)
    dummy_yt_doc = yt_parser.parse("https://www.youtube.com/watch?v=00000000000", title="Dummy Video")
    assert isinstance(dummy_yt_doc, ParsedDocument)
    assert dummy_yt_doc.metadata.get("transcript_available") is False
    print("✓ YouTube unavailable transcript handled gracefully without uncaught exceptions.")

    # -------------------------------------------------------------------------
    # 5. Test AI Abstraction Layer: Offline Heuristic Provider
    # -------------------------------------------------------------------------
    print("\n[Step 5] AI Layer: Offline Heuristic Provider & DAG Resolution")
    offline_provider = OfflineHeuristicProvider()
    assert offline_provider.is_available() is True
    assert offline_provider.name == "offline_heuristic"

    sample_syllabus = """
    1. Linux Fundamentals
    2. Docker Containers
    3. Kubernetes Orchestration
    4. Helm Package Management
    """
    heuristic_res = offline_provider.extract_curriculum(sample_syllabus, title="Container Engineering")
    assert isinstance(heuristic_res, CurriculumAnalysisResult)
    assert len(heuristic_res.topics) >= 4
    assert heuristic_res.provider_used == "offline_heuristic"
    assert heuristic_res.total_estimated_minutes > 0

    # Verify dependency resolution from DAG: Docker depends on Linux, Kubernetes on Docker/Linux, Helm on Kubernetes
    topic_map = {t.title.lower(): t for t in heuristic_res.topics}
    print(f"✓ Topics extracted: {[t.title for t in heuristic_res.topics]}")
    for title, top in topic_map.items():
        if "docker" in title:
            assert any("linux" in dep.lower() for dep in top.dependencies), f"Docker should depend on Linux: {top.dependencies}"
        if "kubernetes" in title:
            assert any("docker" in dep.lower() for dep in top.dependencies), f"Kubernetes should depend on Docker: {top.dependencies}"
        if "helm" in title:
            assert any("kubernetes" in dep.lower() for dep in top.dependencies), f"Helm should depend on Kubernetes: {top.dependencies}"
    print("✓ Heuristic DAG prerequisite inference verified.")

    # -------------------------------------------------------------------------
    # 6. Test AI Service: Cascade and Priority Fallback
    # -------------------------------------------------------------------------
    print("\n[Step 6] AI Service: Orchestration & Fallback Cascade")
    service = AIService()
    registered = service.registered_providers
    assert "gemini" in registered
    assert "ollama" in registered
    assert "offline_heuristic" in registered
    print(f"✓ Registered providers: {registered}")

    available = service.get_available_providers()
    print(f"✓ Currently available providers in environment: {available}")
    assert "offline_heuristic" in available

    # Test analyze_curriculum on live AIService (cascades cleanly to available provider)
    result = service.analyze_curriculum(sample_syllabus, title="DevOps Curriculum")
    assert isinstance(result, CurriculumAnalysisResult)
    assert len(result.topics) >= 4
    print(f"✓ Multi-tier cascade completed successfully via '{result.provider_used}'")

    # -------------------------------------------------------------------------
    # 7. End-to-End Pipeline: Feed Syllabus -> Ingestion -> AI -> StudySpace Structure
    # -------------------------------------------------------------------------
    print("\n[Step 7] End-to-End Pipeline: Raw Source File -> Ingestion -> AI Curriculum")
    full_syllabus_text = """
    Omnidesk BD Advanced Backend & Infrastructure Curriculum:
    1. Python 3 Internals and Asynchronous Programming
    2. FastAPI REST & WebSocket Architecture
    3. SQLAlchemy 2.0 and PostgreSQL Query Optimization
    4. Redis In-Memory Caching & Session Storage
    5. Celery Distributed Task Worker Architecture
    6. Docker Containerization & Multi-Stage Builds
    7. Kubernetes Pod Lifecycle, Services, and Ingress
    """

    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
        f.write(full_syllabus_text)
        sample_file_path = f.name

    try:
        # Ingest
        parsed_doc = ingestion_engine.parse_source(sample_file_path, title="Backend & Infra Track")
        print(f"✓ Document ingested: {parsed_doc.title} ({len(parsed_doc.full_text)} bytes)")

        # AI Extraction
        curriculum = ai_service.analyze_curriculum(parsed_doc.full_text, title=parsed_doc.title)
        
        print("\n" + "=" * 70)
        print(f"📚 GENERATED STUDYSPACE STRUCTURE: {curriculum.title}")
        print(f"   Provider Used: {curriculum.provider_used}")
        print(f"   Total Estimated Study Time: {curriculum.total_estimated_minutes} minutes")
        print(f"   Total Topics: {len(curriculum.topics)}")
        print("=" * 70)

        for i, topic in enumerate(curriculum.topics, 1):
            dep_str = ", ".join(topic.dependencies) if topic.dependencies else "None (Foundation)"
            print(f"\n  [{i}] Topic: {topic.title} ({topic.difficulty} | {topic.estimated_minutes} min)")
            print(f"      Description: {topic.description}")
            print(f"      Prerequisites: {dep_str}")
            print(f"      Subtopics/Competencies:")
            for sub in topic.subtopics:
                print(f"        - {sub}")
            print(f"      Provenance: {topic.source_reference} (Confidence: {topic.confidence_score})")

        print("\n" + "=" * 70)
        print("🎉 ALL PHASE 1 (PACKETS 1E-1G) INGESTION & AI PIPELINE TESTS PASSED!")
        print("=" * 70)

    finally:
        if os.path.exists(sample_file_path):
            os.remove(sample_file_path)


if __name__ == "__main__":
    run_pipeline_test()

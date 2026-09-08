import os
import uuid
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.study_space import StudySpace
from app.models.topic import Topic, SourceType
from app.models.dependency import TopicDependency
from app.models.task import Task
from app.models.study_plan import StudyPlan, StudyWeek, StudyDay
from app.models.material import Material
from app.schemas.studyspace import (
    StudySpaceCreate,
    StudySpaceGenerateText,
    StudySpaceGenerateMaterial,
    StudySpaceResponse,
    StudySpaceDetailResponse,
    StudySpaceGenerateRequest,
    StudySpaceApproveRequest,
    StudySpacePreviewResponse,
    TopicPreviewItem,
    StudyPlanPreview,
    StudyTemplateSummary,
)
from app.services.course_generator import course_generator
from app.services.document_processor import document_processor
from app.services.template_service import template_service
from app.services.scheduler import scheduler
from app.ingestion import ingestion_engine
from app.ai import ai_service
from app.api.deps import get_current_user

logger = logging.getLogger("omnidesk.api.study_spaces")
router = APIRouter()


# =========================================================================
# TEMPLATE ENGINE (Packet 1L)
# =========================================================================

@router.get("/templates", response_model=List[StudyTemplateSummary])
def list_curriculum_templates():
    """
    List pre-configured, production-grade curriculum templates from the registry.
    Serves as an offline alternative to generative AI.
    """
    return template_service.list_templates()


@router.get("/templates/{template_id}", response_model=StudySpacePreviewResponse)
def get_curriculum_template_preview(
    template_id: str,
    time_limit_minutes: Optional[int] = Query(None, ge=15, le=10000),
    daily_target_minutes: int = Query(60, ge=15, le=480),
):
    """
    Load a pre-configured template and generate a time-aware preview ready for approval.
    DOES NOT save to the database.
    """
    template_data = template_service.get_template(template_id)
    if not template_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template '{template_id}' not found in registry."
        )

    raw_topics = template_data.get("topics", [])
    topic_items = [
        TopicPreviewItem(
            title=t["title"],
            description=t.get("description", ""),
            subtopics=t.get("subtopics", []),
            dependencies=t.get("dependencies", []),
            estimated_minutes=t.get("estimated_minutes", 60),
            difficulty=t.get("difficulty", "INTERMEDIATE"),
            source_reference=t.get("source_reference", f"Template: {template_id}"),
            confidence_score=1.0,
            source_type="USER_CREATED"
        )
        for t in raw_topics
    ]

    # Generate time-aware study plan preview
    plan_dict = scheduler.build_study_plan(
        topics=[t.model_dump() for t in topic_items],
        available_time_minutes=time_limit_minutes,
        daily_target_minutes=daily_target_minutes
    )
    study_plan = StudyPlanPreview(**plan_dict)

    return StudySpacePreviewResponse(
        preview_id=f"preview_template_{template_id}_{uuid.uuid4().hex[:8]}",
        title=template_data.get("title", template_id.title()),
        description=template_data.get("description", ""),
        category=template_data.get("category", "Backend / DevOps"),
        interface_language=template_data.get("interface_language", "en"),
        learning_language=template_data.get("learning_language", "en"),
        source_language=template_data.get("source_language", "en"),
        provider_used="template_registry",
        total_estimated_minutes=sum(t.estimated_minutes for t in topic_items),
        topics=topic_items,
        study_plan=study_plan,
        material_id=None,
        is_preview=True
    )


# =========================================================================
# GENERATION API (Packet 1H) - Pure Preview, ZERO Database Persistence
# =========================================================================

@router.post("/generate", response_model=StudySpacePreviewResponse)
async def generate_study_space_preview(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate a complete, structured StudySpace preview (Directive 5 / Packet 1H).
    CRITICAL: Does NOT save to PostgreSQL. Strictly enforces Analyze -> Preview -> Approve -> Persist.
    
    Accepts:
    1. Uploaded PDF file (multipart/form-data): extracts text using PDFParser (up to 10,000 chars),
       sends to GeminiProvider (gemini-1.5-flash Free Tier with Ollama fallback), and returns parsed JSON.
    2. JSON payload (application/json): accepts goal, text, material_id, time limits.
    """
    content_type = request.headers.get("content-type", "").lower()
    
    source_title: str = "Curriculum Track"
    category: str = "Backend / DevOps"
    time_limit_minutes: Optional[int] = None
    daily_target_minutes: int = 60
    preferred_provider: Optional[str] = None
    material_id: Optional[uuid.UUID] = None
    raw_source_text: str = ""
    source_type_tag: str = "AI_INFERRED"
    source_filename: Optional[str] = None

    interface_language: str = "en"
    learning_language: str = "en"
    source_language: str = "en"

    if "multipart/form-data" in content_type:
        form = await request.form()
        uploaded_file = form.get("file")
        if form.get("title"):
            source_title = str(form.get("title"))
        if form.get("category"):
            category = str(form.get("category"))
        if form.get("preferred_provider"):
            preferred_provider = str(form.get("preferred_provider"))
        if form.get("interface_language"):
            interface_language = str(form.get("interface_language"))
        if form.get("learning_language"):
            learning_language = str(form.get("learning_language"))
        if form.get("source_language"):
            source_language = str(form.get("source_language"))
        if form.get("time_limit_minutes"):
            try:
                time_limit_minutes = int(form.get("time_limit_minutes"))
            except (ValueError, TypeError):
                time_limit_minutes = None
        if form.get("daily_target_minutes"):
            try:
                daily_target_minutes = int(form.get("daily_target_minutes"))
            except (ValueError, TypeError):
                daily_target_minutes = 60

        is_topic_name = False
        if uploaded_file and hasattr(uploaded_file, "read"):
            file_bytes = await uploaded_file.read()
            source_filename = getattr(uploaded_file, "filename", "uploaded_document.pdf")
            if not form.get("title"):
                source_title = os.path.splitext(source_filename)[0].replace("_", " ").title()

            ext = os.path.splitext(source_filename)[1].lower()
            if ext in (".md", ".markdown"):
                from app.ingestion.parsers import MarkdownParser
                raw_source_text = await MarkdownParser.extract_text_async(file_bytes, max_chars=10000)
            elif ext in (".txt", ".text"):
                from app.ingestion.parsers import TXTParser
                raw_source_text = await TXTParser.extract_text_async(file_bytes, max_chars=10000)
            else:
                from app.ingestion.parsers import PDFParser
                raw_source_text = await PDFParser.extract_text_async(file_bytes, max_chars=10000)

            source_type_tag = "SOURCE_EXTRACTED"
        else:
            raw_source_text = str(form.get("topic_name") or form.get("text") or form.get("goal") or "")
            if form.get("topic_name"):
                is_topic_name = True
                source_title = form.get("title") or form.get("topic_name")
            if not raw_source_text.strip():
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Must provide an uploaded file (PDF, TXT, MD) or topic_name/text/goal in form."
                )
    else:
        # JSON body
        try:
            body = await request.json()
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid JSON payload."
            )
        payload = StudySpaceGenerateRequest(**body)
        source_title = payload.title or payload.topic_name or payload.goal or "Curriculum Track"
        category = payload.category
        interface_language = payload.interface_language
        learning_language = payload.learning_language
        source_language = payload.source_language
        time_limit_minutes = payload.time_limit_minutes
        daily_target_minutes = payload.daily_target_minutes
        preferred_provider = payload.preferred_provider
        material_id = payload.material_id
        is_topic_name = False

        if payload.topic_name and payload.topic_name.strip():
            raw_source_text = payload.topic_name.strip()
            source_title = payload.title or raw_source_text
            is_topic_name = True
            source_type_tag = "USER_CREATED"
        elif payload.material_id:
            material_record = (
                db.query(Material)
                .filter(Material.id == payload.material_id, Material.user_id == current_user.id)
                .first()
            )
            if not material_record:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Material '{payload.material_id}' not found for current user."
                )
            if not material_record.storage_path or not os.path.exists(material_record.storage_path):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Material physical file is not available on disk."
                )

            ext = os.path.splitext(material_record.storage_path)[1].lower()
            if ext in (".md", ".markdown"):
                from app.ingestion.parsers import MarkdownParser
                raw_source_text = await MarkdownParser.extract_text_async(material_record.storage_path, max_chars=10000)
            elif ext in (".txt", ".text"):
                from app.ingestion.parsers import TXTParser
                raw_source_text = await TXTParser.extract_text_async(material_record.storage_path, max_chars=10000)
            else:
                from app.ingestion.parsers import PDFParser
                raw_source_text = await PDFParser.extract_text_async(material_record.storage_path, max_chars=10000)

            source_title = material_record.title
            source_filename = material_record.original_filename
            source_type_tag = "SOURCE_EXTRACTED"
        elif payload.text and payload.text.strip():
            raw_source_text = payload.text.strip()
            is_topic_name = len(raw_source_text) < 100 and "\n" not in raw_source_text
            source_type_tag = "AI_INFERRED"
        elif payload.goal and payload.goal.strip():
            raw_source_text = payload.goal.strip()
            is_topic_name = True
            source_type_tag = "AI_INFERRED"
        else:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Must provide either 'topic_name', 'text', 'goal', or a valid 'material_id'."
            )

    # First 10,000 characters limit
    analysis_text = raw_source_text[:10000]

    # AI Curriculum Synthesis (Gemini 1.5 Flash Free Tier -> Ollama -> Heuristics)
    from app.services.ai_provider import GeminiProvider, LocalOfflineAIProvider
    gemini_provider = GeminiProvider()

    topic_items: List[TopicPreviewItem] = []
    curriculum_summary = ""
    provider_used = "offline_heuristic"

    try:
        if gemini_provider.is_available() and (not preferred_provider or preferred_provider == "gemini"):
            gemini_data = gemini_provider.generate_study_topics(analysis_text, is_topic_name=is_topic_name, title=source_title)
            curriculum_summary = gemini_data.get("summary", f"Curriculum synthesized by Gemini 1.5 Flash.")
            provider_used = gemini_data.get("provider_used", "gemini-1.5-flash")
            for t in gemini_data.get("topics", []):
                topic_items.append(
                    TopicPreviewItem(
                        title=t.get("title", "Core Topic"),
                        description=t.get("description", ""),
                        subtopics=t.get("subtopics", []),
                        dependencies=t.get("dependencies", t.get("prerequisites", [])),
                        estimated_minutes=t.get("estimated_minutes", 60),
                        difficulty=t.get("difficulty", "INTERMEDIATE"),
                        source_reference=t.get("source_reference", source_filename or "Uploaded Material"),
                        confidence_score=0.95,
                        source_type=source_type_tag
                    )
                )
        else:
            if is_topic_name:
                offline_data = LocalOfflineAIProvider().generate_study_topics(analysis_text, is_topic_name=True, title=source_title)
                curriculum_summary = offline_data.get("summary", "")
                provider_used = "offline_heuristic"
                for t in offline_data.get("topics", []):
                    topic_items.append(
                        TopicPreviewItem(
                            title=t.get("title", "Core Topic"),
                            description=t.get("description", ""),
                            subtopics=t.get("subtopics", []),
                            dependencies=t.get("dependencies", []),
                            estimated_minutes=t.get("estimated_minutes", 60),
                            difficulty=t.get("difficulty", "INTERMEDIATE"),
                            source_reference=t.get("source_reference", "Topic Goal"),
                            confidence_score=0.95,
                            source_type=source_type_tag
                        )
                    )
            else:
                curriculum = ai_service.analyze_curriculum(
                    text=analysis_text,
                    title=source_title,
                    preferred_provider=preferred_provider
                )
                curriculum_summary = curriculum.summary
                provider_used = curriculum.provider_used
                for item in curriculum.topics:
                    topic_items.append(
                        TopicPreviewItem(
                            title=item.title,
                            description=item.description,
                            subtopics=item.subtopics,
                            dependencies=item.dependencies,
                            estimated_minutes=item.estimated_minutes,
                            difficulty=item.difficulty,
                            source_reference=item.source_reference or (source_filename or "Document"),
                            confidence_score=item.confidence_score,
                            source_type=source_type_tag
                        )
                    )
    except HTTPException:
        raise
    except Exception as ai_err:
        logger.warning("AI generation failed (%s). Falling back to course generator parser.", ai_err)
        fallback_topics = course_generator.parse_topics_from_text(analysis_text)
        curriculum_summary = f"Curriculum extracted from input source ({len(fallback_topics)} topics)."
        provider_used = "offline_heuristic"
        for t in fallback_topics:
            topic_items.append(
                TopicPreviewItem(
                    title=t["title"],
                    description=t["description"],
                    subtopics=[],
                    dependencies=[],
                    estimated_minutes=60,
                    difficulty="INTERMEDIATE",
                    source_reference=source_filename or "Emergency Local Fallback",
                    confidence_score=0.85,
                    source_type=source_type_tag
                )
            )

    # Time-Aware Scheduling (Packet 1I)
    plan_dict = scheduler.build_study_plan(
        topics=[t.model_dump() for t in topic_items],
        available_time_minutes=time_limit_minutes,
        daily_target_minutes=daily_target_minutes
    )
    study_plan = StudyPlanPreview(**plan_dict)

    preview_response = StudySpacePreviewResponse(
        preview_id=f"prev_{uuid.uuid4().hex[:12]}",
        title=source_title,
        description=curriculum_summary,
        category=category,
        interface_language=interface_language,
        learning_language=learning_language,
        source_language=source_language,
        provider_used=provider_used,
        total_estimated_minutes=sum(t.estimated_minutes for t in topic_items),
        topics=topic_items,
        study_plan=study_plan,
        material_id=material_id,
        is_preview=True
    )
    return preview_response


@router.post("/generate-file", response_model=StudySpacePreviewResponse)
async def generate_study_space_from_file_upload(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    time_limit_minutes: Optional[int] = Form(None),
    daily_target_minutes: int = Form(60),
    category: str = Form("Backend / DevOps"),
    interface_language: str = Form("en"),
    learning_language: str = Form("en"),
    source_language: str = Form("en"),
    current_user: User = Depends(get_current_user),
):
    """
    Direct file upload to StudySpace Preview.
    Parses PDF, Markdown, or TXT directly and returns a preview without database changes.
    """
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    doc_title = title or os.path.splitext(file.filename or "Document")[0].replace("_", " ").title()
    parsed_doc = ingestion_engine.parse_source(
        file_bytes,
        filename_hint=file.filename,
        title=doc_title
    )

    curriculum = ai_service.analyze_curriculum(
        text=parsed_doc.full_text,
        title=doc_title
    )

    topic_items = [
        TopicPreviewItem(
            title=item.title,
            description=item.description,
            subtopics=item.subtopics,
            dependencies=item.dependencies,
            estimated_minutes=item.estimated_minutes,
            difficulty=item.difficulty,
            source_reference=f"File: {file.filename}",
            confidence_score=item.confidence_score,
            source_type="SOURCE_EXTRACTED"
        )
        for item in curriculum.topics
    ]

    plan_dict = scheduler.build_study_plan(
        topics=[t.model_dump() for t in topic_items],
        available_time_minutes=time_limit_minutes,
        daily_target_minutes=daily_target_minutes
    )
    study_plan = StudyPlanPreview(**plan_dict)

    return StudySpacePreviewResponse(
        preview_id=f"prev_upload_{uuid.uuid4().hex[:12]}",
        title=curriculum.title,
        description=curriculum.summary,
        category=category,
        interface_language=interface_language,
        learning_language=learning_language,
        source_language=source_language,
        provider_used=curriculum.provider_used,
        total_estimated_minutes=sum(t.estimated_minutes for t in topic_items),
        topics=topic_items,
        study_plan=study_plan,
        material_id=None,
        is_preview=True
    )


# =========================================================================
# APPROVAL API (Packet 1J) - Persist Validated Preview into PostgreSQL
# =========================================================================

@router.post("/approve", response_model=StudySpaceDetailResponse, status_code=status.HTTP_201_CREATED)
def approve_and_persist_study_space(
    payload: StudySpaceApproveRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Approve and persist a previewed StudySpace into PostgreSQL (Packet 1J).
    Persists:
    1. StudySpace container.
    2. Topics with 2D coordinates and provenance tags.
    3. Competency tasks for each subtopic (anti-fake-progress).
    4. TopicDependency prerequisite graph edges.
    5. StudyPlan, StudyWeeks, and StudyDays if requested.
    """
    if not payload.topics:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Cannot approve an empty StudySpace with 0 topics."
        )

    # 1. Create StudySpace
    space = StudySpace(
        user_id=current_user.id,
        title=payload.title,
        description=payload.description or f"Approved StudySpace with {len(payload.topics)} topics.",
        category=payload.category,
        is_active=True,
        interface_language=payload.interface_language,
        learning_language=payload.learning_language,
        source_language=payload.source_language
    )
    db.add(space)
    db.flush()

    # 2. Persist Topics
    created_topics = {}
    st_enum = SourceType.SOURCE_EXTRACTED if payload.material_id else SourceType.AI_INFERRED

    for idx, t_in in enumerate(payload.topics):
        col = idx % 3
        row = idx // 3
        pos_x = 100.0 + (col * 320.0)
        pos_y = 100.0 + (row * 240.0)

        topic_st = SourceType.SOURCE_EXTRACTED if t_in.source_type == "SOURCE_EXTRACTED" else st_enum

        topic = Topic(
            user_id=current_user.id,
            study_space_id=space.id,
            title=t_in.title,
            description=t_in.description,
            source_type=topic_st,
            source_reference=t_in.source_reference,
            source_material_id=payload.material_id,
            confidence_score=t_in.confidence_score,
            status="NORMAL",
            progress=0,
            priority=1,
            difficulty=t_in.difficulty.lower(),
            estimated_minutes=t_in.estimated_minutes,
            order=idx + 1,
            position_x=pos_x,
            position_y=pos_y
        )
        db.add(topic)
        db.flush()
        created_topics[t_in.title.strip().lower()] = topic

        # Competency tasks / checkpoints
        subtopics = t_in.subtopics or [
            f"Core principles and syntax of {t_in.title}",
            f"Practical implementation laboratory for {t_in.title}",
            f"Debugging and architectural tradeoffs in {t_in.title}"
        ]
        task_min = max(15, t_in.estimated_minutes // max(1, len(subtopics)))
        for s_idx, sub in enumerate(subtopics):
            task = Task(
                user_id=current_user.id,
                topic_id=topic.id,
                title=sub,
                description=f"Competency milestone for {t_in.title}",
                estimated_minutes=task_min,
                is_completed=False,
                priority=1,
                source_type=topic_st,
                confidence_score=t_in.confidence_score
            )
            db.add(task)

    # 3. Persist TopicDependency Graph
    for t_in in payload.topics:
        dependent_topic = created_topics.get(t_in.title.strip().lower())
        if not dependent_topic:
            continue

        for dep_title in (t_in.dependencies or []):
            prereq_topic = created_topics.get(dep_title.strip().lower())
            if prereq_topic and prereq_topic.id != dependent_topic.id:
                dep_edge = TopicDependency(
                    source_topic_id=prereq_topic.id,
                    target_topic_id=dependent_topic.id,
                    dependency_type="PREREQUISITE"
                )
                db.add(dep_edge)

    # 4. Persist StudyPlan if requested
    active_plan_id = None
    if payload.generate_study_plan:
        plan_days = payload.study_plan.estimated_days if payload.study_plan else max(1, len(payload.topics))
        plan = StudyPlan(
            study_space_id=space.id,
            title=f"Mastery Plan: {space.title}",
            description="Approved structured study trajectory.",
            total_days=plan_days,
            is_active=True
        )
        db.add(plan)
        db.flush()
        active_plan_id = plan.id

        # Populate weeks and days from study plan preview
        if payload.study_plan and payload.study_plan.sessions:
            weeks_cache = {}
            for sess in payload.study_plan.sessions:
                w_num = sess.week_number
                if w_num not in weeks_cache:
                    week = StudyWeek(
                        study_plan_id=plan.id,
                        week_number=w_num,
                        theme_title=f"Week {w_num} Focus Sprint"
                    )
                    db.add(week)
                    db.flush()
                    weeks_cache[w_num] = week

                # Create study day
                d_num = sess.day_number
                day = StudyDay(
                    study_week_id=weeks_cache[w_num].id,
                    day_number=d_num,
                    title=sess.title,
                    focus_goal=f"Complete session: {sess.title} ({sess.planned_minutes} min)",
                    is_completed=False
                )
                db.add(day)

    db.commit()
    db.refresh(space)

    return StudySpaceDetailResponse(
        id=space.id,
        user_id=space.user_id,
        title=space.title,
        description=space.description,
        category=space.category,
        is_active=space.is_active,
        is_archived=space.is_archived,
        created_at=space.created_at,
        updated_at=space.updated_at,
        interface_language=space.interface_language or "en",
        learning_language=space.learning_language or "en",
        source_language=space.source_language or "en",
        topic_count=len(payload.topics),
        completed_topic_count=0,
        active_plan_id=active_plan_id
    )


# =========================================================================
# STANDARD CRUD & LEGACY GENERATION ENDPOINTS
# =========================================================================

@router.get("", response_model=List[StudySpaceDetailResponse])
def list_study_spaces(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all study spaces owned by the current user with topic stats.
    """
    spaces = (
        db.query(StudySpace)
        .filter(StudySpace.user_id == current_user.id, StudySpace.is_archived == False)
        .order_by(StudySpace.created_at.desc())
        .all()
    )

    result = []
    for s in spaces:
        t_count = len(s.topics)
        completed_count = sum(1 for t in s.topics if t.status in ("COMPLETE", "MASTERED"))
        active_plan = s.study_plans[0].id if s.study_plans else None

        result.append(
            StudySpaceDetailResponse(
                id=s.id,
                user_id=s.user_id,
                title=s.title,
                description=s.description,
                category=s.category,
                is_active=s.is_active,
                is_archived=s.is_archived,
                created_at=s.created_at,
                updated_at=s.updated_at,
                interface_language=s.interface_language or "en",
                learning_language=s.learning_language or "en",
                source_language=s.source_language or "en",
                topic_count=t_count,
                completed_topic_count=completed_count,
                active_plan_id=active_plan
            )
        )
    return result


@router.post("", response_model=StudySpaceResponse, status_code=status.HTTP_201_CREATED)
def create_manual_study_space(
    space_in: StudySpaceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Manually create an empty StudySpace.
    """
    space = StudySpace(
        user_id=current_user.id,
        title=space_in.title,
        description=space_in.description,
        category=space_in.category,
        is_active=True,
        interface_language=space_in.interface_language,
        learning_language=space_in.learning_language,
        source_language=space_in.source_language
    )
    db.add(space)
    db.commit()
    db.refresh(space)
    return space


@router.post("/generate-from-text", response_model=StudySpaceResponse, status_code=status.HTTP_201_CREATED)
def generate_study_space_from_text(
    payload: StudySpaceGenerateText,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Legacy instant generation endpoint.
    """
    parsed_topics = course_generator.parse_topics_from_text(payload.text)
    if not parsed_topics:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not extract any learning topics from the provided text."
        )

    title = payload.title or parsed_topics[0]["title"]
    space = course_generator.generate_study_space(
        db=db,
        user_id=current_user.id,
        title=title,
        description=f"Curriculum generated from input: {payload.text[:120]}...",
        category=payload.category or "Backend / DevOps",
        raw_topics=parsed_topics
    )
    return space


@router.post("/generate-from-material", response_model=StudySpaceResponse, status_code=status.HTTP_201_CREATED)
def generate_study_space_from_material(
    payload: StudySpaceGenerateMaterial,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Legacy document generation endpoint.
    """
    material = (
        db.query(Material)
        .filter(Material.id == payload.material_id, Material.user_id == current_user.id)
        .first()
    )
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Material with id '{payload.material_id}' not found."
        )

    if not material.storage_path:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Material does not have a physical storage file to process."
        )

    extraction = document_processor.extract_text(material.storage_path, material.file_type)
    pages = extraction.get("pages", [])

    topics_data = course_generator.parse_topics_from_extracted_pages(
        pages,
        filename=material.original_filename or material.title
    )
    if not topics_data:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not identify structured topics from the uploaded document."
        )

    doc_name = material.original_filename or material.title
    clean_title = payload.title or doc_name.replace(".pdf", "").replace(".docx", "").replace("_", " ").title()

    space = course_generator.generate_study_space(
        db=db,
        user_id=current_user.id,
        title=clean_title,
        description=f"Roadmap generated from document '{doc_name}' ({extraction['page_count']} pages).",
        category=payload.category or "Backend / DevOps",
        raw_topics=topics_data,
        material=material
    )
    return space


@router.get("/{space_id}", response_model=StudySpaceDetailResponse)
def get_study_space(
    space_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed study space metrics.
    """
    space = (
        db.query(StudySpace)
        .filter(StudySpace.id == space_id, StudySpace.user_id == current_user.id)
        .first()
    )
    if not space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"StudySpace with id '{space_id}' not found."
        )

    t_count = len(space.topics)
    completed_count = sum(1 for t in space.topics if t.status in ("COMPLETE", "MASTERED"))
    active_plan = space.study_plans[0].id if space.study_plans else None

    return StudySpaceDetailResponse(
        id=space.id,
        user_id=space.user_id,
        title=space.title,
        description=space.description,
        category=space.category,
        is_active=space.is_active,
        is_archived=space.is_archived,
        created_at=space.created_at,
        updated_at=space.updated_at,
        interface_language=space.interface_language or "en",
        learning_language=space.learning_language or "en",
        source_language=space.source_language or "en",
        topic_count=t_count,
        completed_topic_count=completed_count,
        active_plan_id=active_plan
    )


@router.delete("/{space_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_study_space(
    space_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete study space and cascade all child topics, plans, and sessions.
    """
    space = (
        db.query(StudySpace)
        .filter(StudySpace.id == space_id, StudySpace.user_id == current_user.id)
        .first()
    )
    if not space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"StudySpace with id '{space_id}' not found."
        )

    db.delete(space)
    db.commit()
    return None

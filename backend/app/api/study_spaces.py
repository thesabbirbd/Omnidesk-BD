import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.study_space import StudySpace
from app.models.topic import Topic
from app.models.material import Material
from app.schemas.studyspace import (
    StudySpaceCreate,
    StudySpaceGenerateText,
    StudySpaceGenerateMaterial,
    StudySpaceResponse,
    StudySpaceDetailResponse
)
from app.services.course_generator import course_generator
from app.services.document_processor import document_processor
from app.api.deps import get_current_user

router = APIRouter()


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
    Universal Course Generator: Parse raw topic text or prompt and generate a complete StudySpace
    with DAG dependencies, React Flow 2D coordinates, and competency verification gates.
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
    Course Generator from Uploaded PDF / Document:
    Extracts text page-by-page, discovers topics with source page grounding,
    and builds an interactive StudySpace with DAG dependencies and competency gates.
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

    # Extract text with page-level grounding
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

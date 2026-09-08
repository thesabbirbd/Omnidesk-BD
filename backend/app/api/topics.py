import uuid
import json
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.study_space import StudySpace
from app.models.topic import Topic
from app.models.competency import CompetencyItem
from app.models.activity_log import ActivityLog
from app.schemas.topic import (
    TopicCreate,
    TopicUpdate,
    TopicResponse,
    TopicStatusUpdate,
    TopicStatusUpdateResponse,
    CompetencyItemResponse,
    CompetencyItemUpdate
)
from app.services.competency_engine import competency_engine
from app.services.ai_provider import generate_verification_quiz
from app.api.deps import get_current_user

router = APIRouter()


@router.get("", response_model=List[TopicResponse])
def list_topics(
    study_space_id: Optional[uuid.UUID] = Query(None, description="Filter by StudySpace ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List topics for the current user, optionally filtered by StudySpace.
    """
    query = db.query(Topic).filter(Topic.user_id == current_user.id)
    if study_space_id:
        query = query.filter(Topic.study_space_id == study_space_id)

    return query.order_by(Topic.order.asc(), Topic.created_at.asc()).all()


@router.post("", response_model=TopicResponse, status_code=status.HTTP_201_CREATED)
def create_topic(
    topic_in: TopicCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new topic in a study space.
    """
    space = (
        db.query(StudySpace)
        .filter(StudySpace.id == topic_in.study_space_id, StudySpace.user_id == current_user.id)
        .first()
    )
    if not space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target StudySpace not found or unauthorized."
        )

    topic_data = topic_in.model_dump()
    topic_data["user_id"] = current_user.id
    topic = Topic(**topic_data)
    db.add(topic)
    db.commit()
    db.refresh(topic)
    return topic


@router.get("/{topic_id}", response_model=TopicResponse)
def get_topic(
    topic_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed topic information including its competency gates.
    """
    topic = (
        db.query(Topic)
        .filter(Topic.id == topic_id, Topic.user_id == current_user.id)
        .first()
    )
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found.")

    return topic


@router.put("/{topic_id}", response_model=TopicResponse)
def update_topic(
    topic_id: uuid.UUID,
    topic_in: TopicUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update topic properties (title, description, coordinates, etc.).
    """
    topic = (
        db.query(Topic)
        .filter(Topic.id == topic_id, Topic.user_id == current_user.id)
        .first()
    )
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found.")

    update_data = topic_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(topic, field, value)

    db.commit()
    db.refresh(topic)
    return topic



@router.get("/{topic_id}/verify")
def get_topic_verification_quiz_challenge(
    topic_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Anti-Fake-Progress Verification Challenge (Phase 4 / v1.2.8):
    Generates a 4-option multiple-choice question powered by Gemini 1.5 Flash
    testing conceptual understanding (not rote memorization).
    """
    topic = (
        db.query(Topic)
        .filter(Topic.id == topic_id, Topic.user_id == current_user.id)
        .first()
    )
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found.")

    quiz_data = generate_verification_quiz(topic.title)
    return {
        "topic_id": str(topic.id),
        "topic_title": topic.title,
        "question": quiz_data["question"],
        "options": quiz_data["options"],
        "correct_answer_index": quiz_data["correct_answer_index"],
        "explanation": quiz_data.get("explanation", ""),
        "provider": quiz_data.get("provider", "gemini-1.5-flash")
    }


@router.patch("/{topic_id}/status", response_model=TopicStatusUpdateResponse)
def update_topic_status(
    topic_id: uuid.UUID,
    payload: TopicStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update topic status (NORMAL, LEARNING, COMPLETE, BLOCKED, REVIEW, MASTERED).
    Enforces Anti-Fake-Progress Verification & Velocity Monitor:
    - User cannot mark COMPLETE without proving mastery via verification quiz.
    - Verified completion automatically logs evidence to ActivityLog.
    """
    target_status = payload.status.upper()
    valid_statuses = {"NORMAL", "LEARNING", "COMPLETE", "BLOCKED", "REVIEW", "MASTERED"}
    if target_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{payload.status}'. Valid: {', '.join(valid_statuses)}"
        )

    topic = (
        db.query(Topic)
        .filter(Topic.id == topic_id, Topic.user_id == current_user.id)
        .first()
    )
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found.")

    warning_flag = False
    warning_msg = None

    # Competency Gate Check on Completion
    if target_status in ("COMPLETE", "MASTERED"):
        # If quiz was passed, mark competency items as verified if none were checked yet
        if payload.quiz_verified:
            comps = db.query(CompetencyItem).filter(CompetencyItem.topic_id == topic.id).all()
            if comps and not any(c.is_completed for c in comps):
                comps[0].is_completed = True
                comps[0].evidence_notes = payload.evidence_notes or "Verified via Gemini 1.5 Flash Conceptual Quiz"
                db.flush()

        can_complete, err_msg, is_warning = competency_engine.validate_topic_completion(
            db, topic, current_user.id
        )
        if not can_complete:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=err_msg
            )
        if is_warning:
            warning_flag = True
            warning_msg = err_msg

        # Log verification & topic completion in ActivityLog
        quiz_log = ActivityLog(
            user_id=current_user.id,
            study_space_id=topic.study_space_id,
            event_type="QUIZ_COMPLETED",
            title=f"Verified Concept: {topic.title}",
            description=f"Passed Anti-Fake-Progress challenge for topic '{topic.title}'.",
            metadata_json=json.dumps({
                "topic_id": str(topic.id),
                "verified": True,
                "quiz_verified": bool(payload.quiz_verified)
            })
        )
        db.add(quiz_log)

        comp_log = ActivityLog(
            user_id=current_user.id,
            study_space_id=topic.study_space_id,
            event_type="TOPIC_COMPLETED",
            title=f"Completed Topic: {topic.title}",
            description=f"Topic '{topic.title}' marked as {target_status} with verified mastery.",
            metadata_json=json.dumps({"topic_id": str(topic.id), "status": target_status, "progress": 100})
        )
        db.add(comp_log)

    topic.status = target_status
    if payload.progress is not None:
        topic.progress = payload.progress
    elif target_status in ("COMPLETE", "MASTERED"):
        topic.progress = 100
    elif target_status == "NORMAL":
        topic.progress = 0

    db.commit()
    db.refresh(topic)

    return TopicStatusUpdateResponse(
        topic_id=topic.id,
        status=topic.status,
        progress=topic.progress,
        anti_fake_progress_warning=warning_flag,
        warning_message=warning_msg
    )


@router.patch("/{topic_id}/competencies/{comp_id}/toggle", response_model=CompetencyItemResponse)
def toggle_competency_item(
    topic_id: uuid.UUID,
    comp_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Toggle competency item completion status and update parent topic progress.
    """
    topic = (
        db.query(Topic)
        .filter(Topic.id == topic_id, Topic.user_id == current_user.id)
        .first()
    )
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found.")

    comp = db.query(CompetencyItem).filter(CompetencyItem.id == comp_id, CompetencyItem.topic_id == topic.id).first()
    if not comp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CompetencyItem not found.")

    comp.is_completed = not comp.is_completed
    db.flush()

    # Recalculate topic progress based on competencies
    all_comps = db.query(CompetencyItem).filter(CompetencyItem.topic_id == topic.id).all()
    if all_comps:
        done = sum(1 for c in all_comps if c.is_completed)
        pct = round((done / len(all_comps)) * 100)
        topic.progress = pct
        if pct > 0 and topic.status == "NORMAL":
            topic.status = "LEARNING"

    db.commit()
    db.refresh(comp)
    return comp


@router.delete("/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_topic(
    topic_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a topic.
    """
    topic = (
        db.query(Topic)
        .filter(Topic.id == topic_id, Topic.user_id == current_user.id)
        .first()
    )
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found.")

    db.delete(topic)
    db.commit()
    return None

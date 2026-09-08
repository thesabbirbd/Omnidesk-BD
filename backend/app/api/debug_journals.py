import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.project import DebugJournal, Project
from app.models.study_space import StudySpace
from app.models.topic import Topic
from app.schemas.debug_journal import (
    DebugJournalCreate,
    DebugJournalUpdate,
    DebugJournalResponse,
    DebugHypothesisRequest,
    DebugHypothesisResponse
)
from app.services.ai_provider import get_ai_provider

router = APIRouter()


@router.post("", response_model=DebugJournalResponse, status_code=status.HTTP_201_CREATED)
def create_debug_journal(
    payload: DebugJournalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates a new structured debug journal entry (Problem -> Hypothesis -> Command -> Output -> Root Cause -> Solution).
    Optionally links to a Project and/or Topic.
    """
    if payload.project_id:
        proj = db.query(Project).filter(Project.id == payload.project_id, Project.user_id == current_user.id).first()
        if not proj:
            raise HTTPException(status_code=404, detail="Referenced Project not found")

    if payload.topic_id:
        top = (
            db.query(Topic)
            .join(StudySpace, Topic.study_space_id == StudySpace.id)
            .filter(Topic.id == payload.topic_id, StudySpace.user_id == current_user.id)
            .first()
        )
        if not top:
            raise HTTPException(status_code=404, detail="Referenced Topic not found")

    entry = DebugJournal(
        user_id=current_user.id,
        project_id=payload.project_id,
        topic_id=payload.topic_id,
        title=payload.title,
        problem=payload.problem,
        symptom=payload.symptom,
        hypothesis=payload.hypothesis,
        command_used=payload.command_used,
        output_logs=payload.output_logs,
        root_cause=payload.root_cause,
        solution=payload.solution,
        lesson_learned=payload.lesson_learned
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("", response_model=List[DebugJournalResponse])
def list_debug_journals(
    project_id: Optional[uuid.UUID] = Query(None),
    topic_id: Optional[uuid.UUID] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lists all debug journal entries for the authenticated user, filterable by project or topic.
    """
    query = db.query(DebugJournal).filter(DebugJournal.user_id == current_user.id)
    if project_id:
        query = query.filter(DebugJournal.project_id == project_id)
    if topic_id:
        query = query.filter(DebugJournal.topic_id == topic_id)
    return query.order_by(DebugJournal.created_at.desc()).all()


@router.get("/{journal_id}", response_model=DebugJournalResponse)
def get_debug_journal(
    journal_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = (
        db.query(DebugJournal)
        .filter(DebugJournal.id == journal_id, DebugJournal.user_id == current_user.id)
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Debug journal entry not found")
    return entry


@router.put("/{journal_id}", response_model=DebugJournalResponse)
def update_debug_journal(
    journal_id: uuid.UUID,
    payload: DebugJournalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = (
        db.query(DebugJournal)
        .filter(DebugJournal.id == journal_id, DebugJournal.user_id == current_user.id)
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Debug journal entry not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(entry, field, val)

    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{journal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_debug_journal(
    journal_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = (
        db.query(DebugJournal)
        .filter(DebugJournal.id == journal_id, DebugJournal.user_id == current_user.id)
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Debug journal entry not found")

    db.delete(entry)
    db.commit()
    return None


@router.post("/ai-hypothesis", response_model=DebugHypothesisResponse)
def generate_debug_hypothesis(
    payload: DebugHypothesisRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generates a structured root cause hypothesis and diagnosis command using AIProvider
    (100% offline fallback when offline or without API key).
    """
    ai = get_ai_provider()
    suggestion = ai.suggest_debug_hypothesis(
        problem=payload.problem,
        symptom=payload.symptom,
        logs=payload.output_logs
    )
    return suggestion

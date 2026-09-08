import uuid
from datetime import datetime, timezone, time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.db.session import get_db
from app.models.user import User
from app.models.study_session import StudySession
from app.models.topic import Topic
from app.schemas.session import SessionStart, SessionStop, SessionResponse, TodaySessionsResponse
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/start", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def start_session(
    session_in: SessionStart,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Start a new timer study session linked to the authenticated user.
    """
    topic_uuid = None
    if session_in.topic_id is not None:
        try:
            topic_uuid = uuid.UUID(str(session_in.topic_id))
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid topic_id format. Must be a valid UUID."
            )
        topic = db.query(Topic).filter(Topic.id == topic_uuid, Topic.user_id == current_user.id).first()
        if not topic:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Topic with id '{session_in.topic_id}' not found or not owned by you."
            )

    space_uuid = None
    if session_in.study_space_id is not None:
        try:
            space_uuid = uuid.UUID(str(session_in.study_space_id))
        except (ValueError, TypeError):
            pass

    new_session = StudySession(
        user_id=current_user.id,
        topic_id=topic_uuid,
        study_space_id=space_uuid,
        mode=session_in.mode,
        planned_duration_minutes=session_in.planned_duration_minutes,
        start_time=datetime.now(timezone.utc),
        duration_minutes=0
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session


@router.post("/{session_id}/stop", response_model=SessionResponse)
def stop_session(
    session_id: uuid.UUID,
    session_in: Optional[SessionStop] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Stop an active study session owned by the authenticated user and compute duration.
    """
    session = db.query(StudySession).filter(
        StudySession.id == session_id,
        StudySession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"StudySession with id '{session_id}' not found."
        )

    end_time = datetime.now(timezone.utc)
    session.end_time = end_time

    if session_in and session_in.duration_minutes is not None:
        session.duration_minutes = session_in.duration_minutes
    else:
        delta_seconds = (end_time - session.start_time).total_seconds()
        session.duration_minutes = max(1, round(delta_seconds / 60))

    db.commit()
    db.refresh(session)
    return session


@router.get("/today", response_model=TodaySessionsResponse)
def get_today_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all study sessions recorded today for the current user along with total focused minutes.
    """
    now = datetime.now(timezone.utc)
    today_start = datetime.combine(now.date(), time.min, tzinfo=timezone.utc)

    sessions = (
        db.query(StudySession)
        .filter(StudySession.user_id == current_user.id, StudySession.start_time >= today_start)
        .order_by(desc(StudySession.start_time))
        .all()
    )

    total_minutes = sum(s.duration_minutes for s in sessions)

    return {
        "date": now.strftime("%Y-%m-%d"),
        "total_minutes": total_minutes,
        "sessions_count": len(sessions),
        "sessions": sessions
    }


@router.get("", response_model=List[SessionResponse])
def get_sessions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List study sessions for the authenticated user in reverse chronological order.
    """
    return (
        db.query(StudySession)
        .filter(StudySession.user_id == current_user.id)
        .order_by(desc(StudySession.start_time))
        .offset(skip)
        .limit(limit)
        .all()
    )

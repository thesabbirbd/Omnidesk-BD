from fastapi import APIRouter, Depends
from typing import Optional
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user, get_optional_current_user, get_or_create_default_user
from app.models.user import User
from app.schemas.command_center import (
    WhatToStudyResponse,
    WeeklyRetroResponse,
    WeaknessReportResponse
)
from app.services.command_center import CommandCenterService
from app.services.weakness_detector import WeaknessDetectorService

router = APIRouter()


@router.get("/what-to-study", response_model=WhatToStudyResponse)
def get_what_to_study_now(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Evaluates prerequisites, overdue spaced repetition reviews, and detected weaknesses
    to determine the optimal next learning action.
    """
    if not current_user:
        current_user = get_or_create_default_user(db)
    data = CommandCenterService.get_what_to_study_now(current_user.id, db)
    return data


@router.get("/weekly-retro", response_model=WeeklyRetroResponse)
def get_weekly_retrospective(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Computes planned vs. actual study hours over the previous 7 days,
    evaluating focus accuracy, completed topics, and identified weakness areas.
    """
    if not current_user:
        current_user = get_or_create_default_user(db)
    data = CommandCenterService.get_weekly_retrospective(current_user.id, db)
    return data


@router.get("/weaknesses", response_model=WeaknessReportResponse)
def get_weakness_report(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Scans recent quiz attempts and prolonged study sessions to diagnose learning gaps.
    """
    if not current_user:
        current_user = get_or_create_default_user(db)
    weaknesses = WeaknessDetectorService.detect_weaknesses(current_user.id, db)
    return {
        "weaknesses": weaknesses,
        "total_weaknesses": len(weaknesses)
    }

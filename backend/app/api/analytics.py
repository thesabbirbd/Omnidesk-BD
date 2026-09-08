from typing import Dict, Any, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.api.deps import get_current_user
from app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.get("/dashboard", response_model=Dict[str, Any])
def get_analytics_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get aggregated analytics: focus score, completion velocity,
    planned vs actual study hours, and topic progression trends.
    """
    return AnalyticsService.get_dashboard_analytics(current_user.id, db)


@router.get("/heatmap", response_model=List[Dict[str, Any]])
def get_activity_heatmap(
    days: int = Query(365, ge=7, le=730),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get historical study session heatmap intensity buckets for past N days.
    """
    return AnalyticsService.get_dynamic_heatmap(current_user.id, db, days=days)


@router.get("/anti-fake-progress", response_model=Dict[str, Any])
def get_anti_fake_progress_audit(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Anti-Fake-Progress V2 audit identifying topics marked complete
    without adequate quiz scores or project implementation evidence.
    """
    return AnalyticsService.check_anti_fake_progress_v2(current_user.id, db)

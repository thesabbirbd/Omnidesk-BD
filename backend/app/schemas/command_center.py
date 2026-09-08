from typing import List, Optional
from pydantic import BaseModel


class RecommendationItem(BaseModel):
    topic_id: Optional[str] = None
    topic_title: str
    category: str
    priority: str
    badge: str
    reason: str
    estimated_minutes: int
    action_label: str
    status: Optional[str] = None


class WhatToStudyResponse(BaseModel):
    timestamp: str
    recommendations: List[RecommendationItem]
    total_recommendations: int


class WeeklyRetroResponse(BaseModel):
    period_start: str
    period_end: str
    planned_hours: float
    actual_hours: float
    achievement_pct: int
    sessions_count: int
    focus_accuracy_pct: int
    topics_completed: int
    weak_areas: List[str]
    evaluation: str


class WeaknessItem(BaseModel):
    topic_id: Optional[str] = None
    topic_title: str
    type: str
    severity: str
    reasons: List[str]
    recommendations: List[str]
    engine_mode: str
    score: Optional[int] = None
    logged_minutes: Optional[int] = None
    estimated_minutes: Optional[int] = None


class WeaknessReportResponse(BaseModel):
    weaknesses: List[WeaknessItem]
    total_weaknesses: int

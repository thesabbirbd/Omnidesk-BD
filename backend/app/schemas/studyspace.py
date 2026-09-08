import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class StudySpaceBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "Backend / DevOps"
    interface_language: str = "en"
    learning_language: str = "en"
    source_language: str = "en"


class StudySpaceCreate(StudySpaceBase):
    pass


class StudySpaceGenerateText(BaseModel):
    text: str
    title: Optional[str] = None
    category: Optional[str] = "Backend / DevOps"


class StudySpaceGenerateMaterial(BaseModel):
    material_id: uuid.UUID
    title: Optional[str] = None
    category: Optional[str] = "Backend / DevOps"


# =========================================================================
# PACKETS 1H - 1K: PREVIEW & APPROVAL SCHEMAS (Analyze -> Preview -> Approve -> Persist)
# =========================================================================

class TopicPreviewItem(BaseModel):
    title: str = Field(..., description="Topic title")
    description: str = Field(default="", description="Topic description")
    subtopics: List[str] = Field(default_factory=list)
    dependencies: List[str] = Field(default_factory=list, description="Prerequisite topic titles")
    estimated_minutes: int = Field(default=45, ge=5, le=480)
    difficulty: str = Field(default="INTERMEDIATE")
    source_reference: Optional[str] = None
    confidence_score: float = Field(default=0.92, ge=0.0, le=1.0)
    source_type: str = Field(default="AI_INFERRED")


class StudySessionPreviewItem(BaseModel):
    session_index: int
    title: str
    planned_minutes: int
    topics: List[str] = Field(default_factory=list)
    break_after_minutes: int = 10
    is_milestone: bool = False
    day_number: int = 1
    week_number: int = 1


class StudyPlanPreview(BaseModel):
    total_planned_minutes: int
    total_study_minutes: int
    total_break_minutes: int
    daily_target_minutes: int
    estimated_days: int
    estimated_weeks: int
    total_sessions: int
    sprint_mode: bool = False
    available_time_limit_minutes: Optional[int] = None
    sessions: List[StudySessionPreviewItem] = Field(default_factory=list)


class StudySpacePreviewResponse(BaseModel):
    """
    Volatile preview returned by generation engine.
    CRITICAL: This structure is NOT yet saved to the database.
    """
    preview_id: str
    title: str
    description: str
    category: str = "Backend / DevOps"
    interface_language: str = "en"
    learning_language: str = "en"
    source_language: str = "en"
    provider_used: str = "offline_heuristic"
    total_estimated_minutes: int = 0
    topics: List[TopicPreviewItem]
    study_plan: Optional[StudyPlanPreview] = None
    material_id: Optional[uuid.UUID] = None
    is_preview: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StudySpaceGenerateRequest(BaseModel):
    """
    Input payload for POST /api/v1/study-spaces/generate.
    Accepts goals, raw text, uploaded material reference, or time limits.
    """
    goal: Optional[str] = None
    text: Optional[str] = None
    material_id: Optional[uuid.UUID] = None
    time_limit_minutes: Optional[int] = Field(default=None, ge=15, le=10000)
    daily_target_minutes: int = Field(default=60, ge=15, le=480)
    interface_language: str = "en"
    learning_language: str = "en"
    source_language: str = "en"
    category: str = "Backend / DevOps"
    title: Optional[str] = None
    preferred_provider: Optional[str] = None


class StudySpaceApproveRequest(BaseModel):
    """
    Input payload for POST /api/v1/study-spaces/approve.
    Persists the validated preview into PostgreSQL with strict user isolation.
    """
    title: str
    description: Optional[str] = None
    category: str = "Backend / DevOps"
    interface_language: str = "en"
    learning_language: str = "en"
    source_language: str = "en"
    material_id: Optional[uuid.UUID] = None
    topics: List[TopicPreviewItem] = Field(..., min_length=1)
    study_plan: Optional[StudyPlanPreview] = None
    generate_study_plan: bool = True


class StudyTemplateSummary(BaseModel):
    id: str
    title: str
    category: str
    description: str
    topic_count: int
    total_estimated_minutes: int
    interface_language: str
    learning_language: str
    source_language: str


# Standard persisted responses
class StudySpaceResponse(StudySpaceBase):
    id: uuid.UUID
    user_id: uuid.UUID
    is_active: bool
    is_archived: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StudySpaceDetailResponse(StudySpaceResponse):
    topic_count: int = 0
    completed_topic_count: int = 0
    active_plan_id: Optional[uuid.UUID] = None

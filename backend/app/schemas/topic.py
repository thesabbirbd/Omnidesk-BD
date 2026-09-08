import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class CompetencyItemBase(BaseModel):
    title: str
    competency_type: str = "EXPLAIN"
    is_completed: bool = False
    evidence_notes: Optional[str] = None


class CompetencyItemUpdate(BaseModel):
    is_completed: Optional[bool] = None
    evidence_notes: Optional[str] = None


class CompetencyItemResponse(CompetencyItemBase):
    id: uuid.UUID
    topic_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TopicBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: str = Field(default="NORMAL", description="NORMAL, LEARNING, COMPLETE, BLOCKED, REVIEW, MASTERED")
    progress: int = Field(default=0, ge=0, le=100)
    priority: int = Field(default=1, ge=1, le=5)
    difficulty: str = "intermediate"
    estimated_minutes: int = 60
    order: int = 0
    position_x: float = 0.0
    position_y: float = 0.0


class TopicCreate(TopicBase):
    study_space_id: uuid.UUID


class TopicUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    progress: Optional[int] = None
    priority: Optional[int] = None
    difficulty: Optional[str] = None
    estimated_minutes: Optional[int] = None
    order: Optional[int] = None
    position_x: Optional[float] = None
    position_y: Optional[float] = None


class TopicStatusUpdate(BaseModel):
    status: str
    progress: Optional[int] = None


class TopicStatusUpdateResponse(BaseModel):
    topic_id: uuid.UUID
    status: str
    progress: int
    anti_fake_progress_warning: bool = False
    warning_message: Optional[str] = None


class TopicResponse(TopicBase):
    id: uuid.UUID
    study_space_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    competencies: List[CompetencyItemResponse] = []

    model_config = ConfigDict(from_attributes=True)

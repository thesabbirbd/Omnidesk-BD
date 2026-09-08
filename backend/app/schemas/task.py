import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    is_completed: bool = False
    priority: int = 1
    due_date: Optional[datetime] = None
    estimated_minutes: int = 30

    # Data Provenance Metadata (Packet 1D)
    source_type: str = "USER_CREATED"
    source_reference: Optional[str] = None
    confidence_score: float = 1.0


class TaskCreate(TaskBase):
    topic_id: Optional[uuid.UUID] = None
    study_day_id: Optional[uuid.UUID] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    is_completed: Optional[bool] = None
    priority: Optional[int] = None
    due_date: Optional[datetime] = None
    estimated_minutes: Optional[int] = None
    source_type: Optional[str] = None
    source_reference: Optional[str] = None
    confidence_score: Optional[float] = None


class TaskResponse(TaskBase):
    id: uuid.UUID
    user_id: uuid.UUID
    topic_id: Optional[uuid.UUID] = None
    study_day_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

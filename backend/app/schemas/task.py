from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    is_completed: bool = False


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    topic_id: int


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    is_completed: Optional[bool] = None


class TaskResponse(TaskBase):
    id: int
    topic_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

from datetime import datetime
from enum import IntEnum
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class TopicStatus(IntEnum):
    NORMAL = 0
    LEARNING = 1
    COMPLETE = 2


# --- Topic Schemas ---
class TopicBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: int = Field(default=TopicStatus.NORMAL, ge=0, le=2, description="0=Normal, 1=Learning, 2=Complete")
    order: int = Field(default=0, ge=0)


class TopicCreate(TopicBase):
    study_space_id: int


class TopicUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[int] = Field(None, ge=0, le=2)
    order: Optional[int] = Field(None, ge=0)


class TopicResponse(TopicBase):
    id: int
    study_space_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- StudySpace Schemas ---
class StudySpaceBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class StudySpaceCreate(StudySpaceBase):
    pass


class StudySpaceUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None


class StudySpaceResponse(StudySpaceBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    topics: List[TopicResponse] = []

    model_config = ConfigDict(from_attributes=True)

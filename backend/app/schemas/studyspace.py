import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class StudySpaceBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "Backend / DevOps"


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

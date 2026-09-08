from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ProjectBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: str = Field(default="in_progress", max_length=50)
    github_url: Optional[str] = Field(None, max_length=500)


class ProjectCreate(ProjectBase):
    study_space_id: int


class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)
    github_url: Optional[str] = Field(None, max_length=500)


class ProjectResponse(ProjectBase):
    id: int
    study_space_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

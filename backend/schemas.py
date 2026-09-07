from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TopicBase(BaseModel):
    title: str
    status: str = "normal"
    progress: int = 0
    study_space_id: Optional[int] = None

class TopicCreate(TopicBase):
    pass

class TopicResponse(TopicBase):
    id: int

    class Config:
        from_attributes = True

class StudySessionBase(BaseModel):
    topic_id: Optional[int] = None
    duration_minutes: int = 0
    mode: str = "focus"

class StudySessionCreate(StudySessionBase):
    pass

class StudySessionResponse(StudySessionBase):
    id: int
    start_time: datetime

    class Config:
        from_attributes = True

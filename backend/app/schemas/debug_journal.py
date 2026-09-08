import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class DebugJournalCreate(BaseModel):
    title: str
    problem: str
    symptom: Optional[str] = None
    hypothesis: Optional[str] = None
    command_used: Optional[str] = None
    output_logs: Optional[str] = None
    root_cause: Optional[str] = None
    solution: Optional[str] = None
    lesson_learned: Optional[str] = None
    project_id: Optional[uuid.UUID] = None
    topic_id: Optional[uuid.UUID] = None


class DebugJournalUpdate(BaseModel):
    title: Optional[str] = None
    problem: Optional[str] = None
    symptom: Optional[str] = None
    hypothesis: Optional[str] = None
    command_used: Optional[str] = None
    output_logs: Optional[str] = None
    root_cause: Optional[str] = None
    solution: Optional[str] = None
    lesson_learned: Optional[str] = None
    project_id: Optional[uuid.UUID] = None
    topic_id: Optional[uuid.UUID] = None


class DebugHypothesisRequest(BaseModel):
    problem: str
    symptom: Optional[str] = None
    output_logs: Optional[str] = None


class DebugHypothesisResponse(BaseModel):
    hypothesis: str
    investigation_command: str
    recommended_fix: str


class DebugJournalResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    project_id: Optional[uuid.UUID] = None
    topic_id: Optional[uuid.UUID] = None
    title: str
    problem: str
    symptom: Optional[str] = None
    hypothesis: Optional[str] = None
    command_used: Optional[str] = None
    output_logs: Optional[str] = None
    root_cause: Optional[str] = None
    solution: Optional[str] = None
    lesson_learned: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

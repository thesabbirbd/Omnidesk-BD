from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class SessionStart(BaseModel):
    topic_id: Optional[int] = None
    mode: str = Field(default="pomodoro", description="Timer mode: pomodoro, focus, break, etc.")


class SessionStop(BaseModel):
    duration_minutes: Optional[int] = Field(None, ge=0, description="Override calculated duration if needed")


class SessionResponse(BaseModel):
    id: int
    topic_id: Optional[int] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_minutes: int
    mode: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TodaySessionsResponse(BaseModel):
    date: str
    total_minutes: int
    sessions_count: int
    sessions: List[SessionResponse]

import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class UserProfileBase(BaseModel):
    full_name: Optional[str] = None
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    headline: Optional[str] = "Junior Cloud & Systems Engineer"
    bio: Optional[str] = None
    github_url: Optional[str] = None
    timezone: str = "UTC"

    daily_goal_hours: int = 4
    weekly_goal_hours: int = 20
    challenge_duration_days: int = 100

    preferred_theme_mode: str = "dark"
    preferred_theme_style: str = "glass"
    preferred_glass_gradient: str = "aurora"
    preferred_timer_mode: str = "pomodoro"

    presence_enabled: bool = True
    presence_interval_secs: int = 5


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    github_url: Optional[str] = None
    timezone: Optional[str] = None

    daily_goal_hours: Optional[int] = None
    weekly_goal_hours: Optional[int] = None
    challenge_duration_days: Optional[int] = None

    preferred_theme_mode: Optional[str] = None
    preferred_theme_style: Optional[str] = None
    preferred_glass_gradient: Optional[str] = None
    preferred_timer_mode: Optional[str] = None

    presence_enabled: Optional[bool] = None
    presence_interval_secs: Optional[int] = None


class UserProfileResponse(UserProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserSettingsUpdate(BaseModel):
    notifications_enabled: Optional[bool] = None
    sound_enabled: Optional[bool] = None
    browser_push_enabled: Optional[bool] = None
    camera_presence_active: Optional[bool] = None
    timer_durations_json: Optional[str] = None
    custom_settings_json: Optional[str] = None


class UserSettingsResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    notifications_enabled: bool
    sound_enabled: bool
    browser_push_enabled: bool
    camera_presence_active: bool
    timer_durations_json: Optional[str] = None
    custom_settings_json: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

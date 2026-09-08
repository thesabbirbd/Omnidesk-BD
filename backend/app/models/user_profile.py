import uuid
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Text, Integer, Boolean, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False
    )

    full_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    username: Mapped[Optional[str]] = mapped_column(String(100), unique=True, index=True, nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    headline: Mapped[Optional[str]] = mapped_column(String(200), default="Junior Cloud & Systems Engineer", nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    github_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    timezone: Mapped[str] = mapped_column(String(50), default="UTC", nullable=False)

    # Goals & Learning Preferences
    daily_goal_hours: Mapped[int] = mapped_column(Integer, default=4, nullable=False)
    weekly_goal_hours: Mapped[int] = mapped_column(Integer, default=20, nullable=False)
    challenge_duration_days: Mapped[int] = mapped_column(Integer, default=100, nullable=False)

    # Theme & Timer Preferences
    preferred_theme_mode: Mapped[str] = mapped_column(String(20), default="dark", nullable=False)
    preferred_theme_style: Mapped[str] = mapped_column(String(20), default="glass", nullable=False)
    preferred_glass_gradient: Mapped[str] = mapped_column(String(30), default="aurora", nullable=False)
    preferred_timer_mode: Mapped[str] = mapped_column(String(50), default="pomodoro", nullable=False)

    # Presence Detection Preference
    presence_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    presence_interval_secs: Mapped[int] = mapped_column(Integer, default=5, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="profile")

    def __repr__(self) -> str:
        return f"<UserProfile(user_id={self.user_id}, full_name='{self.full_name}', username='{self.username}')>"

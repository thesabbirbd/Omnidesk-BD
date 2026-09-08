import uuid
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Text, Boolean, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class UserSettings(Base):
    __tablename__ = "user_settings"

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

    notifications_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    sound_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    browser_push_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    camera_presence_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # JSON strings for flexible custom duration configs and miscellaneous state
    timer_durations_json: Mapped[Optional[str]] = mapped_column(
        Text,
        default='{"pomodoro":25,"focus":50,"short_break":5,"long_break":15}',
        nullable=True
    )
    custom_settings_json: Mapped[Optional[str]] = mapped_column(Text, default="{}", nullable=True)

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
    user: Mapped["User"] = relationship("User", back_populates="settings")

    def __repr__(self) -> str:
        return f"<UserSettings(user_id={self.user_id}, notifications={self.notifications_enabled})>"

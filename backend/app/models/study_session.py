import uuid
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Integer, Boolean, ForeignKey, DateTime, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.study_space import StudySpace
    from app.models.topic import Topic


class StudySession(Base):
    __tablename__ = "study_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    study_space_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("study_spaces.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    topic_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("topics.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    mode: Mapped[str] = mapped_column(String(50), default="pomodoro", nullable=False)
    start_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True
    )
    end_time: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    planned_duration_minutes: Mapped[int] = mapped_column(Integer, default=25, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    pause_duration_seconds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    presence_checked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="sessions")
    study_space: Mapped[Optional["StudySpace"]] = relationship("StudySpace")
    topic: Mapped[Optional["Topic"]] = relationship("Topic", back_populates="sessions")

    def __repr__(self) -> str:
        return (
            f"<StudySession(id={self.id}, user_id={self.user_id}, "
            f"duration={self.duration_minutes}m, mode='{self.mode}')>"
        )

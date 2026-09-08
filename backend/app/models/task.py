import uuid
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Text, Boolean, Integer, ForeignKey, DateTime, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.topic import Topic
    from app.models.study_plan import StudyDay


class Task(Base):
    __tablename__ = "tasks"

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
    topic_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("topics.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )
    study_day_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("study_days.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    priority: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    estimated_minutes: Mapped[int] = mapped_column(Integer, default=30, nullable=False)

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
    user: Mapped["User"] = relationship("User", back_populates="tasks")
    topic: Mapped[Optional["Topic"]] = relationship("Topic", back_populates="tasks")
    study_day: Mapped[Optional["StudyDay"]] = relationship("StudyDay", back_populates="tasks")

    def __repr__(self) -> str:
        return f"<Task(id={self.id}, title='{self.title}', is_completed={self.is_completed})>"

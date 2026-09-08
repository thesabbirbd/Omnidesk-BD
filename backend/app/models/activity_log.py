import uuid
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Text, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.study_space import StudySpace


class ActivityLog(Base):
    __tablename__ = "activity_logs"

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

    # Event types: TOPIC_STARTED, TOPIC_COMPLETED, SESSION_COMPLETED, MATERIAL_UPLOADED,
    # NOTE_CREATED, PROJECT_UPDATED, QUIZ_COMPLETED, MILESTONE_REACHED
    event_type: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[Optional[str]] = mapped_column(Text, default="{}", nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="activity_logs")
    study_space: Mapped[Optional["StudySpace"]] = relationship("StudySpace", back_populates="activity_logs")

    def __repr__(self) -> str:
        return f"<ActivityLog(id={self.id}, user_id={self.user_id}, event='{self.event_type}')>"

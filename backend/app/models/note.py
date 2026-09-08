import uuid
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Text, Boolean, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.study_space import StudySpace
    from app.models.topic import Topic
    from app.models.project import Project


class Note(Base):
    __tablename__ = "notes"

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
    study_space_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("study_spaces.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    topic_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("topics.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("projects.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, default="", nullable=False)
    tags_json: Mapped[Optional[str]] = mapped_column(Text, default="[]", nullable=True)
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False, index=True, nullable=False)
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False, index=True, nullable=False)

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
    user: Mapped["User"] = relationship("User", back_populates="notes")
    study_space: Mapped["StudySpace"] = relationship("StudySpace", back_populates="notes")
    topic: Mapped[Optional["Topic"]] = relationship("Topic", back_populates="notes")
    project: Mapped[Optional["Project"]] = relationship("Project", back_populates="notes")

    def __repr__(self) -> str:
        return f"<Note(id={self.id}, title='{self.title}', pinned={self.is_pinned})>"

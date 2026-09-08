import uuid
from datetime import datetime, timezone
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Text, Boolean, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.topic import Topic
    from app.models.project import Project
    from app.models.material import Material
    from app.models.note import Note
    from app.models.study_plan import StudyPlan
    from app.models.quiz import Quiz
    from app.models.activity_log import ActivityLog


class StudySpace(Base):
    __tablename__ = "study_spaces"

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

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(100), default="Backend / DevOps", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Multilingual Architecture
    interface_language: Mapped[str] = mapped_column(String(10), default="en", nullable=False)
    learning_language: Mapped[str] = mapped_column(String(10), default="en", nullable=False)
    source_language: Mapped[str] = mapped_column(String(10), default="en", nullable=False)

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
    user: Mapped["User"] = relationship("User", back_populates="study_spaces")
    topics: Mapped[List["Topic"]] = relationship(
        "Topic",
        back_populates="study_space",
        cascade="all, delete-orphan"
    )
    study_plans: Mapped[List["StudyPlan"]] = relationship(
        "StudyPlan",
        back_populates="study_space",
        cascade="all, delete-orphan"
    )
    projects: Mapped[List["Project"]] = relationship(
        "Project",
        back_populates="study_space",
        cascade="all, delete-orphan"
    )
    materials: Mapped[List["Material"]] = relationship(
        "Material",
        back_populates="study_space",
        cascade="all, delete-orphan"
    )
    notes: Mapped[List["Note"]] = relationship(
        "Note",
        back_populates="study_space",
        cascade="all, delete-orphan"
    )
    quizzes: Mapped[List["Quiz"]] = relationship(
        "Quiz",
        back_populates="study_space",
        cascade="all, delete-orphan"
    )
    activity_logs: Mapped[List["ActivityLog"]] = relationship(
        "ActivityLog",
        back_populates="study_space",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<StudySpace(id={self.id}, title='{self.title}', user_id={self.user_id})>"

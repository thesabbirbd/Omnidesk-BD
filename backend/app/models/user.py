import uuid
from datetime import datetime, timezone
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Boolean, DateTime, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user_profile import UserProfile
    from app.models.user_settings import UserSettings
    from app.models.study_space import StudySpace
    from app.models.task import Task
    from app.models.topic import Topic
    from app.models.study_session import StudySession
    from app.models.project import Project, DebugJournal
    from app.models.note import Note
    from app.models.material import Material
    from app.models.review import Review, Flashcard
    from app.models.quiz import QuizAttempt
    from app.models.activity_log import ActivityLog


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

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

    # One-to-one user profile and settings
    profile: Mapped[Optional["UserProfile"]] = relationship(
        "UserProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )
    settings: Mapped[Optional["UserSettings"]] = relationship(
        "UserSettings",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    # Scoped resources
    study_spaces: Mapped[List["StudySpace"]] = relationship(
        "StudySpace",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    topics: Mapped[List["Topic"]] = relationship(
        "Topic",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    tasks: Mapped[List["Task"]] = relationship(
        "Task",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    sessions: Mapped[List["StudySession"]] = relationship(
        "StudySession",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    projects: Mapped[List["Project"]] = relationship(
        "Project",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    debug_journals: Mapped[List["DebugJournal"]] = relationship(
        "DebugJournal",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    notes: Mapped[List["Note"]] = relationship(
        "Note",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    materials: Mapped[List["Material"]] = relationship(
        "Material",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    reviews: Mapped[List["Review"]] = relationship(
        "Review",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    flashcards: Mapped[List["Flashcard"]] = relationship(
        "Flashcard",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    quiz_attempts: Mapped[List["QuizAttempt"]] = relationship(
        "QuizAttempt",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    activity_logs: Mapped[List["ActivityLog"]] = relationship(
        "ActivityLog",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', is_active={self.is_active})>"

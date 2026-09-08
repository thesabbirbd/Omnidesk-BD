import uuid
from datetime import datetime, timezone
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Text, Integer, Boolean, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.study_space import StudySpace
    from app.models.topic import Topic
    from app.models.note import Note


class Project(Base):
    __tablename__ = "projects"

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

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    # Lifecycle: IDEA, PLANNING, BUILDING, DEBUGGING, TESTING, DEPLOYED, DOCUMENTED, COMPLETE
    status: Mapped[str] = mapped_column(String(50), default="PLANNING", nullable=False, index=True)
    github_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    live_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    tech_stack_json: Mapped[Optional[str]] = mapped_column(Text, default="[]", nullable=True)
    progress_percentage: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

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
    user: Mapped["User"] = relationship("User", back_populates="projects")
    study_space: Mapped["StudySpace"] = relationship("StudySpace", back_populates="projects")
    tasks: Mapped[List["ProjectTask"]] = relationship(
        "ProjectTask",
        back_populates="project",
        cascade="all, delete-orphan"
    )
    debug_journals: Mapped[List["DebugJournal"]] = relationship(
        "DebugJournal",
        back_populates="project",
        cascade="all, delete-orphan"
    )
    notes: Mapped[List["Note"]] = relationship(
        "Note",
        back_populates="project"
    )

    def __repr__(self) -> str:
        return f"<Project(id={self.id}, title='{self.title}', status='{self.status}')>"


class ProjectTask(Base):
    __tablename__ = "project_tasks"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="tasks")

    def __repr__(self) -> str:
        return f"<ProjectTask(id={self.id}, project_id={self.project_id}, title='{self.title}')>"


class DebugJournal(Base):
    __tablename__ = "debug_journals"

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
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )
    topic_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("topics.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    problem: Mapped[str] = mapped_column(Text, nullable=False)
    symptom: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    hypothesis: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    command_used: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    output_logs: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    root_cause: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    solution: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    lesson_learned: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

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
    user: Mapped["User"] = relationship("User", back_populates="debug_journals")
    project: Mapped[Optional["Project"]] = relationship("Project", back_populates="debug_journals")
    topic: Mapped[Optional["Topic"]] = relationship("Topic", back_populates="debug_journals")

    def __repr__(self) -> str:
        return f"<DebugJournal(id={self.id}, title='{self.title}')>"

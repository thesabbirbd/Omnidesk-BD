import uuid
from datetime import datetime, timezone
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Text, Integer, Float, ForeignKey, DateTime, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.study_space import StudySpace
    from app.models.task import Task
    from app.models.study_session import StudySession
    from app.models.dependency import TopicDependency
    from app.models.competency import CompetencyItem
    from app.models.material import MaterialTopic
    from app.models.note import Note
    from app.models.review import Review, Flashcard
    from app.models.quiz import Quiz
    from app.models.project import DebugJournal


class Topic(Base):
    __tablename__ = "topics"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    study_space_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("study_spaces.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Status: NORMAL, LEARNING, COMPLETE, BLOCKED, REVIEW, MASTERED
    status: Mapped[str] = mapped_column(String(50), default="NORMAL", nullable=False, index=True)
    progress: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    priority: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    difficulty: Mapped[str] = mapped_column(String(50), default="intermediate", nullable=False)
    estimated_minutes: Mapped[int] = mapped_column(Integer, default=60, nullable=False)
    order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # React Flow canvas node coordinates
    position_x: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    position_y: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

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
    study_space: Mapped["StudySpace"] = relationship("StudySpace", back_populates="topics")
    tasks: Mapped[List["Task"]] = relationship(
        "Task",
        back_populates="topic",
        cascade="all, delete-orphan"
    )
    competencies: Mapped[List["CompetencyItem"]] = relationship(
        "CompetencyItem",
        back_populates="topic",
        cascade="all, delete-orphan"
    )
    sessions: Mapped[List["StudySession"]] = relationship(
        "StudySession",
        back_populates="topic"
    )
    notes: Mapped[List["Note"]] = relationship(
        "Note",
        back_populates="topic"
    )
    material_links: Mapped[List["MaterialTopic"]] = relationship(
        "MaterialTopic",
        back_populates="topic",
        cascade="all, delete-orphan"
    )
    reviews: Mapped[List["Review"]] = relationship(
        "Review",
        back_populates="topic",
        cascade="all, delete-orphan"
    )
    flashcards: Mapped[List["Flashcard"]] = relationship(
        "Flashcard",
        back_populates="topic",
        cascade="all, delete-orphan"
    )
    quizzes: Mapped[List["Quiz"]] = relationship(
        "Quiz",
        back_populates="topic"
    )
    debug_journals: Mapped[List["DebugJournal"]] = relationship(
        "DebugJournal",
        back_populates="topic"
    )

    # Directed Dependency Graph
    dependencies_out: Mapped[List["TopicDependency"]] = relationship(
        "TopicDependency",
        foreign_keys="[TopicDependency.source_topic_id]",
        back_populates="source_topic",
        cascade="all, delete-orphan"
    )
    dependencies_in: Mapped[List["TopicDependency"]] = relationship(
        "TopicDependency",
        foreign_keys="[TopicDependency.target_topic_id]",
        back_populates="target_topic",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Topic(id={self.id}, title='{self.title}', status='{self.status}')>"

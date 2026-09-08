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


class Quiz(Base):
    __tablename__ = "quizzes"

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
    topic_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("topics.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    passing_score_pct: Mapped[int] = mapped_column(Integer, default=80, nullable=False)

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
    study_space: Mapped["StudySpace"] = relationship("StudySpace", back_populates="quizzes")
    topic: Mapped[Optional["Topic"]] = relationship("Topic", back_populates="quizzes")
    questions: Mapped[List["QuizQuestion"]] = relationship(
        "QuizQuestion",
        back_populates="quiz",
        cascade="all, delete-orphan"
    )
    attempts: Mapped[List["QuizAttempt"]] = relationship(
        "QuizAttempt",
        back_populates="quiz",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Quiz(id={self.id}, title='{self.title}', space_id={self.study_space_id})>"


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    quiz_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("quizzes.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    # Type: MCQ, SHORT_ANSWER, CODE, ARCHITECTURE
    question_type: Mapped[str] = mapped_column(String(50), default="MCQ", nullable=False)
    options_json: Mapped[Optional[str]] = mapped_column(Text, default="[]", nullable=True)
    correct_answer: Mapped[str] = mapped_column(Text, nullable=False)
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    quiz: Mapped["Quiz"] = relationship("Quiz", back_populates="questions")

    def __repr__(self) -> str:
        return f"<QuizQuestion(id={self.id}, quiz_id={self.quiz_id}, type='{self.question_type}')>"


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    quiz_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("quizzes.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    max_score: Mapped[int] = mapped_column(Integer, default=100, nullable=False)
    passed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    answers_json: Mapped[Optional[str]] = mapped_column(Text, default="{}", nullable=True)

    completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    quiz: Mapped["Quiz"] = relationship("Quiz", back_populates="attempts")
    user: Mapped["User"] = relationship("User", back_populates="quiz_attempts")

    def __repr__(self) -> str:
        return f"<QuizAttempt(id={self.id}, user_id={self.user_id}, score={self.score}/{self.max_score}, passed={self.passed})>"

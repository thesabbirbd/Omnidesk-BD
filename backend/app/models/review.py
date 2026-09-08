import uuid
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Text, Integer, Float, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.topic import Topic


class Review(Base):
    __tablename__ = "reviews"

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
    topic_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("topics.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    due_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True
    )
    last_reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    interval_days: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    ease_factor: Mapped[float] = mapped_column(Float, default=2.5, nullable=False)
    repetition_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)

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
    user: Mapped["User"] = relationship("User", back_populates="reviews")
    topic: Mapped["Topic"] = relationship("Topic", back_populates="reviews")

    def __repr__(self) -> str:
        return f"<Review(id={self.id}, topic_id={self.topic_id}, interval={self.interval_days}d)>"


class Flashcard(Base):
    __tablename__ = "flashcards"

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
    topic_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("topics.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    hint: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    difficulty: Mapped[str] = mapped_column(String(50), default="medium", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="NEW", nullable=False)  # NEW, LEARNING, REVIEW, MASTERED

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
    user: Mapped["User"] = relationship("User", back_populates="flashcards")
    topic: Mapped["Topic"] = relationship("Topic", back_populates="flashcards")

    def __repr__(self) -> str:
        return f"<Flashcard(id={self.id}, topic_id={self.topic_id}, status='{self.status}')>"

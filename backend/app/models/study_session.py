from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.topic import Topic


class StudySession(Base):
    __tablename__ = "study_sessions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    
    topic_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("topics.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    
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
    
    duration_minutes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    mode: Mapped[str] = mapped_column(String(50), default="pomodoro", nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    topic: Mapped[Optional["Topic"]] = relationship("Topic", back_populates="sessions")

    def __repr__(self) -> str:
        return (
            f"<StudySession(id={self.id}, topic_id={self.topic_id}, "
            f"duration={self.duration_minutes}m, mode='{self.mode}')>"
        )

import uuid
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Text, Boolean, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.topic import Topic


class CompetencyItem(Base):
    __tablename__ = "competency_items"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    topic_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("topics.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    # Type: EXPLAIN, IMPLEMENT, PRACTICE, DEBUG, BUILD, TRADE_OFF
    competency_type: Mapped[str] = mapped_column(String(50), default="EXPLAIN", nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, index=True, nullable=False)
    evidence_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

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
    topic: Mapped["Topic"] = relationship("Topic", back_populates="competencies")

    def __repr__(self) -> str:
        return f"<CompetencyItem(id={self.id}, topic_id={self.topic_id}, type='{self.competency_type}', completed={self.is_completed})>"

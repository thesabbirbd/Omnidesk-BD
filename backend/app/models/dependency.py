import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING
from sqlalchemy import String, DateTime, ForeignKey, Uuid, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.topic import Topic


class TopicDependency(Base):
    __tablename__ = "topic_dependencies"
    __table_args__ = (
        UniqueConstraint("source_topic_id", "target_topic_id", name="uq_topic_dependency"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    source_topic_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("topics.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    target_topic_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("topics.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Dependency type: PREREQUISITE, RECOMMENDED, COREQUISITE
    dependency_type: Mapped[str] = mapped_column(String(50), default="PREREQUISITE", nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    source_topic: Mapped["Topic"] = relationship(
        "Topic",
        foreign_keys=[source_topic_id],
        back_populates="dependencies_out"
    )
    target_topic: Mapped["Topic"] = relationship(
        "Topic",
        foreign_keys=[target_topic_id],
        back_populates="dependencies_in"
    )

    def __repr__(self) -> str:
        return f"<TopicDependency(source={self.source_topic_id}, target={self.target_topic_id}, type='{self.dependency_type}')>"

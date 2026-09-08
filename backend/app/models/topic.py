from datetime import datetime, timezone
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Text, Integer, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.study_space import StudySpace
    from app.models.task import Task
    from app.models.study_session import StudySession


class Topic(Base):
    __tablename__ = "topics"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Status: 0=Normal, 1=Learning, 2=Complete
    status: Mapped[int] = mapped_column(Integer, default=0, nullable=False, index=True)
    order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    study_space_id: Mapped[int] = mapped_column(
        ForeignKey("study_spaces.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
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
    sessions: Mapped[List["StudySession"]] = relationship(
        "StudySession",
        back_populates="topic"
    )

    def __repr__(self) -> str:
        return f"<Topic(id={self.id}, title='{self.title}', status={self.status}, space_id={self.study_space_id})>"

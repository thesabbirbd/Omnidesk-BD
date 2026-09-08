import uuid
from datetime import datetime, timezone
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Text, Integer, Boolean, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.study_space import StudySpace
    from app.models.task import Task


class StudyPlan(Base):
    __tablename__ = "study_plans"

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

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    total_days: Mapped[int] = mapped_column(Integer, default=100, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

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
    study_space: Mapped["StudySpace"] = relationship("StudySpace", back_populates="study_plans")
    weeks: Mapped[List["StudyWeek"]] = relationship(
        "StudyWeek",
        back_populates="study_plan",
        cascade="all, delete-orphan",
        order_by="StudyWeek.week_number"
    )

    def __repr__(self) -> str:
        return f"<StudyPlan(id={self.id}, title='{self.title}', total_days={self.total_days})>"


class StudyWeek(Base):
    __tablename__ = "study_weeks"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    study_plan_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("study_plans.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    week_number: Mapped[int] = mapped_column(Integer, nullable=False)
    theme_title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    study_plan: Mapped["StudyPlan"] = relationship("StudyPlan", back_populates="weeks")
    days: Mapped[List["StudyDay"]] = relationship(
        "StudyDay",
        back_populates="study_week",
        cascade="all, delete-orphan",
        order_by="StudyDay.day_number"
    )

    def __repr__(self) -> str:
        return f"<StudyWeek(plan_id={self.study_plan_id}, week={self.week_number}, theme='{self.theme_title}')>"


class StudyDay(Base):
    __tablename__ = "study_days"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    study_week_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("study_weeks.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    day_number: Mapped[int] = mapped_column(Integer, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    focus_goal: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, index=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    study_week: Mapped["StudyWeek"] = relationship("StudyWeek", back_populates="days")
    tasks: Mapped[List["Task"]] = relationship(
        "Task",
        back_populates="study_day"
    )

    def __repr__(self) -> str:
        return f"<StudyDay(day={self.day_number}, title='{self.title}', completed={self.is_completed})>"

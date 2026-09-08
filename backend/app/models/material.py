import uuid
from datetime import datetime, timezone
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Text, Integer, ForeignKey, DateTime, Uuid, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.study_space import StudySpace
    from app.models.topic import Topic


class Material(Base):
    __tablename__ = "materials"

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
    original_filename: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    mime_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    file_type: Mapped[str] = mapped_column(String(50), default="PDF", nullable=False)  # PDF, DOCX, TXT, MARKDOWN, VIDEO, URL, IMAGE
    storage_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    source_language: Mapped[str] = mapped_column(String(10), default="en", nullable=False)

    file_size_bytes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    checksum_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    page_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Processing state: UPLOADED, PROCESSING, READY, FAILED
    processing_status: Mapped[str] = mapped_column(String(50), default="READY", nullable=False)
    processing_error: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    extracted_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

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
    user: Mapped["User"] = relationship("User", back_populates="materials")
    study_space: Mapped["StudySpace"] = relationship("StudySpace", back_populates="materials")
    topic_links: Mapped[List["MaterialTopic"]] = relationship(
        "MaterialTopic",
        back_populates="material",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Material(id={self.id}, title='{self.title}', type='{self.file_type}')>"


class MaterialTopic(Base):
    __tablename__ = "material_topics"
    __table_args__ = (
        UniqueConstraint("material_id", "topic_id", name="uq_material_topic"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    material_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("materials.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    topic_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("topics.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    notes: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relationships
    material: Mapped["Material"] = relationship("Material", back_populates="topic_links")
    topic: Mapped["Topic"] = relationship("Topic", back_populates="material_links")

    def __repr__(self) -> str:
        return f"<MaterialTopic(material_id={self.material_id}, topic_id={self.topic_id})>"

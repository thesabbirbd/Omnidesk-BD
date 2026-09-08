import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class MaterialBase(BaseModel):
    title: str
    file_type: str = "PDF"
    url: Optional[str] = None
    source_language: str = "en"


class MaterialResponse(MaterialBase):
    id: uuid.UUID
    user_id: uuid.UUID
    study_space_id: uuid.UUID
    original_filename: Optional[str] = None
    mime_type: Optional[str] = None
    file_size_bytes: int
    page_count: Optional[int] = None
    checksum_hash: Optional[str] = None
    processing_status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MaterialDetailResponse(MaterialResponse):
    extracted_text_preview: Optional[str] = None

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ParsedChunk(BaseModel):
    """
    Represents an atomic grounded section, page, or timestamped segment of source material.
    """
    index: int = 0
    text: str
    page_number: Optional[int] = None
    timestamp_start: Optional[float] = None
    timestamp_end: Optional[float] = None
    heading: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ParsedDocument(BaseModel):
    """
    Standardized payload produced by all ingestion parsers.
    """
    title: str
    source_type: str  # "PDF", "MARKDOWN", "TXT", "YOUTUBE"
    original_source: str
    full_text: str
    chunks: List[ParsedChunk] = Field(default_factory=list)
    page_count: int = 1
    headings: List[str] = Field(default_factory=list)
    word_count: int = 0
    checksum_hash: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

    @property
    def checksum(self) -> Optional[str]:
        return self.checksum_hash

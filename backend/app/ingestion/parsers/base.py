import hashlib
import os
from abc import ABC, abstractmethod
from typing import Union, Optional, Dict, Any
from pathlib import Path
from app.ingestion.models import ParsedDocument


class BaseParser(ABC):
    """
    Abstract BaseParser interface for all document and media ingestion adapters.
    """

    @abstractmethod
    def parse(self, source: Union[str, Path, bytes], **kwargs: Any) -> ParsedDocument:
        """
        Parse the source document/stream and produce a structured ParsedDocument.
        """
        pass

    @staticmethod
    def compute_sha256(data: bytes) -> str:
        """Compute cryptographic hash of raw source material for deduplication and integrity."""
        hasher = hashlib.sha256()
        hasher.update(data)
        return hasher.hexdigest()

    @staticmethod
    def read_bytes(source: Union[str, Path, bytes]) -> bytes:
        """Helper to read bytes from either a file path, raw bytes, or raw text string."""
        if isinstance(source, bytes):
            return source
        if isinstance(source, Path):
            if not source.is_file():
                raise FileNotFoundError(f"Source file does not exist: {source}")
            return source.read_bytes()

        # If source contains newlines or is longer than standard path limit, treat as raw text
        if "\n" in source or len(source) > 255:
            return source.encode("utf-8")

        path = Path(source)
        try:
            if path.is_file():
                return path.read_bytes()
        except (OSError, ValueError):
            pass

        return source.encode("utf-8")

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
        """Helper to read bytes from either a file path or raw bytes input."""
        if isinstance(source, bytes):
            return source
        path = Path(source)
        if not path.is_file():
            raise FileNotFoundError(f"Source file does not exist: {path}")
        return path.read_bytes()

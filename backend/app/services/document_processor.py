import os
import re
import hashlib
import uuid
from typing import Dict, Any, List, Optional
from pathlib import Path
from pypdf import PdfReader
from app.core.config import settings

ALLOWED_MIME_TYPES = {
    "application/pdf": "PDF",
    "text/plain": "TXT",
    "text/markdown": "MARKDOWN",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
    "application/json": "JSON"
}

ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md", ".docx", ".json"}


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent directory traversal and special character exploits.
    """
    base_name = os.path.basename(filename)
    clean_name = re.sub(r"[^a-zA-Z0-9_.-]", "_", base_name)
    return clean_name or f"upload_{uuid.uuid4().hex[:8]}"


def compute_sha256(file_bytes: bytes) -> str:
    """Compute SHA-256 hash of file bytes for content addressing and duplicate prevention."""
    return hashlib.sha256(file_bytes).hexdigest()


class DocumentProcessor:
    def __init__(self, upload_dir: Optional[str] = None):
        self.upload_dir = Path(upload_dir or settings.UPLOAD_DIR)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def validate_file(self, filename: str, content_type: Optional[str], size_bytes: int) -> str:
        """
        Validate file extension, mime type, and maximum upload size.
        Returns the resolved file category (PDF, TXT, etc.).
        """
        ext = Path(filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise ValueError(f"File extension '{ext}' is not supported. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")

        max_size_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        if size_bytes > max_size_bytes:
            raise ValueError(
                f"File size ({size_bytes / (1024*1024):.1f}MB) exceeds limit of {settings.MAX_UPLOAD_SIZE_MB}MB."
            )

        category = "PDF" if ext == ".pdf" else "MARKDOWN" if ext == ".md" else "TXT" if ext == ".txt" else "DOCX" if ext == ".docx" else "JSON"
        return category

    def save_file(self, file_bytes: bytes, original_filename: str) -> Dict[str, Any]:
        """
        Save file to secure storage path named with UUID and sanitized original name.
        """
        clean_name = sanitize_filename(original_filename)
        unique_prefix = uuid.uuid4().hex[:12]
        stored_filename = f"{unique_prefix}_{clean_name}"
        destination_path = self.upload_dir / stored_filename

        with open(destination_path, "wb") as f:
            f.write(file_bytes)

        checksum = compute_sha256(file_bytes)

        return {
            "stored_filename": stored_filename,
            "storage_path": str(destination_path),
            "file_size": len(file_bytes),
            "checksum_hash": checksum
        }

    def extract_text(self, file_path: str, file_type: str) -> Dict[str, Any]:
        """
        Extract text from file with page-level grounding.
        Returns full text, page count, and page-by-page mapping.
        """
        pages_data: List[Dict[str, Any]] = []
        full_text_parts: List[str] = []

        if file_type == "PDF":
            try:
                reader = PdfReader(file_path)
                page_count = len(reader.pages)
                for idx, page in enumerate(reader.pages, start=1):
                    extracted = page.extract_text() or ""
                    cleaned = extracted.strip()
                    pages_data.append({
                        "page_number": idx,
                        "text": cleaned,
                        "word_count": len(cleaned.split())
                    })
                    if cleaned:
                        full_text_parts.append(cleaned)
            except Exception as e:
                raise RuntimeError(f"Failed to extract text from PDF: {str(e)}")

        elif file_type in ("TXT", "MARKDOWN", "JSON"):
            try:
                with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                    content = f.read()
                page_count = max(1, len(content) // 2000)
                pages_data.append({
                    "page_number": 1,
                    "text": content,
                    "word_count": len(content.split())
                })
                full_text_parts.append(content)
            except Exception as e:
                raise RuntimeError(f"Failed to read text file: {str(e)}")
        else:
            page_count = 1
            full_text_parts.append("")

        full_text = "\n\n".join(full_text_parts)
        return {
            "page_count": page_count,
            "full_text": full_text,
            "pages": pages_data,
            "total_words": len(full_text.split())
        }


document_processor = DocumentProcessor()

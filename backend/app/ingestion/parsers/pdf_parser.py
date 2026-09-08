import io
import os
import re
from typing import Union, Optional, Any, List
from pathlib import Path
from app.ingestion.parsers.base import BaseParser
from app.ingestion.models import ParsedDocument, ParsedChunk


class PDFParser(BaseParser):
    """
    High-fidelity PDF document parser using PyMuPDF (fitz) with automatic pypdf fallback.
    Extracts structured page text, headings from Table of Contents, and page grounding.
    """

    @classmethod
    def extract_text(cls, source: Union[str, Path, bytes], max_chars: Optional[int] = None) -> str:
        """
        Extract plain text securely using PyMuPDF (fitz) with automatic pypdf fallback.
        Safely truncates to max_chars if specified without memory leakage.
        """
        parser = cls()
        doc = parser.parse(source)
        text = doc.full_text or ""
        if max_chars is not None and max_chars > 0:
            return text[:max_chars]
        return text

    @classmethod
    async def extract_text_async(cls, source: Union[str, Path, bytes], max_chars: Optional[int] = None) -> str:
        """
        Asynchronously extract plain text without blocking the main FastAPI thread
        by delegating CPU-bound PDF extraction to a thread pool via asyncio.to_thread.
        """
        import asyncio
        return await asyncio.to_thread(cls.extract_text, source, max_chars)

    def parse(self, source: Union[str, Path, bytes], title: Optional[str] = None, **kwargs: Any) -> ParsedDocument:
        file_bytes = self.read_bytes(source)
        checksum = self.compute_sha256(file_bytes)
        source_name = str(source) if not isinstance(source, bytes) else "uploaded_document.pdf"
        doc_title = title or os.path.basename(source_name).replace(".pdf", "").replace("_", " ").title()

        # Attempt 1: PyMuPDF (fitz)
        try:
            return self._parse_with_pymupdf(file_bytes, source_name, doc_title, checksum)
        except Exception as pymupdf_err:
            # Attempt 2: Fallback to pypdf
            return self._parse_with_pypdf(file_bytes, source_name, doc_title, checksum, error_note=str(pymupdf_err))

    def _parse_with_pymupdf(self, file_bytes: bytes, source_name: str, title: str, checksum: str) -> ParsedDocument:
        import pymupdf as fitz

        doc = fitz.open(stream=file_bytes, filetype="pdf")
        page_count = len(doc)
        chunks: List[ParsedChunk] = []
        full_text_parts: List[str] = []
        headings: List[str] = []

        # Extract Table of Contents if present: [[lvl, title, page], ...]
        try:
            toc = doc.get_toc()
            for item in toc:
                if len(item) >= 2 and item[1]:
                    headings.append(item[1].strip())
        except Exception:
            pass

        for page_idx in range(page_count):
            page = doc[page_idx]
            page_num = page_idx + 1
            text = page.get_text("text").strip()
            if text:
                full_text_parts.append(text)
                
                # Check for top heading on page
                lines = [l.strip() for l in text.split("\n") if l.strip()]
                page_heading = None
                if lines and len(lines[0]) < 80 and not lines[0].endswith("."):
                    page_heading = lines[0]
                    if page_heading not in headings:
                        headings.append(page_heading)

                chunks.append(
                    ParsedChunk(
                        index=page_idx,
                        text=text,
                        page_number=page_num,
                        heading=page_heading,
                        metadata={"page": page_num, "engine": "pymupdf"}
                    )
                )

        full_text = "\n\n".join(full_text_parts)
        word_count = len(full_text.split())

        # Extract PDF metadata if title was generic
        meta = doc.metadata or {}
        if meta.get("title") and meta.get("title").strip():
            title = meta["title"].strip()

        doc.close()

        return ParsedDocument(
            title=title,
            source_type="PDF",
            original_source=source_name,
            full_text=full_text,
            chunks=chunks,
            page_count=max(1, page_count),
            headings=headings[:30],
            word_count=word_count,
            checksum_hash=checksum,
            metadata={"parser": "pymupdf", "pdf_version": meta.get("format", "PDF")}
        )

    def _parse_with_pypdf(
        self,
        file_bytes: bytes,
        source_name: str,
        title: str,
        checksum: str,
        error_note: Optional[str] = None
    ) -> ParsedDocument:
        import pypdf

        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        page_count = len(reader.pages)
        chunks: List[ParsedChunk] = []
        full_text_parts: List[str] = []
        headings: List[str] = []

        for page_idx, page in enumerate(reader.pages):
            page_num = page_idx + 1
            text = page.extract_text() or ""
            text = text.strip()
            if text:
                full_text_parts.append(text)
                lines = [l.strip() for l in text.split("\n") if l.strip()]
                page_heading = lines[0] if (lines and len(lines[0]) < 80) else None
                if page_heading and page_heading not in headings:
                    headings.append(page_heading)

                chunks.append(
                    ParsedChunk(
                        index=page_idx,
                        text=text,
                        page_number=page_num,
                        heading=page_heading,
                        metadata={"page": page_num, "engine": "pypdf"}
                    )
                )

        full_text = "\n\n".join(full_text_parts)
        word_count = len(full_text.split())

        return ParsedDocument(
            title=title,
            source_type="PDF",
            original_source=source_name,
            full_text=full_text,
            chunks=chunks,
            page_count=max(1, page_count),
            headings=headings[:30],
            word_count=word_count,
            checksum_hash=checksum,
            metadata={"parser": "pypdf_fallback", "pymupdf_error": error_note}
        )

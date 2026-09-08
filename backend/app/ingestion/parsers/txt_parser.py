import os
import re
from typing import Union, Optional, Any, List
from pathlib import Path
from app.ingestion.parsers.base import BaseParser
from app.ingestion.models import ParsedDocument, ParsedChunk


class TXTParser(BaseParser):
    """
    Parser for plain text (.txt) documents and syllabi.
    Segments paragraphs, detects numbered modules or syllabus points, and calculates checksums.
    """

    @classmethod
    def extract_text(cls, source: Union[str, Path, bytes], max_chars: Optional[int] = None) -> str:
        """
        Extract plain text securely from a .txt source.
        Safely truncates to max_chars if specified.
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
        Asynchronously extract plain text without blocking the main FastAPI event loop.
        """
        import asyncio
        return await asyncio.to_thread(cls.extract_text, source, max_chars)

    def parse(self, source: Union[str, Path, bytes], title: Optional[str] = None, **kwargs: Any) -> ParsedDocument:
        file_bytes = self.read_bytes(source)
        checksum = self.compute_sha256(file_bytes)
        source_name = str(source) if not isinstance(source, bytes) else "document.txt"
        text = file_bytes.decode("utf-8", errors="replace").strip()

        # Split into major paragraphs
        paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
        if not paragraphs:
            paragraphs = [text] if text else [""]

        # Derive title
        doc_title = title
        if not doc_title:
            first_line = paragraphs[0].split("\n")[0].strip()
            if 3 < len(first_line) < 70:
                doc_title = first_line
            else:
                doc_title = os.path.basename(source_name).replace(".txt", "").replace("_", " ").title()

        headings: List[str] = []
        chunks: List[ParsedChunk] = []

        for idx, para in enumerate(paragraphs):
            lines = [l.strip() for l in para.split("\n") if l.strip()]
            first_line = lines[0] if lines else ""

            # Detect if paragraph starts with a heading or module label
            is_heading = (
                re.match(r"^(Chapter\s*\d+|Module\s*\d+|Week\s*\d+|Step\s*\d+|\d+\.)\s*[:\-\.]?\s*(.+)$", first_line, re.IGNORECASE)
                or (first_line.isupper() and len(first_line) < 60)
            )

            heading = first_line if is_heading else None
            if heading and heading not in headings:
                headings.append(heading)

            chunks.append(
                ParsedChunk(
                    index=idx,
                    text=para,
                    page_number=idx + 1,
                    heading=heading,
                    metadata={"paragraph_index": idx}
                )
            )

        word_count = len(text.split())

        return ParsedDocument(
            title=doc_title,
            source_type="TXT",
            original_source=source_name,
            full_text=text,
            chunks=chunks,
            page_count=max(1, len(chunks)),
            headings=headings[:30],
            word_count=word_count,
            checksum_hash=checksum,
            metadata={"total_paragraphs": len(paragraphs)}
        )

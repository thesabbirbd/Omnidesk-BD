import os
import re
from typing import Union, Optional, Any, List, Dict
from pathlib import Path
from app.ingestion.parsers.base import BaseParser
from app.ingestion.models import ParsedDocument, ParsedChunk


class MarkdownParser(BaseParser):
    """
    Parser for Markdown (.md) documents.
    Extracts YAML frontmatter, header hierarchies, code blocks, and structured section chunks.
    """

    @classmethod
    def extract_text(cls, source: Union[str, Path, bytes], max_chars: Optional[int] = None) -> str:
        """
        Extract raw plain/markdown text securely from a markdown source.
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
        Asynchronously extract markdown text without blocking the main event loop.
        """
        import asyncio
        return await asyncio.to_thread(cls.extract_text, source, max_chars)

    def parse(self, source: Union[str, Path, bytes], title: Optional[str] = None, **kwargs: Any) -> ParsedDocument:
        file_bytes = self.read_bytes(source)
        checksum = self.compute_sha256(file_bytes)
        source_name = str(source) if not isinstance(source, bytes) else "document.md"
        raw_text = file_bytes.decode("utf-8", errors="replace")

        # 1. Parse frontmatter if present (between leading --- and ---)
        frontmatter: Dict[str, str] = {}
        content_text = raw_text
        fm_match = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", raw_text, re.DOTALL)
        if fm_match:
            fm_raw = fm_match.group(1)
            content_text = fm_match.group(2)
            for line in fm_raw.split("\n"):
                if ":" in line:
                    k, v = line.split(":", 1)
                    frontmatter[k.strip()] = v.strip().strip("\"'")

        # 2. Derive document title
        doc_title = title or frontmatter.get("title")
        if not doc_title:
            # Look for top H1 header
            h1_match = re.search(r"^#\s+(.+)$", content_text, re.MULTILINE)
            if h1_match:
                doc_title = h1_match.group(1).strip()
            else:
                doc_title = os.path.basename(source_name).replace(".md", "").replace("_", " ").title()

        # 3. Extract headings and section chunks
        headings: List[str] = []
        chunks: List[ParsedChunk] = []

        # Split content by markdown headings (H1 to H3)
        header_pattern = re.compile(r"^(#{1,3})\s+(.+)$", re.MULTILINE)
        matches = list(header_pattern.finditer(content_text))

        if not matches:
            # Single chunk
            chunks.append(
                ParsedChunk(
                    index=0,
                    text=content_text.strip(),
                    page_number=1,
                    heading=doc_title,
                    metadata={"level": 1}
                )
            )
            headings.append(doc_title)
        else:
            for idx, match in enumerate(matches):
                level = len(match.group(1))
                heading_title = match.group(2).strip()
                headings.append(heading_title)

                start_pos = match.start()
                end_pos = matches[idx + 1].start() if idx + 1 < len(matches) else len(content_text)
                section_text = content_text[start_pos:end_pos].strip()

                chunks.append(
                    ParsedChunk(
                        index=idx,
                        text=section_text,
                        page_number=idx + 1,
                        heading=heading_title,
                        metadata={"header_level": level}
                    )
                )

        word_count = len(content_text.split())

        return ParsedDocument(
            title=doc_title,
            source_type="MARKDOWN",
            original_source=source_name,
            full_text=content_text.strip(),
            chunks=chunks,
            page_count=max(1, len(chunks)),
            headings=headings[:30],
            word_count=word_count,
            checksum_hash=checksum,
            metadata={"frontmatter": frontmatter, "total_sections": len(chunks)}
        )

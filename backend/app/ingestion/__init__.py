from typing import Union, Optional, Any
from pathlib import Path
from app.ingestion.models import ParsedDocument, ParsedChunk
from app.ingestion.parsers.base import BaseParser
from app.ingestion.parsers.pdf_parser import PDFParser
from app.ingestion.parsers.markdown_parser import MarkdownParser
from app.ingestion.parsers.txt_parser import TXTParser
from app.ingestion.parsers.youtube_parser import YouTubeTranscriptProvider
from app.ingestion.extractors.structure_extractor import StructureExtractor
from app.ingestion.normalizers.text_normalizer import TextNormalizer


class IngestionEngine:
    """
    Unified Import & Ingestion Engine for Omnidesk BD.
    Automatically detects file formats and media URLs, routes to appropriate parser,
    and returns sanitized, structured ParsedDocument objects.
    """

    def __init__(self):
        self.pdf_parser = PDFParser()
        self.md_parser = MarkdownParser()
        self.txt_parser = TXTParser()
        self.yt_parser = YouTubeTranscriptProvider()
        self.normalizer = TextNormalizer()
        self.extractor = StructureExtractor()

    def parse_source(
        self,
        source: Union[str, Path, bytes],
        filename_hint: Optional[str] = None,
        title: Optional[str] = None,
        **kwargs: Any
    ) -> ParsedDocument:
        """
        Ingest source material, automatically resolving parser adapter.
        """
        source_str = str(source) if not isinstance(source, bytes) else (filename_hint or "")
        lower_source = source_str.lower().strip()

        # 1. YouTube detection
        if "youtube.com" in lower_source or "youtu.be" in lower_source:
            return self.yt_parser.parse(source, title=title, **kwargs)

        # 2. PDF detection
        if lower_source.endswith(".pdf"):
            doc = self.pdf_parser.parse(source, title=title, **kwargs)
        # 3. Markdown detection
        elif lower_source.endswith(".md") or lower_source.endswith(".markdown"):
            doc = self.md_parser.parse(source, title=title, **kwargs)
        # 4. Default plain text
        else:
            doc = self.txt_parser.parse(source, title=title, **kwargs)

        # Apply text normalization
        doc.full_text = self.normalizer.clean_whitespace(
            self.normalizer.normalize_unicode(doc.full_text)
        )
        return doc


ingestion_engine = IngestionEngine()

__all__ = [
    "ParsedDocument",
    "ParsedChunk",
    "BaseParser",
    "PDFParser",
    "MarkdownParser",
    "TXTParser",
    "YouTubeTranscriptProvider",
    "StructureExtractor",
    "TextNormalizer",
    "IngestionEngine",
    "ingestion_engine",
]

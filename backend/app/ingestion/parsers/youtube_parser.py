import re
import logging
from typing import Union, Optional, Any, List, Dict
from pathlib import Path
from app.ingestion.parsers.base import BaseParser
from app.ingestion.models import ParsedDocument, ParsedChunk

logger = logging.getLogger("omnidesk.ingestion.youtube")


class YouTubeTranscriptProvider(BaseParser):
    """
    YouTube video transcript extractor with resilient failure handling.
    Fetches official or auto-generated captions with timestamp grounding.
    Gracefully handles disabled captions, private videos, or offline network state.
    """

    VIDEO_ID_REGEX = re.compile(
        r"(?:v=|\/)([0-9A-Za-z_-]{11}).*"
    )

    def extract_video_id(self, url_or_id: str) -> Optional[str]:
        """Extract 11-character YouTube video ID from URLs or raw IDs."""
        cleaned = url_or_id.strip()
        if len(cleaned) == 11 and re.match(r"^[0-9A-Za-z_-]{11}$", cleaned):
            return cleaned

        match = self.VIDEO_ID_REGEX.search(cleaned)
        if match:
            return match.group(1)
        return None

    def parse(
        self,
        source: Union[str, Path, bytes],
        title: Optional[str] = None,
        languages: Optional[List[str]] = None,
        **kwargs: Any
    ) -> ParsedDocument:
        url_or_id = str(source) if not isinstance(source, bytes) else source.decode("utf-8", errors="ignore")
        video_id = self.extract_video_id(url_or_id)

        if not video_id:
            raise ValueError(f"Could not extract a valid YouTube video ID from '{url_or_id}'")

        languages = languages or ["en", "bn", "es", "de", "fr", "hi"]
        doc_title = title or f"YouTube Video: {video_id}"

        try:
            from youtube_transcript_api import YouTubeTranscriptApi

            # Retrieve transcript supporting both modern 1.2+ API and legacy classmethods
            if hasattr(YouTubeTranscriptApi, "get_transcript"):
                raw_entries = YouTubeTranscriptApi.get_transcript(video_id, languages=languages)
            else:
                api_instance = YouTubeTranscriptApi()
                fetched = api_instance.fetch(video_id, languages=languages)
                raw_entries = fetched.to_raw_dicts() if hasattr(fetched, "to_raw_dicts") else list(fetched)

            transcript_list: List[Dict[str, Any]] = []
            for entry in raw_entries:
                if isinstance(entry, dict):
                    transcript_list.append(entry)
                else:
                    transcript_list.append({
                        "text": getattr(entry, "text", str(entry)),
                        "start": getattr(entry, "start", 0.0),
                        "duration": getattr(entry, "duration", 0.0)
                    })

            chunks: List[ParsedChunk] = []
            full_text_parts: List[str] = []

            # Group transcript entries into logical 60-second chunks for study pacing
            current_chunk_text: List[str] = []
            chunk_start: Optional[float] = None
            chunk_idx = 0

            for entry in transcript_list:
                text = entry.get("text", "").strip()
                start = entry.get("start", 0.0)
                duration = entry.get("duration", 0.0)
                end = start + duration

                if chunk_start is None:
                    chunk_start = start

                current_chunk_text.append(text)
                full_text_parts.append(text)

                # Split chunk roughly every ~60 seconds or ~120 words
                if (end - chunk_start >= 60.0) or len(" ".join(current_chunk_text).split()) >= 120:
                    c_text = " ".join(current_chunk_text)
                    mins = int(chunk_start // 60)
                    secs = int(chunk_start % 60)
                    heading = f"Segment {chunk_idx + 1} ({mins:02d}:{secs:02d})"

                    chunks.append(
                        ParsedChunk(
                            index=chunk_idx,
                            text=c_text,
                            page_number=chunk_idx + 1,
                            timestamp_start=chunk_start,
                            timestamp_end=end,
                            heading=heading,
                            metadata={"start_time": chunk_start, "end_time": end}
                        )
                    )
                    chunk_idx += 1
                    current_chunk_text = []
                    chunk_start = None

            # Add remaining tail chunk
            if current_chunk_text:
                c_text = " ".join(current_chunk_text)
                mins = int((chunk_start or 0.0) // 60)
                secs = int((chunk_start or 0.0) % 60)
                heading = f"Segment {chunk_idx + 1} ({mins:02d}:{secs:02d})"
                chunks.append(
                    ParsedChunk(
                        index=chunk_idx,
                        text=c_text,
                        page_number=chunk_idx + 1,
                        timestamp_start=chunk_start or 0.0,
                        timestamp_end=None,
                        heading=heading,
                        metadata={"start_time": chunk_start}
                    )
                )

            full_text = " ".join(full_text_parts)
            word_count = len(full_text.split())

            return ParsedDocument(
                title=doc_title,
                source_type="YOUTUBE",
                original_source=f"https://www.youtube.com/watch?v={video_id}",
                full_text=full_text,
                chunks=chunks,
                page_count=max(1, len(chunks)),
                headings=[c.heading for c in chunks if c.heading],
                word_count=word_count,
                checksum_hash=self.compute_sha256(full_text.encode("utf-8")),
                metadata={
                    "video_id": video_id,
                    "transcript_available": True,
                    "total_entries": len(transcript_list)
                }
            )

        except Exception as err:
            logger.warning("YouTube transcript extraction failed for %s: %s", video_id, err)
            error_type = type(err).__name__
            error_detail = str(err)

            return ParsedDocument(
                title=doc_title,
                source_type="YOUTUBE",
                original_source=f"https://www.youtube.com/watch?v={video_id}",
                full_text=f"[Transcript Unavailable for video {video_id}: {error_type}]",
                chunks=[],
                page_count=0,
                headings=[],
                word_count=0,
                checksum_hash=self.compute_sha256(video_id.encode("utf-8")),
                metadata={
                    "video_id": video_id,
                    "transcript_available": False,
                    "error_type": error_type,
                    "error_detail": error_detail,
                    "graceful_failure": True
                }
            )

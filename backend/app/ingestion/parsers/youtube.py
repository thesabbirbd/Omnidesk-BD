from typing import Optional
import logging
from urllib.parse import urlparse, parse_qs

logger = logging.getLogger(__name__)

try:
    from youtube_transcript_api import YouTubeTranscriptApi
    from youtube_transcript_api.formatters import TextFormatter
    YOUTUBE_AVAILABLE = True
except ImportError:
    YOUTUBE_AVAILABLE = False
    logger.warning("youtube_transcript_api not installed. YouTube extraction will fail gracefully.")

def extract_video_id(url: str) -> Optional[str]:
    """Extracts the YouTube video ID from a URL."""
    parsed = urlparse(url)
    if parsed.hostname in ('youtu.be', 'www.youtu.be'):
        return parsed.path[1:]
    if parsed.hostname in ('youtube.com', 'www.youtube.com'):
        if parsed.path == '/watch':
            return parse_qs(parsed.query).get('v', [None])[0]
        if parsed.path.startswith('/embed/'):
            return parsed.path.split('/')[2]
        if parsed.path.startswith('/v/'):
            return parsed.path.split('/')[2]
    return None

def extract_youtube_transcript(url: str) -> str:
    """
    Fetches the transcript for a given YouTube video URL.
    Returns the transcript as a continuous string.
    Gracefully handles missing transcripts or rate limits.
    """
    if not YOUTUBE_AVAILABLE:
        return "Transcript unavailable for this source. (youtube_transcript_api not installed)"
        
    video_id = extract_video_id(url)
    if not video_id:
        return "Transcript unavailable for this source. (Invalid YouTube URL)"
        
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        formatter = TextFormatter()
        return formatter.format_transcript(transcript)
    except Exception as e:
        logger.warning(f"YouTube transcript extraction failed for {url}: {str(e)}")
        return "Transcript unavailable for this source."

import re
from typing import List, Dict, Any
from app.ingestion.models import ParsedDocument


class StructureExtractor:
    """
    Extracts high-signal structural cues (headings, key terms, code blocks, numbered milestones)
    from parsed source documents to prepare grounding context for AI analysis.
    """

    @staticmethod
    def extract_key_concepts(doc: ParsedDocument) -> List[str]:
        """Extract high-frequency technical terms and capitalized topics."""
        text = doc.full_text
        # Find terms inside backticks or bold formatting
        backtick_terms = re.findall(r"`([A-Za-z0-9_\-\.]{2,35})`", text)
        bold_terms = re.findall(r"\*\*([A-Za-z0-9\s_\-\.]{3,40})\*\*", text)

        combined = list(set(backtick_terms + bold_terms))
        # Filter out common stop-words
        stopwords = {"the", "and", "for", "with", "true", "false", "none", "null"}
        clean = [t.strip() for t in combined if t.lower().strip() not in stopwords]
        return clean[:40]

    @staticmethod
    def extract_outline(doc: ParsedDocument) -> List[Dict[str, Any]]:
        """Construct structured chapter/section outline with grounded source references."""
        outline = []
        for chunk in doc.chunks:
            if chunk.heading:
                ref = f"Page {chunk.page_number}" if chunk.page_number else (
                    f"Timestamp {int(chunk.timestamp_start or 0)}s" if chunk.timestamp_start is not None else "Section"
                )
                outline.append({
                    "heading": chunk.heading,
                    "reference": f"{doc.title}, {ref}",
                    "chunk_index": chunk.index,
                    "word_count": len(chunk.text.split())
                })
        return outline

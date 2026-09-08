import re
import unicodedata


class TextNormalizer:
    """
    Sanitizes and prepares raw extracted text into clean, high-density context
    for AI curriculum generation and cognitive analysis.
    """

    @staticmethod
    def normalize_unicode(text: str) -> str:
        """Normalize Unicode characters (NFKC) and replace irregular quotes/dashes."""
        if not text:
            return ""
        text = unicodedata.normalize("NFKC", text)
        replacements = {
            "\u2018": "'", "\u2019": "'", "\u201c": '"', "\u201d": '"',
            "\u2013": "-", "\u2014": "-", "\u00a0": " ", "\ufeff": ""
        }
        for orig, repl in replacements.items():
            text = text.replace(orig, repl)
        return text

    @staticmethod
    def clean_whitespace(text: str) -> str:
        """Strip trailing whitespace, collapse redundant blank lines, remove non-printables."""
        if not text:
            return ""
        # Remove non-printable control chars except \n, \r, \t
        text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]", "", text)
        # Collapse 3+ newlines into 2
        text = re.sub(r"\n{3,}", "\n\n", text)
        # Strip trailing spaces on each line
        lines = [line.rstrip() for line in text.split("\n")]
        return "\n".join(lines).strip()

    @classmethod
    def prepare_for_ai_prompt(cls, text: str, max_chars: int = 24000) -> str:
        """
        Complete normalization pipeline ensuring text fits reliably inside prompt bounds
        while preserving technical formatting.
        """
        cleaned = cls.normalize_unicode(text)
        cleaned = cls.clean_whitespace(cleaned)
        if len(cleaned) > max_chars:
            return cleaned[:max_chars] + f"\n\n... [Content truncated to {max_chars} characters for processing]"
        return cleaned

import re
import json
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from app.ai.schemas import CurriculumAnalysisResult


class AIProviderError(Exception):
    """General AI provider execution error."""
    pass


class AIProviderUnavailableError(AIProviderError):
    """Raised when an AI provider is unconfigured, unreachable, or rate-limited."""
    pass


class BaseAIProvider(ABC):
    """
    Abstract interface for AI intelligence providers.
    All providers must implement extraction adhering to the strict typed schema.
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """Identifier for the provider (e.g., 'gemini', 'ollama', 'offline_heuristic')."""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """Check if provider configuration and endpoint are ready for inference."""
        pass

    @abstractmethod
    def extract_curriculum(
        self,
        text: str,
        title: Optional[str] = None,
        **kwargs: Any
    ) -> CurriculumAnalysisResult:
        """
        Analyze text and return a validated CurriculumAnalysisResult.
        Must raise AIProviderUnavailableError if unreachable.
        """
        pass

    @staticmethod
    def clean_json_markdown(raw_response: str) -> str:
        """
        Strips markdown code fences (```json ... ```) or conversational preambles
        to locate clean JSON payloads.
        """
        cleaned = raw_response.strip()
        # Strip ```json ... ``` or ``` ... ```
        if "```" in cleaned:
            match = re.search(r"```(?:json)?\s*\n?(.*?)\n?```", cleaned, re.DOTALL)
            if match:
                cleaned = match.group(1).strip()

        # If there are leading non-bracket characters, search for first { and last }
        if not cleaned.startswith("{") and "{" in cleaned:
            start_idx = cleaned.find("{")
            end_idx = cleaned.rfind("}")
            if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                cleaned = cleaned[start_idx:end_idx + 1]

        return cleaned

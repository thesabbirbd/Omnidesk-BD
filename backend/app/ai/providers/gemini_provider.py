import os
import json
import logging
from typing import Optional, Any
import httpx
from app.core.config import settings
from app.ai.providers.base import BaseAIProvider, AIProviderUnavailableError, AIProviderError
from app.ai.schemas import CurriculumAnalysisResult
from app.ai.prompts import CURRICULUM_EXTRACTION_SYSTEM_PROMPT, build_extraction_prompt

logger = logging.getLogger("studyos.ai.gemini")


class GeminiProvider(BaseAIProvider):
    """
    Adapter for Google Gemini hosted models (using Free-Tier API endpoints).
    Supports Gemini 1.5 Flash / 2.0 Flash for structured JSON outputs.
    Gracefully yields control to fallback providers if key is absent or quota exceeded.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        timeout_seconds: float = 30.0
    ):
        self._api_key = api_key or settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY") or ""
        self._model = model or getattr(settings, "GEMINI_MODEL", "gemini-1.5-flash")
        self._timeout = timeout_seconds

    @property
    def name(self) -> str:
        return "gemini"

    def is_available(self) -> bool:
        """Available if a valid API key string is present."""
        return bool(self._api_key and self._api_key.strip())

    def extract_curriculum(
        self,
        text: str,
        title: Optional[str] = None,
        **kwargs: Any
    ) -> CurriculumAnalysisResult:
        if not self.is_available():
            raise AIProviderUnavailableError("GeminiProvider: GEMINI_API_KEY is not configured.")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self._model}:generateContent?key={self._api_key}"
        user_prompt = build_extraction_prompt(text, title_hint=title)

        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": f"{CURRICULUM_EXTRACTION_SYSTEM_PROMPT}\n\n{user_prompt}"}]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json"
            }
        }

        try:
            with httpx.Client(timeout=self._timeout) as client:
                response = client.post(url, json=payload)

            if response.status_code != 200:
                logger.warning("Gemini API error (HTTP %s): %s", response.status_code, response.text[:200])
                raise AIProviderUnavailableError(
                    f"Gemini API returned HTTP {response.status_code}: {response.text[:150]}"
                )

            data = response.json()
            candidates = data.get("candidates", [])
            if not candidates:
                raise AIProviderError("Gemini returned empty candidate list.")

            content_parts = candidates[0].get("content", {}).get("parts", [])
            if not content_parts or "text" not in content_parts[0]:
                raise AIProviderError("Gemini returned response without text payload.")

            raw_text = content_parts[0]["text"]
            clean_json = self.clean_json_markdown(raw_text)
            parsed_dict = json.loads(clean_json)

            result = CurriculumAnalysisResult.model_validate(parsed_dict)
            result.provider_used = "gemini"
            result.total_estimated_minutes = sum(t.estimated_minutes for t in result.topics)
            return result

        except (httpx.RequestError, httpx.TimeoutException) as net_err:
            logger.warning("Gemini network connection failed: %s", net_err)
            raise AIProviderUnavailableError(f"Gemini network connection failed: {net_err}")
        except json.JSONDecodeError as json_err:
            logger.warning("Gemini output was not valid JSON: %s", json_err)
            raise AIProviderError(f"Gemini output could not be parsed as JSON: {json_err}")

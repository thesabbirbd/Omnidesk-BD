import json
import logging
from typing import Optional, Any
import httpx
from app.core.config import settings
from app.ai.providers.base import BaseAIProvider, AIProviderUnavailableError, AIProviderError
from app.ai.schemas import CurriculumAnalysisResult
from app.ai.prompts import CURRICULUM_EXTRACTION_SYSTEM_PROMPT, build_extraction_prompt

logger = logging.getLogger("studyos.ai.ollama")


class OllamaProvider(BaseAIProvider):
    """
    Local-first AI Provider communicating with local Ollama daemon (e.g. llama3, mistral).
    Enables completely private, offline, zero-network curriculum structuring.
    Gracefully yields control to offline heuristic provider if daemon is unreachable.
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        timeout_seconds: float = 45.0
    ):
        self._base_url = (base_url or settings.OLLAMA_BASE_URL or "http://127.0.0.1:11434").rstrip("/")
        self._model = model or getattr(settings, "OLLAMA_MODEL", "llama3")
        self._timeout = timeout_seconds

    @property
    def name(self) -> str:
        return "ollama"

    def is_available(self) -> bool:
        """Check if local Ollama daemon is active and responding."""
        try:
            with httpx.Client(timeout=1.5) as client:
                res = client.get(f"{self._base_url}/api/tags")
                return res.status_code == 200
        except Exception:
            return False

    def extract_curriculum(
        self,
        text: str,
        title: Optional[str] = None,
        **kwargs: Any
    ) -> CurriculumAnalysisResult:
        user_prompt = build_extraction_prompt(text, title_hint=title)
        endpoint = f"{self._base_url}/api/generate"

        payload = {
            "model": self._model,
            "prompt": f"{CURRICULUM_EXTRACTION_SYSTEM_PROMPT}\n\n{user_prompt}",
            "stream": False,
            "format": "json",
            "options": {
                "temperature": 0.2
            }
        }

        try:
            with httpx.Client(timeout=self._timeout) as client:
                response = client.post(endpoint, json=payload)

            if response.status_code != 200:
                raise AIProviderUnavailableError(
                    f"Ollama daemon returned HTTP {response.status_code}: {response.text[:100]}"
                )

            data = response.json()
            raw_response = data.get("response", "")
            if not raw_response:
                raise AIProviderError("Ollama returned empty response.")

            clean_json = self.clean_json_markdown(raw_response)
            parsed_dict = json.loads(clean_json)

            result = CurriculumAnalysisResult.model_validate(parsed_dict)
            result.provider_used = "ollama"
            result.total_estimated_minutes = sum(t.estimated_minutes for t in result.topics)
            return result

        except (httpx.RequestError, httpx.TimeoutException) as net_err:
            logger.warning("Ollama daemon is unreachable at %s: %s", self._base_url, net_err)
            raise AIProviderUnavailableError(f"Ollama daemon unreachable: {net_err}")
        except json.JSONDecodeError as json_err:
            logger.warning("Ollama output could not be parsed as JSON: %s", json_err)
            raise AIProviderError(f"Ollama output was invalid JSON: {json_err}")

import os
import logging
from typing import Dict, Any, Optional
from fastapi import HTTPException
import httpx

from app.services.ai.base import AIProvider

logger = logging.getLogger("studyos.ai.ollama")

class OllamaProvider(AIProvider):
    """Local Ollama provider fallback when Gemini is unavailable or rate limited."""

    def __init__(self, base_url: Optional[str] = None, model: Optional[str] = None):
        # Ollama runs locally; default endpoint
        self.base_url = base_url or os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.model = model or os.getenv("OLLAMA_MODEL", "gemma2:27b")

    def is_available(self) -> bool:
        # Simple health check: ping the Ollama server
        try:
            resp = httpx.get(f"{self.base_url}/api/version", timeout=2.0)
            return resp.status_code == 200
        except Exception:
            return False

    def _post(self, endpoint: str, json_body: dict) -> dict:
        url = f"{self.base_url}{endpoint}"
        try:
            resp = httpx.post(url, json=json_body, timeout=20.0)
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429:
                raise HTTPException(status_code=429, detail="Ollama rate limit exceeded.")
            raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
        except Exception as e:
            raise HTTPException(status_code=503, detail=str(e))

    def generate_completion(self, prompt: str) -> str:
        payload = {"model": self.model, "prompt": prompt, "stream": False}
        result = self._post("/api/generate", payload)
        return result.get("response", "")

    # For other methods, we fallback to the same offline heuristics as Gemini fallback.
    def extract_curriculum(self, text: str, title: Optional[str] = None) -> Dict[str, Any]:
        from app.services.ai.provider_impl.offline_provider import LocalOfflineAIProvider
        return LocalOfflineAIProvider().extract_curriculum(text, title)

    def generate_study_topics(self, input_text: str, is_topic_name: bool = False, title: Optional[str] = None) -> Dict[str, Any]:
        from app.services.ai.provider_impl.offline_provider import LocalOfflineAIProvider
        return LocalOfflineAIProvider().generate_study_topics(input_text, is_topic_name, title)

    def chat_assistant(self, message: str, mode: str = "explain", context_topic: Optional[str] = None, current_study_space: Optional[str] = None) -> Dict[str, Any]:
        from app.services.ai.provider_impl.offline_provider import LocalOfflineAIProvider
        return LocalOfflineAIProvider().chat_assistant(message, mode, context_topic, current_study_space)

    def generate_verification_quiz(self, subtopic_name: str) -> Dict[str, Any]:
        from app.services.ai.provider_impl.offline_provider import LocalOfflineAIProvider
        return LocalOfflineAIProvider().generate_verification_quiz(subtopic_name)

    def analyze_weakness(self, topic_title: str, metrics: Dict[str, Any]) -> Dict[str, Any]:
        from app.services.ai.provider_impl.offline_provider import LocalOfflineAIProvider
        return LocalOfflineAIProvider().analyze_weakness(topic_title, metrics)

    def suggest_debug_hypothesis(self, problem: str, symptom: Optional[str] = None, logs: Optional[str] = None) -> Dict[str, str]:
        from app.services.ai.provider_impl.offline_provider import LocalOfflineAIProvider
        return LocalOfflineAIProvider().suggest_debug_hypothesis(problem, symptom, logs)

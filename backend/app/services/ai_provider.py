import os
import json
import re
import logging
from pathlib import Path
from typing import Dict, Any, Optional

from dotenv import load_dotenv
from fastapi import HTTPException

# Load environment variables from backend/.env
_env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if _env_path.exists():
    load_dotenv(dotenv_path=_env_path)
else:
    load_dotenv()

logger = logging.getLogger("studyos.ai")

# Import the new abstract base and providers
from .ai.base import AIProvider
from .ai.provider_impl.gemini_provider import GeminiProvider
from .ai.provider_impl.ollama_provider import OllamaProvider
from .ai.provider_impl.offline_provider import LocalOfflineAIProvider
from .ai.budget import gemini_budgeter

# Prompt modules
from .ai.prompts.studyspace_generate import get_curriculum_prompt
from .ai.prompts.quiz_generate import get_quiz_prompt
from .ai.prompts.chat_modes import get_chat_prompt, get_system_instruction

class AIService:
    """Facade that selects the appropriate AI provider and handles fallback & budgeting."""

    def __init__(self):
        self.gemini = GeminiProvider()
        self.ollama = OllamaProvider()
        self.offline = LocalOfflineAIProvider()
        if self.gemini.is_available():
            self.current_provider: AIProvider = self.gemini
        elif self.ollama.is_available():
            self.current_provider: AIProvider = self.ollama
        else:
            self.current_provider: AIProvider = self.offline

    def _record_and_check_budget(self):
        try:
            if not gemini_budgeter.can_make_request():
                raise HTTPException(status_code=429, detail="AI request quota exceeded (15 RPM limit).")
            gemini_budgeter.record_request()
        except HTTPException:
            raise
        except Exception:
            pass

    def _get_fallback_provider(self, exc: Exception) -> AIProvider:
        logger.warning(f"Primary AI provider failed ({exc}); activating resilient fallback.")
        if self.ollama.is_available():
            return self.ollama
        return self.offline

    # ---- Provider method proxies ----
    def generate_completion(self, prompt: str) -> str:
        self._record_and_check_budget()
        try:
            return self.current_provider.generate_completion(prompt)
        except Exception as e:
            fallback = self._get_fallback_provider(e)
            return fallback.generate_completion(prompt)

    def extract_curriculum(self, text: str, title: Optional[str] = None) -> Dict[str, Any]:
        self._record_and_check_budget()
        try:
            return self.current_provider.extract_curriculum(text, title)
        except Exception as e:
            fallback = self._get_fallback_provider(e)
            return fallback.extract_curriculum(text, title)

    def generate_study_topics(self, input_text: str, is_topic_name: bool = False, title: Optional[str] = None) -> Dict[str, Any]:
        self._record_and_check_budget()
        effective_input = input_text[:6000]
        effective_title = title or "Curriculum Track"
        prompt = get_curriculum_prompt(effective_input, effective_title)
        try:
            if hasattr(self.current_provider, "generate_with_prompt"):
                return self.current_provider.generate_with_prompt(prompt)
            return self.current_provider.generate_study_topics(input_text, is_topic_name, title)
        except Exception as e:
            fallback = self._get_fallback_provider(e)
            try:
                if hasattr(fallback, "generate_with_prompt"):
                    return fallback.generate_with_prompt(prompt)
            except Exception:
                pass
            return fallback.generate_study_topics(input_text, is_topic_name, title)

    def chat_assistant(self, message: str, mode: str = "explain", context_topic: Optional[str] = None, current_study_space: Optional[str] = None) -> Dict[str, Any]:
        self._record_and_check_budget()
        system_instruction = get_system_instruction(mode)
        topic_ctx = f"Context Topic: {context_topic}\n" if context_topic else ""
        prompt = get_chat_prompt(system_instruction, topic_ctx, message)
        try:
            if hasattr(self.current_provider, "chat_with_prompt"):
                return self.current_provider.chat_with_prompt(prompt, mode)
            return self.current_provider.chat_assistant(message, mode, context_topic, current_study_space)
        except Exception as e:
            fallback = self._get_fallback_provider(e)
            try:
                if hasattr(fallback, "chat_with_prompt"):
                    return fallback.chat_with_prompt(prompt, mode)
            except Exception:
                pass
            return fallback.chat_assistant(message, mode, context_topic, current_study_space)

    def generate_verification_quiz(self, subtopic_name: str) -> Dict[str, Any]:
        self._record_and_check_budget()
        prompt = get_quiz_prompt(subtopic_name)
        try:
            if hasattr(self.current_provider, "quiz_with_prompt"):
                return self.current_provider.quiz_with_prompt(prompt)
            return self.current_provider.generate_verification_quiz(subtopic_name)
        except Exception as e:
            fallback = self._get_fallback_provider(e)
            try:
                if hasattr(fallback, "quiz_with_prompt"):
                    return fallback.quiz_with_prompt(prompt)
            except Exception:
                pass
            return fallback.generate_verification_quiz(subtopic_name)

    def analyze_weakness(self, topic_title: str, metrics: Dict[str, Any]) -> Dict[str, Any]:
        self._record_and_check_budget()
        try:
            return self.current_provider.analyze_weakness(topic_title, metrics)
        except Exception as e:
            fallback = self._get_fallback_provider(e)
            return fallback.analyze_weakness(topic_title, metrics)

    def suggest_debug_hypothesis(self, problem: str, symptom: Optional[str] = None, logs: Optional[str] = None) -> Dict[str, str]:
        self._record_and_check_budget()
        try:
            return self.current_provider.suggest_debug_hypothesis(problem, symptom, logs)
        except Exception as e:
            fallback = self._get_fallback_provider(e)
            return fallback.suggest_debug_hypothesis(problem, symptom, logs)

# Global singleton for application use
_ai_service = AIService()

def get_ai_provider() -> AIProvider:
    """Return the AIService instance which conforms to AIProvider protocol for backward compatibility."""
    return _ai_service

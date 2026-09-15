import os
import json
import logging
from typing import Dict, Any, Optional
from fastapi import HTTPException

# Switch to google-genai package
from google import genai
from google.genai import types

from app.services.ai.base import AIProvider

logger = logging.getLogger("studyos.ai.gemini")

class GeminiProvider(AIProvider):
    """Gemini API provider with graceful fallback on missing key or rate limiting."""

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
            self.model = "gemini-3.6-flash"
        else:
            self.client = None
            self.model = None

    def is_available(self) -> bool:
        return self.api_key is not None and self.client is not None

    def _handle_rate_limit(self, exc: Exception):
        if "429" in str(exc) or "Quota" in str(exc):
            raise HTTPException(status_code=429, detail="Gemini rate limit exceeded.")
        raise exc

    def _parse_json_response(self, text: str) -> Dict[str, Any]:
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        try:
            return json.loads(text)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON from Gemini: {e}")
            raise HTTPException(status_code=500, detail="Failed to parse AI response as JSON.")

    def generate_completion(self, prompt: str) -> str:
        if not self.is_available():
            raise HTTPException(status_code=503, detail="Gemini API key missing.")
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt
            )
            return response.text or ""
        except Exception as e:
            self._handle_rate_limit(e)
            return ""

    def generate_with_prompt(self, prompt: str) -> Dict[str, Any]:
        """Used by the new AIService architecture in ai_provider.py."""
        text = self.generate_completion(prompt)
        return self._parse_json_response(text)

    def chat_with_prompt(self, prompt: str, mode: str) -> Dict[str, Any]:
        text = self.generate_completion(prompt)
        return {
            "reply": text,
            "mode": mode,
            "provider": "gemini"
        }

    def quiz_with_prompt(self, prompt: str) -> Dict[str, Any]:
        text = self.generate_completion(prompt)
        return self._parse_json_response(text)

    # Fallbacks to satisfy AIProvider base class if called directly
    def generate_study_topics(self, input_text: str, is_topic_name: bool = False, title: Optional[str] = None) -> Dict[str, Any]:
        from app.services.ai.prompts.studyspace_generate import get_curriculum_prompt
        effective_input = input_text[:6000]
        effective_title = title or "Curriculum Track"
        prompt = get_curriculum_prompt(effective_input, effective_title)
        return self.generate_with_prompt(prompt)

    def extract_curriculum(self, text: str, title: Optional[str] = None) -> Dict[str, Any]:
        return self.generate_study_topics(text, False, title)

    def chat_assistant(self, message: str, mode: str = "explain", context_topic: Optional[str] = None, current_study_space: Optional[str] = None) -> Dict[str, Any]:
        from app.services.ai.prompts.chat_modes import get_chat_prompt, get_system_instruction
        prompt = get_chat_prompt(get_system_instruction(mode), f"Context: {context_topic}", message)
        return self.chat_with_prompt(prompt, mode)

    def generate_verification_quiz(self, subtopic_name: str) -> Dict[str, Any]:
        from app.services.ai.prompts.quiz_generate import get_quiz_prompt
        return self.quiz_with_prompt(get_quiz_prompt(subtopic_name))

    def analyze_weakness(self, topic_title: str, metrics: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"Analyze weakness for topic '{topic_title}' given metrics {metrics}. Return JSON with identified_reasons and actionable_recommendations."
        return self._parse_json_response(self.generate_completion(prompt))

    def suggest_debug_hypothesis(self, problem: str, symptom: Optional[str] = None, logs: Optional[str] = None) -> Dict[str, str]:
        prompt = f"Debug problem: {problem}, symptom: {symptom}, logs: {logs}. Return JSON with hypothesis, investigation_command, recommended_fix."
        return self._parse_json_response(self.generate_completion(prompt))

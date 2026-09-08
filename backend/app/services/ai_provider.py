import os
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional


class AIProvider(ABC):
    """
    Abstract AI Provider interface ensuring StudyOS works 100% offline
    without any external paid API dependency.
    """

    @abstractmethod
    def generate_completion(self, prompt: str) -> str:
        """Generate general text completion."""
        pass

    @abstractmethod
    def analyze_weakness(self, topic_title: str, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze learning difficulties and prescribe actionable study advice."""
        pass

    @abstractmethod
    def suggest_debug_hypothesis(
        self, problem: str, symptom: Optional[str] = None, logs: Optional[str] = None
    ) -> Dict[str, str]:
        """Suggest root causes and hypotheses for a debugging scenario."""
        pass


class LocalOfflineAIProvider(AIProvider):
    """
    100% Offline AI Provider using deterministic rule engines, heuristic reasoning,
    and structured synthesis. Zero network calls, zero billing.
    """

    def generate_completion(self, prompt: str) -> str:
        lower_prompt = prompt.lower()
        if "sql" in lower_prompt or "postgres" in lower_prompt or "query" in lower_prompt:
            return (
                "Offline Engineering Heuristic: Optimize query execution plans by checking missing indexes, "
                "avoiding N+1 relationships with eager loads, and evaluating `EXPLAIN (ANALYZE, BUFFERS)`."
            )
        if "docker" in lower_prompt or "container" in lower_prompt:
            return (
                "Offline Engineering Heuristic: Utilize multi-stage builds to minimize image sizes, "
                "order Dockerfile directives from least to most frequently modified for optimal layer caching, "
                "and ensure a non-root user execution."
            )
        if "fastapi" in lower_prompt or "python" in lower_prompt:
            return (
                "Offline Engineering Heuristic: Use dependency injection (`Depends`) for session and auth scoping, "
                "pydantic schemas for serialization boundaries, and async engines for I/O bound operations."
            )
        return (
            "StudyOS Offline Advisor: Break this engineering challenge down into: "
            "1) Core invariant, 2) Isolated reproduction test, 3) Verified fix."
        )

    def analyze_weakness(self, topic_title: str, metrics: Dict[str, Any]) -> Dict[str, Any]:
        quiz_score = metrics.get("quiz_score_pct", 100)
        time_spent = metrics.get("study_minutes", 0)
        estimated_minutes = metrics.get("estimated_minutes", 60)
        unverified_competencies = metrics.get("unverified_competencies", [])

        reasons = []
        recommendations = []

        if quiz_score < 70:
            reasons.append(f"Recent quiz score of {quiz_score}% indicates conceptual gaps.")
            recommendations.append(f"Re-review foundational concepts and architecture notes for '{topic_title}'.")
        
        if time_spent > estimated_minutes * 1.5:
            reasons.append(
                f"Logged {time_spent}m study time exceeds estimated budget ({estimated_minutes}m)."
            )
            recommendations.append(
                "Convert passive reading into active coding drills or debug lab exercises."
            )

        if unverified_competencies:
            items_str = ", ".join(unverified_competencies[:3])
            reasons.append(f"Pending hands-on competency verifications: {items_str}.")
            recommendations.append(f"Implement and verify: {items_str} to solidify mastery.")

        if not recommendations:
            recommendations.append(
                f"Perform spaced repetition review of '{topic_title}' and attempt building a micro-project."
            )

        severity = "HIGH" if quiz_score < 60 or time_spent > estimated_minutes * 2 else "MEDIUM"

        return {
            "topic": topic_title,
            "severity": severity,
            "identified_reasons": reasons,
            "actionable_recommendations": recommendations,
            "mode": "LOCAL_OFFLINE"
        }

    def suggest_debug_hypothesis(
        self, problem: str, symptom: Optional[str] = None, logs: Optional[str] = None
    ) -> Dict[str, str]:
        combined = f"{problem} {symptom or ''} {logs or ''}".lower()

        if "connection refused" in combined or "port" in combined or "econnrefused" in combined:
            return {
                "hypothesis": "The target service is either not running, listening on localhost inside a container rather than 0.0.0.0, or blocked by a firewall/security group.",
                "investigation_command": "netstat -tulnp | grep <port>  # or: docker ps",
                "recommended_fix": "Verify that the service is running, binding to 0.0.0.0, and that container port mappings match host expectations."
            }
        if "401" in combined or "unauthorized" in combined or "token" in combined:
            return {
                "hypothesis": "JWT token has expired, bearer authorization header is missing, or signature validation failed due to secret mismatch.",
                "investigation_command": "curl -v -H 'Authorization: Bearer <TOKEN>' http://localhost:8000/api/users/profile",
                "recommended_fix": "Inspect the token payload expiration (`exp`), verify `SECRET_KEY` alignment between services, and use refresh tokens."
            }
        if "foreignkey" in combined or "integrityerror" in combined or "constraint" in combined:
            return {
                "hypothesis": "Database relational constraint violation: inserting a record referencing a non-existent parent ID, or violating a unique constraint.",
                "investigation_command": "SELECT id FROM <parent_table> WHERE id = '<foreign_key_val>';",
                "recommended_fix": "Ensure the referenced parent record is created and committed before inserting child records, and check CASCADE rules."
            }
        if "nullpointer" in combined or "nonetype" in combined or "undefined" in combined:
            return {
                "hypothesis": "An unhandled null/undefined value was accessed before initialization or after an optional lookup returned nothing.",
                "investigation_command": "python -m pdb -c continue <script.py>",
                "recommended_fix": "Add optional chaining / guard clauses and validate schema inputs at boundary entrypoints."
            }

        return {
            "hypothesis": "The issue likely stems from state divergence between runtime environment and expected configuration.",
            "investigation_command": "env | grep -i <KEY>  # Check environment flags and service logs",
            "recommended_fix": "Add structured debug logging at the boundaries of the failing function and verify config variables."
        }


class GeminiAIProvider(AIProvider):
    """
    Optional online AI Provider utilizing Google Gemini API.
    Gracefully falls back to LocalOfflineAIProvider if the API key is not configured
    or if network/API calls encounter an issue.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self._offline_fallback = LocalOfflineAIProvider()
        self._client = None
        if self.api_key:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
            except Exception:
                self._client = None

    def generate_completion(self, prompt: str) -> str:
        if not self._client:
            return self._offline_fallback.generate_completion(prompt)
        try:
            response = self._client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            return response.text or self._offline_fallback.generate_completion(prompt)
        except Exception:
            return self._offline_fallback.generate_completion(prompt)

    def analyze_weakness(self, topic_title: str, metrics: Dict[str, Any]) -> Dict[str, Any]:
        if not self._client:
            return self._offline_fallback.analyze_weakness(topic_title, metrics)
        try:
            prompt = (
                f"Analyze this engineering learning weakness for topic '{topic_title}':\n"
                f"Metrics: {metrics}\n"
                "Return a concise analysis: reasons and 2 actionable engineering exercises."
            )
            response = self._client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            return {
                "topic": topic_title,
                "severity": "HIGH" if metrics.get("quiz_score_pct", 100) < 70 else "MEDIUM",
                "identified_reasons": [response.text[:200]],
                "actionable_recommendations": [
                    f"Drill {topic_title} fundamentals",
                    "Complete practical debug labs"
                ],
                "mode": "GEMINI_ONLINE"
            }
        except Exception:
            return self._offline_fallback.analyze_weakness(topic_title, metrics)

    def suggest_debug_hypothesis(
        self, problem: str, symptom: Optional[str] = None, logs: Optional[str] = None
    ) -> Dict[str, str]:
        if not self._client:
            return self._offline_fallback.suggest_debug_hypothesis(problem, symptom, logs)
        try:
            prompt = (
                f"Software Debug Scenario:\nProblem: {problem}\nSymptom: {symptom}\nLogs: {logs}\n"
                "Suggest: 1) Root cause hypothesis, 2) Diagnosis command, 3) Proposed fix."
            )
            response = self._client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            lines = [line.strip() for line in (response.text or "").split("\n") if line.strip()]
            return {
                "hypothesis": lines[0] if lines else "Unidentified failure mode.",
                "investigation_command": lines[1] if len(lines) > 1 else "Check system logs",
                "recommended_fix": lines[2] if len(lines) > 2 else "Apply systematic diagnostic patch."
            }
        except Exception:
            return self._offline_fallback.suggest_debug_hypothesis(problem, symptom, logs)


class OllamaAIProvider(AIProvider):
    """
    Local Offline LLM Provider connecting to local Ollama runtime
    (e.g., llama3, mistral, deepseek-coder) via REST API on http://127.0.0.1:11434.
    Ensures 100% private, on-device AI generation with heuristic fallback.
    """

    def __init__(self, base_url: Optional[str] = None, model: Optional[str] = None):
        self.base_url = (base_url or os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")).rstrip("/")
        self.model = model or os.getenv("OLLAMA_MODEL", "llama3")
        self._offline_fallback = LocalOfflineAIProvider()

    def generate_completion(self, prompt: str) -> str:
        try:
            import httpx
            resp = httpx.post(
                f"{self.base_url}/api/generate",
                json={"model": self.model, "prompt": prompt, "stream": False},
                timeout=10.0
            )
            if resp.status_code == 200:
                data = resp.json()
                return data.get("response") or self._offline_fallback.generate_completion(prompt)
        except Exception:
            pass
        return self._offline_fallback.generate_completion(prompt)

    def analyze_weakness(self, topic_title: str, metrics: Dict[str, Any]) -> Dict[str, Any]:
        try:
            import httpx
            prompt = (
                f"Analyze this engineering weakness for topic '{topic_title}':\n"
                f"Metrics: {metrics}\n"
                "Provide reasons and 2 practical actions."
            )
            resp = httpx.post(
                f"{self.base_url}/api/generate",
                json={"model": self.model, "prompt": prompt, "stream": False},
                timeout=10.0
            )
            if resp.status_code == 200:
                text = resp.json().get("response", "")
                return {
                    "topic": topic_title,
                    "severity": "HIGH" if metrics.get("quiz_score_pct", 100) < 70 else "MEDIUM",
                    "identified_reasons": [text[:250]],
                    "actionable_recommendations": [
                        f"Practice hands-on {topic_title} exercises in DevOps Lab",
                        "Retake conceptual quiz"
                    ],
                    "mode": f"OLLAMA_LOCAL_{self.model.upper()}"
                }
        except Exception:
            pass
        return self._offline_fallback.analyze_weakness(topic_title, metrics)

    def suggest_debug_hypothesis(
        self, problem: str, symptom: Optional[str] = None, logs: Optional[str] = None
    ) -> Dict[str, str]:
        try:
            import httpx
            prompt = (
                f"Debug Scenario:\nProblem: {problem}\nSymptom: {symptom}\nLogs: {logs}\n"
                "Provide: 1) hypothesis, 2) check command, 3) solution."
            )
            resp = httpx.post(
                f"{self.base_url}/api/generate",
                json={"model": self.model, "prompt": prompt, "stream": False},
                timeout=10.0
            )
            if resp.status_code == 200:
                text = resp.json().get("response", "")
                lines = [l.strip() for l in text.split("\n") if l.strip()]
                return {
                    "hypothesis": lines[0] if lines else "Local LLM hypothesis pending.",
                    "investigation_command": lines[1] if len(lines) > 1 else "journalctl -xe",
                    "recommended_fix": lines[2] if len(lines) > 2 else "Apply local config fix."
                }
        except Exception:
            pass
        return self._offline_fallback.suggest_debug_hypothesis(problem, symptom, logs)


def get_ai_provider() -> AIProvider:
    """
    Factory returning active AIProvider based on environment configuration.
    Supports Ollama (local offline GPU/CPU LLMs), Gemini (online free tier),
    and LocalOfflineAIProvider (100% free deterministic heuristic engine).
    """
    provider_type = os.getenv("AI_PROVIDER", "local").lower()

    if provider_type == "ollama":
        return OllamaAIProvider()

    if provider_type == "gemini":
        gemini_key = os.getenv("GEMINI_API_KEY")
        if gemini_key and gemini_key.strip():
            try:
                return GeminiAIProvider(gemini_key)
            except Exception:
                return LocalOfflineAIProvider()

    return LocalOfflineAIProvider()

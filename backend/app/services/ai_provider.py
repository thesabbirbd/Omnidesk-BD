import os
import json
import re
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

    @abstractmethod
    def extract_curriculum(self, text: str, title: Optional[str] = None) -> Dict[str, Any]:
        """Extract structured curriculum JSON (topics, subtopics, prerequisites, estimated minutes)."""
        pass

    @abstractmethod
    def generate_verification_quiz(self, subtopic_name: str) -> Dict[str, Any]:
        """Generate a 4-option conceptual verification quiz in JSON format."""
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
            "Omnidesk BD Offline Advisor: Break this engineering challenge down into: "
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

    def extract_curriculum(self, text: str, title: Optional[str] = None) -> Dict[str, Any]:
        from app.services.course_generator import course_generator
        parsed_topics = course_generator.parse_topics_from_text(text)
        course_title = title or "Autonomous Engineering Curriculum"
        
        topics_list = []
        for idx, t in enumerate(parsed_topics):
            prereqs = [parsed_topics[idx - 1]["title"]] if idx > 0 else []
            topics_list.append({
                "title": t["title"],
                "description": t.get("description", f"Deep dive into {t['title']}."),
                "subtopics": [f"{t['title']} Core Architecture", f"{t['title']} Practical Scenarios", f"{t['title']} Verification Drills"],
                "dependencies": prereqs,
                "prerequisites": prereqs,
                "estimated_minutes": 60,
                "difficulty": "INTERMEDIATE",
                "source_reference": f"Section {idx + 1}"
            })
            
        return {
            "title": course_title,
            "category": "Backend / DevOps",
            "summary": f"Structured offline roadmap covering {len(topics_list)} core competency topics.",
            "topics": topics_list,
            "provider_used": "offline_heuristic"
        }

    def generate_verification_quiz(self, subtopic_name: str) -> Dict[str, Any]:
        return {
            "question": f"In {subtopic_name}, which architectural strategy best prevents latency degradation and thread exhaustion under high concurrency?",
            "options": [
                f"Implement asynchronous non-blocking I/O with connection pooling and caching for {subtopic_name}",
                f"Apply global synchronous locks across all {subtopic_name} mutations",
                "Disable all connection retries and let queries crash immediately",
                "Allocate unbounded thread pools without resource limits"
            ],
            "correct_answer_index": 0,
            "explanation": f"High-throughput systems handling {subtopic_name} rely on asynchronous non-blocking I/O and connection pooling to prevent thread exhaustion.",
            "subtopic": subtopic_name,
            "provider": "offline_heuristic"
        }


class GeminiProvider(AIProvider):
    """
    Google Gemini AI Provider utilizing the official `google-generativeai` SDK.
    Targets the 100% Free Tier of Google AI Studio (zero GCP/Vertex billing required).
    Free Tier Rate Limits: 15 RPM / 1500 RPD.
    Gracefully falls back to OllamaProvider (if active) or LocalOfflineAIProvider,
    or returns 429 Too Many Requests when quota is exceeded.
    """

    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemini-1.5-flash"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model_name = model_name
        self._offline_fallback = LocalOfflineAIProvider()
        self._ollama_fallback = OllamaAIProvider()
        self._model = None

        if self.api_key and self.api_key.strip():
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key.strip())
                self._model = genai.GenerativeModel(
                    model_name=self.model_name,
                    generation_config={
                        "response_mime_type": "application/json",
                        "temperature": 0.2
                    }
                )
            except Exception:
                self._model = None

    def is_available(self) -> bool:
        return bool(self.api_key and self.api_key.strip() and self._model is not None)

    def extract_curriculum(self, text: str, title: Optional[str] = None) -> Dict[str, Any]:
        """
        Analyze study text (first 10,000 characters) and return structured JSON curriculum.
        """
        if not self.is_available():
            if self._ollama_fallback.is_available():
                return self._ollama_fallback.extract_curriculum(text, title=title)
            return self._offline_fallback.extract_curriculum(text, title=title)

        truncated_text = text[:10000] if len(text) > 10000 else text
        prompt = (
            "You are an expert curriculum architect and senior software engineer. "
            "Analyze the provided syllabus / educational text and extract a comprehensive, production-grade learning roadmap.\n\n"
            f"Input Material:\n{truncated_text}\n\n"
            "You MUST return a JSON object with this exact structure:\n"
            "{\n"
            '  "title": "Course Title",\n'
            '  "category": "Backend / DevOps",\n'
            '  "summary": "Concise course overview",\n'
            '  "topics": [\n'
            "    {\n"
            '      "title": "Topic Name",\n'
            '      "description": "Detailed description of competencies learned",\n'
            '      "subtopics": ["Subtopic 1", "Subtopic 2"],\n'
            '      "prerequisites": ["Prerequisite Topic Title, or empty if root topic"],\n'
            '      "dependencies": ["Prerequisite Topic Title, or empty if root topic"],\n'
            '      "estimated_minutes": 60,\n'
            '      "difficulty": "BEGINNER" | "INTERMEDIATE" | "ADVANCED",\n'
            '      "source_reference": "Citation or section heading"\n'
            "    }\n"
            "  ]\n"
            "}\n"
            "Output ONLY valid, parseable JSON."
        )

        try:
            response = self._model.generate_content(prompt)
            raw_text = response.text or ""
            cleaned = raw_text.strip()
            if cleaned.startswith("```"):
                cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
                cleaned = re.sub(r"\s*```$", "", cleaned)
            data = json.loads(cleaned)
            data["provider_used"] = "gemini-1.5-flash"
            return data
        except Exception as err:
            err_str = str(err).lower()
            if "resourceexhausted" in err_str or "429" in err_str or "quota" in err_str:
                if self._ollama_fallback.is_available():
                    return self._ollama_fallback.extract_curriculum(text, title=title)
                from fastapi import HTTPException, status
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Gemini Free Tier rate limit exceeded (15 RPM / 1500 RPD). Please try again shortly or configure local Ollama."
                )
            if self._ollama_fallback.is_available():
                return self._ollama_fallback.extract_curriculum(text, title=title)
            return self._offline_fallback.extract_curriculum(text, title=title)

    def generate_verification_quiz(self, subtopic_name: str) -> Dict[str, Any]:
        """
        Anti-Fake-Progress Quiz: Returns a 4-option conceptual JSON question using Gemini 1.5 Flash.
        """
        if not self.is_available():
            if self._ollama_fallback.is_available():
                return self._ollama_fallback.generate_verification_quiz(subtopic_name)
            return self._offline_fallback.generate_verification_quiz(subtopic_name)

        prompt = (
            f"Generate a rigorous conceptual verification quiz question to verify genuine engineering understanding "
            f"for the subtopic: '{subtopic_name}'.\n"
            "Do NOT ask trivial syntax questions. Test deep architectural reasoning, failure modes, or edge cases.\n"
            "Return a strictly valid JSON object with the following schema:\n"
            "{\n"
            '  "question": "The question text",\n'
            '  "options": ["Option A", "Option B", "Option C", "Option D"],\n'
            '  "correct_answer_index": 0,\n'
            '  "explanation": "Why this answer is correct and why the alternatives are incorrect"\n'
            "}\n"
            "Return ONLY the raw JSON object."
        )

        try:
            response = self._model.generate_content(prompt)
            raw_text = response.text or ""
            cleaned = raw_text.strip()
            if cleaned.startswith("```"):
                cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
                cleaned = re.sub(r"\s*```$", "", cleaned)
            quiz_data = json.loads(cleaned)
            quiz_data["subtopic"] = subtopic_name
            quiz_data["provider"] = "gemini-1.5-flash"
            return quiz_data
        except Exception as err:
            err_str = str(err).lower()
            if "resourceexhausted" in err_str or "429" in err_str or "quota" in err_str:
                if self._ollama_fallback.is_available():
                    return self._ollama_fallback.generate_verification_quiz(subtopic_name)
                from fastapi import HTTPException, status
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Gemini Free Tier rate limit exceeded (15 RPM / 1500 RPD). Please try again shortly."
                )
            if self._ollama_fallback.is_available():
                return self._ollama_fallback.generate_verification_quiz(subtopic_name)
            return self._offline_fallback.generate_verification_quiz(subtopic_name)

    def generate_completion(self, prompt: str) -> str:
        if not self.is_available():
            return self._offline_fallback.generate_completion(prompt)
        try:
            response = self._model.generate_content(prompt)
            return response.text or self._offline_fallback.generate_completion(prompt)
        except Exception:
            return self._offline_fallback.generate_completion(prompt)

    def analyze_weakness(self, topic_title: str, metrics: Dict[str, Any]) -> Dict[str, Any]:
        if not self.is_available():
            return self._offline_fallback.analyze_weakness(topic_title, metrics)
        try:
            prompt = (
                f"Analyze this engineering learning weakness for topic '{topic_title}':\n"
                f"Metrics: {metrics}\n"
                "Return a JSON object with keys: identified_reasons (list of strings), actionable_recommendations (list of strings)."
            )
            response = self._model.generate_content(prompt)
            raw = response.text or ""
            cleaned = raw.strip()
            if cleaned.startswith("```"):
                cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
                cleaned = re.sub(r"\s*```$", "", cleaned)
            data = json.loads(cleaned)
            return {
                "topic": topic_title,
                "severity": "HIGH" if metrics.get("quiz_score_pct", 100) < 70 else "MEDIUM",
                "identified_reasons": data.get("identified_reasons", [raw[:200]]),
                "actionable_recommendations": data.get("actionable_recommendations", [
                    f"Drill {topic_title} fundamentals",
                    "Complete practical debug labs"
                ]),
                "mode": "GEMINI_ONLINE"
            }
        except Exception:
            return self._offline_fallback.analyze_weakness(topic_title, metrics)

    def suggest_debug_hypothesis(
        self, problem: str, symptom: Optional[str] = None, logs: Optional[str] = None
    ) -> Dict[str, str]:
        if not self.is_available():
            return self._offline_fallback.suggest_debug_hypothesis(problem, symptom, logs)
        try:
            prompt = (
                f"Software Debug Scenario:\nProblem: {problem}\nSymptom: {symptom}\nLogs: {logs}\n"
                "Return a JSON object with keys: hypothesis, investigation_command, recommended_fix."
            )
            response = self._model.generate_content(prompt)
            raw = response.text or ""
            cleaned = raw.strip()
            if cleaned.startswith("```"):
                cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
                cleaned = re.sub(r"\s*```$", "", cleaned)
            data = json.loads(cleaned)
            return {
                "hypothesis": data.get("hypothesis", "Unidentified failure mode."),
                "investigation_command": data.get("investigation_command", "Check system logs"),
                "recommended_fix": data.get("recommended_fix", "Apply systematic diagnostic patch.")
            }
        except Exception:
            return self._offline_fallback.suggest_debug_hypothesis(problem, symptom, logs)


# Backwards compatibility alias
GeminiAIProvider = GeminiProvider


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

    def is_available(self) -> bool:
        """Check if local Ollama daemon is reachable on base_url."""
        try:
            import httpx
            r = httpx.get(f"{self.base_url}/api/tags", timeout=1.5)
            return r.status_code == 200
        except Exception:
            return False

    def extract_curriculum(self, text: str, title: Optional[str] = None) -> Dict[str, Any]:
        if not self.is_available():
            return self._offline_fallback.extract_curriculum(text, title=title)
        try:
            import httpx
            prompt = (
                "You are an expert technical curriculum designer. Analyze this text and return a JSON object:\n"
                f"{text[:6000]}\n\n"
                "Schema: {\"title\": string, \"category\": string, \"summary\": string, \"topics\": [{\"title\": string, \"description\": string, \"subtopics\": [string], \"prerequisites\": [string], \"estimated_minutes\": int, \"difficulty\": string}]}"
            )
            resp = httpx.post(
                f"{self.base_url}/api/generate",
                json={"model": self.model, "prompt": prompt, "format": "json", "stream": False},
                timeout=25.0
            )
            if resp.status_code == 200:
                raw = resp.json().get("response", "")
                data = json.loads(raw)
                data["provider_used"] = f"ollama_{self.model}"
                return data
        except Exception:
            pass
        return self._offline_fallback.extract_curriculum(text, title=title)

    def generate_verification_quiz(self, subtopic_name: str) -> Dict[str, Any]:
        if not self.is_available():
            return self._offline_fallback.generate_verification_quiz(subtopic_name)
        try:
            import httpx
            prompt = (
                f"Generate a 4-option conceptual verification quiz JSON for '{subtopic_name}'.\n"
                "Schema: {\"question\": string, \"options\": [string, string, string, string], \"correct_answer_index\": int, \"explanation\": string}"
            )
            resp = httpx.post(
                f"{self.base_url}/api/generate",
                json={"model": self.model, "prompt": prompt, "format": "json", "stream": False},
                timeout=20.0
            )
            if resp.status_code == 200:
                raw = resp.json().get("response", "")
                data = json.loads(raw)
                data["subtopic"] = subtopic_name
                data["provider"] = f"ollama_{self.model}"
                return data
        except Exception:
            pass
        return self._offline_fallback.generate_verification_quiz(subtopic_name)

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


# Backwards compatibility alias
OllamaProvider = OllamaAIProvider


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
                provider = GeminiProvider(gemini_key)
                if provider.is_available():
                    return provider
            except Exception:
                pass

    return LocalOfflineAIProvider()


def generate_verification_quiz(subtopic_name: str) -> Dict[str, Any]:
    """
    Helper function that returns a 4-option conceptual JSON question using
    Gemini 1.5 Flash (or graceful fallback).
    """
    provider = get_ai_provider()
    if hasattr(provider, "generate_verification_quiz"):
        return provider.generate_verification_quiz(subtopic_name)
    return LocalOfflineAIProvider().generate_verification_quiz(subtopic_name)


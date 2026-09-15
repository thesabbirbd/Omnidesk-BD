from typing import Dict, Any, Optional
from app.services.ai.base import AIProvider
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

    def generate_study_topics(
        self, input_text: str, is_topic_name: bool = False, title: Optional[str] = None
    ) -> Dict[str, Any]:
        effective_title = title or (input_text.strip() if is_topic_name else "Curriculum Track")
        if is_topic_name:
            goal_clean = input_text.strip()
            topics_list = [
                {
                    "title": f"{goal_clean}: Foundations & Core Concepts",
                    "description": f"Master fundamental principles, syntax, and foundational mental models of {goal_clean}.",
                    "subtopics": [f"{goal_clean} Basics", f"{goal_clean} Core Primitives", f"{goal_clean} Tooling & Environment"],
                    "dependencies": [],
                    "prerequisites": [],
                    "estimated_minutes": 60,
                    "difficulty": "BEGINNER",
                    "source_reference": f"Directive: {goal_clean}"
                },
                {
                    "title": f"{goal_clean}: Intermediate Architecture & Patterns",
                    "description": f"Design resilient structures, modular abstractions, and standard workflows in {goal_clean}.",
                    "subtopics": [f"{goal_clean} Best Practices", f"{goal_clean} Common Design Patterns", f"{goal_clean} Error Handling"],
                    "dependencies": [f"{goal_clean}: Foundations & Core Concepts"],
                    "prerequisites": [f"{goal_clean}: Foundations & Core Concepts"],
                    "estimated_minutes": 75,
                    "difficulty": "INTERMEDIATE",
                    "source_reference": f"Directive: {goal_clean}"
                },
                {
                    "title": f"{goal_clean}: Advanced Systems & Optimization",
                    "description": f"Deep dive into high-performance tuning, scalability, and internal mechanisms of {goal_clean}.",
                    "subtopics": [f"{goal_clean} Internals", f"{goal_clean} Performance Profiling", f"{goal_clean} Production Hardening"],
                    "dependencies": [f"{goal_clean}: Intermediate Architecture & Patterns"],
                    "prerequisites": [f"{goal_clean}: Intermediate Architecture & Patterns"],
                    "estimated_minutes": 90,
                    "difficulty": "ADVANCED",
                    "source_reference": f"Directive: {goal_clean}"
                },
                {
                    "title": f"{goal_clean}: Real-World Capstone & Debug Lab",
                    "description": f"Synthesize end-to-end knowledge through hands-on laboratory exercises and failure analysis in {goal_clean}.",
                    "subtopics": [f"{goal_clean} Capstone Project", f"{goal_clean} Incident Debugging", f"{goal_clean} Production Readiness Review"],
                    "dependencies": [f"{goal_clean}: Advanced Systems & Optimization"],
                    "prerequisites": [f"{goal_clean}: Advanced Systems & Optimization"],
                    "estimated_minutes": 90,
                    "difficulty": "ADVANCED",
                    "source_reference": f"Directive: {goal_clean}"
                }
            ]
            return {
                "title": effective_title,
                "category": "Technology & Engineering",
                "summary": f"Comprehensive roadmap generated for topic goal '{goal_clean}' ({len(topics_list)} progressive modules).",
                "topics": topics_list,
                "provider_used": "offline_heuristic"
            }
        return self.extract_curriculum(input_text, title=effective_title)

    def chat_assistant(
        self, message: str, mode: str = "explain", context_topic: Optional[str] = None, current_study_space: Optional[str] = None
    ) -> Dict[str, Any]:
        mode_lower = (mode or "explain").lower()
        ctx_str = f" for '{context_topic}'" if context_topic else ""

        if mode_lower == "hint":
            reply = (
                f"💡 Guiding Hint{ctx_str}:\n"
                f"Consider what fundamental invariant is being challenged here. "
                f"Instead of jumping to the final syntax, ask yourself: "
                f"How does data flow across this boundary, and what state changes occur? "
                f"Try isolating the single step where expectations diverge from actual runtime behavior."
            )
        elif mode_lower == "debug":
            diag = self.suggest_debug_hypothesis(message, symptom=context_topic)
            reply = (
                f"🛠️ Debug Lab Analysis{ctx_str}:\n\n"
                f"• Root Cause Hypothesis: {diag['hypothesis']}\n\n"
                f"• Diagnostic Action: `{diag['investigation_command']}`\n\n"
                f"• Recommended Fix: {diag['recommended_fix']}"
            )
        else:
            reply = (
                f"🧠 Feynman Concept Breakdown{ctx_str}:\n\n"
                f"Let's explain '{context_topic or message}' using simple, intuitive intuition:\n\n"
                f"1. Core Intuition: Think of this system like a highway interchange where traffic must merge smoothly based on priority signals rather than brute-forcing intersections.\n"
                f"2. Decoupled Role: Each component focuses strictly on its single invariant, minimizing cascading blast radiuses.\n"
                f"3. Practical Takeaway: Build around invariants first; the implementation details naturally align once the boundary is clear."
            )

        return {
            "reply": reply,
            "mode": mode_lower,
            "context_topic": context_topic,
            "provider": "offline_heuristic"
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



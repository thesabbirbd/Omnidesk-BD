import re
from typing import Optional, Any, List
from app.ai.providers.base import BaseAIProvider
from app.ai.schemas import CurriculumAnalysisResult, TopicAnalysisItem

TECH_DEPENDENCY_GRAPH = {
    "kubernetes": ["docker", "linux"],
    "docker": ["linux"],
    "helm": ["kubernetes"],
    "fastapi": ["python"],
    "sqlalchemy": ["sql", "python"],
    "alembic": ["sqlalchemy"],
    "redis": ["linux"],
    "celery": ["redis", "python"],
    "postgresql": ["sql"],
    "istio": ["kubernetes"],
    "terraform": ["cloud"],
    "ansible": ["linux"],
}


class OfflineHeuristicProvider(BaseAIProvider):
    """
    Deterministic rule-based AI provider ensuring Omnidesk BD functions 100% offline
    with ZERO network, API key, or daemon dependencies.
    Extracts structured curricula using NLP heuristics and prerequisite graph topologies.
    """

    @property
    def name(self) -> str:
        return "offline_heuristic"

    def is_available(self) -> bool:
        """Always available."""
        return True

    def extract_curriculum(
        self,
        text: str,
        title: Optional[str] = None,
        **kwargs: Any
    ) -> CurriculumAnalysisResult:
        raw_lines = [l.strip() for l in text.split("\n") if l.strip()]

        # Handle inline numbered items: "1. Python. 2. FastAPI."
        if len(raw_lines) == 1 and re.search(r"\d+\.\s+", raw_lines[0]):
            split_items = [p.strip() for p in re.split(r"(?<=[.!?\w])\s+(?=\d+\.\s+)", raw_lines[0]) if p.strip()]
            if len(split_items) > 1:
                raw_lines = split_items

        extracted_topics: List[TopicAnalysisItem] = []
        seen_titles = set()

        for idx, line in enumerate(raw_lines):
            # Heading or bullet match
            m = re.match(
                r"^([\d\.\-\*\#]+\s*)?(Chapter\s*\d+|Module\s*\d+|Step\s*\d+|Week\s*\d+)?\s*[:\-\.]?\s*(.+)$",
                line,
                re.IGNORECASE
            )
            candidate = m.group(3).strip() if m else line.strip()

            # Clean punctuation
            clean_title = re.sub(r"^[\d\.\-\*\#\s]+", "", candidate).strip()
            clean_title = re.sub(r"[:\.\-\s]+$", "", clean_title).strip()

            if 2 < len(clean_title) < 70 and clean_title.lower() not in seen_titles:
                seen_titles.add(clean_title.lower())
                
                # Derive subtopics from surrounding context or default competencies
                subtopics = [
                    f"Core syntax and fundamentals of {clean_title}",
                    f"Practical application and hands-on laboratory for {clean_title}",
                    f"Troubleshooting, debugging, and common pitfalls in {clean_title}"
                ]

                # Heuristic difficulty and minutes
                lower = clean_title.lower()
                if any(k in lower for k in ["advanced", "internals", "architecture", "distributed", "consensus", "cluster"]):
                    difficulty = "ADVANCED"
                    minutes = 90
                elif any(k in lower for k in ["basics", "introduction", "fundamentals", "overview", "setup"]):
                    difficulty = "BEGINNER"
                    minutes = 30
                else:
                    difficulty = "INTERMEDIATE"
                    minutes = 45

                extracted_topics.append(
                    TopicAnalysisItem(
                        title=clean_title,
                        description=f"Curriculum mastery module covering {clean_title}.",
                        subtopics=subtopics,
                        dependencies=[],  # Will resolve in second pass
                        estimated_minutes=minutes,
                        difficulty=difficulty,
                        source_reference=f"Extracted from source line {idx + 1}",
                        confidence_score=0.92
                    )
                )

        # Fallback if no lines matched
        if not extracted_topics and text.strip():
            fallback_title = title or text.strip()[:50]
            extracted_topics.append(
                TopicAnalysisItem(
                    title=fallback_title,
                    description=text.strip()[:180],
                    subtopics=["Core principles", "Practical implementation"],
                    dependencies=[],
                    estimated_minutes=45,
                    difficulty="INTERMEDIATE",
                    source_reference="Source text input",
                    confidence_score=0.85
                )
            )

        # Pass 2: Infer dependencies between discovered topics
        topic_title_map = {t.title.lower(): t.title for t in extracted_topics}
        for topic in extracted_topics:
            t_lower = topic.title.lower()
            deps = []
            for tech, prereqs in TECH_DEPENDENCY_GRAPH.items():
                if tech in t_lower:
                    for prereq in prereqs:
                        for other_lower, actual_title in topic_title_map.items():
                            if actual_title != topic.title and prereq in other_lower:
                                if actual_title not in deps:
                                    deps.append(actual_title)
            topic.dependencies = deps

        doc_title = title or (extracted_topics[0].title if extracted_topics else "Unified Study Curriculum")
        total_mins = sum(t.estimated_minutes for t in extracted_topics)

        return CurriculumAnalysisResult(
            title=doc_title,
            category="Backend / DevOps",
            summary=f"Automated offline curriculum with {len(extracted_topics)} structured mastery topics.",
            topics=extracted_topics,
            total_estimated_minutes=total_mins,
            provider_used="offline_heuristic",
            grounded_ratio=1.0
        )

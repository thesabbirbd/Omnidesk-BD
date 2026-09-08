import re
import uuid
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.study_space import StudySpace
from app.models.topic import Topic
from app.models.dependency import TopicDependency
from app.models.competency import CompetencyItem
from app.models.study_plan import StudyPlan, StudyWeek, StudyDay
from app.models.material import Material, MaterialTopic
from app.models.activity_log import ActivityLog


# Known tech dependency heuristics for smart offline DAG construction
TECH_PREREQUISITES = {
    "docker": ["linux", "git"],
    "kubernetes": ["docker", "linux", "networking"],
    "k8s": ["docker", "linux"],
    "fastapi": ["python"],
    "django": ["python"],
    "postgresql": ["sql"],
    "postgres": ["sql"],
    "terraform": ["cloud", "aws", "linux"],
    "ansible": ["linux", "ssh"],
    "ci/cd": ["git", "docker"],
    "prometheus": ["linux", "docker"],
    "grafana": ["prometheus"],
    "redis": ["backend"],
    "kafka": ["distributed systems", "backend"],
    "helm": ["kubernetes"],
}

COMPETENCY_TEMPLATES = [
    ("EXPLAIN", "Explain core principles and architectural tradeoffs of {topic}"),
    ("IMPLEMENT", "Implement a working hands-on script/configuration for {topic}"),
    ("PRACTICE", "Solve 3 common production or development scenarios using {topic}"),
    ("DEBUG", "Diagnose and resolve a simulated break/error in {topic}"),
    ("BUILD", "Integrate {topic} into an end-to-end laboratory project"),
    ("TRADE_OFF", "Analyze advantages and trade-offs of {topic} vs alternatives")
]


class CourseGenerator:
    """
    Universal Study Space and Course Generator.
    Operates offline without paid dependencies.
    Grounds all generated topics and tasks to source documents or explicit inputs.
    """

    def parse_topics_from_text(self, text: str) -> List[Dict[str, Any]]:
        """
        Parse structured topics from plain text, roadmap descriptions, or lists.
        """
        raw_lines = [line.strip() for line in text.split("\n") if line.strip()]
        topic_entries: List[Dict[str, Any]] = []

        # Case 1: Comma-separated or short bullet list
        if len(raw_lines) == 1 and "," in raw_lines[0]:
            items = [item.strip() for item in raw_lines[0].split(",") if item.strip()]
            for idx, item in enumerate(items, 1):
                clean_title = re.sub(r"^[\d\.\-\*\s]+", "", item).strip()
                if clean_title:
                    topic_entries.append({
                        "title": clean_title,
                        "description": f"Mastery module for {clean_title}",
                        "page_number": None,
                        "origin": "USER_CREATED"
                    })
            return topic_entries

        # Case 2: Multi-line list or curriculum outline
        for idx, line in enumerate(raw_lines, 1):
            # Check for header/bullet patterns: "1. Python", "- Docker", "Phase 1: Linux"
            m = re.match(r"^([\d\.\-\*\#]+\s*)?(Phase\s*\d+:|Module\s*\d+:|Day\s*\d+:|Week\s*\d+:|Chapter\s*\d+:)?\s*(.+)$", line, re.IGNORECASE)
            if m:
                raw_title = m.group(3).strip()
                # Skip trivial lines
                if len(raw_title) < 3 or len(raw_title) > 80:
                    continue
                topic_entries.append({
                    "title": raw_title,
                    "description": f"Curriculum topic covering {raw_title}",
                    "page_number": None,
                    "origin": "USER_CREATED"
                })

        # Fallback if few lines detected
        if not topic_entries and text.strip():
            topic_entries.append({
                "title": text.strip()[:60],
                "description": text.strip(),
                "page_number": None,
                "origin": "USER_CREATED"
            })

        return topic_entries

    def parse_topics_from_extracted_pages(
        self,
        pages: List[Dict[str, Any]],
        filename: str
    ) -> List[Dict[str, Any]]:
        """
        Extract topics from PDF/document pages with exact source page grounding.
        """
        discovered: List[Dict[str, Any]] = []
        seen_titles = set()

        for page in pages:
            page_num = page.get("page_number", 1)
            page_text = page.get("text", "")
            lines = [l.strip() for l in page_text.split("\n") if l.strip()]

            for line in lines:
                # Look for chapter/section headings or bold key subjects
                match = re.match(r"^(Chapter\s*\d+|Section\s*\d+|Step\s*\d+|Phase\s*\d+|[\d]{1,2}\.[\d]{0,2})\s*[:\-\.]?\s*(.+)$", line, re.IGNORECASE)
                candidate_title = None
                if match:
                    candidate_title = match.group(2).strip()
                elif line.isupper() and 4 < len(line) < 60:
                    candidate_title = line.strip().title()
                elif re.match(r"^[A-Z][A-Za-z0-9\s\(\)\-\/\+]{4,45}$", line) and not line.endswith("."):
                    # High probability topic headline
                    candidate_title = line.strip()

                if candidate_title:
                    clean = re.sub(r"[^A-Za-z0-9\s\-\+\/\(\)]", "", candidate_title).strip()
                    clean_lower = clean.lower()
                    if 3 < len(clean) < 70 and clean_lower not in seen_titles:
                        seen_titles.add(clean_lower)
                        discovered.append({
                            "title": clean,
                            "description": f"Extracted from {filename}, Page {page_num}",
                            "page_number": page_num,
                            "origin": "SOURCE_CONFIRMED",
                            "source_reference": f"{filename}, Page {page_num}"
                        })

        # If too few headings matched, fallback to paragraph-chunk topic extraction
        if len(discovered) < 3:
            for page in pages[:8]:
                page_num = page.get("page_number", 1)
                text = page.get("text", "")
                words = [w.strip() for w in re.split(r"[,;\n]", text) if len(w.strip()) > 4]
                for chunk in words[:3]:
                    if chunk.lower() not in seen_titles and len(chunk) < 50:
                        seen_titles.add(chunk.lower())
                        discovered.append({
                            "title": chunk.title(),
                            "description": f"Extracted from {filename}, Page {page_num}",
                            "page_number": page_num,
                            "origin": "SOURCE_CONFIRMED",
                            "source_reference": f"{filename}, Page {page_num}"
                        })

        return discovered

    def calculate_node_positions(self, num_topics: int) -> List[Tuple[float, float]]:
        """
        Calculate non-overlapping 2D layout coordinates for React Flow canvas.
        Arranges nodes in a balanced multi-row directed graph structure.
        """
        positions: List[Tuple[float, float]] = []
        # Center root at (450, 60)
        positions.append((450.0, 60.0))

        remaining = num_topics - 1
        if remaining <= 0:
            return positions

        cols_per_row = 3
        start_x = 120.0
        x_spacing = 330.0
        start_y = 220.0
        y_spacing = 180.0

        for i in range(remaining):
            row = i // cols_per_row
            col = i % cols_per_row
            # Stagger alternating rows slightly for dynamic aesthetic
            x_offset = 40.0 if row % 2 == 1 else 0.0
            x = start_x + (col * x_spacing) + x_offset
            y = start_y + (row * y_spacing)
            positions.append((x, y))

        return positions

    def infer_dependencies(self, topics: List[Topic]) -> List[Tuple[uuid.UUID, uuid.UUID, str]]:
        """
        Infer dependency edges between topics using keyword matching and sequential flow.
        Returns list of (source_id, target_id, type).
        """
        edges: List[Tuple[uuid.UUID, uuid.UUID, str]] = []
        topic_map = {t.title.lower(): t for t in topics}

        # 1. Tech prerequisite heuristics
        for t in topics:
            title_lower = t.title.lower()
            for key, prereqs in TECH_PREREQUISITES.items():
                if key in title_lower:
                    for prereq in prereqs:
                        for other_title, other_topic in topic_map.items():
                            if other_topic.id != t.id and prereq in other_title:
                                edges.append((other_topic.id, t.id, "PREREQUISITE"))

        # 2. Sequential fallback if sparse graph (connect root to first layer, layer n to n+1)
        if len(topics) > 1 and len(edges) < len(topics) - 1:
            root = topics[0]
            for subsequent in topics[1:min(4, len(topics))]:
                if not any(e[0] == root.id and e[1] == subsequent.id for e in edges):
                    edges.append((root.id, subsequent.id, "PREREQUISITE"))

            # Cascade remaining
            for idx in range(1, len(topics) - 1):
                cur = topics[idx]
                nxt = topics[idx + 1]
                if not any(e[0] == cur.id and e[1] == nxt.id for e in edges):
                    edges.append((cur.id, nxt.id, "RECOMMENDED"))

        return edges

    def generate_study_space(
        self,
        db: Session,
        user_id: uuid.UUID,
        title: str,
        description: Optional[str] = None,
        category: str = "Backend / DevOps",
        raw_topics: Optional[List[Dict[str, Any]]] = None,
        material: Optional[Material] = None
    ) -> StudySpace:
        """
        Execute end-to-end generation of a complete StudySpace with:
        - StudySpace entity
        - Topics with 2D React Flow positions
        - TopicDependencies (DAG)
        - CompetencyItems (anti-fake-progress criteria)
        - 100-Day StudyPlan with weeks & days
        - Material linking and activity logging
        """
        # 1. Create StudySpace
        space = StudySpace(
            user_id=user_id,
            title=title,
            description=description or f"Adaptive learning workspace for {title}",
            category=category,
            is_active=True
        )
        db.add(space)
        db.flush()

        # 2. Prepare Topic List
        topic_data_list = raw_topics or []
        if not topic_data_list:
            topic_data_list = [
                {"title": f"{title} Foundation", "description": "Core concepts and architecture overview"},
                {"title": "Development Environment & Tooling", "description": "Local workspace and CLI toolchain setup"},
                {"title": "Core Implementation & Practice", "description": "Hands-on coding and component implementation"},
                {"title": "Testing, Debugging & Refinement", "description": "Unit testing and error diagnostics"},
                {"title": "Capstone Project & Deployment", "description": "End-to-end laboratory delivery"}
            ]

        # Calculate Coordinates
        coords = self.calculate_node_positions(len(topic_data_list))

        created_topics: List[Topic] = []
        for idx, t_data in enumerate(topic_data_list):
            pos_x, pos_y = coords[idx] if idx < len(coords) else (150.0 + (idx * 50), 200.0 + (idx * 50))
            
            origin_tag = t_data.get("origin", "SOURCE_CONFIRMED" if material else "USER_CREATED")
            source_ref = t_data.get("source_reference")
            if not source_ref and material:
                source_ref = f"{material.original_filename}"

            topic_desc = t_data.get("description", "")
            if source_ref:
                topic_desc += f" (Source: {source_ref} [{origin_tag}])"

            topic = Topic(
                study_space_id=space.id,
                title=t_data["title"],
                description=topic_desc,
                status="NORMAL" if idx > 0 else "LEARNING",
                progress=0,
                priority=1 if idx < 3 else 2,
                difficulty="beginner" if idx < 2 else "intermediate" if idx < 5 else "advanced",
                estimated_minutes=90,
                order=idx,
                position_x=pos_x,
                position_y=pos_y
            )
            db.add(topic)
            db.flush()
            created_topics.append(topic)

            # 3. Create CompetencyItems for each topic
            for c_type, template in COMPETENCY_TEMPLATES:
                comp = CompetencyItem(
                    topic_id=topic.id,
                    title=template.format(topic=topic.title),
                    competency_type=c_type,
                    is_completed=False,
                    evidence_notes=None
                )
                db.add(comp)

            # Link Material if available
            if material:
                mat_link = MaterialTopic(
                    material_id=material.id,
                    topic_id=topic.id,
                    notes=f"Linked to {topic.title} from {source_ref or 'Uploaded Document'}"
                )
                db.add(mat_link)

        # 4. Generate Dependencies (DAG)
        deps = self.infer_dependencies(created_topics)
        for src_id, tgt_id, dep_type in deps:
            dep = TopicDependency(
                source_topic_id=src_id,
                target_topic_id=tgt_id,
                dependency_type=dep_type
            )
            db.add(dep)

        # 5. Create Default 100-Day StudyPlan
        plan = StudyPlan(
            study_space_id=space.id,
            title=f"100-Day Mastery Plan: {title}",
            description="Daily structured milestones, competency gates, and scheduled reviews.",
            total_days=100,
            is_active=True
        )
        db.add(plan)
        db.flush()

        # Seed initial 2 weeks with study days
        for w in range(1, 3):
            week = StudyWeek(
                study_plan_id=plan.id,
                week_number=w,
                theme_title=f"Week {w}: {'Core Fundamentals' if w==1 else 'Practical Engineering'}"
            )
            db.add(week)
            db.flush()

            for d in range(1, 8):
                day_num = (w - 1) * 7 + d
                study_day = StudyDay(
                    study_week_id=week.id,
                    day_number=day_num,
                    title=f"Day {day_num}: Focus Sprint",
                    focus_goal=f"Deep study and hands-on laboratory for {created_topics[min(d - 1, len(created_topics)-1)].title}"
                )
                db.add(study_day)

        # 6. Log Activity Event
        log = ActivityLog(
            user_id=user_id,
            study_space_id=space.id,
            event_type="STUDYSPACE_CREATED",
            title=f"Created StudySpace '{title}'",
            description=f"Generated {len(created_topics)} topics with full competency gates and dependency tree."
        )
        db.add(log)

        db.commit()
        db.refresh(space)
        return space


course_generator = CourseGenerator()

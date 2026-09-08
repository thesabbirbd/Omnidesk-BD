import uuid
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.study_space import StudySpace
from app.models.topic import Topic
from app.models.dependency import TopicDependency
from app.models.competency import CompetencyItem
from app.models.note import Note
from app.models.material import Material, MaterialTopic
from app.models.project import Project, DebugJournal
from app.models.study_session import StudySession
from app.models.quiz import Quiz, QuizAttempt


class KnowledgeGraphService:
    """
    Constructs the holistic multidimensional knowledge graph for any topic:
    Topics <-> Notes <-> Materials <-> Projects <-> Bugs/Debug Journals <-> Sessions.
    """

    @classmethod
    def get_topic_graph(cls, topic_id: uuid.UUID, user_id: uuid.UUID, db: Session) -> Dict[str, Any]:
        topic = (
            db.query(Topic)
            .join(StudySpace, Topic.study_space_id == StudySpace.id)
            .filter(Topic.id == topic_id, StudySpace.user_id == user_id)
            .first()
        )
        if not topic:
            return {"error": "Topic not found"}

        # 1. Total Studied Time & Sessions
        session_stats = (
            db.query(
                func.coalesce(func.sum(StudySession.duration_minutes), 0).label("total_mins"),
                func.count(StudySession.id).label("session_count")
            )
            .filter(StudySession.topic_id == topic_id, StudySession.user_id == user_id)
            .first()
        )
        total_minutes = int(session_stats.total_mins) if session_stats else 0
        hours = total_minutes // 60
        mins = total_minutes % 60
        time_formatted = f"{hours}h {mins}m" if hours > 0 else f"{mins}m"

        # 2. Related Notes
        notes = (
            db.query(Note)
            .filter(Note.topic_id == topic_id, Note.user_id == user_id)
            .order_by(Note.updated_at.desc())
            .all()
        )
        notes_data = [
            {
                "id": str(n.id),
                "title": n.title,
                "is_pinned": n.is_pinned,
                "is_favorite": n.is_favorite,
                "created_at": n.created_at.isoformat()
            }
            for n in notes
        ]

        # 3. Related Materials
        materials = (
            db.query(Material)
            .join(MaterialTopic, MaterialTopic.material_id == Material.id)
            .filter(MaterialTopic.topic_id == topic_id, Material.user_id == user_id)
            .all()
        )
        materials_data = [
            {
                "id": str(m.id),
                "title": m.title,
                "file_type": m.file_type,
                "page_count": m.page_count,
                "created_at": m.created_at.isoformat()
            }
            for m in materials
        ]

        # 4. Bugs Fixed & Debug Journals
        debug_entries = (
            db.query(DebugJournal)
            .filter(DebugJournal.topic_id == topic_id, DebugJournal.user_id == user_id)
            .order_by(DebugJournal.created_at.desc())
            .all()
        )
        bugs_data = [
            {
                "id": str(d.id),
                "title": d.title,
                "problem": d.problem,
                "root_cause": d.root_cause,
                "solution": d.solution,
                "project_id": str(d.project_id) if d.project_id else None,
                "created_at": d.created_at.isoformat()
            }
            for d in debug_entries
        ]

        # 5. Associated Projects (through linked debug journals or notes)
        project_ids = set()
        for d in debug_entries:
            if d.project_id:
                project_ids.add(d.project_id)
        for n in notes:
            if n.project_id:
                project_ids.add(n.project_id)

        projects = []
        if project_ids:
            proj_objs = db.query(Project).filter(Project.id.in_(project_ids)).all()
            projects = [
                {
                    "id": str(p.id),
                    "title": p.title,
                    "status": p.status,
                    "stage": p.stage
                }
                for p in proj_objs
            ]

        # 6. Prerequisites & Downstream Dependencies
        prereq_topics = (
            db.query(Topic)
            .join(TopicDependency, TopicDependency.source_topic_id == Topic.id)
            .filter(TopicDependency.target_topic_id == topic_id)
            .all()
        )
        downstream_topics = (
            db.query(Topic)
            .join(TopicDependency, TopicDependency.target_topic_id == Topic.id)
            .filter(TopicDependency.source_topic_id == topic_id)
            .all()
        )

        # 7. Competency Items
        competencies = (
            db.query(CompetencyItem)
            .filter(CompetencyItem.topic_id == topic_id)
            .all()
        )
        competencies_data = [
            {
                "id": str(c.id),
                "competency_type": c.competency_type,
                "title": c.title,
                "is_completed": c.is_completed
            }
            for c in competencies
        ]

        # 8. Quizzes & Best Attempts
        quizzes = (
            db.query(Quiz)
            .filter(Quiz.topic_id == topic_id)
            .all()
        )
        quizzes_data = []
        for q in quizzes:
            best_attempt = (
                db.query(QuizAttempt)
                .filter(QuizAttempt.quiz_id == q.id, QuizAttempt.user_id == user_id)
                .order_by(QuizAttempt.score.desc())
                .first()
            )
            quizzes_data.append({
                "id": str(q.id),
                "title": q.title,
                "passing_score_pct": q.passing_score_pct,
                "best_score": best_attempt.score if best_attempt else None,
                "passed": best_attempt.passed if best_attempt else False
            })

        # Extract source grounding from description
        source_ref = None
        origin = "USER_CREATED"
        if topic.description and "Source:" in topic.description:
            parts = topic.description.split("Source:")
            if len(parts) > 1:
                source_ref = parts[1].strip().rstrip(")")
                origin = "SOURCE_CONFIRMED"

        return {
            "topic": {
                "id": str(topic.id),
                "title": topic.title,
                "status": topic.status,
                "progress": topic.progress,
                "priority": topic.priority,
                "difficulty": topic.difficulty,
                "estimated_minutes": topic.estimated_minutes,
                "source_reference": source_ref,
                "origin": origin
            },
            "metrics": {
                "total_study_minutes": total_minutes,
                "formatted_study_time": time_formatted,
                "sessions_count": int(session_stats.session_count) if session_stats else 0,
                "completed_competencies": sum(1 for c in competencies if c.is_completed),
                "total_competencies": len(competencies),
                "bugs_resolved_count": len(bugs_data)
            },
            "related_notes": notes_data,
            "related_materials": materials_data,
            "bugs_fixed": bugs_data,
            "related_projects": projects,
            "prerequisites": [
                {"id": str(p.id), "title": p.title, "status": p.status} for p in prereq_topics
            ],
            "downstream_topics": [
                {"id": str(d.id), "title": d.title, "status": d.status} for d in downstream_topics
            ],
            "competencies": competencies_data,
            "quizzes": quizzes_data
        }

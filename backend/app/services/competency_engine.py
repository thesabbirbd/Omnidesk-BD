import uuid
from datetime import datetime, timezone, timedelta
from typing import Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.topic import Topic
from app.models.competency import CompetencyItem
from app.models.study_session import StudySession


class CompetencyEngine:
    """
    Skill Evidence & Anti-Fake-Progress Enforcement Engine.
    Ensures topics cannot be blindly clicked as Complete without verifiable competency evidence.
    Detects unusually rapid completion velocity and triggers anti-fake-progress flags.
    """

    @staticmethod
    def validate_topic_completion(
        db: Session,
        topic: Topic,
        user_id: uuid.UUID
    ) -> Tuple[bool, Optional[str], bool]:
        """
        Verify if a topic meets the evidence criteria to be marked COMPLETE or MASTERED.
        Returns: (can_complete: bool, message: Optional[str], anti_fake_progress_flag: bool)
        """
        # 1. Competency Check
        competencies = db.query(CompetencyItem).filter(CompetencyItem.topic_id == topic.id).all()
        if competencies:
            completed_count = sum(1 for c in competencies if c.is_completed)
            if completed_count == 0:
                return (
                    False,
                    f"Competency Gate Blocked: Topic '{topic.title}' has {len(competencies)} competency items "
                    f"(Explain, Implement, Debug, Build, etc.). You must complete at least 1 competency item with hands-on evidence before marking as COMPLETE.",
                    False
                )

        # 2. Anti-Fake-Progress Velocity Check
        now = datetime.now(timezone.utc)
        recent_threshold = now - timedelta(minutes=15)

        # Count topics completed in the last 15 minutes in this space
        recent_completed_topics = (
            db.query(Topic)
            .filter(
                Topic.study_space_id == topic.study_space_id,
                Topic.status.in_(["COMPLETE", "MASTERED"]),
                Topic.updated_at >= recent_threshold,
                Topic.id != topic.id
            )
            .count()
        )

        # Calculate study session minutes logged today by user
        today_start = datetime.combine(now.date(), datetime.min.time(), tzinfo=timezone.utc)
        total_session_minutes = (
            db.query(func.coalesce(func.sum(StudySession.duration_minutes), 0))
            .filter(
                StudySession.user_id == user_id,
                StudySession.start_time >= today_start
            )
            .scalar() or 0
        )

        # If 3 or more topics completed in 15 minutes with less than 20 minutes study time
        if recent_completed_topics >= 2 and total_session_minutes < 20:
            warning_msg = (
                f"⚠️ Anti-Fake-Progress Warning: You completed {recent_completed_topics + 1} topics in under 15 minutes "
                f"with only {total_session_minutes}m focused study time recorded today. "
                f"Completion represents actual competency and code building. Consider logging study sessions!"
            )
            return (True, warning_msg, True)

        return (True, None, False)


competency_engine = CompetencyEngine()

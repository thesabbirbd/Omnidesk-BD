import uuid
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.quiz import Quiz, QuizAttempt
from app.models.study_session import StudySession
from app.models.topic import Topic
from app.models.competency import CompetencyItem
from app.services.ai_provider import get_ai_provider


class WeaknessDetectorService:
    """
    Scans user learning data (quiz attempts, study duration vs estimated budget,
    and competency evidence) to detect weak areas and prescribe actionable interventions.
    """

    @classmethod
    def detect_weaknesses(cls, user_id: uuid.UUID, db: Session) -> List[Dict[str, Any]]:
        ai = get_ai_provider()
        weaknesses = []

        # 1. Inspect failed or low-scoring quiz attempts (< 75%)
        low_quizzes = (
            db.query(QuizAttempt, Quiz, Topic)
            .join(Quiz, QuizAttempt.quiz_id == Quiz.id)
            .outerjoin(Topic, Quiz.topic_id == Topic.id)
            .filter(QuizAttempt.user_id == user_id, QuizAttempt.score < 75)
            .order_by(QuizAttempt.completed_at.desc())
            .limit(5)
            .all()
        )

        analyzed_topic_ids = set()

        for attempt, quiz, topic in low_quizzes:
            topic_title = topic.title if topic else quiz.title
            topic_id = topic.id if topic else None
            if topic_id:
                analyzed_topic_ids.add(topic_id)

            # Get unverified competencies
            unverified = []
            if topic_id:
                items = (
                    db.query(CompetencyItem.title)
                    .filter(CompetencyItem.topic_id == topic_id, CompetencyItem.is_completed == False)
                    .all()
                )
                unverified = [it[0] for it in items]

            metrics = {
                "quiz_score_pct": attempt.score,
                "study_minutes": 0,
                "estimated_minutes": topic.estimated_minutes if topic else 60,
                "unverified_competencies": unverified
            }

            analysis = ai.analyze_weakness(topic_title, metrics)
            weaknesses.append({
                "topic_id": str(topic_id) if topic_id else None,
                "topic_title": topic_title,
                "type": "FAILED_QUIZ",
                "score": attempt.score,
                "severity": analysis["severity"],
                "reasons": analysis["identified_reasons"],
                "recommendations": analysis["actionable_recommendations"],
                "engine_mode": analysis["mode"]
            })

        # 2. Inspect topics where logged study time significantly exceeds estimated budget
        session_aggregates = (
            db.query(
                StudySession.topic_id,
                func.sum(StudySession.duration_minutes).label("total_mins")
            )
            .filter(
                StudySession.user_id == user_id,
                StudySession.topic_id != None
            )
            .group_by(StudySession.topic_id)
            .all()
        )

        for topic_id, total_mins in session_aggregates:
            if topic_id in analyzed_topic_ids:
                continue

            topic = db.query(Topic).filter(Topic.id == topic_id).first()
            if not topic:
                continue

            # Flag if study time > 1.5x estimate and topic not yet complete or mastered
            if total_mins > (topic.estimated_minutes * 1.5) and topic.status.upper() not in ["COMPLETE", "MASTERED"]:
                items = (
                    db.query(CompetencyItem.title)
                    .filter(CompetencyItem.topic_id == topic_id, CompetencyItem.is_completed == False)
                    .all()
                )
                unverified = [it[0] for it in items]

                metrics = {
                    "quiz_score_pct": 100,
                    "study_minutes": int(total_mins),
                    "estimated_minutes": topic.estimated_minutes,
                    "unverified_competencies": unverified
                }
                analysis = ai.analyze_weakness(topic.title, metrics)
                weaknesses.append({
                    "topic_id": str(topic.id),
                    "topic_title": topic.title,
                    "type": "PROLONGED_TIME",
                    "logged_minutes": int(total_mins),
                    "estimated_minutes": topic.estimated_minutes,
                    "severity": analysis["severity"],
                    "reasons": analysis["identified_reasons"],
                    "recommendations": analysis["actionable_recommendations"],
                    "engine_mode": analysis["mode"]
                })
                analyzed_topic_ids.add(topic_id)

        # 3. Fallback heuristic if zero historical failures exist (cold start guidance)
        if not weaknesses:
            weaknesses.append({
                "topic_id": None,
                "topic_title": "Active Learning & Verification",
                "type": "BASELINE_MONITOR",
                "severity": "LOW",
                "reasons": ["No historical quiz failures or velocity anomalies detected."],
                "recommendations": [
                    "Continue executing Pomodoro focus blocks with presence verification.",
                    "Verify hands-on competency items (Explain, Implement, Debug) as you study."
                ],
                "engine_mode": "LOCAL_OFFLINE"
            })

        return weaknesses

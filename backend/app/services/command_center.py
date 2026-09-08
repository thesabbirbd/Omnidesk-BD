import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.study_space import StudySpace
from app.models.topic import Topic
from app.models.dependency import TopicDependency
from app.models.review import Review
from app.models.study_session import StudySession
from app.models.user_settings import UserSettings
from app.models.user_profile import UserProfile
from app.services.weakness_detector import WeaknessDetectorService


class CommandCenterService:
    """
    Daily Command Center & Weekly Retrospective Intelligence Service.
    Answers: 'What should I study now?' and calculates weekly planned vs. actual progress.
    """

    @classmethod
    def get_what_to_study_now(cls, user_id: uuid.UUID, db: Session) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        recommendations = []

        # 1. Check Spaced Repetition Due Reviews
        due_reviews = (
            db.query(Review, Topic)
            .join(Topic, Review.topic_id == Topic.id)
            .filter(Review.user_id == user_id, Review.due_date <= now)
            .order_by(Review.due_date.asc())
            .limit(3)
            .all()
        )

        for rev, topic in due_reviews:
            recommendations.append({
                "topic_id": str(topic.id),
                "topic_title": topic.title,
                "category": "REVIEW_DUE",
                "priority": "HIGH",
                "badge": "Spaced Review Due",
                "reason": f"Retention interval ({rev.interval_days}d) reached. Review now to prevent memory decay.",
                "estimated_minutes": min(20, topic.estimated_minutes),
                "action_label": "Start Review Drill",
                "status": topic.status
            })

        # 2. Check Weakness Detector for Critical Interventions
        weaknesses = WeaknessDetectorService.detect_weaknesses(user_id, db)
        for w in weaknesses:
            if w.get("topic_id") and w.get("severity") == "HIGH":
                topic = db.query(Topic).filter(Topic.id == uuid.UUID(w["topic_id"])).first()
                if topic and not any(r["topic_id"] == str(topic.id) for r in recommendations):
                    recommendations.append({
                        "topic_id": str(topic.id),
                        "topic_title": topic.title,
                        "category": "WEAKNESS_INTERVENTION",
                        "priority": "HIGH",
                        "badge": "Weakness Detected",
                        "reason": w["reasons"][0] if w.get("reasons") else "Conceptual gap detected.",
                        "estimated_minutes": min(30, topic.estimated_minutes),
                        "action_label": "Targeted Practice",
                        "status": topic.status
                    })

        # 3. Check Active In-Progress Topics with Satisfied Prerequisites
        learning_topics = (
            db.query(Topic)
            .join(StudySpace, Topic.study_space_id == StudySpace.id)
            .filter(
                StudySpace.user_id == user_id,
                Topic.status.in_(["LEARNING", "learning"])
            )
            .order_by(Topic.priority.desc(), Topic.updated_at.desc())
            .all()
        )

        for topic in learning_topics:
            if any(r["topic_id"] == str(topic.id) for r in recommendations):
                continue

            # Verify DAG prerequisite satisfaction
            prereqs = (
                db.query(Topic)
                .join(TopicDependency, TopicDependency.source_topic_id == Topic.id)
                .filter(TopicDependency.target_topic_id == topic.id)
                .all()
            )
            unmet_prereqs = [p.title for p in prereqs if p.status.upper() not in ["COMPLETE", "MASTERED"]]

            if not unmet_prereqs:
                recommendations.append({
                    "topic_id": str(topic.id),
                    "topic_title": topic.title,
                    "category": "IN_PROGRESS",
                    "priority": "MEDIUM",
                    "badge": "Active Sprint",
                    "reason": f"Currently in progress. All prerequisites verified.",
                    "estimated_minutes": topic.estimated_minutes,
                    "action_label": "Resume Session",
                    "status": topic.status
                })
            else:
                recommendations.append({
                    "topic_id": str(topic.id),
                    "topic_title": topic.title,
                    "category": "PREREQUISITE_BLOCKED",
                    "priority": "LOW",
                    "badge": "Prerequisites Needed",
                    "reason": f"Blocked by incomplete prerequisite: {unmet_prereqs[0]}",
                    "estimated_minutes": topic.estimated_minutes,
                    "action_label": f"Study {unmet_prereqs[0]}",
                    "status": "BLOCKED"
                })

        # 4. Check Unblocked Next Topics in Normal/Ready state
        if len(recommendations) < 4:
            next_topics = (
                db.query(Topic)
                .join(StudySpace, Topic.study_space_id == StudySpace.id)
                .filter(
                    StudySpace.user_id == user_id,
                    Topic.status.in_(["NORMAL", "normal"])
                )
                .order_by(Topic.priority.desc())
                .limit(5)
                .all()
            )
            for topic in next_topics:
                if any(r["topic_id"] == str(topic.id) for r in recommendations):
                    continue

                prereqs = (
                    db.query(Topic)
                    .join(TopicDependency, TopicDependency.source_topic_id == Topic.id)
                    .filter(TopicDependency.target_topic_id == topic.id)
                    .all()
                )
                unmet_prereqs = [p.title for p in prereqs if p.status.upper() not in ["COMPLETE", "MASTERED"]]

                if not unmet_prereqs:
                    recommendations.append({
                        "topic_id": str(topic.id),
                        "topic_title": topic.title,
                        "category": "READY_TO_START",
                        "priority": "LOW",
                        "badge": "Next in Roadmap",
                        "reason": "Prerequisites met. Ready to begin first focus sprint.",
                        "estimated_minutes": topic.estimated_minutes,
                        "action_label": "Start Learning",
                        "status": topic.status
                    })
                if len(recommendations) >= 4:
                    break

        # Fallback if no user topics exist yet
        if not recommendations:
            recommendations.append({
                "topic_id": None,
                "topic_title": "Initialize Your First Study Space",
                "category": "ONBOARDING",
                "priority": "HIGH",
                "badge": "Quick Start",
                "reason": "Upload a course PDF or paste roadmap topics to generate your tailored curriculum.",
                "estimated_minutes": 15,
                "action_label": "Create StudySpace",
                "status": "NORMAL"
            })

        return {
            "timestamp": now.isoformat(),
            "recommendations": recommendations,
            "total_recommendations": len(recommendations)
        }

    @classmethod
    def get_weekly_retrospective(cls, user_id: uuid.UUID, db: Session) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        week_start = now - timedelta(days=7)

        # 1. Fetch user profile for planned weekly hours
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        planned_weekly_hours = float(profile.weekly_goal_hours) if profile and profile.weekly_goal_hours else 20.0

        # 2. Query sessions in the 7-day window
        sessions = (
            db.query(StudySession)
            .filter(
                StudySession.user_id == user_id,
                StudySession.start_time >= week_start
            )
            .all()
        )

        total_actual_minutes = sum(s.duration_minutes for s in sessions)
        actual_weekly_hours = round(total_actual_minutes / 60.0, 1)

        # 3. Focus and presence metrics
        total_sessions_count = len(sessions)
        presence_checked_sessions = sum(1 for s in sessions if s.presence_checked)
        focus_accuracy_pct = (
            round((presence_checked_sessions / total_sessions_count) * 100)
            if total_sessions_count > 0
            else 100
        )

        # 4. Completed topics in this week
        completed_topics_count = (
            db.query(Topic)
            .join(StudySpace, Topic.study_space_id == StudySpace.id)
            .filter(
                StudySpace.user_id == user_id,
                Topic.updated_at >= week_start,
                Topic.status.in_(["COMPLETE", "complete", "MASTERED", "mastered"])
            )
            .count()
        )

        # 5. Weak areas identified
        weaknesses = WeaknessDetectorService.detect_weaknesses(user_id, db)
        weak_topics = [
            w["topic_title"] for w in weaknesses if w.get("topic_title") and w.get("severity") == "HIGH"
        ]

        # 6. Calculated achievement ratio & synthesis
        achievement_pct = (
            round((actual_weekly_hours / planned_weekly_hours) * 100)
            if planned_weekly_hours > 0
            else 100
        )

        if achievement_pct >= 90:
            status_text = "Mastery Velocity: Target exceeded. High retention and consistency."
        elif achievement_pct >= 70:
            status_text = "Steady Progress: Solid consistency, close to planned workload."
        else:
            status_text = "Pace Deficit: Fell behind planned hours. Schedule dedicated morning blocks."

        return {
            "period_start": week_start.isoformat(),
            "period_end": now.isoformat(),
            "planned_hours": planned_weekly_hours,
            "actual_hours": actual_weekly_hours,
            "achievement_pct": min(achievement_pct, 200),
            "sessions_count": total_sessions_count,
            "focus_accuracy_pct": focus_accuracy_pct,
            "topics_completed": completed_topics_count,
            "weak_areas": weak_topics[:3],
            "evaluation": status_text
        }

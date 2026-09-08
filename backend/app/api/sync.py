import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.api.deps import get_current_user
from app.models.task import Task
from app.models.study_session import StudySession
from app.models.topic import Topic
from app.models.project import DebugJournal

logger = logging.getLogger("studyos.sync")

router = APIRouter()


class SyncMutation(BaseModel):
    entity: str  # 'task', 'session', 'topic_status', 'debug_journal'
    action: str  # 'create', 'update', 'complete'
    data: Dict[str, Any]
    client_timestamp: Optional[str] = None


class BatchSyncRequest(BaseModel):
    mutations: List[SyncMutation]


class BatchSyncResponse(BaseModel):
    success: bool
    processed: int
    errors: List[str] = []
    server_time: str


@router.post("/batch", response_model=BatchSyncResponse)
def process_batch_sync(
    payload: BatchSyncRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Synchronize offline queued mutations created by the client PWA.
    Ensures data integrity for tasks, study sessions, and topic progression.
    """
    processed = 0
    errors = []

    for mut in payload.mutations:
        try:
            entity = mut.entity.lower()
            action = mut.action.lower()
            data = mut.data

            if entity == "task" and action in ["complete", "update"]:
                task_id = data.get("id")
                task = db.query(Task).filter(Task.id == task_id).first()
                if task:
                    if "is_completed" in data:
                        task.is_completed = data["is_completed"]
                    if "status" in data:
                        task.status = data["status"]
                    processed += 1

            elif entity == "session" and action == "create":
                # Create study session record from offline timer completion
                session = StudySession(
                    user_id=current_user.id,
                    topic_id=data.get("topic_id"),
                    duration_minutes=int(data.get("duration_minutes", 25)),
                    mode=data.get("mode", "pomodoro"),
                    presence_checked=bool(data.get("presence_checked", data.get("presence_verified", True)))
                )
                db.add(session)
                processed += 1

            elif entity == "topic_status" and action == "update":
                topic_id = data.get("id")
                new_status = data.get("status")
                topic = db.query(Topic).filter(Topic.id == topic_id).first()
                if topic and new_status:
                    topic.status = new_status
                    processed += 1

            elif entity == "debug_journal" and action == "create":
                journal = DebugJournal(
                    user_id=current_user.id,
                    topic_id=data.get("topic_id"),
                    project_id=data.get("project_id"),
                    title=data.get("title", "Offline Debug Entry"),
                    problem=data.get("problem", ""),
                    symptom=data.get("symptom"),
                    hypothesis=data.get("hypothesis"),
                    command_used=data.get("command_used"),
                    output_logs=data.get("output_logs"),
                    root_cause=data.get("root_cause"),
                    solution=data.get("solution"),
                    lesson_learned=data.get("lesson_learned"),
                )
                db.add(journal)
                processed += 1

            else:
                logger.warning("Unrecognized sync mutation: %s - %s", entity, action)

        except Exception as exc:
            errors.append(f"Failed to process mutation {mut.entity}/{mut.action}: {str(exc)}")
            logger.error("Sync error on mutation: %s", exc, exc_info=True)

    db.commit()

    return BatchSyncResponse(
        success=len(errors) == 0,
        processed=processed,
        errors=errors,
        server_time=datetime.now(timezone.utc).isoformat()
    )

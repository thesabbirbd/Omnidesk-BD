import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.task import Task
from app.models.topic import Topic
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.api.deps import get_current_user

router = APIRouter()


@router.get("", response_model=List[TaskResponse])
def get_tasks(
    topic_id: Optional[uuid.UUID] = Query(None, description="Filter tasks by topic ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch all tasks for the current user, optionally filtered by topic.
    """
    query = db.query(Task).filter(Task.user_id == current_user.id)
    if topic_id is not None:
        query = query.filter(Task.topic_id == topic_id)
    return query.order_by(Task.created_at.desc()).offset(skip).limit(limit).all()


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new task linked to the authenticated user and an optional owned topic.
    """
    if task_in.topic_id:
        topic = db.query(Topic).filter(Topic.id == task_in.topic_id, Topic.user_id == current_user.id).first()
        if not topic:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Topic with id '{task_in.topic_id}' not found or not owned by you."
            )

    new_task = Task(
        user_id=current_user.id,
        topic_id=task_in.topic_id,
        study_day_id=task_in.study_day_id,
        title=task_in.title,
        description=task_in.description,
        is_completed=task_in.is_completed,
        priority=task_in.priority,
        due_date=task_in.due_date,
        estimated_minutes=task_in.estimated_minutes,
        source_type=task_in.source_type,
        source_reference=task_in.source_reference,
        confidence_score=task_in.confidence_score
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: uuid.UUID,
    task_in: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update task details (title, description, completion, priority, provenance).
    """
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id '{task_id}' not found."
        )

    update_data = task_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


@router.patch("/{task_id}/toggle", response_model=TaskResponse)
@router.put("/{task_id}/toggle", response_model=TaskResponse)
def toggle_task_completion(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Toggle the completion status of an owned task (True <-> False).
    """
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id '{task_id}' not found."
        )

    task.is_completed = not task.is_completed
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an owned task by ID.
    """
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id '{task_id}' not found."
        )

    db.delete(task)
    db.commit()
    return None

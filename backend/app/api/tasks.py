from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.task import Task
from app.models.topic import Topic
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter()


@router.get("", response_model=List[TaskResponse])
def get_tasks(
    topic_id: Optional[int] = Query(None, description="Filter tasks by topic ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """
    Fetch all tasks, optionally filtered by topic.
    """
    query = db.query(Task)
    if topic_id is not None:
        query = query.filter(Task.topic_id == topic_id)
    return query.offset(skip).limit(limit).all()


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new task linked to a topic.
    """
    topic = db.query(Topic).filter(Topic.id == task_in.topic_id).first()
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Topic with id {task_in.topic_id} not found."
        )

    new_task = Task(
        title=task_in.title,
        topic_id=task_in.topic_id,
        is_completed=False
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task


@router.patch("/{task_id}/toggle", response_model=TaskResponse)
@router.put("/{task_id}/toggle", response_model=TaskResponse)
def toggle_task_completion(
    task_id: int,
    db: Session = Depends(get_db)
):
    """
    Toggle the completion status of a task (True <-> False).
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found."
        )

    task.is_completed = not task.is_completed
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a task by ID.
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found."
        )

    db.delete(task)
    db.commit()
    return None

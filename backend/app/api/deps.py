import uuid
from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Validate access token and return current active user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        if payload.get("type") != "access":
            raise credentials_exception

        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception

        try:
            user_id = uuid.UUID(user_id_str)
        except ValueError:
            raise credentials_exception

    except (jwt.PyJWTError, ValueError):
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user account.")

    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Dependency ensuring the user is active."""
    return current_user


# ==============================================================================
# USER ISOLATION & RESOURCE OWNERSHIP DEPENDENCIES (Packet 1C)
# ==============================================================================

def verify_study_space_owner(
    space_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Ensure the target StudySpace belongs exclusively to the authenticated user."""
    from app.models.study_space import StudySpace
    space = db.query(StudySpace).filter(StudySpace.id == space_id).first()
    if not space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="StudySpace not found."
        )
    if space.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not own this StudySpace."
        )
    return space


def verify_topic_owner(
    topic_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Ensure the target Topic belongs exclusively to the authenticated user."""
    from app.models.topic import Topic
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found."
        )
    if topic.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not own this Topic."
        )
    return topic


def verify_material_owner(
    material_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Ensure the target Material belongs exclusively to the authenticated user."""
    from app.models.material import Material
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found."
        )
    if material.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not own this Material."
        )
    return material


def verify_task_owner(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Ensure the target Task belongs exclusively to the authenticated user."""
    from app.models.task import Task
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found."
        )
    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not own this Task."
        )
    return task


def verify_session_owner(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Ensure the target StudySession belongs exclusively to the authenticated user."""
    from app.models.study_session import StudySession
    session = db.query(StudySession).filter(StudySession.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="StudySession not found."
        )
    if session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not own this StudySession."
        )
    return session

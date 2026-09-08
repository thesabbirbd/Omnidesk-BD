from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.user_profile import UserProfile
from app.models.user_settings import UserSettings
from app.schemas.user import (
    UserProfileResponse,
    UserProfileUpdate,
    UserSettingsResponse,
    UserSettingsUpdate
)
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/profile", response_model=UserProfileResponse)
def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get profile of the currently authenticated user.
    Auto-provisions a profile if one does not already exist.
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(
            user_id=current_user.id,
            full_name=current_user.email.split("@")[0].capitalize(),
            username=f"user_{str(current_user.id)[:6]}"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return profile


@router.put("/profile", response_model=UserProfileResponse)
def update_user_profile(
    profile_in: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update profile details, study goals, theme styling, and timer preferences.
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    # Check username uniqueness if changed
    if profile_in.username and profile_in.username != profile.username:
        existing = db.query(UserProfile).filter(
            UserProfile.username == profile_in.username,
            UserProfile.user_id != current_user.id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Username '{profile_in.username}' is already taken."
            )

    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile


@router.get("/settings", response_model=UserSettingsResponse)
def get_user_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user system settings (audio, notifications, presence, timer defaults).
    """
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return settings


@router.put("/settings", response_model=UserSettingsResponse)
def update_user_settings(
    settings_in: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update user system preferences and custom timer durations.
    """
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)

    update_data = settings_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)

    db.commit()
    db.refresh(settings)
    return settings

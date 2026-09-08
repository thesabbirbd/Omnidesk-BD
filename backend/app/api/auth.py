import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.user_profile import UserProfile
from app.models.user_settings import UserSettings
from app.schemas.auth import (
    UserCreate,
    UserLogin,
    UserResponse,
    AuthResponse,
    Token,
    RefreshTokenRequest,
)
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    validate_password_strength,
)
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_in: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Register a new user account, provision default profile and settings,
    and return an initial pair of access and refresh tokens.
    """
    # 1. Validate password strength
    pwd_error = validate_password_strength(user_in.password)
    if pwd_error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=pwd_error
        )

    # 2. Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user account with this email address already exists."
        )

    # 3. Create User with secure hash
    hashed_password = get_password_hash(user_in.password)
    user = User(
        email=user_in.email.lower(),
        hashed_password=hashed_password,
        is_active=True,
        is_verified=False
    )
    db.add(user)
    db.flush()  # Assigns user.id UUID

    # 4. Auto-provision default UserProfile & UserSettings
    username_candidate = user_in.email.split("@")[0]
    profile = UserProfile(
        user_id=user.id,
        full_name=username_candidate.capitalize(),
        username=f"{username_candidate}_{str(user.id)[:4]}",
        headline="Junior Systems & Cloud Engineer",
        timezone="UTC",
        daily_goal_hours=4,
        weekly_goal_hours=20,
        preferred_theme_mode="dark",
        preferred_theme_style="glass",
        preferred_glass_gradient="aurora",
        preferred_timer_mode="pomodoro",
        presence_enabled=True,
        presence_interval_secs=5
    )
    settings = UserSettings(
        user_id=user.id,
        notifications_enabled=True,
        sound_enabled=True,
        browser_push_enabled=False,
        camera_presence_active=True
    )
    db.add(profile)
    db.add(settings)
    db.commit()
    db.refresh(user)

    # 5. Generate token pair
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/login", response_model=AuthResponse)
def login(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Authenticate user credentials and issue new access & refresh tokens.
    """
    user = db.query(User).filter(User.email == credentials.email.lower()).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is deactivated. Please contact support."
        )

    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/refresh", response_model=Token)
def refresh_token(
    payload_in: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Exchange a valid refresh token for a newly issued access token and refresh token.
    """
    payload = decode_refresh_token(payload_in.refresh_token)
    if not payload or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = uuid.UUID(payload["sub"])
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Corrupted token payload."
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive."
        )

    new_access_token = create_access_token(subject=user.id)
    new_refresh_token = create_refresh_token(subject=user.id)

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    """
    Logout current user session.
    """
    return {
        "status": "success",
        "message": f"Successfully logged out user {current_user.email}."
    }


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user identity.
    """
    return current_user

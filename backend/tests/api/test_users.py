import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
import uuid
from datetime import datetime, timezone

# Do not import models/DB connection for the client side. We just mock DB dependencies
from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.user_profile import UserProfile
from main import app

client = TestClient(app)

@pytest.fixture(autouse=True)
def cleanup_overrides():
    """Ensure that dependency overrides are cleaned up after every test even if it fails."""
    yield
    app.dependency_overrides.clear()

def test_get_user_profile_auto_provisions():
    user_id = uuid.uuid4()
    mock_user = User(
        id=user_id,
        email="test@example.com",
        is_active=True,
    )

    mock_db = MagicMock()
    # first() will return None the first time (no profile found)
    mock_db.query.return_value.filter.return_value.first.return_value = None

    # When add is called, we want to set id, created_at, updated_at to the object
    def mock_add(obj):
        if isinstance(obj, UserProfile):
            obj.id = uuid.uuid4()
            obj.timezone = "UTC"
            obj.daily_goal_hours = 4
            obj.weekly_goal_hours = 20
            obj.challenge_duration_days = 100
            obj.preferred_theme_mode = "dark"
            obj.preferred_theme_style = "glass"
            obj.preferred_glass_gradient = "aurora"
            obj.preferred_timer_mode = "pomodoro"
            obj.presence_enabled = True
            obj.presence_interval_secs = 5
            obj.created_at = datetime.now(timezone.utc)
            obj.updated_at = datetime.now(timezone.utc)

    mock_db.add.side_effect = mock_add

    app.dependency_overrides[get_current_user] = lambda: mock_user
    app.dependency_overrides[get_db] = lambda: mock_db

    response = client.get("/api/users/profile")

    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == str(user_id)
    assert data["full_name"] == "Test"
    assert data["username"].startswith("user_")

    # Verify that it tried to add the new profile to the db and commit
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once()

def test_get_user_profile_existing():
    user_id = uuid.uuid4()
    mock_user = User(
        id=user_id,
        email="test2@example.com",
        is_active=True,
    )

    existing_profile = UserProfile(
        id=uuid.uuid4(),
        user_id=user_id,
        full_name="Existing Profile",
        username="existing_user",
        timezone="UTC",
        daily_goal_hours=4,
        weekly_goal_hours=20,
        challenge_duration_days=100,
        preferred_theme_mode="dark",
        preferred_theme_style="glass",
        preferred_glass_gradient="aurora",
        preferred_timer_mode="pomodoro",
        presence_enabled=True,
        presence_interval_secs=5,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )

    mock_db = MagicMock()
    # first() will return the existing profile
    mock_db.query.return_value.filter.return_value.first.return_value = existing_profile

    app.dependency_overrides[get_current_user] = lambda: mock_user
    app.dependency_overrides[get_db] = lambda: mock_db

    response = client.get("/api/users/profile")

    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == str(user_id)
    assert data["full_name"] == "Existing Profile"
    assert data["username"] == "existing_user"

    # Verify no new profile was added
    mock_db.add.assert_not_called()
    mock_db.commit.assert_not_called()

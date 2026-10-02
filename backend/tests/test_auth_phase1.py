import os
import sys
import uuid

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["status"] == "healthy"
    assert data["version"] == "1.2.5"
    print("✓ Health endpoint returned 200 and version 1.2.5")


def test_auth_and_profile_lifecycle():
    unique_suffix = str(uuid.uuid4())[:8]
    email_a = f"engineer_{unique_suffix}@studyos.com"
    email_b = f"devops_{unique_suffix}@studyos.com"
    strong_pwd = "Password123!"

    # 1. Weak password rejected
    resp = client.post("/api/auth/register", json={"email": email_a, "password": "weak"})
    assert resp.status_code == 422, f"Expected 422 for weak password, got {resp.status_code}"
    print("✓ Weak password rejected with 422")

    # 2. Register User A
    resp = client.post("/api/auth/register", json={"email": email_a, "password": strong_pwd})
    assert resp.status_code == 201, f"Registration failed: {resp.text}"
    auth_data_a = resp.json()
    assert "access_token" in auth_data_a
    assert "refresh_token" in auth_data_a
    token_a = auth_data_a["access_token"]
    refresh_a = auth_data_a["refresh_token"]
    user_id_a = auth_data_a["user"]["id"]
    print(f"✓ User A registered successfully (UUID: {user_id_a})")

    # 3. Duplicate registration blocked
    resp = client.post("/api/auth/register", json={"email": email_a, "password": strong_pwd})
    assert resp.status_code == 400
    print("✓ Duplicate email registration rejected with 400")

    # 4. Login User A
    resp = client.post("/api/auth/login", json={"email": email_a, "password": strong_pwd})
    assert resp.status_code == 200
    login_data = resp.json()
    assert login_data["access_token"]
    print("✓ User login succeeded with fresh access token")

    # 5. Invalid password login rejected
    resp = client.post("/api/auth/login", json={"email": email_a, "password": "WrongPassword123"})
    assert resp.status_code == 401
    print("✓ Invalid password login rejected with 401")

    # 6. Authenticated GET /api/auth/me
    headers_a = {"Authorization": f"Bearer {token_a}"}
    resp = client.get("/api/auth/me", headers=headers_a)
    assert resp.status_code == 200
    assert resp.json()["email"] == email_a
    print("✓ Authenticated GET /api/auth/me returned correct user identity")

    # 7. Unauthenticated request rejected
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401
    print("✓ Unauthenticated request rejected with 401")

    # 8. Token Refresh
    resp = client.post("/api/auth/refresh", json={"refresh_token": refresh_a})
    assert resp.status_code == 200
    refreshed_data = resp.json()
    assert "access_token" in refreshed_data
    assert "refresh_token" in refreshed_data
    token_a_new = refreshed_data["access_token"]
    headers_a_new = {"Authorization": f"Bearer {token_a_new}"}
    print("✓ Refresh token exchange succeeded")

    # 9. Verify Auto-provisioned User Profile
    resp = client.get("/api/users/profile", headers=headers_a_new)
    assert resp.status_code == 200
    profile = resp.json()
    assert profile["user_id"] == user_id_a
    assert profile["preferred_theme_style"] == "glass"
    assert profile["daily_goal_hours"] == 4
    print("✓ Auto-provisioned profile retrieved successfully")

    # 10. Update User Profile
    update_payload = {
        "full_name": "Sabbir Ahmed",
        "bio": "Senior Full-Stack Architect mastering Backend & DevOps",
        "daily_goal_hours": 6,
        "preferred_glass_gradient": "emerald",
        "preferred_timer_mode": "focus"
    }
    resp = client.put("/api/users/profile", json=update_payload, headers=headers_a_new)
    assert resp.status_code == 200
    updated_profile = resp.json()
    assert updated_profile["full_name"] == "Sabbir Ahmed"
    assert updated_profile["daily_goal_hours"] == 6
    assert updated_profile["preferred_glass_gradient"] == "emerald"
    print("✓ User profile updated and verified")

    # 11. User Settings Retrieval and Update
    resp = client.get("/api/users/settings", headers=headers_a_new)
    assert resp.status_code == 200
    resp = client.put("/api/users/settings", json={"sound_enabled": False}, headers=headers_a_new)
    assert resp.status_code == 200
    assert resp.json()["sound_enabled"] is False
    print("✓ User settings retrieved and updated")

    # 12. User Isolation Verification
    # Register User B
    resp = client.post("/api/auth/register", json={"email": email_b, "password": strong_pwd})
    assert resp.status_code == 201
    token_b = resp.json()["access_token"]
    user_id_b = resp.json()["user"]["id"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User B checks profile -> should see User B's profile, NOT User A's
    resp = client.get("/api/users/profile", headers=headers_b)
    assert resp.status_code == 200
    profile_b = resp.json()
    assert profile_b["user_id"] == user_id_b
    assert profile_b["user_id"] != user_id_a
    assert profile_b["full_name"] != "Sabbir Ahmed"
    print("✓ User isolation verified: User B profile is completely isolated from User A")

    # 13. Logout
    resp = client.post("/api/auth/logout", headers=headers_a_new)
    assert resp.status_code == 200
    print("✓ User logout endpoint tested successfully")


if __name__ == "__main__":
    print("Starting StudyOS v1.3.1 Phase 1 Verification Suite...")
    test_health_endpoint()
    test_auth_and_profile_lifecycle()
    print("\n🎉 ALL PHASE 1 TESTS PASSED SUCCESSFULLY!")

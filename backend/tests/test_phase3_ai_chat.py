import sys
import os
import uuid
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from app.services.ai_provider import GeminiProvider, LocalOfflineAIProvider, chat_assistant


def run_phase3_ai_chat_test_suite():
    print("\n" + "=" * 75)
    print("  Omnidesk BD v1.2.7: Phase 3 (Omni-AI Assistant & Debug Lab) Test Suite")
    print("  Testing Modes: Explain (Feynman), Hint (Socratic), Debug (Engineering Lab)")
    print("=" * 75)

    client = TestClient(app)

    # 0. User Registration
    suffix = uuid.uuid4().hex[:8]
    user_email = f"chat_engineer_{suffix}@omnidesk.bd"
    password = "SecurePassword123!"

    reg_resp = client.post("/api/v1/auth/register", json={
        "email": user_email,
        "password": password,
        "full_name": "Omni AI Test Engineer"
    })
    assert reg_resp.status_code == 201, f"Registration failed: {reg_resp.text}"
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"✓ Test user registered: {user_email}")

    # 1. Test Mode 'explain' (Feynman breakdown)
    print("\n[Step 1] Testing /api/v1/ai/chat mode='explain' (Feynman Technique)...")
    resp_explain = client.post(
        "/api/v1/ai/chat",
        headers=headers,
        json={
            "message": "Explain how database indexing works under the hood",
            "mode": "explain",
            "context_topic": "PostgreSQL Indexing"
        }
    )
    assert resp_explain.status_code == 200, f"Explain mode failed: {resp_explain.text}"
    data_explain = resp_explain.json()
    assert data_explain["mode"] == "explain"
    assert data_explain["context_topic"] == "PostgreSQL Indexing"
    assert len(data_explain["reply"]) > 20
    print(f"✓ Mode 'explain' returned response ({len(data_explain['reply'])} chars) via provider '{data_explain.get('provider')}'")

    # 2. Test Mode 'hint' (Socratic Mentor - never dumps complete answer)
    print("\n[Step 2] Testing /api/v1/ai/chat mode='hint' (Socratic Guidance)...")
    resp_hint = client.post(
        "/api/v1/ai/chat",
        headers=headers,
        json={
            "message": "How do I fix a deadlock in PostgreSQL?",
            "mode": "hint",
            "context_topic": "Transaction Isolation"
        }
    )
    assert resp_hint.status_code == 200, f"Hint mode failed: {resp_hint.text}"
    data_hint = resp_hint.json()
    assert data_hint["mode"] == "hint"
    assert data_hint["context_topic"] == "Transaction Isolation"
    assert len(data_hint["reply"]) > 20
    print(f"✓ Mode 'hint' returned Socratic response ({len(data_hint['reply'])} chars)")

    # 3. Test Mode 'debug' (Engineering Lab Root-Cause Analysis)
    print("\n[Step 3] Testing /api/v1/ai/chat mode='debug' (Engineering Debug Lab)...")
    resp_debug = client.post(
        "/api/v1/ai/chat",
        headers=headers,
        json={
            "message": "CrashLoopBackOff: exit code 137 OOMKilled in pod auth-service-78f9",
            "mode": "debug",
            "context_topic": "Kubernetes Pod Memory"
        }
    )
    assert resp_debug.status_code == 200, f"Debug mode failed: {resp_debug.text}"
    data_debug = resp_debug.json()
    assert data_debug["mode"] == "debug"
    assert data_debug["context_topic"] == "Kubernetes Pod Memory"
    assert len(data_debug["reply"]) > 20
    print(f"✓ Mode 'debug' returned root-cause diagnosis ({len(data_debug['reply'])} chars)")

    # 4. Test validation error on empty message
    print("\n[Step 4] Testing validation error handling on empty message...")
    resp_empty = client.post(
        "/api/v1/ai/chat",
        headers=headers,
        json={"message": "   ", "mode": "explain"}
    )
    assert resp_empty.status_code == 422
    print("✓ Empty message correctly rejected with HTTP 422")

    # 5. Test unit level LocalOfflineAIProvider fallback
    print("\n[Step 5] Testing LocalOfflineAIProvider chat fallback...")
    offline = LocalOfflineAIProvider()
    res_offline = offline.chat_assistant("Explain DNS resolution", mode="explain", context_topic="Networking")
    assert res_offline["mode"] == "explain"
    assert "DNS" in res_offline["reply"] or "Networking" in res_offline["reply"]
    print("✓ Offline heuristic fallback verified")

    print("\n" + "=" * 75)
    print("  ALL PHASE 3 (OMNI-AI ASSISTANT & DEBUG LAB v1.2.7) TESTS PASSED!")
    print("=" * 75 + "\n")


if __name__ == "__main__":
    run_phase3_ai_chat_test_suite()

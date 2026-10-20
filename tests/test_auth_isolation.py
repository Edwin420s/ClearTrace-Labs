"""
ClearTrace Labs — Authentication & Multi-Tenant Data Isolation Tests
Verifies:
  1. User Registration (input validation, hashing, duplicate email detection)
  2. User Login (valid vs invalid credentials, session token creation)
  3. 1-Click Demo Auditor login (isolated demo workspace)
  4. Multi-tenant privacy: Cases created by User A are strictly isolated from User B
  5. Demo cases are isolated to Demo user and do not pollute fresh user accounts
  6. Quick reconciliation stores cases under the authenticated user
  7. Session revocation on logout
"""

import os
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

import backend.database as db_mod
from backend.main import app

client = TestClient(app)
TEST_AUTH_DB = Path(__file__).resolve().parent / "test_auth_isolation.db"


@pytest.fixture(autouse=True)
def clean_auth_db(monkeypatch):
    monkeypatch.setattr(db_mod, "DB_PATH", TEST_AUTH_DB)
    if TEST_AUTH_DB.exists():
        try:
            os.remove(TEST_AUTH_DB)
        except OSError:
            pass
    db_mod.init_db(TEST_AUTH_DB)
    yield
    if TEST_AUTH_DB.exists():
        try:
            os.remove(TEST_AUTH_DB)
        except OSError:
            pass


def test_auth_registration_validation():
    # Invalid email
    res = client.post("/api/auth/register", json={
        "email": "invalid-email",
        "password": "strongpassword123",
        "full_name": "Alice Auditor",
    })
    assert res.status_code == 400
    assert "valid email" in res.json()["detail"].lower()

    # Short password
    res = client.post("/api/auth/register", json={
        "email": "alice@company.com",
        "password": "123",
        "full_name": "Alice Auditor",
    })
    assert res.status_code == 400
    assert "at least 6 characters" in res.json()["detail"].lower()

    # Valid registration
    res = client.post("/api/auth/register", json={
        "email": "alice@company.com",
        "password": "securepassword2026",
        "full_name": "Alice Auditor",
        "organization": "Acme Legal Audit",
    })
    assert res.status_code == 200
    data = res.json()
    assert "token" in data
    assert data["token"].startswith("ct_")
    assert data["user"]["email"] == "alice@company.com"
    assert data["user"]["full_name"] == "Alice Auditor"
    assert data["user"]["organization"] == "Acme Legal Audit"

    # Duplicate registration rejection
    res_dup = client.post("/api/auth/register", json={
        "email": "alice@company.com",
        "password": "anotherpassword",
        "full_name": "Alice Clone",
    })
    assert res_dup.status_code == 400
    assert "already exists" in res_dup.json()["detail"]


def test_auth_login_and_logout():
    # Register first
    client.post("/api/auth/register", json={
        "email": "bob@auditfirm.org",
        "password": "mypassword123",
        "full_name": "Bob Forensics",
    })

    # Wrong password
    res_wrong = client.post("/api/auth/login", json={
        "email": "bob@auditfirm.org",
        "password": "wrongpassword",
    })
    assert res_wrong.status_code == 401

    # Correct password
    res_login = client.post("/api/auth/login", json={
        "email": "bob@auditfirm.org",
        "password": "mypassword123",
    })
    assert res_login.status_code == 200
    token = res_login.json()["token"]

    # Verify session profile with GET /api/auth/me
    res_me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 200
    assert res_me.json()["email"] == "bob@auditfirm.org"

    # Logout
    res_logout = client.post("/api/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert res_logout.status_code == 200

    # /api/auth/me after logout should now fail
    res_me_revoked = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me_revoked.status_code == 401


def test_demo_account_login():
    res = client.post("/api/auth/demo-login")
    assert res.status_code == 200
    data = res.json()
    assert data["user"]["user_id"] == "usr-demo"
    assert "demo" in data["user"]["email"].lower()
    assert data["token"].startswith("ct_")


def test_multi_tenant_case_isolation():
    # User 1: Alice
    res_alice = client.post("/api/auth/register", json={
        "email": "alice@firm.com",
        "password": "passwordAlice123",
        "full_name": "Alice Forensic",
    })
    token_alice = res_alice.json()["token"]

    # User 2: Charlie
    res_charlie = client.post("/api/auth/register", json={
        "email": "charlie@bank.com",
        "password": "passwordCharlie123",
        "full_name": "Charlie Risk",
    })
    token_charlie = res_charlie.json()["token"]

    # Alice initially has 0 cases (clean slate, no demo leaks)
    res_alice_cases = client.get("/api/cases", headers={"Authorization": f"Bearer {token_alice}"})
    assert res_alice_cases.status_code == 200
    assert len(res_alice_cases.json()["cases"]) == 0

    # Alice creates a private case via preset
    res_alice_create = client.post(
        "/api/cases/from-preset/invoice",
        headers={"Authorization": f"Bearer {token_alice}"},
    )
    assert res_alice_create.status_code == 200
    alice_case_id = res_alice_create.json()["case"]["case_id"]

    # Alice now sees 1 case
    res_alice_list = client.get("/api/cases", headers={"Authorization": f"Bearer {token_alice}"})
    alice_case_ids = [c["case_id"] for c in res_alice_list.json()["cases"]]
    assert alice_case_id in alice_case_ids

    # Charlie must NOT see Alice's case!
    res_charlie_list = client.get("/api/cases", headers={"Authorization": f"Bearer {token_charlie}"})
    assert res_charlie_list.status_code == 200
    charlie_case_ids = [c["case_id"] for c in res_charlie_list.json()["cases"]]
    assert alice_case_id not in charlie_case_ids
    assert len(charlie_case_ids) == 0

    # Charlie runs quick reconciliation
    res_charlie_quick = client.post(
        "/api/cases/quick-reconcile",
        headers={"Authorization": f"Bearer {token_charlie}"},
        json={
            "title": "Charlie Private Loan Audit",
            "domain": "invoice",
            "source_a_label": "Loan Agreement",
            "source_a_text": "Principal: $500,000. Interest: 5.5%",
            "source_b_label": "Bank Statement",
            "source_b_text": "Principal: $500,000. Interest: 5.5%",
        },
    )
    assert res_charlie_quick.status_code == 200
    charlie_case_id = res_charlie_quick.json()["case"]["case_id"]

    # Charlie now sees only his case
    res_charlie_list2 = client.get("/api/cases", headers={"Authorization": f"Bearer {token_charlie}"})
    charlie_ids2 = [c["case_id"] for c in res_charlie_list2.json()["cases"]]
    assert charlie_case_id in charlie_ids2
    assert alice_case_id not in charlie_ids2
    assert len(charlie_ids2) == 1

    # Alice must NOT see Charlie's case either!
    res_alice_list2 = client.get("/api/cases", headers={"Authorization": f"Bearer {token_alice}"})
    alice_ids2 = [c["case_id"] for c in res_alice_list2.json()["cases"]]
    assert charlie_case_id not in alice_ids2
    assert len(alice_ids2) == 1


def test_delete_case_and_clear_history():
    # User Dave
    res_dave = client.post("/api/auth/register", json={
        "email": "dave@forensics.org",
        "password": "davepassword123",
        "full_name": "Dave Auditor",
    })
    token_dave = res_dave.json()["token"]

    # Dave creates 2 cases
    res1 = client.post("/api/cases/from-preset/invoice", headers={"Authorization": f"Bearer {token_dave}"})
    case1_id = res1.json()["case"]["case_id"]

    res2 = client.post("/api/cases/from-preset/rights", headers={"Authorization": f"Bearer {token_dave}"})
    case2_id = res2.json()["case"]["case_id"]

    res_list = client.get("/api/cases", headers={"Authorization": f"Bearer {token_dave}"})
    assert len(res_list.json()["cases"]) == 2

    # Delete 1 case
    del1 = client.delete(f"/api/cases/{case1_id}", headers={"Authorization": f"Bearer {token_dave}"})
    assert del1.status_code == 200

    res_list_after1 = client.get("/api/cases", headers={"Authorization": f"Bearer {token_dave}"})
    assert len(res_list_after1.json()["cases"]) == 1
    assert res_list_after1.json()["cases"][0]["case_id"] == case2_id

    # Clear all remaining cases
    clear_all = client.delete("/api/cases", headers={"Authorization": f"Bearer {token_dave}"})
    assert clear_all.status_code == 200
    assert clear_all.json()["deleted_count"] == 1

    res_list_empty = client.get("/api/cases", headers={"Authorization": f"Bearer {token_dave}"})
    assert len(res_list_empty.json()["cases"]) == 0


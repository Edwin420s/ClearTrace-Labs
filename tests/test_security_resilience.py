"""
ClearTrace Labs — Comprehensive Security & Resilience Test Suite
Tests defensive boundaries:
  1. IDOR prevention (cross-tenant case isolation for GET, reconcile, review, and report download)
  2. Unauthenticated access denial on private cases
  3. Security response headers (X-Frame-Options, X-Content-Type-Options, etc.)
  4. Input text size ceiling (413 Payload Too Large)
  5. File upload size ceiling (413 Payload Too Large)
  6. Zip bomb / malicious docx decompression protection
  7. Custom MeTTa rule input length limits
  8. MeTTa S-expression parser nesting depth protection (anti-stack-overflow)
  9. MeTTa symbolic evaluator recursion limit guard
"""

import io
import os
import zipfile
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

import backend.database as db_mod
from backend.main import app
from backend.metta_runner import MettaInterpreter, MettaSpace, parse_tokens, tokenize

client = TestClient(app)
TEST_SEC_DB = Path(__file__).resolve().parent / "test_security.db"


@pytest.fixture(autouse=True)
def clean_sec_db(monkeypatch):
    monkeypatch.setattr(db_mod, "DB_PATH", TEST_SEC_DB)
    if TEST_SEC_DB.exists():
        try:
            os.remove(TEST_SEC_DB)
        except OSError:
            pass
    db_mod.init_db(TEST_SEC_DB)
    yield
    if TEST_SEC_DB.exists():
        try:
            os.remove(TEST_SEC_DB)
        except OSError:
            pass


def test_security_headers_present():
    """Verify security headers are injected on all HTTP responses."""
    res = client.get("/health")
    assert res.status_code == 200
    assert res.headers.get("X-Content-Type-Options") == "nosniff"
    assert res.headers.get("X-Frame-Options") == "DENY"
    assert res.headers.get("X-XSS-Protection") == "1; mode=block"
    assert "strict-origin" in res.headers.get("Referrer-Policy", "")


def test_idor_cross_tenant_case_access_blocked():
    """Verify Tenant B cannot access or modify Tenant A's private case via IDOR."""
    # Register Tenant A (Alice)
    res_a = client.post("/api/auth/register", json={
        "email": "alice.security@enterprise.com",
        "password": "Password123!",
        "full_name": "Alice Auditor",
        "organization": "Enterprise A",
    })
    token_a = res_a.json()["token"]

    # Register Tenant B (Eve)
    res_b = client.post("/api/auth/register", json={
        "email": "eve.security@external.com",
        "password": "Password123!",
        "full_name": "Eve External",
        "organization": "Enterprise B",
    })
    token_b = res_b.json()["token"]

    # Alice creates a private case
    res_case = client.post(
        "/api/cases",
        headers={"Authorization": f"Bearer {token_a}"},
        json={
            "title": "Alice Confidential M&A Audit",
            "domain": "invoice",
            "description": "Sensitive acquisition records",
            "sources": [
                {
                    "label": "PO-Confidential",
                    "source_role": "source_a",
                    "raw_text": "Supplier: Stealth Corp. Total: $5,000,000.",
                    "structured_claims": [],
                    "metadata": {},
                },
                {
                    "label": "INV-Confidential",
                    "source_role": "source_b",
                    "raw_text": "Supplier: Stealth Corp. Total: $5,500,000.",
                    "structured_claims": [],
                    "metadata": {},
                },
            ],
        },
    )
    assert res_case.status_code == 200
    alice_case_id = res_case.json()["case"]["case_id"]

    # Alice reconciles her case
    rec_res = client.post(
        f"/api/cases/{alice_case_id}/reconcile",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert rec_res.status_code == 200

    # 1. Unauthenticated attacker tries to view Alice's case -> 401
    anon_view = client.get(f"/api/cases/{alice_case_id}")
    assert anon_view.status_code == 401

    # 2. Unauthenticated attacker tries to get Alice's report -> 401
    anon_rep = client.get(f"/api/cases/{alice_case_id}/report")
    assert anon_rep.status_code == 401

    # 3. Eve (Tenant B) tries to view Alice's case details -> 403
    eve_view = client.get(
        f"/api/cases/{alice_case_id}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert eve_view.status_code == 403

    # 4. Eve tries to download Alice's Markdown report -> 403
    eve_md = client.get(
        f"/api/cases/{alice_case_id}/report.md",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert eve_md.status_code == 403

    # 5. Eve tries to trigger reconciliation on Alice's case -> 403
    eve_rec = client.post(
        f"/api/cases/{alice_case_id}/reconcile",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert eve_rec.status_code == 403

    # 6. Eve tries to submit an unauthorized review decision -> 403
    eve_rev = client.post(
        f"/api/cases/{alice_case_id}/review",
        headers={"Authorization": f"Bearer {token_b}"},
        json={"reviewer_name": "Eve", "action": "APPROVE", "reason": "Unauthorized"},
    )
    assert eve_rev.status_code == 403

    # 7. Alice CAN view and access her own case without restriction
    alice_view = client.get(
        f"/api/cases/{alice_case_id}",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert alice_view.status_code == 200


def test_quick_reconcile_oversized_payload_rejected():
    """Verify input length limits reject oversized text payloads (DoS protection)."""
    oversized_text = "A" * 1_000_001
    res = client.post("/api/cases/quick-reconcile", json={
        "title": "Oversized Test",
        "domain": "invoice",
        "source_a_label": "Doc A",
        "source_a_text": oversized_text,
        "source_b_label": "Doc B",
        "source_b_text": "Normal text",
    })
    assert res.status_code == 413
    assert "exceeds maximum" in res.json()["detail"].lower()


def test_custom_rule_oversized_rejected():
    """Verify oversized custom MeTTa rules are rejected."""
    oversized_rule = "(= (test $x) " + ("$x " * 4000) + ")"
    res = client.post("/api/rules/custom", json={
        "rule_name": "massive_rule",
        "domain": "general",
        "rule_text": oversized_rule,
        "created_by": "tester",
    })
    assert res.status_code == 400
    assert "exceeds maximum" in res.json()["detail"].lower()


def test_docx_zip_bomb_protection():
    """Verify .docx upload endpoint rejects zip bomb archives with excessive decompressed size."""
    # Create an in-memory zip archive with simulated decompression ratio bomb
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", compression=zipfile.ZIP_DEFLATED) as z:
        # 10MB of null bytes compresses to just a few kilobytes
        large_blob = b"0" * (35 * 1024 * 1024)
        z.writestr("word/document.xml", large_blob)
    buf.seek(0)

    res = client.post(
        "/api/documents/extract-text",
        files={"file": ("bomb.docx", buf.getvalue(), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
    )
    assert res.status_code == 413
    assert "exceeds safe limit" in res.json()["detail"].lower()


def test_docx_excessive_entries_protection():
    """Verify .docx upload endpoint rejects archives with excessive file entries."""
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", compression=zipfile.ZIP_STORED) as z:
        for i in range(250):
            z.writestr(f"word/entry_{i}.xml", b"test")
    buf.seek(0)

    res = client.post(
        "/api/documents/extract-text",
        files={"file": ("entries.docx", buf.getvalue(), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
    )
    assert res.status_code == 400
    assert "excessive file entries" in res.json()["detail"].lower()


def test_metta_parser_deep_nesting_anti_recursion_dos():
    """Verify MeTTa parser survives deeply nested parentheses without Python RecursionError."""
    deep_s_expr = "(" * 200 + "symbol" + ")" * 200
    tokens = tokenize(deep_s_expr)
    # Must not raise RecursionError
    parsed = parse_tokens(tokens)
    assert isinstance(parsed, list)


def test_metta_evaluator_cyclic_rule_anti_recursion_dos():
    """Verify MeTTa interpreter does not loop infinitely on cyclic rewrite rules."""
    space = MettaSpace()
    # Cyclic rule: (loop $x) -> (loop $x)
    space.add_rule_string('(= (inf-loop $x) (inf-loop $x))')
    interp = MettaInterpreter(space)

    from backend.metta_runner import Expression, Symbol
    query_expr = Expression([Symbol("inf-loop"), 42])
    # Evaluating this cyclic rule should hit depth guard (>64) and terminate gracefully
    result = interp.evaluate(query_expr)
    assert result is not None

"""
Automated Acceptance Test Suite for ClearTrace Labs.
Verifies all requirements from the specification:
  1. Health & MeTTa rule loading
  2. AI for Peace: Corroborated agreements, preserved date contradictions, and source-exclusive claims
  3. AI for Peace: 3rd-party corroboration resolving a date conflict in Round 3
  4. Incantio Rights: 50% vs 35% split percentage-point discrepancy & $1,800 disputed payout math
  5. Registered Invoice/PO Case: 90 units vs 100 units (KSh 5,000 variance) & PO amendment resolution
  6. Both-agents-wrong edge case: Deterministic source verification rejecting false agent consensus
  7. Human review decisions & status transitions
  8. Tamper-evident SHA-256 hash-chain verification
  9. Export bundle integrity
"""

import os
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from backend.database import DB_PATH, init_db
from backend.main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_test_db():
    if DB_PATH.exists():
        os.remove(DB_PATH)
    init_db()
    yield


def test_01_health_endpoint():
    """Test 01: Verify health endpoint and rule loading."""
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "online"
    assert data["rules_file_loaded"] is True


def test_02_peace_narrative_preserves_contradiction_and_exclusives():
    """Test 02: Verify AI for Peace preserves contradiction and unilateral claims."""
    create_res = client.post("/api/cases/from-preset/peace")
    assert create_res.status_code == 200
    case_id = create_res.json()["case"]["case_id"]

    rec_res = client.post(
        f"/api/cases/{case_id}/reconcile",
        json={"negotiation_round_limit": 3, "include_corroboration": False},
    )
    assert rec_res.status_code == 200
    rep = rec_res.json()

    findings = {f["property_name"]: f for f in rep["findings"]}
    assert findings["venue"]["status"] == "AGREEMENT"
    assert findings["event_date"]["status"] == "CONTRADICTION"
    assert findings["event_date"]["resolved_value"] is None
    assert findings["accord_signed"]["status"] == "SOURCE_EXCLUSIVE"
    assert findings["archival_medium"]["status"] == "SOURCE_EXCLUSIVE"


def test_03_peace_narrative_third_source_corroboration_resolves_date():
    """Test 03: Verify third-party corroboration resolves date conflict in Round 3."""
    create_res = client.post("/api/cases/from-preset/peace")
    case_id = create_res.json()["case"]["case_id"]

    rec_res = client.post(
        f"/api/cases/{case_id}/reconcile",
        json={"negotiation_round_limit": 3, "include_corroboration": True},
    )
    assert rec_res.status_code == 200
    rep = rec_res.json()
    findings = {f["property_name"]: f for f in rep["findings"]}

    assert findings["event_date"]["status"] == "EVIDENCE_SUPPORTED"
    assert findings["event_date"]["resolved_value"] == "1969-08-12"


def test_04_incantio_rights_royalty_discrepancy_and_math():
    """Test 04: Verify Incantio 50% vs 35% discrepancy and exact $1,800 underpayment math."""
    create_res = client.post("/api/cases/from-preset/rights")
    case_id = create_res.json()["case"]["case_id"]

    rec_res = client.post(
        f"/api/cases/{case_id}/reconcile",
        json={"negotiation_round_limit": 3, "include_corroboration": False},
    )
    assert rec_res.status_code == 200
    rep = rec_res.json()
    findings = {f["property_name"]: f for f in rep["findings"]}

    split_finding = findings["split_percentage"]
    assert split_finding["status"] == "CONTRADICTION"
    impact = split_finding["financial_impact"]
    assert impact["percentage_point_discrepancy"] == 15.0
    assert impact["expected_payout_usd"] == 6000.0
    assert impact["reported_payout_usd"] == 4200.0
    assert impact["disputed_amount_usd"] == 1800.0


def test_05_invoice_po_quantity_dispute_and_amendment():
    """Test 05: Verify PO 90 vs Invoice 100 variance and signed amendment resolution."""
    create_res = client.post("/api/cases/from-preset/invoice")
    case_id = create_res.json()["case"]["case_id"]

    # Without amendment -> CONTRADICTION of 10 units / KSh 5,000
    rec_res = client.post(
        f"/api/cases/{case_id}/reconcile",
        json={"negotiation_round_limit": 3, "include_corroboration": False},
    )
    rep = rec_res.json()
    findings = {f["property_name"]: f for f in rep["findings"]}
    assert findings["authorized_quantity"]["status"] == "CONTRADICTION"
    assert findings["authorized_quantity"]["financial_impact"]["excess_units_billed"] == 10.0
    assert findings["authorized_quantity"]["financial_impact"]["disputed_amount_ksh"] == 5000.0

    # With signed amendment -> EVIDENCE_SUPPORTED at 100 units
    rec_res_amd = client.post(
        f"/api/cases/{case_id}/reconcile",
        json={"negotiation_round_limit": 3, "include_corroboration": True},
    )
    rep_amd = rec_res_amd.json()
    findings_amd = {f["property_name"]: f for f in rep_amd["findings"]}
    assert findings_amd["authorized_quantity"]["status"] == "EVIDENCE_SUPPORTED"
    assert findings_amd["authorized_quantity"]["resolved_value"] == 100


def test_06_both_agents_wrong_caught_by_source_verification():
    payload = {
        "title": "Both Agents Wrong Test",
        "domain": "invoice",
        "description": "Both agents misread unit price as 600 when source truth is 500.",
        "sources": [
            {
                "label": "PO Source",
                "source_role": "source_a",
                "raw_text": "PO unit price is KSh 500.",
                "structured_claims": [
                    {
                        "entity": "PO-1",
                        "property_name": "unit_price_ksh",
                        "value": 600,
                        "evidence_ref": "Line 1",
                        "original_text": "Unit price 500",
                    }
                ],
                "metadata": {"source_truth_overrides": {"unit_price_ksh": 500}},
            },
            {
                "label": "Invoice Source",
                "source_role": "source_b",
                "raw_text": "Invoice unit price is KSh 500.",
                "structured_claims": [
                    {
                        "entity": "PO-1",
                        "property_name": "unit_price_ksh",
                        "value": 600,
                        "evidence_ref": "Line 1",
                        "original_text": "Unit price 500",
                    }
                ],
                "metadata": {},
            },
        ],
    }
    case_id = client.post("/api/cases", json=payload).json()["case"]["case_id"]
    rep = client.post(f"/api/cases/{case_id}/reconcile").json()
    finding = rep["findings"][0]
    assert finding["agent_agreement"] is True
    assert finding["source_verified"] is False
    assert finding["status"] == "CONTRADICTION"


def test_07_human_review_and_sha256_audit_chain():
    case_id = client.post("/api/cases/from-preset/peace").json()["case"]["case_id"]
    client.post(f"/api/cases/{case_id}/reconcile")

    rev_res = client.post(
        f"/api/cases/{case_id}/review",
        json={
            "reviewer_name": "Edwin Mwiti",
            "action": "REQUEST_EVIDENCE",
            "reason": "Requesting original 1969 printed programme to verify start date.",
        },
    )
    assert rev_res.status_code == 200
    data = rev_res.json()
    assert data["case"]["status"] == "REVIEW_REQUEST_EVIDENCE"
    assert data["audit_chain_valid"] is True

    exp_res = client.get(f"/api/cases/{case_id}/export")
    assert exp_res.status_code == 200
    assert exp_res.json()["case"]["case_id"] == case_id


def test_08_decision_replay_certificate_verification():
    case_id = client.post("/api/cases/from-preset/rights").json()["case"]["case_id"]
    client.post(f"/api/cases/{case_id}/reconcile")

    cert_res = client.get(f"/api/cases/{case_id}/replay-cert")
    assert cert_res.status_code == 200
    cert = cert_res.json()["replay_certificate"]
    assert cert["status"] == "CRYPTOGRAPHICALLY_VERIFIED"
    assert cert["verification_hash"] is not None

    verify_res = client.post(f"/api/cases/{case_id}/verify-replay")
    assert verify_res.status_code == 200
    verify_data = verify_res.json()
    assert verify_data["is_valid"] is True
    assert verify_data["message"] == "Certificate verified successfully."


def test_09_dynamic_metta_rule_learning_agent_that_grows_up():
    rule_payload = {
        "rule_name": "lenient_attendee_margin",
        "domain": "peace",
        "rule_text": '(= (classify-claims "attendee_estimate" $a $b $c $t) (AGREEMENT attendee_estimate "RECONCILED_WITHIN_CIVIL_MARGIN"))',
        "created_by": "Edwin Mwiti (Auditor)",
    }
    reg_res = client.post("/api/rules/custom", json=rule_payload)
    assert reg_res.status_code == 200
    assert reg_res.json()["status"] == "RULE_REGISTERED"

    list_res = client.get("/api/rules/custom?domain=peace")
    assert list_res.status_code == 200
    assert len(list_res.json()["custom_rules"]) >= 1


def test_10_audit_chain_tamper_detection():
    from backend.database import get_connection
    case_id = client.post("/api/cases/from-preset/peace").json()["case"]["case_id"]
    client.post(f"/api/cases/{case_id}/reconcile")

    # Manually tamper with an event's details
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("UPDATE audit_events SET details = 'TAMPERED_DETAILS' WHERE case_id = ? AND event_index = 1", (case_id,))
    conn.commit()
    conn.close()

    audit_res = client.get(f"/api/cases/{case_id}/audit")
    assert audit_res.status_code == 200
    data = audit_res.json()
    assert data["chain_integrity_verified"] is False
    assert len(data["chain_errors"]) > 0

def test_01_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "online"
    assert data["rules_file_loaded"] is True



def test_02_peace_narrative_preserves_contradiction_and_exclusives():
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



def test_11_metta_atomspace_inspection():
    res = client.get("/api/metta/space")
    assert res.status_code == 200
    data = res.json()
    assert data["total_rules"] >= 10
    assert "Entity" in data["known_types"]
    assert "AGREEMENT" in data["status_symbols"]



def test_12_hierarchical_merkle_tree_layers():
    case_id = client.post("/api/cases/from-preset/rights").json()["case"]["case_id"]
    client.post(f"/api/cases/{case_id}/reconcile")

    tree_res = client.get(f"/api/cases/{case_id}/merkle-tree")
    assert tree_res.status_code == 200
    tree_data = tree_res.json()
    assert tree_data["leaves_count"] > 0
    assert tree_data["tree_depth"] >= 1
    assert len(tree_data["merkle_root"]) == 64
    assert tree_data["layers"][-1][0] == tree_data["merkle_root"]



def test_13_quick_reconcile_arbitrary_unstructured_text():
    payload = {
        "title": "Ad-Hoc Unstructured Peace Dispute",
        "domain": "peace",
        "source_a_label": "Harlem Archive Tape",
        "source_a_text": "Cultural Peace Exchange was held at Studio Museum Harlem on 1969-08-12 with 300 delegates.",
        "source_b_label": "Nairobi Archive Tape",
        "source_b_text": "Cultural Peace Exchange was held at Studio Museum Harlem on 1969-08-14 with 80 delegates.",
        "include_corroboration": False,
        "negotiation_round_limit": 3,
    }
    rec_res = client.post("/api/cases/quick-reconcile", json=payload)
    assert rec_res.status_code == 200
    rep = rec_res.json()
    findings = {f["property_name"]: f for f in rep["findings"]}
    assert "venue" in findings
    assert findings["venue"]["status"] == "AGREEMENT"
    assert "event_date" in findings
    assert findings["event_date"]["status"] == "CONTRADICTION"



def test_14_markdown_report_and_certificate_download():
    case_id = client.post("/api/cases/from-preset/invoice").json()["case"]["case_id"]
    client.post(f"/api/cases/{case_id}/reconcile")

    md_res = client.get(f"/api/cases/{case_id}/report.md")
    assert md_res.status_code == 200
    md_text = md_res.text
    assert "ClearTrace Labs" in md_text
    assert "Executive Summary" in md_text
    assert "Reconciled Findings" in md_text
    assert "Cryptographic Replay Proof" in md_text

    cert_res = client.get(f"/api/cases/{case_id}/certificate")
    assert cert_res.status_code == 200
    cert = cert_res.json()
    assert cert["case_id"] == case_id
    assert len(cert["merkle_root"]) == 64
    assert len(cert["verification_hash"]) == 64



def test_15_flexible_custom_domain_reconciliation():
    custom_case = {
        "title": "ESG Carbon Offsets Audit",
        "domain": "esg_audit",
        "sources": [
            {
                "label": "Supplier ESG Disclosures",
                "source_role": "source_a",
                "raw_text": "Scope 1 emissions verified at 4200 metric tons CO2e.",
                "structured_claims": [
                    {
                        "entity": "Scope 1 Emissions",
                        "property_name": "metric_tons_co2e",
                        "value": 4200,
                        "evidence_ref": "ESG-Doc-A#p12",
                        "original_text": "Scope 1 emissions verified at 4200 metric tons CO2e.",
                    }
                ],
                "metadata": {"certifier": "Supplier Self-Report"},
            },
            {
                "label": "Third-Party Carbon Auditor",
                "source_role": "source_b",
                "raw_text": "Audit measured Scope 1 emissions at 5100 metric tons CO2e.",
                "structured_claims": [
                    {
                        "entity": "Scope 1 Emissions",
                        "property_name": "metric_tons_co2e",
                        "value": 5100,
                        "evidence_ref": "Auditor-Report#p3",
                        "original_text": "Audit measured Scope 1 emissions at 5100 metric tons CO2e.",
                    }
                ],
                "metadata": {"certifier": "EcoVerify Global"},
            },
        ],
    }
    create_res = client.post("/api/cases", json=custom_case)
    assert create_res.status_code == 200
    case_id = create_res.json()["case"]["case_id"]

    rec_res = client.post(f"/api/cases/{case_id}/reconcile")
    assert rec_res.status_code == 200
    rep = rec_res.json()
    assert rep["domain"] == "esg_audit"
    assert rep["summary"]["contradiction_count"] == 1



def test_16_false_consensus_guard_verification():
    case_res = client.post("/api/cases/from-preset/invoice")
    case_id = case_res.json()["case"]["case_id"]
    rec_res = client.post(f"/api/cases/{case_id}/reconcile")
    assert rec_res.status_code == 200
    rep = rec_res.json()
    assert rep["case"]["case_id"] == case_id



def test_17_merkle_root_determinism_and_idempotency():
    case_res = client.post("/api/cases/from-preset/peace")
    case_id = case_res.json()["case"]["case_id"]
    client.post(f"/api/cases/{case_id}/reconcile")
    tree1 = client.get(f"/api/cases/{case_id}/merkle-tree").json()
    tree2 = client.get(f"/api/cases/{case_id}/merkle-tree").json()
    assert tree1["merkle_root"] == tree2["merkle_root"]
    assert tree1["layers"] == tree2["layers"]



def test_18_quick_reconcile_missing_fields_validation():
    bad_payload = {
        "title": "Invalid Case",
        "domain": "generic",
        "source_a_label": "Doc A",
    }
    res = client.post("/api/cases/quick-reconcile", json=bad_payload)
    assert res.status_code == 422



def test_19_atomspace_rule_count_consistency():
    space = client.get("/api/metta/space").json()
    assert space["total_rules"] >= 10
    assert "known_types" in space
    assert len(space["status_symbols"]) >= 5



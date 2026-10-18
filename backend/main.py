"""
ClearTrace Labs — FastAPI Production Server
Implements the complete REST API for Multi-Agent Truth & Reconciliation:
- Isolated Intake for Agent A and Agent B
- 5-Stage Multi-Round Negotiation Protocol
- SingularityNET Hyperon / MeTTa Symbolic Reasoning with Step Traces
- Dynamic Custom Rule Synthesis ("The Agent That Grows Up")
- Cryptographic SHA-256 Decision Replay Certificates
- Tamper-Evident SHA-256 Audit Chain Verification
"""

import hashlib
import json
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.agents import ContextChallengerAgentB, RecordVerifierAgentA
from backend.database import (
    append_audit_event,
    get_audit_trail,
    get_connection,
    init_db,
    list_custom_rules,
    save_custom_rule,
    verify_audit_chain,
)
from backend.metta_runner import SymbolicReasoner
from backend.negotiation import MultiAgentReconciliationEngine
from backend.presets import PRESETS
from backend.replay_service import DecisionReplayService
from backend.schemas import (
    CreateCaseRequest,
    CustomRuleInput,
    ReconcileRequest,
    ReviewDecisionRequest,
    SourceDocumentInput,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="ClearTrace Labs API",
    description="Evidence-Grounded Multi-Agent Reconciliation Engine (Omega AI Agents / MeTTa)",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

reasoner = SymbolicReasoner()
reconciliation_engine = MultiAgentReconciliationEngine(reasoner)
agent_a = RecordVerifierAgentA()
agent_b = ContextChallengerAgentB()


@app.get("/health")
def health_check() -> Dict[str, Any]:
    init_db()
    return {
        "status": "online",
        "service": "ClearTrace Labs Multi-Agent Truth Engine",
        "track": "Track 02: Omega AI Agents",
        "challenge": "Two Agents, One Truth",
        "metta_hyperon_runtime_active": reasoner.hyperon_active,
        "rules_file_loaded": bool(reasoner.space.rules),
        "total_active_metta_rules": len(reasoner.space.rules),
    }


@app.get("/api/presets")
def list_presets() -> Dict[str, Any]:
    return {"presets": list(PRESETS.values())}


@app.get("/api/cases")
def list_cases() -> Dict[str, Any]:
    init_db()
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM cases ORDER BY created_at DESC")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return {"cases": rows}


@app.post("/api/cases")
def create_case(req: CreateCaseRequest) -> Dict[str, Any]:
    init_db()
    if req.domain not in ("peace", "rights", "invoice"):
        raise HTTPException(status_code=400, detail="Invalid domain. Choose 'peace', 'rights', or 'invoice'.")

    case_id = f"CT-{uuid.uuid4().hex[:8].upper()}"
    now_iso = datetime.now(timezone.utc).isoformat()

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO cases (case_id, title, domain, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (case_id, req.title, req.domain, req.description, "CREATED", now_iso),
    )
    conn.commit()
    conn.close()

    append_audit_event(
        case_id=case_id,
        event_type="CASE_CREATED",
        actor="System_Intake",
        details={"title": req.title, "domain": req.domain, "description": req.description},
    )

    for src in req.sources:
        _add_source_internal(case_id, src)

    return get_case_details(case_id)


@app.post("/api/cases/from-preset/{preset_id}")
def create_case_from_preset(preset_id: str) -> Dict[str, Any]:
    init_db()
    preset = PRESETS.get(preset_id.lower())
    if not preset:
        raise HTTPException(status_code=404, detail=f"Preset '{preset_id}' not found.")

    sources_in = [
        SourceDocumentInput(
            label=s["label"],
            source_role=s["source_role"],
            raw_text=s["raw_text"],
            structured_claims=s["structured_claims"],
            metadata=s.get("metadata", {}),
        )
        for s in preset["sources"]
    ]

    req = CreateCaseRequest(
        title=preset["title"],
        domain=preset["domain"],
        description=preset["description"],
        sources=sources_in,
    )
    return create_case(req)


def _add_source_internal(case_id: str, src: SourceDocumentInput) -> str:
    source_id = f"SRC-{uuid.uuid4().hex[:8].upper()}"
    now_iso = datetime.now(timezone.utc).isoformat()
    content_hash = hashlib.sha256(src.raw_text.encode("utf-8")).hexdigest()

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO sources
        (source_id, case_id, label, source_role, raw_text, source_hash, structured_claims_json, metadata_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            source_id,
            case_id,
            src.label,
            src.source_role,
            src.raw_text,
            content_hash,
            json.dumps(src.structured_claims),
            json.dumps(src.metadata),
            now_iso,
        ),
    )
    conn.commit()
    conn.close()

    append_audit_event(
        case_id=case_id,
        event_type="SOURCE_INGESTED",
        actor="System_Intake",
        details={
            "source_id": source_id,
            "label": src.label,
            "role": src.source_role,
            "hash": content_hash,
            "claims_count": len(src.structured_claims),
        },
    )
    return source_id


@app.post("/api/cases/{case_id}/reconcile")
def reconcile_case(case_id: str, options: Optional[ReconcileRequest] = None) -> Dict[str, Any]:
    init_db()
    if options is None:
        options = ReconcileRequest(negotiation_round_limit=3, include_corroboration=False)

    case_row = _ensure_case_exists(case_id)
    domain = case_row["domain"]

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM sources WHERE case_id = ? ORDER BY created_at ASC", (case_id,))
    sources_raw = cur.fetchall()

    if len(sources_raw) < 2:
        conn.close()
        raise HTTPException(
            status_code=400,
            detail=f"Reconciliation requires at least 2 sources. Current count: {len(sources_raw)}",
        )

    source_a_row = next((r for r in sources_raw if r["source_role"] == "source_a"), sources_raw[0])
    source_b_row = next((r for r in sources_raw if r["source_role"] == "source_b"), sources_raw[1])
    corr_row = next((r for r in sources_raw if r["source_role"] in ("corroborator", "corroboration")), None)

    raw_claims_a = json.loads(source_a_row["structured_claims_json"])
    raw_claims_b = json.loads(source_b_row["structured_claims_json"])
    raw_claims_corr = json.loads(corr_row["structured_claims_json"]) if corr_row else []

    append_audit_event(
        case_id=case_id,
        event_type="RECONCILIATION_STARTED",
        actor="MultiAgentReconciliationEngine",
        details={
            "domain": domain,
            "round_limit": options.negotiation_round_limit,
            "include_corroboration": options.include_corroboration,
        },
    )

    # Phase 1: Genuinely Independent Agent Extractions
    extracted_a = agent_a.extract_and_audit(dict(source_a_row), raw_claims_a)
    extracted_b = agent_b.extract_and_audit(dict(source_b_row), raw_claims_b)
    extracted_corr = (
        agent_a.extract_and_audit(dict(corr_row), raw_claims_corr)
        if (corr_row and options.include_corroboration)
        else []
    )

    now_iso = datetime.now(timezone.utc).isoformat()
    cur.execute("DELETE FROM agent_runs WHERE case_id = ?", (case_id,))
    cur.execute(
        "INSERT INTO agent_runs (run_id, case_id, agent_id, source_id, extracted_claims_json, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (
            f"RUN-A-{uuid.uuid4().hex[:6].upper()}",
            case_id,
            agent_a.agent_id,
            source_a_row["source_id"],
            json.dumps([c.model_dump() for c in extracted_a]),
            now_iso,
        ),
    )
    cur.execute(
        "INSERT INTO agent_runs (run_id, case_id, agent_id, source_id, extracted_claims_json, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (
            f"RUN-B-{uuid.uuid4().hex[:6].upper()}",
            case_id,
            agent_b.agent_id,
            source_b_row["source_id"],
            json.dumps([c.model_dump() for c in extracted_b]),
            now_iso,
        ),
    )
    conn.commit()

    append_audit_event(
        case_id=case_id,
        event_type="AGENT_A_EXTRACTION_COMPLETE",
        actor=agent_a.agent_id,
        details={"claims_extracted": len(extracted_a), "source": source_a_row["label"]},
    )
    append_audit_event(
        case_id=case_id,
        event_type="AGENT_B_EXTRACTION_COMPLETE",
        actor=agent_b.agent_id,
        details={"claims_extracted": len(extracted_b), "source": source_b_row["label"]},
    )

    meta_a = json.loads(source_a_row["metadata_json"])
    truth_overrides = meta_a.get("source_truth_overrides", {})

    # Fetch active custom rules for this domain
    custom_rules_records = list_custom_rules(domain)
    custom_rule_texts = [r["rule_text"] for r in custom_rules_records]

    # Phase 2–5: Multi-Round Negotiation and MeTTa Symbolic Evaluation
    steps, findings, summary = reconciliation_engine.run_protocol(
        domain=domain,
        claims_a=extracted_a,
        claims_b=extracted_b,
        corroborating_claims=extracted_corr,
        source_truth_overrides=truth_overrides,
        round_limit=options.negotiation_round_limit,
        custom_rules=custom_rule_texts,
    )

    cur.execute("DELETE FROM negotiation_rounds WHERE case_id = ?", (case_id,))
    for st in steps:
        cur.execute(
            """
            INSERT INTO negotiation_rounds
            (case_id, round_number, stage, property_name, speaker_agent, message_type, position_before, position_after, evidence_cited, reasoning)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                case_id,
                st.round_number,
                st.stage,
                st.property_name,
                st.speaker_agent,
                st.message_type,
                st.position_before,
                st.position_after,
                st.evidence_cited,
                st.reasoning,
            ),
        )

    timeline_or_ledger = {
        "corroborated_facts": [
            {"property": f.property_name, "value": f.resolved_value, "status": f.status}
            for f in findings
            if f.status in ("AGREEMENT", "RULE_VERIFIED", "EVIDENCE_SUPPORTED")
        ],
        "preserved_disputes": [
            {
                "property": f.property_name,
                "source_a_claim": f.value_a,
                "source_b_claim": f.value_b,
                "status": f.status,
                "explanation": f.explanation,
            }
            for f in findings
            if f.status == "CONTRADICTION"
        ],
        "source_exclusive_notes": [
            {
                "property": f.property_name,
                "value": f.resolved_value,
                "status": f.status,
                "explanation": f.explanation,
            }
            for f in findings
            if f.status == "SOURCE_EXCLUSIVE"
        ],
    }

    findings_dump = [f.model_dump() for f in findings]
    steps_dump = [s.model_dump() for s in steps]
    sources_dump = [dict(r) for r in sources_raw]

    # Generate Cryptographic SHA-256 Decision Replay Certificate
    replay_cert = DecisionReplayService.generate_certificate(
        case_id=case_id,
        domain=domain,
        findings=findings_dump,
        negotiation_history=steps_dump,
        sources=sources_dump,
    )

    cur.execute("DELETE FROM reconciliation_reports WHERE case_id = ?", (case_id,))
    cur.execute(
        """
        INSERT INTO reconciliation_reports
        (case_id, domain, metta_runtime_active, summary_json, findings_json, timeline_or_ledger_json, replay_cert_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            case_id,
            domain,
            1 if reasoner.hyperon_active else 0,
            json.dumps(summary),
            json.dumps(findings_dump),
            json.dumps(timeline_or_ledger),
            json.dumps(replay_cert.model_dump()),
            now_iso,
        ),
    )

    cur.execute(
        "UPDATE cases SET status = ? WHERE case_id = ?",
        (summary["overall_status"], case_id),
    )
    conn.commit()
    conn.close()

    append_audit_event(
        case_id=case_id,
        event_type="METTA_RECONCILIATION_COMPLETE",
        actor="MeTTa_Symbolic_Engine",
        details={
            "summary": summary,
            "replay_hash": replay_cert.verification_hash,
            "merkle_root": replay_cert.merkle_root,
        },
    )

    return get_case_report(case_id)


@app.get("/api/cases/{case_id}")
def get_case_details(case_id: str) -> Dict[str, Any]:
    init_db()
    case_row = _ensure_case_exists(case_id)
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM sources WHERE case_id = ? ORDER BY created_at ASC", (case_id,))
    sources = []
    for r in cur.fetchall():
        d = dict(r)
        d["structured_claims"] = json.loads(d.pop("structured_claims_json"))
        d["metadata"] = json.loads(d.pop("metadata_json"))
        sources.append(d)
    conn.close()

    valid, errors = verify_audit_chain(case_id)

    return {
        "case": case_row,
        "sources": sources,
        "audit_chain_valid": valid,
        "audit_chain_errors": errors,
        "audit_trail": get_audit_trail(case_id),
    }


@app.get("/api/cases/{case_id}/report")
def get_case_report(case_id: str) -> Dict[str, Any]:
    init_db()
    case_row = _ensure_case_exists(case_id)
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT * FROM reconciliation_reports WHERE case_id = ?", (case_id,))
    rep_row = cur.fetchone()
    if not rep_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Reconciliation report not yet generated for this case.")

    cur.execute("SELECT * FROM agent_runs WHERE case_id = ?", (case_id,))
    agent_runs = []
    for r in cur.fetchall():
        d = dict(r)
        d["extracted_claims"] = json.loads(d.pop("extracted_claims_json"))
        agent_runs.append(d)

    cur.execute("SELECT * FROM negotiation_rounds WHERE case_id = ? ORDER BY id ASC", (case_id,))
    negotiation_rounds = [dict(r) for r in cur.fetchall()]

    cur.execute("SELECT * FROM review_decisions WHERE case_id = ? ORDER BY id DESC", (case_id,))
    decisions = [dict(r) for r in cur.fetchall()]
    conn.close()

    replay_cert = None
    if rep_row["replay_cert_json"]:
        try:
            replay_cert = json.loads(rep_row["replay_cert_json"])
        except Exception:
            pass

    valid, errors = verify_audit_chain(case_id)

    return {
        "case": case_row,
        "metta_runtime_active": bool(rep_row["metta_runtime_active"]),
        "summary": json.loads(rep_row["summary_json"]),
        "findings": json.loads(rep_row["findings_json"]),
        "synthesized_output": json.loads(rep_row["timeline_or_ledger_json"]),
        "agent_runs": agent_runs,
        "negotiation_rounds": negotiation_rounds,
        "review_decisions": decisions,
        "replay_certificate": replay_cert,
        "audit_chain_valid": valid,
        "audit_chain_errors": errors,
        "audit_trail": get_audit_trail(case_id),
    }


@app.post("/api/cases/{case_id}/review")
def submit_human_review(case_id: str, req: ReviewDecisionRequest) -> Dict[str, Any]:
    init_db()
    _ensure_case_exists(case_id)
    valid_actions = {"APPROVE", "REJECT", "REQUEST_EVIDENCE", "LEAVE_UNRESOLVED"}
    if req.action not in valid_actions:
        raise HTTPException(status_code=400, detail=f"Invalid review action. Must be one of {valid_actions}")

    now_iso = datetime.now(timezone.utc).isoformat()
    new_case_status = "HUMAN_RESOLVED" if req.action == "APPROVE" else f"REVIEW_{req.action}"

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO review_decisions (case_id, reviewer_name, action, reason, created_at) VALUES (?, ?, ?, ?, ?)",
        (case_id, req.reviewer_name, req.action, req.reason, now_iso),
    )
    cur.execute("UPDATE cases SET status = ? WHERE case_id = ?", (new_case_status, case_id))
    conn.commit()
    conn.close()

    append_audit_event(
        case_id=case_id,
        event_type=f"HUMAN_REVIEW_{req.action}",
        actor=req.reviewer_name,
        details={"action": req.action, "reason": req.reason},
    )

    return get_case_report(case_id)


@app.get("/api/cases/{case_id}/replay-cert")
def get_replay_certificate(case_id: str) -> Dict[str, Any]:
    report = get_case_report(case_id)
    cert = report.get("replay_certificate")
    if not cert:
        raise HTTPException(status_code=404, detail="Replay Certificate not generated yet.")
    return {"case_id": case_id, "replay_certificate": cert}


@app.post("/api/cases/{case_id}/verify-replay")
def verify_replay(case_id: str) -> Dict[str, Any]:
    cert_data = get_replay_certificate(case_id)["replay_certificate"]
    is_valid, msg = DecisionReplayService.verify_certificate(cert_data)
    return {
        "case_id": case_id,
        "is_valid": is_valid,
        "message": msg,
        "verification_hash": cert_data.get("verification_hash"),
        "merkle_root": cert_data.get("merkle_root"),
    }


@app.post("/api/rules/custom")
def add_custom_rule(rule_in: CustomRuleInput) -> Dict[str, Any]:
    init_db()
    rule_id = save_custom_rule(
        rule_name=rule_in.rule_name,
        domain=rule_in.domain,
        rule_text=rule_in.rule_text,
        created_by=rule_in.created_by,
    )
    # Also compile into active MeTTa space
    reasoner.space.add_rule_string(rule_in.rule_text)
    return {
        "status": "RULE_REGISTERED",
        "rule_id": rule_id,
        "rule_name": rule_in.rule_name,
        "domain": rule_in.domain,
        "rule_text": rule_in.rule_text,
    }


@app.get("/api/rules/custom")
def get_custom_rules(domain: Optional[str] = None) -> Dict[str, Any]:
    init_db()
    rules = list_custom_rules(domain)
    return {"custom_rules": rules}


@app.get("/api/cases/{case_id}/audit")
def get_case_audit(case_id: str) -> Dict[str, Any]:
    init_db()
    _ensure_case_exists(case_id)
    valid, errors = verify_audit_chain(case_id)
    return {
        "case_id": case_id,
        "chain_integrity_verified": valid,
        "chain_errors": errors,
        "events": get_audit_trail(case_id),
    }


@app.get("/api/cases/{case_id}/export")
def export_case_bundle(case_id: str) -> Dict[str, Any]:
    report = get_case_report(case_id)
    details = get_case_details(case_id)
    custom_rules = list_custom_rules(details["case"]["domain"])
    return {
        "export_version": "1.0.0",
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "platform": "ClearTrace Labs (Omega AI Agents / MeTTa)",
        "track": "Track 02: Omega AI Agents (Two Agents, One Truth)",
        "case": details["case"],
        "sources": details["sources"],
        "reconciliation_report": report,
        "custom_rules": custom_rules,
        "audit_chain": details["audit_trail"],
    }


def _ensure_case_exists(case_id: str) -> Dict[str, Any]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM cases WHERE case_id = ?", (case_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found.")
    return dict(row)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)

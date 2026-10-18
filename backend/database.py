"""
ClearTrace Labs — SQLite Persistence & SHA-256 Tamper-Evident Audit Chain.
Implements complete case tracking, isolated agent runs, multi-round negotiation logs,
symbolic findings, reviewer decisions, custom MeTTa rules, and cryptographic audit hashing.
"""

import hashlib
import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

DB_PATH = Path(__file__).resolve().parent.parent / "cleartrace.db"


def get_connection(db_path: Optional[Path] = None) -> sqlite3.Connection:
    target = db_path or DB_PATH
    conn = sqlite3.connect(str(target), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db(db_path: Optional[Path] = None) -> None:
    conn = get_connection(db_path)
    cur = conn.cursor()

    cur.executescript(
        """
        CREATE TABLE IF NOT EXISTS cases (
            case_id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            domain TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS sources (
            source_id TEXT PRIMARY KEY,
            case_id TEXT NOT NULL,
            label TEXT NOT NULL,
            source_role TEXT NOT NULL,
            raw_text TEXT NOT NULL,
            source_hash TEXT NOT NULL,
            structured_claims_json TEXT NOT NULL,
            metadata_json TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS agent_runs (
            run_id TEXT PRIMARY KEY,
            case_id TEXT NOT NULL,
            agent_id TEXT NOT NULL,
            source_id TEXT NOT NULL,
            extracted_claims_json TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS negotiation_rounds (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            case_id TEXT NOT NULL,
            round_number INTEGER NOT NULL,
            stage TEXT NOT NULL,
            property_name TEXT NOT NULL,
            speaker_agent TEXT NOT NULL,
            message_type TEXT NOT NULL,
            position_before TEXT NOT NULL,
            position_after TEXT NOT NULL,
            evidence_cited TEXT NOT NULL,
            reasoning TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS reconciliation_reports (
            case_id TEXT PRIMARY KEY,
            domain TEXT NOT NULL,
            metta_runtime_active INTEGER NOT NULL,
            summary_json TEXT NOT NULL,
            findings_json TEXT NOT NULL,
            timeline_or_ledger_json TEXT NOT NULL,
            replay_cert_json TEXT,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS review_decisions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            case_id TEXT NOT NULL,
            reviewer_name TEXT NOT NULL,
            action TEXT NOT NULL,
            reason TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS custom_rules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            rule_name TEXT NOT NULL,
            domain TEXT NOT NULL,
            rule_text TEXT NOT NULL,
            created_by TEXT NOT NULL,
            is_active INTEGER DEFAULT 1,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS audit_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            case_id TEXT NOT NULL,
            event_index INTEGER NOT NULL,
            timestamp TEXT NOT NULL,
            event_type TEXT NOT NULL,
            actor TEXT NOT NULL,
            details TEXT NOT NULL,
            prev_hash TEXT NOT NULL,
            curr_hash TEXT NOT NULL
        );
        """
    )
    conn.commit()
    conn.close()


def append_audit_event(
    case_id: str,
    event_type: str,
    actor: str,
    details: Any,
    db_path: Optional[Path] = None,
) -> str:
    """Appends an event to the SHA-256 tamper-evident hash chain."""
    conn = get_connection(db_path)
    cur = conn.cursor()

    cur.execute(
        "SELECT event_index, curr_hash FROM audit_events WHERE case_id = ? ORDER BY event_index DESC LIMIT 1",
        (case_id,),
    )
    row = cur.fetchone()

    if row is None:
        event_index = 0
        prev_hash = "GENESIS_HASH_CLEARTRACE_LABS_00000000000000000000000000000000000000000000"
    else:
        event_index = row["event_index"] + 1
        prev_hash = row["curr_hash"]

    timestamp = datetime.now(timezone.utc).isoformat()
    if isinstance(details, (dict, list)):
        canonical_details = json.dumps(details, sort_keys=True, separators=(",", ":"))
    else:
        canonical_details = json.dumps({"message": str(details)}, sort_keys=True, separators=(",", ":"))

    payload = f"{event_index}|{case_id}|{timestamp}|{event_type}|{actor}|{canonical_details}|{prev_hash}"
    curr_hash = hashlib.sha256(payload.encode("utf-8")).hexdigest()

    cur.execute(
        """
        INSERT INTO audit_events
        (case_id, event_index, timestamp, event_type, actor, details, prev_hash, curr_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (case_id, event_index, timestamp, event_type, actor, canonical_details, prev_hash, curr_hash),
    )
    conn.commit()
    conn.close()
    return curr_hash


def verify_audit_chain(case_id: str, db_path: Optional[Path] = None) -> Tuple[bool, List[str]]:
    """Verifies the SHA-256 cryptographic hash chain for a case."""
    conn = get_connection(db_path)
    cur = conn.cursor()
    cur.execute("SELECT * FROM audit_events WHERE case_id = ? ORDER BY event_index ASC", (case_id,))
    rows = cur.fetchall()
    conn.close()

    if not rows:
        return True, ["No audit events recorded for this case."]

    errors: List[str] = []
    expected_prev = "GENESIS_HASH_CLEARTRACE_LABS_00000000000000000000000000000000000000000000"

    for r in rows:
        idx = r["event_index"]
        if r["prev_hash"] != expected_prev:
            errors.append(f"Broken link at event {idx}: prev_hash does not match previous block's curr_hash.")

        payload = f"{idx}|{r['case_id']}|{r['timestamp']}|{r['event_type']}|{r['actor']}|{r['details']}|{r['prev_hash']}"
        computed_curr = hashlib.sha256(payload.encode("utf-8")).hexdigest()

        if computed_curr != r["curr_hash"]:
            errors.append(f"Tampered block at event {idx}: computed hash {computed_curr[:12]} != stored {r['curr_hash'][:12]}")

        expected_prev = r["curr_hash"]

    return len(errors) == 0, errors


def get_audit_trail(case_id: str, db_path: Optional[Path] = None) -> List[Dict[str, Any]]:
    conn = get_connection(db_path)
    cur = conn.cursor()
    cur.execute("SELECT * FROM audit_events WHERE case_id = ? ORDER BY event_index ASC", (case_id,))
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    for r in rows:
        try:
            r["details"] = json.loads(r["details"])
        except Exception:
            pass
    return rows


def save_custom_rule(
    rule_name: str,
    domain: str,
    rule_text: str,
    created_by: str,
    db_path: Optional[Path] = None,
) -> int:
    conn = get_connection(db_path)
    cur = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()
    cur.execute(
        """
        INSERT INTO custom_rules (rule_name, domain, rule_text, created_by, is_active, created_at)
        VALUES (?, ?, ?, ?, 1, ?)
        """,
        (rule_name, domain, rule_text, created_by, now_iso),
    )
    rule_id = cur.lastrowid
    conn.commit()
    conn.close()
    return rule_id or 0


def list_custom_rules(domain: Optional[str] = None, db_path: Optional[Path] = None) -> List[Dict[str, Any]]:
    conn = get_connection(db_path)
    cur = conn.cursor()
    if domain:
        cur.execute("SELECT * FROM custom_rules WHERE domain = ? AND is_active = 1 ORDER BY id DESC", (domain,))
    else:
        cur.execute("SELECT * FROM custom_rules WHERE is_active = 1 ORDER BY id DESC")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows

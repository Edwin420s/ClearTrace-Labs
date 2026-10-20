"""
ClearTrace Labs — SQLite Persistence & SHA-256 Tamper-Evident Audit Chain.
Implements complete case tracking, isolated agent runs, multi-round negotiation logs,
symbolic findings, reviewer decisions, custom MeTTa rules, and cryptographic audit hashing.
"""

import hashlib
import json
import secrets
import sqlite3
from datetime import datetime, timedelta, timezone
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

        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            full_name TEXT NOT NULL,
            organization TEXT DEFAULT 'Independent',
            role TEXT DEFAULT 'auditor',
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS user_sessions (
            token TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(user_id)
        );
        """
    )
    conn.commit()

    # Column migrations for existing tables
    cur.execute("PRAGMA table_info(cases)")
    case_cols = [r["name"] for r in cur.fetchall()]
    if "user_id" not in case_cols:
        cur.execute("ALTER TABLE cases ADD COLUMN user_id TEXT DEFAULT 'usr-demo'")

    cur.execute("PRAGMA table_info(custom_rules)")
    rule_cols = [r["name"] for r in cur.fetchall()]
    if "user_id" not in rule_cols:
        cur.execute("ALTER TABLE custom_rules ADD COLUMN user_id TEXT DEFAULT 'usr-demo'")

    conn.commit()
    conn.close()

    ensure_demo_user(db_path)


def hash_password(password: str, salt: Optional[str] = None) -> Tuple[str, str]:
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000).hex()
    return hashed, salt


def verify_password(password: str, salt: str, password_hash: str) -> bool:
    hashed, _ = hash_password(password, salt)
    return secrets.compare_digest(hashed, password_hash)


def create_user(
    email: str,
    password: str,
    full_name: str,
    organization: Optional[str] = "Independent",
    role: str = "auditor",
    user_id: Optional[str] = None,
    db_path: Optional[Path] = None,
) -> Dict[str, Any]:
    conn = get_connection(db_path)
    cur = conn.cursor()
    clean_email = email.strip().lower()

    cur.execute("SELECT user_id FROM users WHERE email = ?", (clean_email,))
    if cur.fetchone():
        conn.close()
        raise ValueError(f"An account with email '{clean_email}' already exists.")

    uid = user_id or f"usr-{secrets.token_hex(6)}"
    p_hash, salt = hash_password(password)
    now_iso = datetime.now(timezone.utc).isoformat()

    cur.execute(
        """
        INSERT INTO users (user_id, email, password_hash, salt, full_name, organization, role, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (uid, clean_email, p_hash, salt, full_name.strip(), (organization or "Independent").strip(), role, now_iso),
    )
    conn.commit()
    conn.close()

    return {
        "user_id": uid,
        "email": clean_email,
        "full_name": full_name.strip(),
        "organization": (organization or "Independent").strip(),
        "role": role,
        "created_at": now_iso,
    }


def authenticate_user(email: str, password: str, db_path: Optional[Path] = None) -> Optional[Dict[str, Any]]:
    conn = get_connection(db_path)
    cur = conn.cursor()
    clean_email = email.strip().lower()

    cur.execute("SELECT * FROM users WHERE email = ?", (clean_email,))
    row = cur.fetchone()
    conn.close()

    if not row:
        return None

    if not verify_password(password, row["salt"], row["password_hash"]):
        return None

    return {
        "user_id": row["user_id"],
        "email": row["email"],
        "full_name": row["full_name"],
        "organization": row["organization"],
        "role": row["role"],
        "created_at": row["created_at"],
    }


def get_user_by_id(user_id: str, db_path: Optional[Path] = None) -> Optional[Dict[str, Any]]:
    conn = get_connection(db_path)
    cur = conn.cursor()
    cur.execute("SELECT user_id, email, full_name, organization, role, created_at FROM users WHERE user_id = ?", (user_id,))
    row = cur.fetchone()
    conn.close()
    return dict(row) if row else None


def get_user_by_email(email: str, db_path: Optional[Path] = None) -> Optional[Dict[str, Any]]:
    conn = get_connection(db_path)
    cur = conn.cursor()
    cur.execute("SELECT user_id, email, full_name, organization, role, created_at FROM users WHERE email = ?", (email.strip().lower(),))
    row = cur.fetchone()
    conn.close()
    return dict(row) if row else None


def create_session(user_id: str, db_path: Optional[Path] = None) -> str:
    conn = get_connection(db_path)
    cur = conn.cursor()
    token = f"ct_{secrets.token_hex(24)}"
    now = datetime.now(timezone.utc)
    expires = now + timedelta(days=30)

    cur.execute(
        "INSERT INTO user_sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
        (token, user_id, now.isoformat(), expires.isoformat()),
    )
    conn.commit()
    conn.close()
    return token


def get_user_by_token(token: str, db_path: Optional[Path] = None) -> Optional[Dict[str, Any]]:
    conn = get_connection(db_path)
    cur = conn.cursor()
    cur.execute(
        """
        SELECT u.user_id, u.email, u.full_name, u.organization, u.role, u.created_at, s.expires_at
        FROM user_sessions s
        JOIN users u ON s.user_id = u.user_id
        WHERE s.token = ?
        """,
        (token,),
    )
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    try:
        exp = datetime.fromisoformat(row["expires_at"])
        if datetime.now(timezone.utc) > exp:
            delete_session(token, db_path)
            return None
    except Exception:
        pass

    return {
        "user_id": row["user_id"],
        "email": row["email"],
        "full_name": row["full_name"],
        "organization": row["organization"],
        "role": row["role"],
        "created_at": row["created_at"],
    }


def delete_session(token: str, db_path: Optional[Path] = None) -> None:
    conn = get_connection(db_path)
    cur = conn.cursor()
    cur.execute("DELETE FROM user_sessions WHERE token = ?", (token,))
    conn.commit()
    conn.close()


def ensure_demo_user(db_path: Optional[Path] = None) -> Dict[str, Any]:
    conn = get_connection(db_path)
    cur = conn.cursor()
    cur.execute("SELECT user_id, email, full_name, organization, role, created_at FROM users WHERE user_id = 'usr-demo'")
    row = cur.fetchone()
    if row:
        conn.close()
        return dict(row)

    now_iso = datetime.now(timezone.utc).isoformat()
    p_hash, salt = hash_password("demo123456")
    cur.execute(
        """
        INSERT OR IGNORE INTO users (user_id, email, password_hash, salt, full_name, organization, role, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            "usr-demo",
            "demo@cleartrace.io",
            p_hash,
            salt,
            "Demo Auditor",
            "ClearTrace Labs Benchmark",
            "evaluator",
            now_iso,
        ),
    )
    conn.commit()
    conn.close()
    return {
        "user_id": "usr-demo",
        "email": "demo@cleartrace.io",
        "full_name": "Demo Auditor",
        "organization": "ClearTrace Labs Benchmark",
        "role": "evaluator",
        "created_at": now_iso,
    }


def delete_case(case_id: str, user_id: Optional[str] = None, db_path: Optional[Path] = None) -> bool:
    """Deletes a case and all associated child records. If user_id is provided, verifies ownership."""
    conn = get_connection(db_path)
    cur = conn.cursor()
    if user_id:
        cur.execute("SELECT case_id FROM cases WHERE case_id = ? AND user_id = ?", (case_id, user_id))
    else:
        cur.execute("SELECT case_id FROM cases WHERE case_id = ?", (case_id,))
    if not cur.fetchone():
        conn.close()
        return False

    tables = [
        "sources",
        "agent_runs",
        "negotiation_rounds",
        "reconciliation_reports",
        "review_decisions",
        "audit_events",
        "cases",
    ]
    for tbl in tables:
        cur.execute(f"DELETE FROM {tbl} WHERE case_id = ?", (case_id,))
    conn.commit()
    conn.close()
    return True


def clear_user_cases(user_id: str, db_path: Optional[Path] = None) -> int:
    """Deletes all cases and child records belonging to a user. Returns count of deleted cases."""
    conn = get_connection(db_path)
    cur = conn.cursor()
    cur.execute("SELECT case_id FROM cases WHERE user_id = ?", (user_id,))
    case_ids = [r["case_id"] for r in cur.fetchall()]
    if not case_ids:
        conn.close()
        return 0

    placeholders = ",".join("?" for _ in case_ids)
    tables = [
        "sources",
        "agent_runs",
        "negotiation_rounds",
        "reconciliation_reports",
        "review_decisions",
        "audit_events",
        "cases",
    ]
    for tbl in tables:
        cur.execute(f"DELETE FROM {tbl} WHERE case_id IN ({placeholders})", case_ids)
    conn.commit()
    conn.close()
    return len(case_ids)


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

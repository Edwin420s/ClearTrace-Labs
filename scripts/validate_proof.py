#!/usr/bin/env python3
"""
ClearTrace Labs — Replay Proof & Certificate Validator CLI.
Forwarding wrapper to scripts/verify_replay_cert.py.
"""
import sys
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from scripts.verify_replay_cert import verify_certificate, canonical_json_bytes
from backend.database import get_connection, init_db
import json

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] in ("-h", "--help"):
        print("ClearTrace Labs — Replay Proof & Certificate Validator CLI")
        print("\nUsage:")
        print("    python3 scripts/validate_proof.py [certificate.json]")
        print("    python3 scripts/validate_proof.py --case-id={CASE_ID}")
        print("    python3 scripts/validate_proof.py                  (runs self-verification test)")
        sys.exit(0)

    cert_obj = None
    if len(sys.argv) > 1:
        arg = sys.argv[1]
        case_id = None
        if arg.startswith("--case-id="):
            case_id = arg.split("=", 1)[1].strip()
        elif arg == "--case-id" and len(sys.argv) > 2:
            case_id = sys.argv[2].strip()
        elif arg.startswith("CT-"):
            case_id = arg.strip()

        if case_id:
            init_db()
            conn = get_connection()
            cur = conn.cursor()
            cur.execute("SELECT replay_cert_json FROM reconciliation_reports WHERE case_id = ?", (case_id,))
            row = cur.fetchone()
            conn.close()
            if not row or not row["replay_cert_json"]:
                print(f"Error: No replay certificate found in database for case '{case_id}'.")
                sys.exit(1)
            cert_obj = json.loads(row["replay_cert_json"])
        else:
            cert_path = Path(arg)
            if not cert_path.exists():
                print(f"Error: File or case '{cert_path}' not found.")
                sys.exit(1)
            data = json.loads(cert_path.read_text(encoding="utf-8"))
            cert_obj = data.get("replay_certificate", data)
    else:
        # Default built-in test
        import hashlib
        payload = {
            "case_id": "CT-DEMO-PROOF",
            "domain": "rights",
            "decision_digest": "3c89b708b981fcae1358b548b89e7e7a5bc83921867c4ecb40b79dc9d39b8e21",
            "merkle_root": "7a94efbc086d141e6c38b2923984be1a7e436814b301dc9d64a273b06ec98e3b",
            "timestamp": "2026-10-19T00:00:00+00:00",
            "ruleset_signature": "MeTTa-Hyperon-S-Expression-V1.0-SHA256",
            "status": "CRYPTOGRAPHICALLY_VERIFIED",
        }
        verification_hash = hashlib.sha256(canonical_json_bytes(payload)).hexdigest()
        cert_obj = {**payload, "verification_hash": verification_hash}

    success = verify_certificate(cert_obj)
    sys.exit(0 if success else 1)

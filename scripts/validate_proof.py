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
        print("    python3 scripts/validate_proof.py --case-id=latest")
        print("    python3 scripts/validate_proof.py --case-id=peace|rights|invoice")
        print("    python3 scripts/validate_proof.py                  (verifies latest case or built-in test)")
        sys.exit(0)

    cert_obj = None
    if len(sys.argv) > 1:
        arg = sys.argv[1]
        case_id = None
        if arg.startswith("--case-id="):
            case_id = arg.split("=", 1)[1].strip()
        elif arg == "--case-id" and len(sys.argv) > 2:
            case_id = sys.argv[2].strip()
        elif arg in ("--latest", "-l"):
            case_id = "latest"
        elif arg.startswith("CT-") or arg.lower() in ("latest", "peace", "rights", "invoice"):
            case_id = arg.strip()

        if case_id:
            init_db()
            conn = get_connection()
            cur = conn.cursor()
            
            row = None
            if case_id.lower() == "latest":
                cur.execute("SELECT case_id, replay_cert_json FROM reconciliation_reports ORDER BY created_at DESC LIMIT 1")
                row = cur.fetchone()
            elif case_id.lower() in ("peace", "rights", "invoice"):
                cur.execute("SELECT case_id, replay_cert_json FROM reconciliation_reports WHERE domain = ? ORDER BY created_at DESC LIMIT 1", (case_id.lower(),))
                row = cur.fetchone()
            else:
                cur.execute("SELECT case_id, replay_cert_json FROM reconciliation_reports WHERE case_id = ?", (case_id,))
                row = cur.fetchone()

            if not row or not row["replay_cert_json"]:
                # Check if any cases exist in database
                cur.execute("SELECT case_id, domain FROM reconciliation_reports ORDER BY created_at DESC LIMIT 5")
                available = cur.fetchall()
                conn.close()
                print(f"Error: No replay certificate found in database for case '{case_id}'.")
                if available:
                    print("\nAvailable reconciled cases in database:")
                    for a in available:
                        print(f"  • {a['case_id']} ({a['domain']})")
                    print("\nTip: Run with --case-id=latest or one of the case IDs above.")
                else:
                    print("\nTip: Seed synthetic cases first with: python3 scripts/seed_presets.py")
                sys.exit(1)
            
            conn.close()
            cert_obj = json.loads(row["replay_cert_json"])
        else:
            cert_path = Path(arg)
            if not cert_path.exists():
                print(f"Error: File or case '{cert_path}' not found.")
                sys.exit(1)
            data = json.loads(cert_path.read_text(encoding="utf-8"))
            cert_obj = data.get("replay_certificate", data)
    else:
        # Check if database has a reconciled case first
        init_db()
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT replay_cert_json FROM reconciliation_reports ORDER BY created_at DESC LIMIT 1")
        row = cur.fetchone()
        conn.close()
        
        if row and row["replay_cert_json"]:
            cert_obj = json.loads(row["replay_cert_json"])
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


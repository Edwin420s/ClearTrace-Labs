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
import json

if __name__ == "__main__":
    if len(sys.argv) > 1:
        cert_path = Path(sys.argv[1])
        if not cert_path.exists():
            print(f"Error: File '{cert_path}' not found.")
            sys.exit(1)
        data = json.loads(cert_path.read_text(encoding="utf-8"))
        cert_obj = data.get("replay_certificate", data)
    else:
        # Default built-in test
        from scripts.verify_replay_cert import verify_certificate
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

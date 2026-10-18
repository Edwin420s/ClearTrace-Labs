#!/usr/bin/env python3
"""
ClearTrace Labs — Audit Bundle Exporter for Hackathon Reviewers.
Exports a complete self-contained JSON audit bundle with cryptographic verification proofs.
Run:
    python3 scripts/export_audit_bundle.py <case_id> [output_file.json]
"""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from backend.main import export_case_bundle


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/export_audit_bundle.py <case_id> [output_file.json]")
        sys.exit(1)

    case_id = sys.argv[1]
    out_path = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(f"audit_bundle_{case_id}.json")

    print(f"Exporting complete audit bundle for case {case_id}...")
    bundle = export_case_bundle(case_id)
    out_path.write_text(json.dumps(bundle, indent=2), encoding="utf-8")
    print(f"[SUCCESS] Audit bundle written to {out_path.resolve()} ({out_path.stat().st_size} bytes)")


if __name__ == "__main__":
    main()

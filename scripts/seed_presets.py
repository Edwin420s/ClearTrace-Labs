#!/usr/bin/env python3
"""
ClearTrace Labs — Seed Synthetic Demonstration Presets.
Initializes the database and pre-reconciles all three partner domains:
1. peace   -> AI for Peace (Harlem & Nairobi oral history reconciliation)
2. rights  -> Incantio Creative Rights & Royalty audit
3. invoice -> Operational PO vs Invoice dispute

Run:
    python3 scripts/seed_presets.py
"""

import sys
from pathlib import Path

# Add project root to sys.path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from backend.database import init_db
from backend.main import create_case_from_preset, reconcile_case
from backend.schemas import ReconcileRequest


def main():
    print("Initializing ClearTrace Labs SQLite database...")
    init_db()

    presets = ["peace", "rights", "invoice"]
    for pid in presets:
        print(f"\n--- Seeding Preset: {pid} ---")
        created = create_case_from_preset(pid)
        case_id = created["case"]["case_id"]
        print(f"Created case {case_id}: '{created['case']['title']}'")

        # Reconcile without corroboration first to demonstrate preserved contradictions
        report = reconcile_case(case_id, ReconcileRequest(negotiation_round_limit=3, include_corroboration=False))
        findings_count = len(report["findings"])
        print(f"Reconciled {case_id} across {findings_count} properties. Status: {report['case']['status']}")
        print(f"Replay Hash: {report['replay_certificate']['verification_hash'][:16]}...")

    print("\n[SUCCESS] All synthetic demo cases successfully seeded and reconciled.")


if __name__ == "__main__":
    main()

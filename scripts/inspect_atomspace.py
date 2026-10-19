#!/usr/bin/env python3
"""
ClearTrace Labs — CLI MeTTa Atomspace Inspector.
Inspects active rewrite rules, types, and status constructors from the command line.

Usage:
    python3 scripts/inspect_atomspace.py
"""
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend.metta_runner import SymbolicReasoner

def main():
    reasoner = SymbolicReasoner()
    data = reasoner.get_atomspace_inspection()

    print("=" * 68)
    print(" ClearTrace Labs — MeTTa Atomspace Dynamic Inspection")
    print("=" * 68)
    print(f"Hyperon Native Engine Active: {data.get('hyperon_active')}")
    print(f"Total Rules Loaded:           {data.get('total_rules')}")
    print(f"Total Facts Loaded:           {data.get('total_facts')}")
    print(f"Known Types:                  {', '.join(data.get('known_types', []))}")
    print(f"Status Symbols:               {', '.join(data.get('status_symbols', []))}")
    print("-" * 68)
    print("Loaded MeTTa S-Expression Rewrite Rules:")
    print("-" * 68)
    for i, r in enumerate(data.get("rules", []), start=1):
        print(f"  {i:2d}. (= {r['pattern']} {r['reduction']})")
    print("=" * 68)

if __name__ == "__main__":
    main()

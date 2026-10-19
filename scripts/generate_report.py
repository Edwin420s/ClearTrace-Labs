#!/usr/bin/env python3
"""
ClearTrace Labs — CLI Executive Markdown Audit Report Generator.
Generates an executive-ready Markdown audit report for any case in the database.

Usage:
    python3 scripts/generate_report.py [case_id] [optional_output_file.md]
"""
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend.database import get_connection, init_db
from backend.main import get_case_markdown_report

def main():
    init_db()
    if len(sys.argv) > 1:
        case_id = sys.argv[1]
    else:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT case_id FROM cases ORDER BY created_at DESC LIMIT 1")
        row = cur.fetchone()
        conn.close()
        if not row:
            print("Error: No cases found in database. Run 'python3 scripts/seed_presets.py' first.")
            sys.exit(1)
        case_id = row["case_id"]

    try:
        report_md = get_case_markdown_report(case_id)
    except Exception as e:
        print(f"Error generating report for case '{case_id}': {e}")
        sys.exit(1)

    if len(sys.argv) > 2:
        out_path = Path(sys.argv[2])
        out_path.write_text(report_md, encoding="utf-8")
        print(f"[SUCCESS] Audit report written to: {out_path.resolve()}")
    else:
        print(report_md)

if __name__ == "__main__":
    main()

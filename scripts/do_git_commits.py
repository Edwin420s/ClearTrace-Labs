#!/usr/bin/env python3
"""
ClearTrace Labs — Granular Git Commit & Push Automator.
Creates structured, atomic, high-quality commits for all enterprise features,
security hardening, MeTTa symbolic reasoning, and frontend components,
then pushes to GitHub.
"""

import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
os.chdir(ROOT)


def run_cmd(cmd):
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error executing: {cmd}")
        print(f"Stderr: {res.stderr}")
        print(f"Stdout: {res.stdout}")
        sys.exit(1)
    return res.stdout.strip()


def git_commit(files, msg):
    for f in files:
        run_cmd(f"git add {f}")
    status = run_cmd("git status --porcelain")
    # Check if any staged changes
    staged = subprocess.run("git diff --cached --quiet", shell=True).returncode != 0
    if staged:
        # Use simple quotes or pass via stdin to avoid shell escaping issues
        res = subprocess.run(["git", "commit", "-m", msg], capture_output=True, text=True)
        if res.returncode != 0:
            print(f"Commit error: {res.stderr}")
            sys.exit(1)
        print(f"  [COMMIT] {msg}")


def main():
    print("=================================================================")
    print(" Executing Granular Semantic Commits for ClearTrace Labs")
    print("=================================================================")

    run_cmd('git config --local user.name "Edwin Mwenda Mwiti"')
    run_cmd('git config --local user.email "eduedwyn5@gmail.com"')

    commits = [
        # --- 1. MeTTa & Symbolic Core ---
        (["metta/ontology/types.metta"], "feat(metta): update ontology type definitions with financial invariant structures"),
        (["metta/rules/core_reconciliation.metta"], "feat(metta): extend core reconciliation declarative rewrite rules"),
        (["engine/cleartrace_rules.metta"], "feat(metta): implement deterministic rule engine patterns in cleartrace_rules.metta"),

        # --- 2. Backend Schemas & Data Layer ---
        (["backend/schemas.py"], "feat(backend): add financial impact fields and metta reduction trace to schemas"),
        (["backend/database.py"], "feat(backend): implement PBKDF2 password hashing and multi-tenant database isolation"),
        (["backend/agents.py"], "feat(agents): implement air-gapped intake with isolated prompt pods for Agent A and B"),
        (["backend/metta_runner.py"], "feat(metta): implement MettaRunner with recursion depth protection and timeout safeguards"),
        (["backend/negotiation.py"], "feat(negotiation): implement 5-stage Omega cognitive loop deliberation protocol"),
        (["backend/pdf_generator.py"], "feat(pdf): implement enterprise PDF forensic audit report generator"),
        (["backend/presets.py"], "feat(presets): update multi-domain forensic presets for B2B, Music IP, and Peace Scenarios"),

        # --- 3. Backend Endpoints & Security ---
        (["backend/main.py"], "security(backend): add CSP, HSTS, X-Frame-Options, IDOR checks and DoS limits"),

        # --- 4. Automated Verification & Security Test Suite ---
        (["tests/test_auth_isolation.py"], "test(auth): add comprehensive multi-tenant isolation and IDOR test suite"),
        (["tests/test_security_resilience.py"], "test(security): add DoS resilience, ZIP bomb, and cyclic recursion tests"),
        (["tests/test_cleartrace.py"], "test(engine): update 33-step master test suite covering all domains and replay certification"),

        # --- 5. Frontend Config & Data ---
        (["frontend/vite.config.js"], "security(frontend): sanitize vite.config.js and configure clean reverse proxy"),
        (["frontend/index.html"], "style(frontend): update index.html with fonts, metadata, and security tags"),
        (["frontend/src/data/scenarios.js"], "feat(frontend): update sample scenario datasets with verified ground truth records"),

        # --- 6. Frontend Security & Auth Components ---
        (["frontend/src/components/AuthModal.jsx"], "feat(frontend): create AuthModal for email/password and demo mode authentication"),
        (["frontend/src/components/AuditHistory.jsx"], "feat(frontend): create AuditHistory drawer for isolated tenant audit records"),
        (["frontend/src/components/LandingPage.jsx"], "feat(frontend): create LandingPage with public showcase and isolated sandbox"),
        (["frontend/src/components/Header.jsx"], "feat(frontend): create Header with tenant isolation indicator and user controls"),

        # --- 7. Frontend Reconciliation Components ---
        (["frontend/src/components/HeroBanner.jsx"], "feat(frontend): create HeroBanner with dual-mode audit and quick reconcile"),
        (["frontend/src/components/DocumentInputs.jsx"], "feat(frontend): implement Air-Gapped Multi-Agent Intake Architecture in DocumentInputs"),
        (["frontend/src/components/FindingsSummary.jsx"], "feat(frontend): implement 5-Stage Omega Cognitive Loop Protocol Stepper in FindingsSummary"),
        (["frontend/src/components/NextSteps.jsx"], "feat(frontend): implement Action 3 NextSteps with structured evidence resolution loop"),
        (["frontend/src/components/SignOffModal.jsx"], "feat(frontend): enforce mandatory reviewer selection and rationale in SignOffModal"),
        (["frontend/src/components/ReportModal.jsx"], "feat(frontend): implement ReportModal with tamper-evident certificate display"),
        (["frontend/src/components/AdvancedAudit.jsx"], "feat(frontend): integrate Hierarchical Merkle Visualizer and MeTTa Inspector in AdvancedAudit"),
        (["frontend/src/App.jsx"], "feat(frontend): wire full authentication, tenant scoping, and state handling in App.jsx"),

        # --- 8. Scripts & Verification Tools ---
        (["scripts/export_audit_bundle.py"], "feat(scripts): update export_audit_bundle.py for forensic bundle generation"),
        (["scripts/verify_replay_cert.py"], "feat(scripts): enhance verify_replay_cert.py with SHA-256 Merkle root verification"),
        (["scripts/run_all_verifications.sh"], "ci(scripts): update run_all_verifications.sh with full test suite orchestration"),

        # --- 9. Forensic Documentation & Specifications ---
        (["docs/PLATFORM_SPECIFICATION.md"], "docs(platform): create PLATFORM_SPECIFICATION.md for enterprise deployment"),
        (["docs/CRYPTOGRAPHIC_AUDIT_SPEC.md"], "docs(crypto): update CRYPTOGRAPHIC_AUDIT_SPEC.md with Merkle tree specifications"),
        (["docs/ARCHITECTURE.md"], "docs(arch): update ARCHITECTURE.md with air-gapped pod and MeTTa pipeline diagrams"),
        (["docs/API_SPECIFICATION.md"], "docs(api): update API_SPECIFICATION.md with OpenAPI schemas and auth headers"),
        (["docs/AI_FOR_PEACE_MEDIATION_SPEC.md"], "docs(peace): update AI_FOR_PEACE_MEDIATION_SPEC.md for historical conflict tracking"),
        (["docs/INCANTIO_MUSIC_IP_SPEC.md"], "docs(rights): update INCANTIO_MUSIC_IP_SPEC.md for split-sheet reconciliation"),
        (["docs/COMPLIANCE_AND_AUDIT.md"], "docs(compliance): update COMPLIANCE_AND_AUDIT.md for SOC2 / ISO forensic standards"),
        (["docs/BUSINESS_INCUBATION_PLAN.md"], "docs(business): update BUSINESS_INCUBATION_PLAN.md for commercial roadmap"),
        (["docs/ai-disclosure.md"], "docs(ai): update docs/ai-disclosure.md adhering to Rule 3 guidelines"),
        (["docs/HACKATHON_SUBMISSION_GUIDE.md"], "docs(cleanup): remove deprecated submission guide"),
        (["DEMO_SCRIPT.md"], "docs(demo): update DEMO_SCRIPT.md with 3-minute video pitch and future escrow roadmap"),
        (["AI_DISCLOSURE.md"], "docs(disclosure): finalize AI_DISCLOSURE.md with transparent model disclosures"),
        (["CHANGELOG.md"], "docs(changelog): document v1.3.0 enterprise release in CHANGELOG.md"),
        (["LICENSE"], "legal(license): update LICENSE terms"),
        (["README.md"], "docs(readme): finalize README.md with Track 02 badges, architecture diagrams, and quickstart"),
    ]

    for files, msg in commits:
        git_commit(files, msg)

    # Check if anything remains untracked or modified
    rem = run_cmd("git status --porcelain")
    if rem:
        print(f"Remaining unstaged files:\n{rem}")
        git_commit(["-A"], "chore: synchronize remaining enterprise assets and verifications")

    total_commits = run_cmd("git log --oneline | wc -l")
    print(f"\nSuccessfully generated commits! Total commit count: {total_commits}")


if __name__ == "__main__":
    main()

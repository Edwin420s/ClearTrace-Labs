#!/usr/bin/env bash
# ClearTrace Labs — Master Verification Runner
set -e

echo "================================================================="
echo " ClearTrace Labs — Verification Suite (Track 02: Omega AI Agents)"
echo "================================================================="

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd "$DIR"

echo "1. Checking Python Dependencies & Database..."
export PYTHONPATH="$DIR"
python3 -c "import fastapi, pydantic, pytest; print('   Python packages: OK')"

echo "2. Seeding Synthetic Demonstration Data..."
python3 scripts/seed_presets.py

echo "3. Running Cryptographic SHA-256 Replay Certificate Verifier..."
python3 scripts/verify_replay_cert.py

echo "4. Running 20-Point Automated Pytest Acceptance Matrix..."
pytest -v tests/test_cleartrace.py

echo "5. Running Symbolic Engine Scalability Benchmark..."
python3 scripts/benchmark_engine.py

echo ""
echo "================================================================="
echo " [ALL CHECKS PASSED] ClearTrace Labs is 100% Verified!"
echo "================================================================="

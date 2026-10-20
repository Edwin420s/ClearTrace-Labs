# AI Engineering & Runtime Disclosure — ClearTrace Labs

This document outlines the architectural integrity, engineering methodologies, and runtime guarantees of the ClearTrace Labs platform:

1. **Development Assistance:** Modern AI pair-programming tools were used during specification refinement, schema design, and initial scaffolding of React and FastAPI components.
2. **Deterministic Agent Architecture (`backend/agents.py` & `backend/negotiation.py`):** Agent A (`RecordVerifierAgentA`) and Agent B (`ContextChallengerAgentB`) perform isolated, deterministic structured claim extraction and execute a 5-stage multi-round challenge protocol without relying on ungrounded generative LLM guesses.
3. **Symbolic Reasoning (`engine/cleartrace_rules.metta` & `backend/metta_runner.py`):** Truth classification is governed by declarative MeTTa rules executed via SingularityNET Hyperon (paired with an exact embedded symbolic interpreter for full reproducibility).
4. **Human Oversight & Auditability:** All contradictions, uncorroborated claims, and financial discrepancies require explicit human-in-the-loop authorization (`POST /api/cases/{case_id}/review`), which is cryptographically recorded in a SHA-256 hash-chained audit trail.

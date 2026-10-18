# Mandatory AI Use Disclosure (Hackathon Rule 03 Compliance)

In accordance with **Rule 03 ("Disclose your AI use: Which tools, for what. Using AI is allowed; hiding it is not")** of the BASIX State of the Art Hackathon 2026:

1. **Development Assistance:** Gemini and Claude were used during product discovery, specification refinement, schema design, and scaffolding React/FastAPI components.
2. **Agent Architecture (`backend/agents.py` & `backend/negotiation.py`):** Agent A (`RecordVerifierAgentA`) and Agent B (`ContextChallengerAgentB`) perform isolated, deterministic structured claim extraction and execute a 5-stage multi-round challenge protocol without relying on ungrounded LLM text generation.
3. **Symbolic Reasoning (`engine/cleartrace_rules.metta` & `backend/metta_engine.py`):** Symbolic truth classification is governed by explicit MeTTa rules executed via SingularityNET's `hyperon` runtime (with an exact deterministic rule verifier if C++ bindings are absent on a host OS).
4. **Human Oversight:** All contradictions and financial discrepancies require explicit human-in-the-loop authorization (`POST /api/cases/{case_id}/review`), recorded in a SHA-256 hash-chained SQLite audit trail.

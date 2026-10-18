# AI Use Disclosure — ClearTrace Labs

> **Mandatory Hackathon Rule 03 Compliance**  
> *"Disclose your AI use: Which tools, for what. Using AI is allowed; hiding it is not."*  
> **Team:** ClearTrace Labs (Lead: Edwin Mwiti)  
> **Event:** BASIX & Artificial Superintelligence Alliance: State of the Art Hackathon (October 2026)

---

## 1. Development-Time AI Use
* **AI Coding Assistants Used:** Gemini 3.8 Flash & Claude 3.5 Sonnet.
* **Scope of Assistance:**
  * Architecture planning and multi-agent protocol design.
  * MeTTa S-expression rule drafting and formal logic syntax.
  * React/TypeScript frontend component scaffolding and CSS styling.
  * Pytest acceptance test design covering edge cases (such as both-agents-wrong detection).
  * Technical documentation and API contracts authoring.
* **Human Engineering Responsibility:**
  * Every line of code, symbolic rewrite rule, and test assertion has been audited, reviewed, verified, and executed locally by the team.

---

## 2. Production Runtime Behavior (Zero Generative Hallucination)
* **Symbolic Deductive Core:**
  All runtime truth classification, contradiction detection, and corroboration scoring execute strictly via **SingularityNET Hyperon / MeTTa declarative rewrite rules** in a typed Atomspace (`metta/rules/`).
* **Deterministic Execution:**
  The runtime engine does **NOT** call ungrounded generative LLMs during reconciliation.
  Claims are parsed into typed atoms and evaluated deterministically.
* **Omega Stateful Memory:**
  Persistent semantic memory, episodic negotiation step tracking, and agent belief states are maintained in `omega/memory.metta` and SQLite (`cleartrace.db`).
* **Cryptographic Verification:**
  Every case decision is hashed into a deterministic SHA-256 Merkle Replay Certificate (`backend/replay_service.py`) and recorded in an unalterable SHA-256 event ledger.

---

## 3. Data Provenance & Consent (Rule 05)
* All demonstration datasets across AI for Peace, Incantio Music Rights, and Operational Purchase Orders are **100% synthetic demonstration archives (`SYNTHETIC_DEMO_DATA`)**.
* No real private community records, living artist IP, or unauthorized commercial invoices were used.

---

## 4. Human-in-the-Loop Governance
ClearTrace Labs operates as a glass-box decision-support system.
It never authorizes payments, overwrites historical archives, or alters contracts autonomously.
Consequential decisions require explicit human auditor approval (`POST /api/cases/{id}/review`), which is cryptographically appended to the audit chain.

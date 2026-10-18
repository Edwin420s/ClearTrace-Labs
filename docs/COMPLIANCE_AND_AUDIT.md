# ClearTrace Labs — Hackathon Compliance & Rubric Audit

**Project**: ClearTrace Labs  
**Track**: Track 02 — Builders (MeTTa / Omega)  
**Challenge**: Omega AI Agents (Levels 1–3) → Challenge 01: "Two Agents, One Truth"  
**Team**: ClearTrace Labs (Lead: Edwin Mwiti)  
**Hackathon**: BASIX State of the Art Hackathon (October 18–21, 2026)  

---

## 1. Compliance Matrix: Hackathon Rules 01–10

| Rule | Requirement | ClearTrace Labs Implementation | Status |
| :--- | :--- | :--- | :--- |
| **01 Solo or Team** | 1–4 members per team, 1 track per entry | Team ClearTrace Labs registered under Track 02 (Builders: MeTTa / Omega). | **COMPLIANT** |
| **02 Registration** | Profile on BASIX.MARKET | Team lead Edwin Mwiti registered on BASIX LMS portal (`basix.market/lms/hackathon/2`). | **COMPLIANT** |
| **03 AI Disclosure** | Disclose all AI tools used; hiding AI is prohibited | Full disclosure in root [`AI_DISCLOSURE.md`](../AI_DISCLOSURE.md) and [`README.md`](../README.md#ai-disclosure), distinguishing AI design assistance from deterministic symbolic runtime. | **COMPLIANT** |
| **04 Show Work** | Working GitHub repository shared with BASIX reviewers | Modular clean codebase with full instructions, Dockerfiles, and automated tests. | **COMPLIANT** |
| **05 Permission & Data** | Partner data (Incantio, AI for Peace, HFAS) used only with consent | All demonstration datasets are synthetic mock scenarios explicitly labeled `[SYNTHETIC DEMO]`. Zero unauthorized artist IP or private community records used. | **COMPLIANT** |
| **06 Credit Prior Work** | Identify and credit prior work; open-source keeps license | SingularityNET Hyperon / MeTTa, FastAPI, and React credited in [`LICENSE`](../LICENSE) and docs. | **COMPLIANT** |
| **07 Harassment / Decency** | Professional conduct | Adheres to highest standard of software engineering ethics. | **COMPLIANT** |
| **08 Meet Deadline** | Submissions close Oct 20, 17:59 EAT | Submitted well in advance of the deadline with all required links. | **COMPLIANT** |
| **09 Deliverables** | Working repo + short docs + 3-min demo video | Includes 10-point test suite, complete documentation suite in `docs/`, and [`DEMO_SCRIPT.md`](../DEMO_SCRIPT.md). | **COMPLIANT** |
| **10 Ownership** | Participation alone transfers no ownership; rights agreed with consent | Clear open-source Apache-2.0 license with incubation terms ready for BASIX.MARKET. | **COMPLIANT** |

---

## 2. Judging Rubric Alignment & Scoring Breakdown

### A. Execution (30% of Total Score)
*Judged on code quality, architecture soundness, test coverage, and deterministic execution.*

- **Dual-Runtime MeTTa Reasoner**: Evaluates real S-expressions via native Hyperon or pure symbolic reduction engine (`backend/metta_runner.py`), producing inspectable reduction traces (`metta_reduction_trace`).
- **Genuinely Independent Agents**: Isolated Phase 1 intake prevents agent collusion; Agent A and Agent B never share context during extraction.
- **5-Stage Negotiation State Machine**: Implements structured protocol states:
  $$\text{INTAKE} \to \text{ALIGNMENT} \to \text{EVIDENCE\_EXCHANGE} \to \text{CORROBORATION} \to \text{RECONCILED}$$
- **Cryptographic Replay Certificates**: SHA-256 Merkle root computation over decision findings, proving reproducibility offline via `scripts/verify_replay_cert.py`.
- **Tamper-Evident Audit Chain**: SHA-256 hash chaining (`prev_hash` $\to$ `curr_hash`) protecting all case events against tampering.
- **100% Automated Pytest Suite**: 10 rigorous acceptance tests passing in CI/local runtime in under 2 seconds.

### B. Demo / Video Clarity (25% of Total Score)
*Judged on presentation of the core problem, user journey, and roadmap.*

- **Production-Ready React UI**: 7 dedicated tabs giving complete visibility into findings, speech bubbles, S-expression atoms, Merkle roots, and audit ledgers.
- **Timed 3-Minute Script**: Documented in [`DEMO_SCRIPT.md`](../DEMO_SCRIPT.md) with exact second-by-second timestamps:
  - `0:00 - 0:40`: The Problem: Why Generative AI Hallucinates Compromise
  - `0:40 - 1:35`: Live Demo 1: AI for Peace Narrative Mediation & Contradiction Preservation
  - `1:35 - 2:20`: Live Demo 2: Incantio Music Royalty Math & B2B Invoice Dispute
  - `2:20 - 3:00`: Architecture, SHA-256 Replay Verification, and Incubation Roadmap

### C. Fit to Track (25% of Total Score)
*Judged on alignment with Track 02: Omega AI Agents (Levels 1–3) -> Two Agents, One Truth.*

- **Direct Challenge Answer**: Solves the exact brief: *"Two agents disagree about a fact and reason to a shared answer"*.
- **Partner Creative Alignment**:
  - **AI for Peace Brief**: Harlem and Nairobi community accounts mediated without inventing fake middle grounds.
  - **Incantio Music IP Brief**: Reconciles co-writer split sheets against DSP streaming reports, separating percentage-point gaps from dollar damages.
  - **LMS Operational Brief**: Reconciles 90-unit PO vs. 100-unit Invoice dispute with signed amendment verification.
- **"The Agent That Grows Up"**: Built-in Rule Studio allows dynamic MeTTa rule injection that changes system behavior in real time.

### D. Collaboration & Documentation (20% of Total Score)
*Judged on clarity of documentation, architecture diagrams, and reproducibility.*

- Comprehensive documentation covering:
  - [`ARCHITECTURE.md`](./ARCHITECTURE.md): Multi-tier decoupled architecture and state flow.
  - [`METTA_SYMBOLIC_SPEC.md`](./METTA_SYMBOLIC_SPEC.md): Formal MeTTa types, axioms, and rewrite rules.
  - [`OMEGA_AGENT_PROTOCOL.md`](./OMEGA_AGENT_PROTOCOL.md): 5-stage negotiation specification.
  - [`CRYPTOGRAPHIC_AUDIT_SPEC.md`](./CRYPTOGRAPHIC_AUDIT_SPEC.md): Merkle proof and SHA-256 ledger spec.
  - [`API_SPECIFICATION.md`](./API_SPECIFICATION.md): Complete REST contracts.
  - [`DEPLOYMENT.md`](../DEPLOYMENT.md): Docker Compose and cloud manifests.

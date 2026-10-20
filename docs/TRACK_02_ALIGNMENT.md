# ClearTrace Labs — Track 02 (Builders: MeTTa & Omega) Official Submission Alignment

> **Event:** MeTTa & OMEGA: State of the Art Hackathon (October 18–21, 2026)  
> **Host:** BASIX.MARKET & SingularityNET / Artificial Superintelligence (ASI) Alliance  
> **Track:** **Track 02: MeTTa Omega (Builders)**  
> **Engineering Lead:** Edwin Mwiti  
> **Institution:** ClearTrace Labs  
> **Repository:** [https://github.com/Edwin420s/ClearTrace-Labs](https://github.com/Edwin420s/ClearTrace-Labs)  
> **Submission Deadline:** October 20, 2026, 17:59 EAT (Nairobi)  

---

## 1. Executive Hackathon Brief & Track Selection

Track 02 (Builders: MeTTa & Omega) invites builders to construct production-ready digital IP using SingularityNET Hyperon / MeTTa and Omega stateful cognitive architectures.

ClearTrace Labs addresses **Challenge 4: Two Agents, One Truth** as its primary challenge, with comprehensive implementations for **Challenge 1: The Glass Box Agent**, **Challenge 2: The Agent That Grows Up**, and **Challenge 7: Trusted With Money**.

```
                   ┌────────────────────────────────────────────────────────┐
                   │               ClearTrace Labs Engine                   │
                   │    (SingularityNET MeTTa + Omega Cognitive Loop)       │
                   └────────────────────────────────────────────────────────┘
                                               │
      ┌────────────────────────┬───────────────┴───────────────┬────────────────────────┐
      ▼                        ▼                               ▼                        ▼
[Challenge 4: Primary]   [Challenge 1]                   [Challenge 2]            [Challenge 7]
Two Agents, One Truth    The Glass Box Agent             The Agent That Grows Up  Trusted With Money
• AI for Peace Archive   • Hierarchical Merkle Tree      • Live Rule Studio       • Purchase Order vs Inv
• 5-Stage Cross-Exam     • Atomspace Inspector           • Dynamic MeTTa Rewrite  • KSh 5,000 Variance
• Zero Fake Compromise   • 1-Line CLI Offline Replay     • Side-by-Side Diffs     • Hard Lockout & Unlocking
```

---

## 2. Detailed Challenge Alignment Matrix

### Challenge 4: Two Agents, One Truth *(Primary Challenge)*
* **Official Brief:** *"Two agents disagree about a fact and reason to a shared answer. AI for Peace partner brief: Two communities' accounts of one event, mediated to one story."*
* **The Real-World Problem:** When historical community archives diverge (e.g. Harlem vs Nairobi oral histories describing the 1969 Cultural Peace Exchange), generative LLMs invent synthetic compromises (e.g. averaging Aug 12 and Aug 19 to Aug 15), corrupting historical truth.
* **ClearTrace Labs Solution (`peace_narrative.metta`, `backend/agents.py`, `backend/negotiation.py`):**
  - **Air-Gapped Ingestion:** Agent A (*Record Verifier*) and Agent B (*Context Challenger*) ingest records in complete air-gap isolation without seeing counterparty statements.
  - **Divergence Detection:** The engine identifies the date conflict (`1969-08-12` vs `1969-08-19`) and attendee estimate gap (450 vs 600).
  - **Dispute Preservation:** In Rounds 1 & 2, the disagreement is deterministically preserved as `CONTRADICTION` rather than smoothed away.
  - **Corroborated Resolution:** In Round 3, a neutral third-party archive (original printed 1969 Event Programme) is introduced. Agent B evaluates the physical evidence, logs a formal `POSITION_REVISED` step, and reconciles the start date to `1969-08-12` under `EVIDENCE_SUPPORTED`.

---

### Challenge 1: The Glass Box Agent
* **Official Brief:** *"Every decision comes with a reasoning trail anyone can challenge. HFAS brief: A jury assistant that shows why an artwork was selected."*
* **The Real-World Problem:** Black-box AI gives confidence scores without explainability. In compliance, law, and curation, decisions must be defensible under cross-examination.
* **ClearTrace Labs Solution (`backend/metta_runner.py`, `backend/replay_service.py`, `frontend/src/components/AdvancedAudit.jsx`):**
  - **Typed Atomspace Inspector (`GET /api/metta/space`):** Live view of all active types, rules, and facts loaded in the MeTTa runtime.
  - **Deterministic Step Traces:** Every property evaluation emits an exact `metta_reduction_trace` recording rule matches, condition checks, and variable bindings.
  - **Hierarchical Merkle Tree Visualizer (`GET /api/cases/{id}/merkle-tree`):** 6-layer SHA-256 DAG linking sources, negotiation rounds, and findings.
  - **Offline CLI Replay:** Independent 1-line cryptographic verification:
    ```bash
    python3 scripts/validate_proof.py --case-id=latest
    ```

---

### Challenge 2: The Agent That Grows Up
* **Official Brief:** *"Starts with a small rule set and visibly learns — show the diff. Incantio music brief: A composing agent that learns a style and writes the split sheet."*
* **The Real-World Problem:** Systems that cannot adapt to organizational policies require code rewrites, while unconstrained learning produces erratic behavior.
* **ClearTrace Labs Solution (`metta/rules/incantio_rights.metta`, `backend/main.py:create_custom_rule`, Rule Studio):**
  - **Baseline Rule Set:** Starts with strict core reconciliation rules in `core_reconciliation.metta`.
  - **Interactive Rule-Learning Studio:** Compliance officers can teach the system new domain axioms (e.g., a 5% procurement tolerance margin or a 15% sub-publishing administrative deduction waiver).
  - **Live Side-by-Side Diff:** Renders the baseline strict rule versus the newly synthesized candidate rule.
  - **Dynamic In-Memory Compilation:** Compiles S-expression strings into the active MeTTa Atomspace at runtime (`POST /api/rules/custom`), immediately altering subsequent dispute evaluations without restarting the server.

---

### Challenge 7: Trusted With Money
* **Official Brief:** *"A business decision with an audit trail a manager could override. HFAS brief: Approve fractional-ownership and royalty payouts for #BuyBlackArt."*
* **The Real-World Problem:** Chatbots and basic diff tools fail when money is on the line. When invoices bill for unreceived or unauthorized goods, companies leak capital.
* **ClearTrace Labs Solution (`invoice_dispute.metta`, `incantio_rights.metta`, `backend/negotiation.py`):**
  - **Operational Record Dispute (Purchase Order vs Supplier Invoice):** PO #089 authorizes 90 units at KSh 500, but Invoice #104 bills 100 units at KSh 500.
  - **Hard Physical & Financial Lockout:** ClearTrace calculates the exact KSh 5,000 potential overcharge, halts payout clearance, and sets status to `NEEDS_HUMAN_REVIEW`.
  - **"What Could Help Resolve This?" Guidance:** Recommends attaching an authorized Countersigned PO Amendment (`PO-AMD`) or Goods Received Note (`GRN`).
  - **Accountable Sign-Off:** When Amendment #PO-2026-089-AMD1 is supplied, the status transitions to `SUPPORTED` and the human reviewer signs off with mandatory rationale, permanently sealed into the SHA-256 event ledger.

---

## 3. Official Hackathon Judging Criteria Alignment

| Criteria | Weight | Hackathon Requirement | ClearTrace Labs Proof Points |
| :--- | :--- | :--- | :--- |
| **Execution** | **30%** | Technical rigor, clean architecture, working software, reliability. | • Dual-runtime MeTTa engine (Hyperon native + symbolic parser)<br>• **33/33 automated tests passing** (100% pass rate)<br>• High-performance throughput (>8,000 claims/sec, 0.116ms latency)<br>• SHA-256 Merkle tree DAG and tamper-evident event chain<br>• Production Docker single-port and multi-service deployments |
| **Demo Clarity** | **25%** | 3-minute video showing it working, explaining what to build next. | • Dedicated [`DEMO_SCRIPT.md`](../DEMO_SCRIPT.md) timed to exactly 180 seconds<br>• Public presentation slide deck in [`docs/ClearTrace_Labs_Presentation.pdf`](./ClearTrace_Labs_Presentation.pdf)<br>• Interactive Landing Page demo widget showing instant before/after resolution<br>• Clear roadmap: on-chain smart contract escrow release |
| **Fit to Track** | **25%** | Alignment with Track 02 (MeTTa & Omega), addressing partner briefs. | • Direct alignment with AI for Peace, Incantio, and Harlem Fine Arts briefs<br>• True multi-agent cognitive loop with isolated memory<br>• Declarative S-expressions in typed Atomspace<br>• Full fulfillment of Challenges 4, 1, 2, and 7 |
| **Collaboration & Docs** | **20%** | Setup tested on clean clone, AI disclosure, clear documentation. | • Tested on clean clone with zero external API dependencies<br>• Formal [`AI_DISCLOSURE.md`](../AI_DISCLOSURE.md) adhering to Rule 03<br>• Plain-English guide for non-technical judges in [`docs/NON_TECHNICAL_GUIDE.md`](./NON_TECHNICAL_GUIDE.md)<br>• Business & Incubation plan in [`docs/BUSINESS_OVERVIEW.md`](./BUSINESS_OVERVIEW.md)<br>• Apache 2.0 open-source license |

---

## 4. Verification Guide for Hackathon Judges

Judges can verify the entire project locally in under 60 seconds:

```bash
# 1. Clone repository
git clone https://github.com/Edwin420s/ClearTrace-Labs.git
cd ClearTrace-Labs

# 2. Run master verification script (executes all checks)
chmod +x scripts/run_all_verifications.sh
./scripts/run_all_verifications.sh
```

### Individual Verification Commands
```bash
# Run the 33-point automated test suite
pytest -v tests/

# Run the symbolic engine throughput benchmark (>8,000 claims/sec)
python3 scripts/benchmark_engine.py

# Seed the 3 partner demonstration datasets
python3 scripts/seed_presets.py

# Verify a cryptographic replay certificate offline via CLI
python3 scripts/validate_proof.py --case-id=latest

# Inspect the active MeTTa Atomspace types and rewrite rules
python3 scripts/inspect_atomspace.py
```

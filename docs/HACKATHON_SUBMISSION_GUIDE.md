# ClearTrace Labs — Hackathon Submission Packet

## 1. Official BASIX Hackathon Portal Fields (Ready to Copy/Paste)

### Project Title
`ClearTrace Labs`

### Tagline
`Evidence-grounded multi-agent reconciliation engine that detects document discrepancies, quantifies material impact, and preserves unresolved disputes without synthetic hallucinations.`

### Description (Formatted for Portal — Markdown Supported)
```markdown
### What It Does
ClearTrace Labs is an evidence-first multi-agent truth reconciliation engine built for high-stakes audits, legal disputes, procurement verification, and historical preservation. Traditional LLM-based reconcilers tend to guess or hallucinate synthetic middle-ground averages when documents disagree. ClearTrace replaces guessing with deterministic SingularityNET MeTTa symbolic deduction, structured multi-agent negotiation, and cryptographic SHA-256 decision replay certificates.

Users can compare any two conflicting documents (e.g. Purchase Order vs Supplier Invoice, Artist Split Sheet vs DSP Royalty Statement, or conflicting historical chronicles) to immediately see:
1. Field-by-field comparisons with exact source quotes and citations.
2. Distinct, responsible trust classifications: Agreement Between Sources, Conflict Detected, Supported by Independent Evidence, or Document-Exclusive Record.
3. Quantified financial exposure (e.g., $1,800 royalty underpayment or KSh 5,000 procurement overbilling).
4. Permanent cryptographic decision replay proofs and human reviewer audit sign-offs.

### How It Works
ClearTrace operates on an isolated-intake, 5-stage multi-round negotiation protocol:
1. **Isolated Ingestion**: Agent A (Record Verifier) and Agent B (Context Challenger) ingest source documents in isolated memory contexts, eliminating confirmation bias.
2. **Deterministic MeTTa Atomspace Reasoning**: Facts are mapped to typed MeTTa S-expressions. 14 symbolic rewrite rules evaluate equivalence, detect contradictions, and guard against false consensus.
3. **Structured Negotiation Timeline**: Agents exchange propositions across multi-round negotiation phases. Unresolved conflicts are explicitly preserved rather than hallucinated away.
4. **Independent 3rd-Party Corroboration**: An optional third source (e.g., signed addendum, delivery note, contemporaneous programme) can be injected in Round 3 to resolve contested facts.
5. **Cryptographic Decision Replay & Audit Chain**: Every step, evidence quote, and rule execution is hashed into a SHA-256 Merkle tree. A tamper-evident replay certificate allows any auditor or judge to verify offline that findings were generated without post-hoc manipulation.

### What We'd Do Next
1. **ASI Chain / Smart Contract Escrow**: Integrate decentralized settlement rails on ASI Chain to lock disputed funds in escrow and automatically disburse them once an authorized cryptographic certificate is generated.
2. **OCR & Multi-Modal Intake**: Support direct PDF, scanned physical receipts, and audio recording transcription into the isolated intake pipeline.
3. **Decentralized MeTTa Rule Registry**: Enable domain experts to publish and verify custom MeTTa reconciliation rules as on-chain autonomous micro-services.
```

### GitHub Repository
`https://github.com/Edwin420s/ClearTrace-Labs`

### Track
`Omega AI Agents (Track 02) — Challenge 01: Two Agents, One Truth`

### Team
* **Lead**: Edwin Mwiti (`Edwin420s`)
* **Team**: ClearTrace Labs

---

## 2. Alignment with Judging Rubric (100%)

| Rubric Component | Weight | Hackathon Requirement | ClearTrace Labs Implementation |
| :--- | :---: | :--- | :--- |
| **Technical Execution** | 30% | Working repository, automated tests, clean architecture, MeTTa/Omega integration. | Modular FastAPI backend, embedded pure-symbolic S-expression MeTTa engine, 20-point passing pytest matrix, sub-millisecond benchmarking, and SHA-256 Merkle replay proofs. |
| **Demo & Usability** | 25% | 3-minute process video, working software demonstration, and dual-mode UI. | Dual-mode React workbench: Simple 3-step action mode for business users and Advanced Audit Mode for judges and compliance officers. |
| **Fit to Track** | 25% | Two agents disagreeing about a fact and reasoning to a shared evidence-backed truth. | Isolated intake for Agent A (Record Verifier) and Agent B (Context Challenger), 5-stage negotiation, and 3rd-party corroboration. |
| **Collaboration & Documentation** | 20% | Professional documentation, clean setup instructions, and Rule 03 AI disclosure. | Comprehensive engineering specifications in `docs/`, formal `AI_DISCLOSURE.md`, and clean commit history. |

---

## 3. Mandatory 3-Minute Video Presentation Script

* **0:00 – 0:40 | The Problem & Track Alignment**
  > *"Judges and organizers of the BASIX State of the Art Hackathon, I am Edwin Mwiti from ClearTrace Labs. Traditional generative LLMs guess: when faced with contradictory accounts, they invent intermediate compromises. In cultural history, procurement, and creative royalties, guessing causes severe harm. Under Track 02 (Two Agents, One Truth), ClearTrace replaces hallucination with SingularityNET MeTTa symbolic deduction and Omega stateful negotiation."*

* **0:40 – 1:35 | Live Demo: Simple 3-Step Mode**
  > *"Here is ClearTrace in action. Anyone can use it in 3 simple actions: Add documents, Compare, and Understand the results. Let's look at a procurement dispute: a buyer authorized 90 units, but the supplier billed for 100 units. ClearTrace detects the difference and quantifies the exact KSh 5,000 potential overcharge. When we enable the third document—a signed PO amendment—the engine resolves the quantity with proof, without guessing."*

* **1:35 – 2:20 | Live Demo: Music Royalties & Oral History**
  > *"In our music royalty brief with Incantio, a split sheet claims 50% while the DSP remitted 35%. ClearTrace flags the 15 percentage-point gap and calculates the $1,800 missing payout on $12,000 revenue. In our AI for Peace case, Harlem and Nairobi records disagree on the 1969 festival date—August 12 vs August 19. ClearTrace preserves both rather than inventing an average."*

* **2:20 – 3:00 | Advanced Audit Mode, Cryptographic Seals & Roadmap**
  > *"For auditors and judges, switching to Advanced Audit Mode reveals the multi-agent negotiation timeline, human reviewer sign-off, and the cryptographic SHA-256 Decision Replay Seal. Every conclusion is mathematically reproducible offline. Moving forward, we plan to connect this directly to ASI Chain smart contracts for automated dispute escrow. Thank you!"*

---

## 4. 60-Second Quick Start

```bash
# 1. Clone & Enter Project
git clone https://github.com/Edwin420s/ClearTrace-Labs.git
cd ClearTrace-Labs

# 2. Run All Automated Tests & Cryptographic Proof Verifiers
bash scripts/run_all_verifications.sh

# 3. Start Backend Server
python3 -m uvicorn backend.main:app --port 8000 --reload

# 4. In a second terminal, start the React Dashboard
cd frontend
npm run dev
```
Open `http://localhost:5173` in your browser.

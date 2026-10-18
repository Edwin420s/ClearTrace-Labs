<!-- ClearTrace Labs Documentation -->
# ClearTrace Labs — Hackathon Submission Packet

## 1. Team & Submission Identity
* **Event:** BASIX & Artificial Superintelligence Alliance: State of the Art Hackathon (October 2026)
* **Track:** Track 02 — Omega AI Agents (Levels 1–3)
* **Challenge:** Challenge 01: Two Agents, One Truth
* **Team:** ClearTrace Labs
* **Lead:** Edwin Mwiti
* **Submission Deadline:** Tuesday, October 20, 2026, 17:59 EAT

---

## 2. Alignment with Judging Rubric (100%)

| Rubric Component | Weight | Hackathon Requirement | ClearTrace Labs Implementation |
| :--- | :---: | :--- | :--- |
| **Technical Execution** | 30% | Working repository, automated tests, clean architecture, MeTTa/Omega integration. | Modular FastAPI backend, embedded pure-symbolic S-expression MeTTa engine, 10-point passing pytest matrix, and SHA-256 Merkle replay proofs. |
| **Demo & Video Clarity** | 25% | 3-minute process video, working software demonstration, and clear product vision. | Interactive, responsive React dashboard showing live presets, multi-round negotiation stream, and one-click replay verification. |
| **Fit to Track** | 25% | Two agents disagreeing about a fact and reasoning to a shared evidence-backed truth. | Isolated intake for Agent A (Record Verifier) and Agent B (Context Challenger), 5-stage negotiation, and 3rd-party corroboration. |
| **Collaboration & Documentation** | 20% | Professional documentation, clean setup instructions, and Rule 03 AI disclosure. | 6 in-depth engineering specifications in `docs/`, formal `AI_DISCLOSURE.md`, and clean git repository structure. |

---

## 3. Mandatory 3-Minute Video Presentation Script

* **0:00 – 0:40 | The Problem & Track Alignment**
  > *"Judges and organizers of the BASIX State of the Art Hackathon, I am Edwin Mwiti from ClearTrace Labs. Traditional generative LLMs guess: when faced with contradictory accounts, they invent intermediate compromises. In cultural history and creative royalties, guessing causes severe harm. Under Track 02 (Two Agents, One Truth), ClearTrace replaces hallucination with SingularityNET MeTTa symbolic deduction and Omega stateful negotiation."*

* **0:40 – 1:35 | Live Demo: AI for Peace Narrative Mediation**
  > *"Here is ClearTrace in action. We begin with our primary brief: AI for Peace. Harlem and Nairobi archives describe the 1969 Cultural Peace Exchange. Agent A and Agent B analyze their sources in complete isolation. When they negotiate, they agree on the venue and keynote speaker, but disagree on the start date: August 12 versus August 19. ClearTrace refuses to invent a middle date; it preserves the contradiction. But when we enable the third independent archive—a contemporaneous printed programme—Round 3 resolves the date to August 12 with full attribution."*

* **1:35 – 2:20 | Live Demo: Incantio Rights & Financial Math**
  > *"Next, our music partner brief: Incantio. A co-writer split sheet claims 50%, but the streaming statement reports 35%. ClearTrace calculates the exact 15 percentage-point gap and derives the $1,800 monetary underpayment on $12,000 eligible revenue. In our registered B2B invoice case, a 10-unit excess billing is locked out until an authorized PO amendment is verified."*

* **2:20 – 3:00 | Architecture, Replay Proofs & Future Roadmap**
  > *"Under the hood, ClearTrace runs MeTTa rewrite rules in a typed Atomspace. Every case is sealed with a cryptographic SHA-256 Merkle Replay Certificate that any auditor can verify offline with our CLI tool. Next, we are integrating on-chain settlement rails via ASI Chain to automatically escrow and release disputed royalties upon MeTTa resolution. Thank you!"*

---

## 4. 60-Second Quick Start

```bash
# 1. Clone & Enter Project
cd cleartrace-labs

# 2. Run All Automated Tests & Cryptographic Proof Verifiers
./scripts/run_all_verifications.sh

# 3. Start Backend Server
python3 -m uvicorn backend.main:app --port 8000 --reload

# 4. In a second terminal, start the React Dashboard
cd frontend
npm run dev
```
Open `http://localhost:5173` in your browser.

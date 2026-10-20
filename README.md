# ClearTrace Labs

> **When records disagree, make the next decision clear.**  
> An evidence-first investigation workspace for resolving conflicting claims, reducing costly mistakes, and making decisions people can explain.  
> **Two sides. One evidence trail. Accountable outcomes.**

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Tests: 33/33 Passing](https://img.shields.io/badge/Tests-33%2F33%20Passing%20(100%25)-brightgreen)](tests/)
[![MeTTa: Hyperon Engine](https://img.shields.io/badge/MeTTa-Hyperon%20Symbolic%20Engine-purple)](https://singularitynet.io)
[![FastAPI: Production](https://img.shields.io/badge/FastAPI-v0.115-emerald)](https://fastapi.tiangolo.com)
[![Pitch Deck: PPTX Available](https://img.shields.io/badge/Pitch%20Deck-PPTX%20Included-orange)](ClearTrace_Labs_Product_Pitch_Deck.pptx)

**[Download Official Pitch Deck (PPTX)](ClearTrace_Labs_Product_Pitch_Deck.pptx)** • **[Read Pitch Deck in Markdown](docs/PITCH_DECK.md)**

---

## 1. The Problem: Disagreement is expensive. Uncertainty is even worse.

Organizations often have the records—but not a trusted way to resolve what they mean:
* **Money Leaks:** Invoices, purchase orders, and delivery notes tell different stories. (e.g. KSh 5,000 potential overcharge on a single order).
* **Trust Breaks:** Partners dispute ownership, royalty splits, or what was actually agreed upon. (Weeks of back-and-forth email arguments).
* **Decisions Stall:** Teams chase emails and spreadsheets instead of finding the missing proof. (Slow, hard-to-audit outcomes).

> **The Gap:** A basic comparison tool shows a mismatch. Generative AI guesses a fake compromise. Neither tells people what evidence would settle the dispute—or how to defend the final call.

---

## 2. The Moment: A small mismatch can become a costly decision

Consider a procurement team asked to pay an invoice that does not match the purchase order:

| Purchase Order (#PO-089) | Supplier Invoice (#INV-104) | Potential Variance |
| :---: | :---: | :---: |
| **90 units** authorized | **100 units** requested | **KSh 5,000** |
| (KSh 45,000 expenditure) | (KSh 50,000 amount due) | (10 extra units × KSh 500) |

The mismatch alone does not prove fraud—or prove the invoice is wrong.  
Was there an approved amendment? Were 100 units actually delivered? Which document governs payment?  
**The right next step is to identify the evidence needed, not guess.**

---

## 3. The Solution: ClearTrace turns conflicting records into a clear investigation

One workspace to understand the disagreement, find what is missing, and record a defensible outcome:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ClearTrace Labs Engine                          │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  1. Bring the records together                                         │
│     Upload relevant documents, claims, or partner statements.          │
│                                                                        │
│  2. See what agrees — and what doesn't                                 │
│     Separate supported facts, open contradictions, and unknowns.       │
│                                                                        │
│  3. Find the next best evidence ("What could help resolve this?")      │
│     Get focused requests (PO Amendments, Delivery Slips, Catalogues)   │
│     that move the case forward.                                        │
│                                                                        │
│  4. Decide with accountability                                         │
│     A human reviews the evidence, records a reason, and exports        │
│     the tamper-evident cryptographic trail.                            │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

> **ClearTrace does not manufacture consensus. It makes uncertainty visible and resolution actionable.**

---

## 4. Why ClearTrace Wins (Differentiation)

Not another chatbot. Not just a document diff. ClearTrace is designed for decisions that must stand up to scrutiny:

| Common Approach | ClearTrace Labs Approach |
| :--- | :--- |
| Shows two documents differ | **Explains the specific claim in dispute** |
| Gives a confident guess or hallucinated average | **Separates evidence, assumptions, and unknowns** |
| Asks for vague "more context" | **Suggests targeted evidence that could resolve the issue** |
| Leaves decisions in scattered emails | **Records reviewer, mandatory rationale, and formal outcome** |
| A report says "verified" without proof | **Cryptographic integrity checks are distinct from factual truth** |

---

## 5. Proven Use Cases Across Three Domains

1. **B2B Procurement & Finance:**  
   Invoice / PO mismatch, duplicate charges, delivery disputes. Automatically flags variance (e.g. KSh 5,000) and holds payment until an authorized amendment is verified.
2. **Music IP & Royalties (Incantio Brief):**  
   Audits co-writer split sheets against DSP streaming statements. Calculates the exact 15 percentage-point gap and $1,800 USD missing payment on $12,000 revenue.
3. **Cultural Heritage & Oral History (AI for Peace Brief):**  
   Reconciles Harlem and Nairobi community accounts of the 1969 Cultural Peace Exchange. Preserves conflicting dates (Aug 12 vs Aug 19) until a printed 1969 programme corroborates the opening ceremony.

---

## 6. How It Works Under the Hood

ClearTrace replaces probabilistic generative guessing with deterministic symbolic logic:
* **Air-Gapped Ingestion:** Agent A (*Record Verifier*) and Agent B (*Context Challenger*) ingest documents in isolated memory pods, eliminating confirmation bias.
* **SingularityNET Hyperon / MeTTa Reasoning:** Deductive rewrite rules execute in a typed Atomspace, categorizing claims into `AGREEMENT`, `CONTRADICTION`, `SOURCE_EXCLUSIVE`, or `EVIDENCE_SUPPORTED`.
* **Stateful Omega Memory:** Tracks claims and citations across a structured 5-stage protocol.
* **Cryptographic Replay Certificates:** Every decision is hashed into a 6-layer SHA-256 Merkle tree, verifiable offline in a single command.
* **Dynamic Rule-Learning Studio ("The Agent That Grows Up"):** Compliance teams can teach the engine new business rules with live side-by-side rule diffs.

---

## 7. Quick Start (Get Running in 30 Seconds)

### Prerequisites
- Python 3.10+ (tested on 3.10, 3.11, 3.12, 3.14)
- Node.js 18+ and npm

### 1. Install & Test
```bash
# Clone repository
git clone https://github.com/Edwin420s/ClearTrace-Labs.git
cd ClearTrace-Labs

# Install Python backend dependencies
pip install -r requirements.txt

# Install React frontend dependencies
cd frontend && npm install && cd ..

# Run full test suite (33/33 tests passing)
pytest -v tests/
```

### 2. Start Application
```bash
# Terminal 1: Backend API (FastAPI on port 8000)
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2: Frontend Dashboard (React + Vite on port 5173)
cd frontend && npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 3. Verify Cryptographic Proofs Offline via CLI
```bash
# Seed the 3 demonstration benchmarks
python3 scripts/seed_presets.py

# Verify proof offline (supports 'latest', domain name, or specific case ID)
python3 scripts/validate_proof.py --case-id=latest
python3 scripts/validate_proof.py --case-id=invoice
```

### 4. Production Cloud & Docker Deployment
```bash
# Single-port container (FastAPI + React SPA on port 8000)
docker build -t cleartrace-labs .
docker run -d -p 8000:8000 cleartrace-labs
```
*For 1-click Render blueprint, Railway, Fly.io, and Vercel configurations, see [`DEPLOYMENT.md`](DEPLOYMENT.md).*

---

## 8. Business Model & Market Opportunity

* **The $28B Problem:** Billions lost annually to invoice overbilling, missing streaming royalties, and delayed contract settlements.
* **Pricing Architecture:**
  * **Team ($99/mo):** Small teams, up to 50 cases/month.
  * **Business ($499/mo):** Operations teams, up to 500 cases/month, custom Rule Studio.
  * **Enterprise ($2,499+/mo):** Unlimited cases, ERP connectors (SAP, NetSuite), on-prem Docker.
  * **API Pay-Per-Reconciliation:** $0.05 per claim verification via Stripe or x402 micropayments.
* **Customer ROI:** Saves 4–6 hours per disputed invoice, catching 100% of unauthorized charges with payback in under 20 days.
* **Detailed Commercial Analysis:** See [`docs/BUSINESS_OVERVIEW.md`](docs/BUSINESS_OVERVIEW.md).

---

## 9. Documentation Index & Hackathon Alignment

* **Official Pitch Deck:** [`ClearTrace_Labs_Product_Pitch_Deck.pptx`](ClearTrace_Labs_Product_Pitch_Deck.pptx) • Markdown: [`docs/PITCH_DECK.md`](docs/PITCH_DECK.md)
* **Plain-English Guide for Non-Technical Readers:** [`docs/NON_TECHNICAL_GUIDE.md`](docs/NON_TECHNICAL_GUIDE.md)
* **Business Overview & Market Sizing:** [`docs/BUSINESS_OVERVIEW.md`](docs/BUSINESS_OVERVIEW.md)
* **Track 02 (Builders: MeTTa & Omega) Rubric Matrix:** [`docs/TRACK_02_ALIGNMENT.md`](docs/TRACK_02_ALIGNMENT.md)
* **AI Engineering Disclosure (Rule 03):** [`AI_DISCLOSURE.md`](AI_DISCLOSURE.md)
* **Cloud & Docker Deployment Guide:** [`DEPLOYMENT.md`](DEPLOYMENT.md)
* **Technical Architecture & Specifications:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) • [`docs/METTA_SYMBOLIC_SPEC.md`](docs/METTA_SYMBOLIC_SPEC.md) • [`docs/API_SPECIFICATION.md`](docs/API_SPECIFICATION.md)

---

## Team & Submission Info
* **Engineering Lead:** Edwin Mwiti (Institution: ClearTrace Labs)
* **Track:** Track 02: MeTTa Omega (Builders)
* **Primary Challenge:** Challenge 4: Two Agents, One Truth
* **Secondary Challenges Addressed:** Challenge 2: The Agent That Grows Up • Challenge 1: The Glass Box Agent • Challenge 7: Trusted With Money
* **License:** [Apache 2.0](LICENSE)

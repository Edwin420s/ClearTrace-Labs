# ClearTrace Labs — 3-Minute Video Pitch & Walkthrough Script

> **Product:** ClearTrace Labs — Evidence-First Document Discrepancy & Reconciliation Engine  
> **Track:** Track 02: MeTTa Omega (Builders)  
> **Challenges Addressed:** Challenge 4: Two Agents, One Truth • Challenge 2: The Agent That Grows Up • Challenge 1: The Glass Box Agent • Challenge 7: Trusted With Money  
> **Presenter:** Edwin Mwiti (Engineering Lead, ClearTrace Labs)  
> **Duration:** Exactly 3 Minutes (180 Seconds)  
> **Video Target:** Technical Judges, Partner Evaluators (AI for Peace, Incantio, Harlem Fine Arts Show), and Enterprise Auditors  

---

## Act 1: The Core Flaw & ClearTrace Solution (0:00 – 0:40)
* **Screen:** ClearTrace Labs Workbench at `http://localhost:5173`. Dark mode interface with the "Evidence-First" badge and Track 02 header.
* **Speaker:**
  > *"Welcome to ClearTrace Labs. Traditional generative LLMs have a fatal flaw in high-stakes finance, legal, and compliance operations: when documents disagree, LLMs hallucinate false consensus. If a Purchase Order says 90 units and an Invoice says 100, a standard AI tries to average them or fabricates an unverified excuse.*
  >
  > *ClearTrace takes the opposite approach: 'Two Agents, One Truth'. We deploy two air-gapped AI agents that extract claims in total isolation, and evaluate conflicting statements using SingularityNET MeTTa declarative symbolic logic. Disagreement is not an error to blur away—it is the start of a structured, evidence-first investigation."*

---

## Act 2: The Signature Differentiator: "What Could Help Resolve This?" (0:40 – 1:25)
* **Screen:** Click preset **B2B Procurement (Harlem Fine Arts / Enterprise Benchmark)**. Click **Compare My Documents**.
* **Speaker:**
  > *"Watch this live benchmark: Purchase Order 089 authorizes 90 units at KSh 500, but Supplier Invoice 104 bills 100 units.
  >
  > In 28 milliseconds, ClearTrace isolates the contradiction, flags a KSh 5,000 potential overcharge, and holds approval.
  >
  > But here is ClearTrace's signature differentiator: instead of stopping at the mismatch, ClearTrace asks: 'What evidence would resolve this?'
  >
  > It guides the auditor with domain-specific recommendations: a Countersigned PO Amendment (PO-AMD) to prove authorization, or a Goods Received Note (GRN) to prove delivery.
  >
  > Let's click 'Add Supporting Evidence for this Finding'. We attach Change Order Docket A-02. Clicking Compare re-evaluates the case: the outcome instantly updates to 'Verified by Third Record (Supported)'—cleanly resolving the dispute without hallucinating."*

---

## Act 3: Across Partner Tracks: Music Royalties & Oral Histories (1:25 – 2:05)
* **Screen:** Click preset **Incantio Music IP (Challenge 2 & 7)**, then switch to **AI for Peace (Challenge 4)**.
* **Speaker:**
  > *"ClearTrace runs the same engine across all creative and cultural domains:
  >
  > For Incantio Music IP, a signed split sheet gives a producer 50%, while a DSP remits only 35%. ClearTrace calculates the exact 15 percentage-point gap and a verified $1,800 monetary shortfall on $12,000 revenue.
  >
  > For AI for Peace, two archival oral histories report conflicting dates for the 1969 Peace Exchange—August 12 versus August 19. ClearTrace preserves the contradiction with verbatim citations until contemporary printed evidence corroborates the opening ceremony."*

---

## Act 4: Glass Box & "The Agent That Grows Up" Rule Studio (2:05 – 2:40)
* **Screen:** Scroll to **Deep Technical Verification, Atomspace & Rule Studio**. Click **Hierarchical Merkle Tree Visualizer**, then **MeTTa Atomspace Inspector**, then **Rule-Learning Studio**.
* **Speaker:**
  > *"For technical judges looking for a true Glass Box Agent:
  >
  > 1. Our Hierarchical Merkle Tree Visualizer hashes every claim, round, and finding into a 6-layer SHA-256 tree reproducible offline via our CLI.
  > 2. The MeTTa Atomspace Inspector exposes the active typed Atomspace and declarative rewrite rules.
  > 3. And in our Rule-Learning Studio—fulfilling Challenge 2 'The Agent That Grows Up'—the system visibly learns. We select the 5% Procurement Tolerance Waiver, inspect the live side-by-side rule diff, and click 'Teach Agent Rule'. It compiles dynamically into the MeTTa Atomspace and re-evaluates the case live!"*

---

## Act 5: Accountable Sign-Off & What We Will Build Next (2:40 – 3:00)
* **Screen:** Open **Auditor Sign-Off Form** (demonstrate explicit reviewer name, formal action selection, rationale), click **Sign & Seal**, and show downloaded PDF report.
* **Speaker:**
  > *"To finalize, an auditor records an explicit sign-off with mandatory justification, sealing the decision permanently into the cryptographic ledger.
  >
  > What would we build next?
  > We will connect ClearTrace directly to decentralized on-chain escrow smart contracts (SingularityNET / Base) to automatically release payments only when cryptographic MeTTa Merkle proofs verify 100% agreement.
  >
  > ClearTrace Labs: Reconcile Conflicting Documents. Prove Every Fact. Zero Hallucination. Thank you!"*

---

## Quick-Check Checklist for Recording
- [x] Backend running on `http://localhost:8000` (`python3 -m uvicorn backend.main:app --port 8000 --reload`)
- [x] Frontend running on `http://localhost:5173` (`cd frontend && npm run dev`)
- [x] Database pre-seeded with all 3 domain cases (`python3 scripts/seed_presets.py`)
- [x] All 33 unit tests pass (`python3 -m pytest tests/ -v`)
- [x] CLI validator tested: `python3 scripts/validate_proof.py --case-id=CT-B1534BBE`

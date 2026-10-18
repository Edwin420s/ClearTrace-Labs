# ClearTrace Labs — 3-Minute Video Presentation Script

> **Event:** BASIX State of the Art Hackathon (October 2026)  
> **Track:** Track 02 — Omega AI Agents (Levels 1–3) • **Challenge:** Two Agents, One Truth  
> **Presenter:** Edwin Mwiti (Lead, ClearTrace Labs)  
> **Total Target Duration:** 3 Minutes (180 Seconds)

---

## Act 1: The Problem & The Solution (0:00 – 0:40)
* **Visual:** Browser showing ClearTrace Labs UI header and Track 02 badge.
* **Spoken Script:**
  > *"Hello, judges and organizers. I am Edwin Mwiti, presenting ClearTrace Labs. Traditional generative LLMs operate on probabilities: when faced with contradictory accounts, they guess or smooth over differences by inventing plausible compromises. In cultural history and creative royalties, guessing causes severe harm.*
  >
  > *Under Track 02: Two Agents, One Truth, ClearTrace replaces hallucination with deterministic symbolic deduction. Built on SingularityNET MeTTa and Omega stateful memory, ClearTrace lets two independent agents investigate evidence, challenge unsupported claims, and reason to verifiable truth."*

---

## Act 2: Live Demo — AI for Peace Narrative Mediation (0:40 – 1:35)
* **Visual:** Select Preset 1 (`peace`). Click **Load & Reconcile Case**. Show the findings table and negotiation timeline.
* **Spoken Script:**
  > *"Here is ClearTrace in action on our primary partner brief: AI for Peace. Two community archives describe the 1969 Cultural Peace Exchange. Agent A examines the Harlem Living Archive; Agent B examines the Nairobi Oral History Chronicle in complete isolation.*
  >
  > *During negotiation, they agree on the venue and keynote speaker. But on the event date, Harlem records August 12 while Nairobi records August 19. Notice what ClearTrace does: it refuses to invent a middle date; it preserves the contradiction in red with full attribution.*
  >
  > *Now watch this: we toggle on the third independent archive—a contemporaneous printed programme. We re-run reconciliation. In Round 3, Agent B discovers the corroborating programme, revises its position, and MeTTa deductively resolves the start date to August 12 with a complete audit trail."*

---

## Act 3: Live Demo — Incantio Creative Rights & B2B Invoices (1:35 – 2:20)
* **Visual:** Switch to Preset 2 (`rights`), then demonstrate Preset 3 (`invoice`).
* **Spoken Script:**
  > *"Next, our second partner brief: Incantio. A co-writer split sheet claims 50% ownership, while the DSP streaming statement reports only 35%. ClearTrace separates the 15 percentage-point allocation gap from verified financial loss, calculating the exact $1,800 monetary underpayment on $12,000 eligible revenue.*
  >
  > *In our registered B2B invoice case, an unapproved 10-unit excess billing triggers an automatic payment lockout until an authorized PO amendment confirms delivery of 100 units."*

---

## Act 4: Architecture, Replay Proofs & What's Next (2:20 – 3:00)
* **Visual:** Click **Replay Proof** tab, click **Verify Cryptographic Proof Now**, then show the **Rule Studio ("Agent That Grows Up")**.
* **Spoken Script:**
  > *"Under the hood, ClearTrace runs MeTTa S-expression rewrite rules in a typed Atomspace. Every case decision is sealed into a cryptographic SHA-256 Merkle Replay Certificate that any auditor can verify offline with our CLI.*
  >
  > *We also satisfy 'The Agent That Grows Up': auditors can teach the engine new MeTTa rules live in our Rule Studio. Next, we are integrating on-chain settlement rails via ASI Chain to automatically release escrowed royalties upon MeTTa verification. Thank you!"*

---

## Checklist Before Recording
1. Start backend: `python3 -m uvicorn backend.main:app --port 8000 --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Verify `/health` reports `status: online` and active MeTTa rules.
4. Pre-seed the cases: `python3 scripts/seed_presets.py`
5. Ensure recording resolution is 1080p, audio is clear, and keep strictly within 180 seconds.

<!-- Presentation calibrated for exact 3:00 minute runtime per Hackathon Rule 09. -->

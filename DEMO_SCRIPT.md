# ClearTrace Labs — 3-Minute Video Presentation Script

> **Event:** BASIX State of the Art Hackathon (October 2026)  
> **Track:** Track 02 — Omega AI Agents (Levels 1–3) • **Challenge:** Two Agents, One Truth  
> **Presenter:** Edwin Mwiti (Lead, ClearTrace Labs)  
> **Total Target Duration:** 3 Minutes (180 Seconds)

---

## Act 1: The Problem & The Solution (0:00 – 0:40)
* **Visual:** Browser showing ClearTrace Labs UI header at `http://localhost:5173` with clean typography and `Evidence-First` badge.
* **Spoken Script:**
  > *"Hello, judges and organizers. I am Edwin Mwiti, presenting ClearTrace Labs. Traditional generative LLMs operate on probabilities: when faced with contradictory accounts, they guess or smooth over differences by inventing plausible compromises. In cultural history, procurement, and creative royalties, guessing causes severe harm.*
  >
  > *Under Track 02: Two Agents, One Truth, ClearTrace replaces hallucination with deterministic symbolic deduction. Built on SingularityNET MeTTa and Omega stateful memory, ClearTrace lets two independent agents investigate evidence, challenge unsupported claims, and reason to verifiable truth."*

---

## Act 2: Live Demo — Simple Mode & Procurement Overcharge (0:40 – 1:30)
* **Visual:** Select Preset: **Procurement (90 vs 100 Units · KSh 5,000 Overcharge)**. Show Document A (PO) and Document B (Invoice) textareas. Click **Compare My Documents**.
* **Spoken Script:**
  > *"ClearTrace was designed for everyday users through three simple actions: Add documents, Compare, and Understand the results.*
  >
  > *Here, a buyer authorized 90 units on Purchase Order 089, but the supplier billed for 100 units on Invoice 104. In seconds, ClearTrace isolates the discrepancy, explains the root cause in plain English, and quantifies the exact financial exposure: a KSh 5,000 potential overcharge.*
  >
  > *Now, what if we have third-party proof? We enable 'Have a third document to help verify the result?' and inject the Signed PO Amendment. Clicking Compare resolves the authorized quantity with verifiable proof, without synthetic guessing."*

---

## Act 3: Live Demo — Incantio Creative Rights & AI for Peace (1:30 – 2:15)
* **Visual:** Switch to **Music Royalties** preset, click Compare, then switch to **Oral History** preset.
* **Spoken Script:**
  > *"Next, our partner briefs. In creative music rights with Incantio, a producer split sheet claims 50% while the DSP remitted 35%. ClearTrace highlights the 15 percentage-point gap and calculates the exact $1,800 missing payout on $12,000 revenue.*
  >
  > *In our AI for Peace case, Harlem and Nairobi oral chronicles disagree on the 1969 festival start date—August 12 versus August 19. Notice what ClearTrace does: it refuses to invent a middle date; it preserves the contradiction with full attribution until independent evidence resolves it."*

---

## Act 4: Advanced Audit Mode, Cryptographic Seals & Roadmap (2:15 – 3:00)
* **Visual:** Toggle to **Advanced Audit Mode**. Show the Multi-Agent Negotiation Timeline, record a quick Human Review decision, and click **Verify Decision Replay**.
* **Spoken Script:**
  > *"For judges and compliance officers, switching to Advanced Audit Mode reveals the technical engine: traceable multi-agent negotiation rounds, human review adjudication that commits sign-offs to a tamper-evident audit ledger, and cryptographic SHA-256 Merkle Decision Replay.*
  >
  > *Every finding is mathematically sealed and reproducible offline via our CLI. Next, we are integrating on-chain settlement rails via ASI Chain to automatically release escrowed royalties upon MeTTa verification. Thank you!"*

---

## Checklist Before Recording
1. Start backend: `python3 -m uvicorn backend.main:app --port 8000 --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Verify `/health` reports `status: online` and active MeTTa rules.
4. Pre-seed the cases: `python3 scripts/seed_presets.py`
5. Ensure recording resolution is 1080p, audio is clear, and keep strictly within 180 seconds.

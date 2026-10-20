# ClearTrace Labs — Platform Specification & Capability Guide

## 1. Product Overview

### Project Title
`ClearTrace Labs`

### Tagline
`Evidence-grounded multi-agent reconciliation engine that detects document discrepancies, quantifies material impact, and preserves unresolved disputes without synthetic hallucinations.`

### Executive Description
ClearTrace Labs is an evidence-first multi-agent truth reconciliation engine built for high-stakes audits, legal agreements, procurement verification, and historical preservation. Traditional LLM-based reconcilers tend to guess or hallucinate synthetic middle-ground averages when documents disagree. ClearTrace replaces guessing with deterministic SingularityNET MeTTa symbolic deduction, structured multi-agent negotiation, and cryptographic SHA-256 decision replay certificates.

Users can compare any two conflicting records (e.g., Purchase Order vs. Supplier Invoice, Artist Split Sheet vs. DSP Royalty Statement, or conflicting technical specifications) to immediately see:
1. Field-by-field comparisons with exact source quotes and citations.
2. Distinct, responsible trust classifications: Matches Exactly, Discrepancy (Needs Review), Verified by Third Record, or Single-Document Note.
3. Quantified financial exposure (e.g., $1,800 royalty underpayment or KSh 5,000 procurement overbilling).
4. Permanent cryptographic decision replay proofs and human reviewer audit sign-offs.

---

## 2. Core Protocol & Execution Pipeline

ClearTrace operates on an isolated-intake, 5-stage multi-round negotiation protocol:
1. **Isolated Ingestion**: Agent A (Record Verifier) and Agent B (Context Challenger) ingest source documents in separate memory contexts, eliminating confirmation bias.
2. **Deterministic MeTTa Atomspace Reasoning**: Facts are mapped to typed MeTTa S-expressions. 14 symbolic rewrite rules evaluate equivalence, detect contradictions, and guard against false consensus.
3. **Structured Negotiation Timeline**: Agents exchange formal documentary citations across multi-round negotiation phases. Unresolved conflicts are explicitly preserved rather than hallucinated away.
4. **Independent 3rd-Party Corroboration**: An optional third source (e.g., signed addendum, delivery note, contemporaneous programme) can be injected in Round 3 to resolve contested facts.
5. **Cryptographic Decision Replay & Audit Chain**: Every step, evidence quote, and rule execution is hashed into a SHA-256 Merkle tree. A tamper-evident replay certificate allows any auditor or compliance officer to verify offline that findings were generated without post-hoc manipulation.

---

## 3. Product Architecture

| Architectural Layer | Implementation | Purpose |
| :--- | :--- | :--- |
| **User Experience** | Dual-Mode React 18 + Tailwind UI | Simple 3-step action mode for business users and Advanced Audit mode for compliance auditors. |
| **API Server** | FastAPI (Python 3.10+) | High-performance asynchronous API endpoints for document extraction, case reconciliation, and report generation. |
| **Reasoning Substrate** | SingularityNET Hyperon / MeTTa | Declarative symbolic rewrite rules evaluated in an Atomspace with zero probabilistic hallucination. |
| **Audit Ledger** | SQLite + SHA-256 Hash Chain | Append-only event store where each case milestone is chained to previous events cryptographically. |
| **Offline Verification** | Standalone Python CLI (`scripts/verify_replay_cert.py`) | Offline verification reproducing Merkle roots and decision hashes from exported certificates. |

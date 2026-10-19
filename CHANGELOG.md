# Changelog

All notable changes to the **ClearTrace Labs** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-10-19 — Advanced Features & Enhanced Verification Release

### Added
- **Ad-Hoc Custom Case Reconciliation**: `POST /api/cases/quick-reconcile` and Tab 6 Custom Case Studio allowing users and judges to paste arbitrary unformatted documents and reconcile live with MeTTa.
- **Automated Text Extraction Fallbacks**: Regex and heuristic extractors in `RecordVerifierAgentA` and `ContextChallengerAgentB` to extract dates, percentages, amounts, and entities from raw text.
- **Hierarchical Merkle Tree Layer Engine**: Multi-level tree calculation (`compute_merkle_tree_layers`) and `GET /api/cases/{case_id}/merkle-tree` endpoint for visual inspection of cryptographic proofs.
- **Live Atomspace Inspector**: `GET /api/metta/space` and live dashboard card in Tab 5 inspecting loaded rewrite rules and types.
- **Executive Markdown Reports**: `GET /api/cases/{case_id}/report.md` generating formatted audit documents.
- **Standalone Certificate Export**: `GET /api/cases/{case_id}/certificate` and UI download button.
- **Offline CLI Proof Validator**: `scripts/validate_proof.py` tool.
- **Status Filter Pills**: Quick finding filters (`ALL`, `CONTRADICTION`, `AGREEMENT`, `EVIDENCE_SUPPORTED`, `SOURCE_EXCLUSIVE`) in Tab 1.
- **Extended Test Suite**: 20 comprehensive automated pytest test suites (100% passing).

---

## [1.0.0] - 2026-10-19 — BASIX State of the Art Hackathon Release

### Added
- **Track 02 Implementation**: Complete stateful multi-agent system addressing "Two Agents, One Truth" challenge.
- **Dual-Runtime MeTTa Engine**: Native SingularityNET Hyperon support + embedded symbolic S-expression reduction engine with step-by-step reduction traces.
- **Air-Gapped Ingestion**: Phase 1 isolated source extraction where Agent A and Agent B analyze disparate documents independently.
- **5-Stage Negotiation Protocol**:
  - Stage 1: Isolated Extraction
  - Stage 2: Direct Claim Alignment & Divergence Detection
  - Stage 3: Structured Evidence Citation & Challenge
  - Stage 4: 3rd-Party Corroboration Integration
  - Stage 5: Symbolic Rule Reduction & Dispute Preservation
- **Preserved Contradictions**: Rejection of artificial hallucinated compromise when corroborating evidence is absent.
- **Cryptographic SHA-256 Decision Replay Certificates**: Complete Merkle-tree verified proof ensuring decisions are deterministic and independently verifiable offline.
- **Tamper-Evident SHA-256 Audit Trail**: Hash-chained event log (`prev_hash` -> `curr_hash`) protecting case actions against modification.
- **Dynamic Rule Studio ("The Agent That Grows Up")**: Dynamic MeTTa rule synthesis allowing human auditors to inject new domain axioms at runtime.
- **Multi-Domain Presets**:
  - AI for Peace: Harlem ↔ Nairobi oral history mediation.
  - Incantio Music Rights: Co-writer split sheets vs. DSP streaming statements.
  - Operational B2B: Purchase order vs. supplier invoice dispute.
- **Modern React 18 + Vite Frontend**: 7 interactive workspaces with dark mode, responsive styling (desktop, tablet, mobile), live Merkle root verification, and one-click JSON audit bundle exports.
- **Full Containerization & Cloud Manifests**: `Dockerfile.backend`, `Dockerfile.frontend`, `docker-compose.yml`, `nginx.conf`, `render.yaml`, `railway.json`, `fly.toml`, `vercel.json`.
- **Automated Test Matrix**: 10/10 passing pytest acceptance suite.

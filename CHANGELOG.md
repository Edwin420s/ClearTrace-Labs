# Changelog

All notable changes to the **ClearTrace Labs** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2026-10-19 — Dual-Mode Architecture & Responsible Trust Release

### Added
- **Dual-Mode User Experience**:
  - **Simple Mode (Default)**: Streamlined 3-action workflow (Add Documents, Understand Results, Next Steps) designed for business users and non-technical auditors.
  - **Advanced Audit Mode**: Dedicated interface for hackathon judges and compliance engineers featuring multi-agent negotiation timelines, human review adjudication forms, and cryptographic decision replay verification.
- **Responsible Trust Categorization**:
  - `Agreement Between Sources` explicitly distinguished from external verification.
  - `Supported by Independent Evidence` reserved strictly for corroborating 3rd documents.
  - Transparent `Conflict Detected` and `Document-Exclusive Note` classifications.
- **Financial Exposure Quantification**: Real-time dollar and shilling exposure metrics on discrepancy cards (e.g., $1,800 royalty underpayment, KSh 5,000 procurement overcharge).
- **Frontend Modularization**: Split monolith into `components/` (`DocumentInputs`, `FindingsSummary`, `NextSteps`, `AdvancedAudit`, `TrustBadge`, `Icons`) and `data/` (`scenarios.js`).
- **Comprehensive Master Verification**: Integrated frontend production build checks into `scripts/run_all_verifications.sh`.

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

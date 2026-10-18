# ClearTrace Labs — REST API Reference & Data Contracts

## Base URL
Default local development port: `http://localhost:8000`

---

## Endpoints

### 1. Health & Engine Status
* **`GET /health`**
  * Returns engine status, runtime active status, and number of rules loaded in the MeTTa Atomspace.
  * Response:
  ```json
  {
    "status": "online",
    "service": "ClearTrace Labs Multi-Agent Truth Engine",
    "track": "Track 02: Omega AI Agents",
    "challenge": "Two Agents, One Truth",
    "metta_hyperon_runtime_active": true,
    "rules_file_loaded": true,
    "total_active_metta_rules": 14
  }
  ```

---

### 2. Presets & Cases
* **`GET /api/presets`**: Returns all built-in demonstration cases (`peace`, `rights`, `invoice`).
* **`GET /api/cases`**: Lists all cases in the SQLite database.
* **`POST /api/cases`**: Creates a new custom reconciliation case.
* **`POST /api/cases/from-preset/{preset_id}`**: Instantiates a synthetic demonstration case (`peace`, `rights`, `invoice`).
* **`GET /api/cases/{case_id}`**: Retrieves case metadata, sources, and audit status.

---

### 3. Multi-Agent Reconciliation & MeTTa Evaluation
* **`POST /api/cases/{case_id}/reconcile`**
  * Initiates Phase 1 isolated extractions and Phase 2–5 structured negotiation rounds.
  * Body:
  ```json
  {
    "negotiation_round_limit": 3,
    "include_corroboration": false
  }
  ```
  * Returns complete findings, step-by-step reduction traces, financial impacts, and cryptographic replay certificate.

* **`GET /api/cases/{case_id}/report`**: Retrieves the persisted reconciliation report.

---

### 4. Human Review & Adjudication
* **`POST /api/cases/{case_id}/review`**
  * Records human auditor approval or escalation onto the SHA-256 hash chain.
  * Body:
  ```json
  {
    "reviewer_name": "Edwin Mwiti (Lead Auditor)",
    "action": "REQUEST_EVIDENCE",
    "reason": "Requesting original printed programme to verify start date."
  }
  ```

---

### 5. Cryptographic Replay & Verification
* **`GET /api/cases/{case_id}/replay-cert`**: Fetches the SHA-256 Merkle Replay Certificate.
* **`POST /api/cases/{case_id}/verify-replay`**: Runs live mathematical verification of the decision certificate.
* **`GET /api/cases/{case_id}/audit`**: Verifies full SHA-256 blockchain-style event chain integrity.
* **`GET /api/cases/{case_id}/export`**: Exports the complete self-contained JSON audit bundle.

---

### 6. Dynamic MeTTa Rule Synthesis ("The Agent That Grows Up")
* **`POST /api/rules/custom`**
  * Injects a new MeTTa rewrite rule dynamically into the Atomspace:
  ```json
  {
    "rule_name": "lenient_crowd_margin",
    "domain": "peace",
    "rule_text": "(= (classify-claims \"attendee_estimate\" $a $b $c $t) (AGREEMENT attendee_estimate \"RECONCILED\"))",
    "created_by": "Edwin Mwiti"
  }
  ```
* **`GET /api/rules/custom`**: Lists all active custom rules.

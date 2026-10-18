# ClearTrace Labs — Incantio Creative Rights & Royalty Reconciliation Specification

**Track 02 Partner Brief**: Incantio.com Music Business & Rights as Rules  
**Brief Requirement**: *"Royalty reconciliation: Platform and label statements disagree — agents find the missing money."*  
**Problem Context**: Co-writer split sheets vs. DSP streaming statements (Spotify, Apple Music, YouTube)  

---

## 1. Industry Context & The Royalty Gap

In independent music distribution and sync licensing:
- **Master Rights & Composition Rights**: Independent creators frequently sign split sheets during recording sessions (e.g., 50% / 50% composition ownership).
- **DSP / Aggregator Reporting Errors**: When digital service providers (DSPs) pay out quarterly royalties, reporting statements frequently misattribute artist shares or apply wrong publisher cuts (e.g., reporting 35% instead of 50%).
- **The Accounting Trap**: Discrepancies are often conflated between:
  1. **Percentage-Point Allocation Gap**: A contractual disagreement over relative ownership.
  2. **Monetary Underpayment ($ USD)**: The actual dollar amount withheld or misrouted, which depends strictly on verified eligible gross revenue and territory matching.

---

## 2. ClearTrace Labs Symbolic Math Formulation

ClearTrace Labs enforces mathematically sound, deterministic rules:

### A. Percentage-Point Allocation Gap:
$$\Delta_{\text{pct}} = |\text{Agreed Pct} - \text{Reported Pct}|$$
$$\Delta_{\text{pct}} = |50.0\% - 35.0\%| = 15.0 \text{ percentage points}$$

*(Note: We do not report relative error $\frac{15}{50} = 30\%$, but honest contractual percentage-point variance).*

### B. Monetary Underpayment Calculation:
Monetary underpayment is calculated **only** when eligible gross revenue and territory match:
$$\text{Expected Payout} = \text{Eligible Gross Revenue} \times \left(\frac{\text{Agreed Pct}}{100}\right)$$
$$\text{Expected Payout} = \$12,000.00 \times 0.50 = \$6,000.00$$

$$\text{Reported Payout} = \text{Eligible Gross Revenue} \times \left(\frac{\text{Reported Pct}}{100}\right)$$
$$\text{Reported Payout} = \$12,000.00 \times 0.35 = \$4,200.00$$

$$\text{Disputed Amount (USD)} = \text{Expected Payout} - \text{Reported Payout} = \$1,800.00$$

---

## 3. MeTTa Symbolic Rules (`metta/rules/incantio_rights.metta`)

```metta
;; Split Sheet Ownership Axiom
(= (evaluate-royalty-split $agreedPct $reportedPct)
   (if (== $agreedPct $reportedPct)
       (RULE_VERIFIED split_percentage $agreedPct)
       (CONTRADICTION split_percentage $agreedPct $reportedPct)))

;; Automated Payout Derivation
(= (calculate-royalty-underpayment $grossRev $agreedPct $reportedPct)
   (let* (($expected (* $grossRev (/ $agreedPct 100.0)))
          ($reported (* $grossRev (/ $reportedPct 100.0)))
          ($disputed (- $expected $reported)))
     (FINANCIAL_IMPACT $expected $reported $disputed "USD")))
```

---

## 4. Integration with Incantio.com Platform

1. **Pre-Listing Verification**: Before a track is listed on [Incantio.com](https://incantio.com) for sync licensing, ClearTrace Labs audits the split sheet against the registration metadata.
2. **Deterministic Settlement Lockout**: If an unresolved `CONTRADICTION` is flagged on `split_percentage`, the system locks automated payout disbursement until an authorized reviewer adjudicates the case.
3. **Audit Trail**: Every DSP discrepancy flag produces a tamper-evident SHA-256 event, providing proof for legal publisher claims.

<!-- Clarifies mathematical distinction between percentage points and calculated USD. -->

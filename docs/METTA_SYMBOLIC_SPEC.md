# ClearTrace Labs — MeTTa Symbolic Formal Specification

## Abstract
This document formalizes the declarative symbolic reduction semantics implemented in ClearTrace Labs under the SingularityNET Hyperon / MeTTa (Meta Type Talk) framework.

---

## 1. Type Ontology (`metta/ontology/types.metta`)

```metta
(: Entity Type)
(: Property Type)
(: Value Type)
(: Source Type)
(: Confidence Type)
(: Status Type)
(: Evidence Type)
(: Agent Type)
(: Stage Type)

(: AGREEMENT Status)
(: CONTRADICTION Status)
(: EVIDENCE_SUPPORTED Status)
(: SOURCE_EXCLUSIVE Status)
(: INSUFFICIENT_EVIDENCE Status)
(: RULE_VERIFIED Status)
(: RULE_VERIFIED_MISMATCH Status)
(: NEEDS_HUMAN_REVIEW Status)
(: HUMAN_RESOLVED Status)
```

---

## 2. Core Deductive Rewrite Rules (`metta/rules/core_reconciliation.metta`)

### Rule 1: Pairwise Claim Classification
$$\text{classify-claims}(p, v_A, v_B, v_{corr}, v_{truth})$$

```metta
(= (classify-claims $prop $valA $valB $corroboratedVal $sourceTruthVal)
   (if (and (== $valA $valB) (not (== $valA $sourceTruthVal)))
       (RULE_VERIFIED_MISMATCH $prop $valA $sourceTruthVal)
       (if (== $valA $valB)
           (AGREEMENT $prop $valA)
           (if (== $corroboratedVal $valA)
               (EVIDENCE_SUPPORTED $prop $valA "Source_A_Corroborated")
               (if (== $corroboratedVal $valB)
                   (EVIDENCE_SUPPORTED $prop $valB "Source_B_Corroborated")
                   (CONTRADICTION $prop $valA $valB))))))
```

* **Guard 1 (False Consensus Rejection)**: If both agents agree ($v_A = v_B$), but source-level deterministic truth establishes $v_A \neq v_{truth}$, the engine rejects the consensus and asserts `(RULE_VERIFIED_MISMATCH ...)`.
* **Guard 2 (Mutual Agreement)**: If $v_A = v_B$ and verified, reduces to `(AGREEMENT $prop $valA)`.
* **Guard 3 (3rd-Party Corroboration)**: If $v_{corr} = v_A$, resolves in favor of Source A; if $v_{corr} = v_B$, resolves in favor of Source B.
* **Guard 4 (Contradiction Preservation)**: If uncorroborated, reduces to `(CONTRADICTION $prop $valA $valB)`.

---

## 3. Domain Logic Rules

### A. AI for Peace (`metta/rules/peace_narrative.metta`)
* Prohibits intermediate date generation:
```metta
(= (evaluate-narrative-date $harlemDate $nairobiDate $corroboratedDate)
   (if (== $harlemDate $nairobiDate)
       (AGREEMENT event_date $harlemDate)
       (if (== $corroboratedDate $harlemDate)
           (EVIDENCE_SUPPORTED event_date $harlemDate "Harlem_Programme_Corroborated")
           (if (== $corroboratedDate $nairobiDate)
               (EVIDENCE_SUPPORTED event_date $nairobiDate "Nairobi_Reel_Corroborated")
               (CONTRADICTION event_date $harlemDate $nairobiDate)))))
```

### B. Incantio Creative Rights (`metta/rules/incantio_rights.metta`)
* Differentiates percentage points from monetary underpayment:
$$\Delta_{pct} = \text{AgreedPct} - \text{ReportedPct}$$
$$\text{Shortfall} = \text{EligibleGross} \times \frac{\Delta_{pct}}{100}$$

```metta
(= (calculate-monetary-shortfall $eligibleRevenue $agreedPct $reportedPct)
   (* $eligibleRevenue (/ (- $agreedPct $reportedPct) 100.0)))
```

### C. Operational Invoice Dispute (`metta/rules/invoice_dispute.metta`)
* Purchase Order vs Billed Quantity & Amendment matching:
```metta
(= (evaluate-invoice-quantity $poQty $invQty $amendedQty)
   (if (== $poQty $invQty)
       (RULE_VERIFIED authorized_quantity $invQty)
       (if (== $amendedQty $invQty)
           (EVIDENCE_SUPPORTED authorized_quantity $invQty "Approved_Amendment_Verified")
           (CONTRADICTION authorized_quantity $poQty $invQty))))
```

<!-- Note: S-expression rewrite engine adheres to SingularityNET Hyperon semantics. -->
<!-- Dynamic rules compile directly into the shared space. -->

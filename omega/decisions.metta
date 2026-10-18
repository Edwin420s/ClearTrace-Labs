;; ============================================================================
;; ClearTrace Labs — Omega Cognitive Architecture: decisions.metta
;; Deterministic Safety Policies & Actuation Lockout Gates
;; ============================================================================

;; SAFETY POLICY 01: Prohibition of Synthetic Hallucination
;; If two narrative dates conflict and no 3rd-party primary record exists,
;; the engine MUST preserve the contradiction.
(= (enforce-narrative-safety $valA $valB $corrVal)
   (if (== $valA $valB)
       "SAFE_CONSENSUS"
       (if (== $corrVal $valA)
           "RESOLVED_BY_CORROBORATION_A"
           (if (== $corrVal $valB)
               "RESOLVED_BY_CORROBORATION_B"
               "SAFETY_PRESERVE_CONTRADICTION"))))

;; SAFETY POLICY 02: Financial Discrepancy Gate
;; If billed units exceed PO units by > 0 and no signed amendment is verified,
;; payment authorization MUST BE LOCKED OUT.
(= (check-payment-lockout $excessUnits $hasSignedAmendment)
   (if (> $excessUnits 0)
       (if (== $hasSignedAmendment True)
           "PAYMENT_AUTHORIZED_WITH_AMENDMENT"
           "PAYMENT_HARD_LOCKOUT_UNAUTHORIZED_VARIANCE")
       "PAYMENT_AUTHORIZED_STANDARD"))

;; SAFETY POLICY 03: Human Review Escalation
(= (requires-human-review $disputeType)
   (if (or (== $disputeType "CONTRADICTION") (== $disputeType "RULE_VERIFIED_MISMATCH"))
       True
       False))

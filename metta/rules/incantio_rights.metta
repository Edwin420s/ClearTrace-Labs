;; ============================================================================
;; ClearTrace Labs — Incantio Creative Rights & Royalty Rules
;; Domain: Co-Writer Split Sheets vs DSP Settlement Statements
;; Rule Principle: Honest financial math & explicit clause audit trail
;; ============================================================================

;; Evaluate royalty split percentage
(= (evaluate-royalty-split $agreedPct $reportedPct)
   (if (== $agreedPct $reportedPct)
       (RULE_VERIFIED split_percentage $agreedPct)
       (CONTRADICTION split_percentage $agreedPct $reportedPct)))

;; Calculate percentage point discrepancy
(= (calculate-pct-discrepancy $agreedPct $reportedPct)
   (- $agreedPct $reportedPct))

;; Calculate monetary underpayment if revenue and territory match
(= (calculate-monetary-shortfall $eligibleRevenue $agreedPct $reportedPct)
   (* $eligibleRevenue (/ (- $agreedPct $reportedPct) 100.0)))

;; Verify sync licensing clearance
(= (verify-sync-status $contractSync $dspSync)
   (if (== $contractSync $dspSync)
       (RULE_VERIFIED sync_terms $contractSync)
       (CONTRADICTION sync_terms $contractSync $dspSync)))

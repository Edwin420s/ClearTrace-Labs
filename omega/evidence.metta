;; Omega Cognitive Architecture Layer
;; ============================================================================
;; ClearTrace Labs — Omega Cognitive Architecture: evidence.metta
;; Source Credibility, Provenance, and Corroboration Scoring
;; ============================================================================

;; Base Credibility Ratings (0.0 to 1.0)
(source-tier primary_contract 0.98)
(source-tier institutional_archive 0.92)
(source-tier third_party_corroborator 0.90)
(source-tier oral_history_tape 0.82)
(source-tier counterparty_invoice 0.80)
(source-tier unverified_estimate 0.40)

;; Calculate Joint Provenance Score for Corroborated Claims
(= (joint-provenance-score $tierSource $tierCorroborator)
   (let* (($w1 (match &self (source-tier $tierSource $s1) $s1 0.70))
          ($w2 (match &self (source-tier $tierCorroborator $s2) $s2 0.70)))
         (/ (+ $w1 $w2) 2.0)))

;; Corroboration Verification Threshold
(= (is-corroboration-sufficient $jointScore)
   (>= $jointScore 0.85))

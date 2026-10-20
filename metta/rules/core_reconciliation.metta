;; ============================================================================
;; ClearTrace Labs — Core Symbolic Reconciliation Rules
;; Substrate: SingularityNET Hyperon / MeTTa
;; Architecture: Multi-Agent Truth & Consensus Engine
;; ============================================================================

;; Primary rule for classifying pairwise claims with optional corroboration and ground truth verification
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

;; Rule for unilateral / source-exclusive claims
(= (classify-exclusive $prop $source $val)
   (SOURCE_EXCLUSIVE $prop $source $val))

;; Rule for missing evidence on both sides
(= (classify-missing $prop)
   (INSUFFICIENT_EVIDENCE $prop))

;; Confidence scoring rule based on status
(= (evaluate-confidence $status $corroborated)
   (if (== $status "AGREEMENT")
       0.95
       (if (== $status "EVIDENCE_SUPPORTED")
           0.90
           (if (== $status "SOURCE_EXCLUSIVE")
               0.75
               (if (== $status "CONTRADICTION")
                   0.20
                   0.10)))))

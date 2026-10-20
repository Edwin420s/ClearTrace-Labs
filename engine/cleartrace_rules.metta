;; ============================================================================
;; ClearTrace Labs — Symbolic Reasoning & Multi-Agent Reconciliation Rules
;; Substrate: SingularityNET Hyperon / MeTTa
;; Architecture: Multi-Agent Truth & Consensus Engine
;; ============================================================================

(: Entity Type)
(: Property Type)
(: Value Type)
(: Source Type)
(: Status Type)

;; Symbolic classification rule for two aligned claims + optional corroboration
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

;; Symbolic rule for unilateral / source-exclusive claims
(= (classify-exclusive $prop $source $val)
   (SOURCE_EXCLUSIVE $prop $source $val))

;; Symbolic rule for royalty percentage-point comparison
(= (evaluate-royalty-split $agreedPct $reportedPct)
   (if (== $agreedPct $reportedPct)
       (RULE_VERIFIED split_percentage $agreedPct)
       (CONTRADICTION split_percentage $agreedPct $reportedPct)))

;; Symbolic rule for invoice quantity vs purchase order quantity + amendment
(= (evaluate-invoice-quantity $poQty $invQty $amendedQty)
   (if (== $poQty $invQty)
       (RULE_VERIFIED authorized_quantity $invQty)
       (if (== $amendedQty $invQty)
           (EVIDENCE_SUPPORTED authorized_quantity $invQty "Approved_Amendment_Verified")
           (CONTRADICTION authorized_quantity $poQty $invQty))))

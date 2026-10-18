;; ============================================================================
;; ClearTrace Labs — AI for Peace Narrative Mediation Rules
;; Domain: Harlem & Nairobi Cross-Cultural Oral History Reconciliation
;; Rule Principle: Preserve historical variance without synthetic compromises
;; ============================================================================

;; Evaluate oral history date claims
(= (evaluate-narrative-date $harlemDate $nairobiDate $corroboratedDate)
   (if (== $harlemDate $nairobiDate)
       (AGREEMENT event_date $harlemDate)
       (if (== $corroboratedDate $harlemDate)
           (EVIDENCE_SUPPORTED event_date $harlemDate "Harlem_Programme_Corroborated")
           (if (== $corroboratedDate $nairobiDate)
               (EVIDENCE_SUPPORTED event_date $nairobiDate "Nairobi_Reel_Corroborated")
               (CONTRADICTION event_date $harlemDate $nairobiDate)))))

;; Check oral history attendee estimates (allowing soft ranges)
(= (evaluate-attendee-estimates $harlemEst $nairobiEst)
   (if (== $harlemEst $nairobiEst)
       (AGREEMENT attendee_estimate $harlemEst)
       (CONTRADICTION attendee_estimate $harlemEst $nairobiEst)))

;; Check bilateral accord signing
(= (verify-accord $signedAccord)
   (if (not (== $signedAccord "NONE"))
       (RULE_VERIFIED accord_signed $signedAccord)
       (INSUFFICIENT_EVIDENCE accord_signed)))

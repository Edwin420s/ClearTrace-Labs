;; ============================================================================
;; ClearTrace Labs — Omega Cognitive Architecture: negotiation.metta
;; 5-Stage Multi-Round Negotiation Protocol State Machine
;; ============================================================================

;; Allowed Transitions in the 5-Stage Negotiation Loop
(valid-transition STAGE_1_INDEPENDENT_ASSESSMENT STAGE_2_DISAGREEMENT_DETECTION)
(valid-transition STAGE_2_DISAGREEMENT_DETECTION STAGE_3_EVIDENCE_EXCHANGE)
(valid-transition STAGE_3_EVIDENCE_EXCHANGE STAGE_4_RULE_VERIFICATION)
(valid-transition STAGE_4_RULE_VERIFICATION STAGE_5_RESOLUTION_OR_ESCALATION)

;; Round Termination Guard
(= (should-continue-negotiation $currentRound $maxRounds $unresolvedCount)
   (if (> $unresolvedCount 0)
       (if (< $currentRound $maxRounds)
           True
           False)
       False))

;; Protocol Action Recommendation
(= (determine-stage-action $stage $disputeStatus)
   (if (== $stage "STAGE_1_INDEPENDENT_ASSESSMENT")
       "EXTRACT_ISOLATED_CLAIMS"
       (if (== $stage "STAGE_2_DISAGREEMENT_DETECTION")
           "COMPARE_CANONICAL_PROPERTIES"
           (if (== $stage "STAGE_3_EVIDENCE_EXCHANGE")
               "EXCHANGE_CITATIONS_AND_COUNTER_EVIDENCE"
               (if (== $stage "STAGE_4_RULE_VERIFICATION")
                   "EVALUATE_METTA_RULES_AND_CORROBORATION"
                   (if (== $disputeStatus "UNRESOLVED")
                       "ESCALATE_TO_HUMAN_REVIEWER"
                       "EMIT_VERIFIED_CONSENSUS"))))))

;; Omega Cognitive Architecture Layer
;; ============================================================================
;; ClearTrace Labs — Omega Cognitive Architecture: outcomes.metta
;; Closed-Loop Learning & Human Adjudication Feedback
;; ============================================================================

;; Record human reviewer decision
(= (record-human-adjudication $caseId $prop $action $chosenValue $auditorNote)
   (assert-atom &self (human-resolution $caseId $prop $action $chosenValue $auditorNote)))

;; Update source credibility weight after audit confirmation
(= (update-source-reliability $sourceId $wasCorrect)
   (if (== $wasCorrect True)
       "SOURCE_CREDIBILITY_PROMOTED"
       "SOURCE_CREDIBILITY_PENALIZED"))

;; Dynamic Rule Addition ("The Agent That Grows Up")
;; Allows human experts to register new declarative reconciliation rules
(= (register-custom-rule $ruleExpression)
   (assert-atom &self $ruleExpression))

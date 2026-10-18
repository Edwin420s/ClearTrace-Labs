;; Omega Cognitive Architecture Layer
;; ============================================================================
;; ClearTrace Labs — Omega Cognitive Architecture: memory.metta
;; Persistent Semantic, Episodic, and Agent Belief Spaces
;; ============================================================================

;; 1. SEMANTIC MEMORY: Domain Entities & Standard Verification Thresholds
(domain-spec peace "AI for Peace Narrative Mediation")
(domain-spec rights "Incantio Creative Rights & Royalty Reconciliation")
(domain-spec invoice "Operational Purchase Order vs Supplier Invoice")

;; Tolerance limits: Financial discrepancy threshold in percentage points
(tolerance-threshold rights split_percentage 0.0)
(tolerance-threshold invoice authorized_quantity 0.0)
(tolerance-threshold peace attendee_estimate 50.0)

;; 2. EPISODIC MEMORY: Multi-Round Negotiation Register
;; Represents history of claims exchanged between Agent A and Agent B
(= (record-episodic-step $caseId $round $agent $prop $val $evidence)
   (assert-atom &self (episodic-trace $caseId $round $agent $prop $val $evidence)))

;; 3. AGENT BELIEF STATES: Current Working Hypotheses
(= (get-agent-belief $caseId $agent $prop)
   (match &self (agent-belief $caseId $agent $prop $currentVal)
          $currentVal
          "UNCOMMITTED"))

;; 4. DISPUTE PRESERVATION REGISTER
;; Preserves unresolved contradictions rather than smoothing them over
(= (preserve-dispute $caseId $prop $valA $valB $reason)
   (assert-atom &self (unresolved-dispute $caseId $prop $valA $valB $reason)))

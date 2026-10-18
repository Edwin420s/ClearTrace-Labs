;; Verified for SingularityNET Hyperon runtime
;; ============================================================================
;; ClearTrace Labs — Core MeTTa Type Ontology
;; Track 02: Omega AI Agents — Two Agents, One Truth
;; ============================================================================

(: Entity Type)
(: Property Type)
(: Value Type)
(: Source Type)
(: Confidence Type)
(: Status Type)
(: Evidence Type)
(: Agent Type)
(: Stage Type)

;; Status Constructors
(: AGREEMENT Status)
(: CONTRADICTION Status)
(: EVIDENCE_SUPPORTED Status)
(: SOURCE_EXCLUSIVE Status)
(: INSUFFICIENT_EVIDENCE Status)
(: RULE_VERIFIED Status)
(: RULE_VERIFIED_MISMATCH Status)
(: NEEDS_HUMAN_REVIEW Status)
(: HUMAN_RESOLVED Status)

;; Agent Constructors
(: Agent_A_Record_Verifier Agent)
(: Context_Challenger_Agent_B Agent)
(: Human_Reviewer Agent)

;; Stages in Multi-Round Negotiation
(: STAGE_1_INDEPENDENT_ASSESSMENT Stage)
(: STAGE_2_DISAGREEMENT_DETECTION Stage)
(: STAGE_3_EVIDENCE_EXCHANGE Stage)
(: STAGE_4_RULE_VERIFICATION Stage)
(: STAGE_5_RESOLUTION_OR_ESCALATION Stage)

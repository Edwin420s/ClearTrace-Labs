;; ============================================================================
;; ClearTrace Labs — Omega Registered Skill Interfaces
;; ============================================================================

(: IngestSourceClaim (-> Source Entity Property Value Evidence Outcome))
(: ChallengeAssumption (-> Agent Property Value CounterEvidence Outcome))
(: QueryCorroboration (-> Property Value ThirdPartyRecord Outcome))
(: FormulateConsensus (-> Property Value Confidence Status Outcome))
(: GenerateReplayProof (-> CaseId DecisionDigest CryptographicCertificate))

(= (describe-skill IngestSourceClaim)
   "Extracts structured claim with exact source citation and evidence text without looking at counterparty records.")

(= (describe-skill ChallengeAssumption)
   "Cross-examines counterparty claim by proposing alternative hypotheses and requesting documentary proof.")

(= (describe-skill QueryCorroboration)
   "Queries independent third-party records (programmes, amendments, settlement sheets) to resolve deadlocks.")

(= (describe-skill FormulateConsensus)
   "Translates verified claims into deterministic consensus findings or freezes contradictions for human review.")

(= (describe-skill GenerateReplayProof)
   "Generates a SHA-256 Merkle root and tamper-evident replay certificate for independent verification.")

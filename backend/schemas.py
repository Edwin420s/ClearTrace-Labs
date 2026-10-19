"""
ClearTrace Labs — Pydantic Data Contracts & Schemas (Pydantic v2).
Defines typed models for cases, sources, extracted claims, negotiation rounds,
symbolic findings, financial calculations, replay certificates, and audit events.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class SourceDocumentInput(BaseModel):
    label: str = Field(..., description="Human-readable title of the document or record")
    source_role: str = Field(..., description="'source_a', 'source_b', or 'corroborator'")
    raw_text: str = Field(..., description="Complete raw text or transcript extract")
    structured_claims: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Structured claims: [{entity, property_name, value, evidence_ref, original_text}]",
    )
    metadata: Dict[str, Any] = Field(default_factory=dict)


class CreateCaseRequest(BaseModel):
    title: str
    domain: str = Field(default="peace", description="Domain e.g. 'peace', 'rights', 'invoice', or custom domain")
    description: Optional[str] = None
    sources: List[SourceDocumentInput]


class ExtractedClaimRecord(BaseModel):
    claim_id: str
    case_id: Optional[str] = None
    source_id: str
    source_label: str
    source_role: Optional[str] = None
    agent_id: str
    entity: str
    raw_property: str
    canonical_property: str
    value: Any
    normalized_value: str
    evidence_ref: str
    original_text: str
    claim_type: Optional[str] = "direct_statement"
    confidence: Optional[float] = 0.95
    uncertainty_note: Optional[str] = None


class NegotiationStep(BaseModel):
    round_number: int
    stage: str
    property_name: str
    speaker_agent: str
    message_type: str
    position_before: str
    position_after: str
    evidence_cited: str
    reasoning: str


class FinancialImpactRecord(BaseModel):
    domain: str
    percentage_point_discrepancy: Optional[float] = None
    contracted_percentage: Optional[float] = None
    reported_percentage: Optional[float] = None
    eligible_revenue_usd: Optional[float] = None
    expected_payout_usd: Optional[float] = None
    reported_payout_usd: Optional[float] = None
    disputed_amount_usd: Optional[float] = None
    ordered_quantity: Optional[float] = None
    billed_quantity: Optional[float] = None
    excess_units_billed: Optional[float] = None
    unit_price_ksh: Optional[float] = None
    disputed_amount_ksh: Optional[float] = None
    calculation_basis: str


class ReconciledFindingRecord(BaseModel):
    property_name: str
    entity: str
    status: str
    agent_agreement: bool
    source_verified: bool
    value_a: Optional[Any] = None
    value_b: Optional[Any] = None
    agent_a_value: Optional[Any] = None
    agent_b_value: Optional[Any] = None
    corroborated_value: Optional[Any] = None
    resolved_value: Optional[Any] = None
    evidence_ref_a: Optional[str] = None
    evidence_ref_b: Optional[str] = None
    evidence_ref_corroboration: Optional[str] = None
    agent_a_evidence: Optional[str] = None
    agent_b_evidence: Optional[str] = None
    corroborating_evidence: Optional[str] = None
    confidence_score: float = 0.95
    metta_expression: str = ""
    metta_output: str = ""
    metta_reduction_trace: List[Dict[str, Any]] = Field(default_factory=list)
    explanation: str = ""
    recommended_action: Optional[str] = None
    financial_impact: Optional[Dict[str, Any]] = None


class ReplayCertificate(BaseModel):
    case_id: str
    domain: str
    decision_digest: str
    merkle_root: str
    timestamp: str
    ruleset_signature: str
    status: str
    verification_hash: str


class ReconciliationReportResponse(BaseModel):
    case_id: str
    domain: str
    title: str
    status: str
    metta_runtime_active: bool
    summary: Dict[str, Any]
    findings: List[ReconciledFindingRecord]
    timeline_or_ledger: List[Dict[str, Any]]
    negotiation_history: List[NegotiationStep]
    replay_certificate: Optional[ReplayCertificate] = None
    created_at: str


class ReconcileRequest(BaseModel):
    negotiation_round_limit: int = 3
    include_corroboration: bool = False


class ReviewDecisionRequest(BaseModel):
    reviewer_name: str
    action: str = Field(..., description="'ACCEPT_RESOLVED', 'REQUEST_EVIDENCE', 'ESCALATE_DISPUTE', 'OVERRIDE'")
    reason: str


class CustomRuleInput(BaseModel):
    rule_name: str
    domain: str
    rule_text: str
    created_by: str = "Lead Auditor"


class CustomRuleRecord(BaseModel):
    id: int
    rule_name: str
    domain: str
    rule_text: str
    created_by: str
    is_active: bool
    created_at: str


class AuditChainVerificationResponse(BaseModel):
    case_id: str
    is_valid: bool
    total_events: int
    genesis_hash: str
    latest_hash: str
    errors: List[str]


class CaseExportBundle(BaseModel):
    case: Dict[str, Any]
    sources: List[Dict[str, Any]]
    negotiation_steps: List[Dict[str, Any]]
    report: Optional[Dict[str, Any]]
    audit_chain: List[Dict[str, Any]]
    replay_certificate: Optional[Dict[str, Any]]
    custom_rules: List[Dict[str, Any]]

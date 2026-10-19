"""
ClearTrace Labs — Domain & System Constants
Defines canonical status constructors, confidence weights, and domain labels.
"""

from typing import Dict

# Canonical Truth & Verification Statuses
STATUS_AGREEMENT = "AGREEMENT"
STATUS_RULE_VERIFIED = "RULE_VERIFIED"
STATUS_CONTRADICTION = "CONTRADICTION"
STATUS_EVIDENCE_SUPPORTED = "EVIDENCE_SUPPORTED"
STATUS_SOURCE_EXCLUSIVE = "SOURCE_EXCLUSIVE"
STATUS_INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"
STATUS_NEEDS_HUMAN_REVIEW = "NEEDS_HUMAN_REVIEW"
STATUS_HUMAN_RESOLVED = "HUMAN_RESOLVED"

# Default Confidence Scoring Weights
STATUS_CONFIDENCE_WEIGHTS: Dict[str, float] = {
    STATUS_AGREEMENT: 0.95,
    STATUS_RULE_VERIFIED: 0.98,
    STATUS_EVIDENCE_SUPPORTED: 0.90,
    STATUS_SOURCE_EXCLUSIVE: 0.75,
    STATUS_CONTRADICTION: 0.20,
    STATUS_INSUFFICIENT_EVIDENCE: 0.10,
    STATUS_NEEDS_HUMAN_REVIEW: 0.50,
    STATUS_HUMAN_RESOLVED: 0.99,
}

# Domain Metadata & Descriptive Labels
DOMAIN_METADATA = {
    "peace": {
        "title": "AI for Peace Narrative Mediation",
        "brief": "Cross-cultural oral history truth & reconciliation",
        "primary_entity": "Historical Event",
    },
    "rights": {
        "title": "Incantio Creative Rights & Royalties",
        "brief": "Split sheet contract vs DSP streaming remittance",
        "primary_entity": "Music Composition",
    },
    "invoice": {
        "title": "Operational B2B Dispute",
        "brief": "Purchase Order vs Supplier Invoice billing variance",
        "primary_entity": "Purchase Order Line",
    },
    "esg": {
        "title": "ESG Scope 1 Emissions Audit",
        "brief": "Facility carbon disclosure vs independent auditor",
        "primary_entity": "Emissions Scope",
    },
    "clinical": {
        "title": "Clinical Trial Protocol Verification",
        "brief": "Site administration log vs central pharmacy dispensing",
        "primary_entity": "Clinical Protocol",
    },
}

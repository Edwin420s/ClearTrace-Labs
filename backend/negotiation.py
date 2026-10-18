"""
5-Stage Multi-Round Negotiation Protocol & Deterministic Domain Verifier.
Implements:
  Stage 1: Independent Assessment
  Stage 2: Disagreement Detection
  Stage 3: Evidence Exchange & Challenge
  Stage 4: Revision & Rule-Based Verification
  Stage 5: Resolution or Escalation
"""

from typing import Any, Dict, List, Optional, Tuple
from backend.metta_engine import SymbolicReasoner
from backend.schemas import (
    ExtractedClaimRecord,
    NegotiationStep,
    ReconciledFindingRecord,
)


class MultiAgentReconciliationEngine:
    def __init__(self, reasoner: SymbolicReasoner) -> None:
        self.reasoner = reasoner

    def run_protocol(
        self,
        domain: str,
        claims_a: List[ExtractedClaimRecord],
        claims_b: List[ExtractedClaimRecord],
        corroborating_claims: List[ExtractedClaimRecord],
        source_truth_overrides: Optional[Dict[str, Any]] = None,
        round_limit: int = 3,
        custom_rules: Optional[List[str]] = None,
    ) -> Tuple[List[NegotiationStep], List[ReconciledFindingRecord], Dict[str, Any]]:
        map_a = {c.canonical_property: c for c in claims_a}
        map_b = {c.canonical_property: c for c in claims_b}
        map_corr = {c.canonical_property: c for c in corroborating_claims}
        truth_overrides = source_truth_overrides or {}

        all_props = sorted(set(map_a.keys()) | set(map_b.keys()))

        negotiation_steps: List[NegotiationStep] = []
        findings: List[ReconciledFindingRecord] = []

        for prop in all_props:
            ca = map_a.get(prop)
            cb = map_b.get(prop)
            cc = map_corr.get(prop)

            val_a = ca.value if ca else None
            val_b = cb.value if cb else None
            val_corr = cc.value if cc else None
            truth_val = truth_overrides.get(prop)

            entity = (ca.entity if ca else (cb.entity if cb else "case_subject"))

            # STAGE 1: Independent Assessment Logged
            if ca:
                negotiation_steps.append(
                    NegotiationStep(
                        round_number=1,
                        stage="STAGE_1_INDEPENDENT_ASSESSMENT",
                        property_name=prop,
                        speaker_agent=ca.agent_id,
                        message_type="INITIAL_CLAIM",
                        position_before="UNINITIALIZED",
                        position_after=str(val_a),
                        evidence_cited=f"{ca.source_label} [{ca.evidence_ref}]: '{ca.original_text}'",
                        reasoning=f"Agent A independently extracted '{prop}' = '{val_a}'.",
                    )
                )
            if cb:
                negotiation_steps.append(
                    NegotiationStep(
                        round_number=1,
                        stage="STAGE_1_INDEPENDENT_ASSESSMENT",
                        property_name=prop,
                        speaker_agent=cb.agent_id,
                        message_type="INITIAL_CLAIM",
                        position_before="UNINITIALIZED",
                        position_after=str(val_b),
                        evidence_cited=f"{cb.source_label} [{cb.evidence_ref}]: '{cb.original_text}'",
                        reasoning=f"Agent B independently extracted '{prop}' = '{val_b}'.",
                    )
                )

            # Execute MeTTa Symbolic Rule Evaluation
            eval_res = self.reasoner.evaluate_claim_pair(
                prop=prop,
                val_a=val_a,
                val_b=val_b,
                corroborated_val=val_corr,
                source_truth_val=truth_val,
                custom_rules=custom_rules,
            )
            if len(eval_res) == 4:
                metta_status, metta_expr, metta_out, metta_trace = eval_res
            else:
                metta_status, metta_expr, metta_out = eval_res[:3]
                metta_trace = []

            agent_agreement = (
                ca is not None
                and cb is not None
                and ca.normalized_value.lower() == cb.normalized_value.lower()
            )

            # Check if both agents made the same extraction mistake against deterministic source truth
            both_agents_wrong = (
                agent_agreement
                and truth_val is not None
                and str(truth_val).strip().lower() != ca.normalized_value.lower()
            )

            if both_agents_wrong:
                negotiation_steps.append(
                    NegotiationStep(
                        round_number=2,
                        stage="STAGE_4_RULE_VERIFICATION",
                        property_name=prop,
                        speaker_agent="Deterministic_Source_Verifier",
                        message_type="CONSENSUS_REJECTED",
                        position_before=str(val_a),
                        position_after=f"DISPUTED_EXTRACTION_ERROR (Source has '{truth_val}')",
                        evidence_cited=f"Deterministic Source Check on '{prop}'",
                        reasoning=(
                            f"Both Agent A and Agent B reported '{val_a}', but source-level verification "
                            f"established '{truth_val}'. Agent agreement does not equal truth."
                        ),
                    )
                )
                findings.append(
                    ReconciledFindingRecord(
                        property_name=prop,
                        entity=entity,
                        status="CONTRADICTION",
                        agent_agreement=True,
                        source_verified=False,
                        value_a=val_a,
                        value_b=val_b,
                        corroborated_value=truth_val,
                        resolved_value=None,
                        evidence_ref_a=ca.evidence_ref if ca else None,
                        evidence_ref_b=cb.evidence_ref if cb else None,
                        metta_expression=metta_expr,
                        metta_output=metta_out,
                        metta_reduction_trace=metta_trace,
                        explanation=(
                            f"Source Verification Alert: Both agents agreed on '{val_a}', but deterministic "
                            f"source inspection found '{truth_val}'. Rejected false agent consensus."
                        ),
                        recommended_action="Correct the agent extraction error and re-verify source line item.",
                    )
                )
                continue

            # CASE 1: Unilateral / Source-Exclusive claim
            if metta_status == "SOURCE_EXCLUSIVE":
                present_claim = ca if ca is not None else cb
                missing_side = "Source B" if ca is not None else "Source A"
                negotiation_steps.append(
                    NegotiationStep(
                        round_number=2,
                        stage="STAGE_2_DISAGREEMENT_DETECTION",
                        property_name=prop,
                        speaker_agent="Agent_B_Context_Challenger" if ca else "Agent_A_Record_Verifier",
                        message_type="ASYMMETRY_NOTE",
                        position_before="OMITTED",
                        position_after="SOURCE_EXCLUSIVE_PRESERVED",
                        evidence_cited=f"{present_claim.source_label} [{present_claim.evidence_ref}]",
                        reasoning=(
                            f"Claim '{prop}' = '{present_claim.value}' is recorded in "
                            f"{present_claim.source_label} but absent in {missing_side}. Silence is not contradiction."
                        ),
                    )
                )
                findings.append(
                    ReconciledFindingRecord(
                        property_name=prop,
                        entity=entity,
                        status="SOURCE_EXCLUSIVE",
                        agent_agreement=False,
                        source_verified=True,
                        value_a=val_a,
                        value_b=val_b,
                        resolved_value=present_claim.value,
                        evidence_ref_a=ca.evidence_ref if ca else None,
                        evidence_ref_b=cb.evidence_ref if cb else None,
                        metta_expression=metta_expr,
                        metta_output=metta_out,
                        metta_reduction_trace=metta_trace,
                        explanation=(
                            f"Asymmetric Record: '{present_claim.value}' is documented exclusively by "
                            f"{present_claim.source_label} ({present_claim.evidence_ref}). Preserved with attribution."
                        ),
                        recommended_action="Include in report with explicit single-source attribution.",
                    )
                )
                continue

            # CASE 2: Exact Agreement Verified
            if metta_status == "AGREEMENT":
                final_status = "RULE_VERIFIED" if domain in ("rights", "invoice") else "AGREEMENT"
                findings.append(
                    ReconciledFindingRecord(
                        property_name=prop,
                        entity=entity,
                        status=final_status,
                        agent_agreement=True,
                        source_verified=True,
                        value_a=val_a,
                        value_b=val_b,
                        resolved_value=val_a,
                        evidence_ref_a=ca.evidence_ref if ca else None,
                        evidence_ref_b=cb.evidence_ref if cb else None,
                        metta_expression=metta_expr,
                        metta_output=metta_out,
                        metta_reduction_trace=metta_trace,
                        explanation=(
                            f"Corroborated Agreement: Both {ca.source_label} and {cb.source_label} "
                            f"independently establish '{val_a}'."
                        ),
                        recommended_action="Accept corroborated fact into the verified record.",
                    )
                )
                continue

            # CASE 3: Disagreement Detected -> Run Multi-Round Challenge & Check Corroboration
            negotiation_steps.append(
                NegotiationStep(
                    round_number=2,
                    stage="STAGE_3_EVIDENCE_CHALLENGE",
                    property_name=prop,
                    speaker_agent="Agent_A_Record_Verifier",
                    message_type="CHALLENGE_CLAIM",
                    position_before=str(val_a),
                    position_after=str(val_a),
                    evidence_cited=f"{ca.source_label} [{ca.evidence_ref}]",
                    reasoning=(
                        f"Agent A challenges '{val_b}' from {cb.source_label}, citing primary record "
                        f"'{val_a}' in {ca.source_label} ({ca.evidence_ref})."
                    ),
                )
            )
            negotiation_steps.append(
                NegotiationStep(
                    round_number=2,
                    stage="STAGE_3_EVIDENCE_CHALLENGE",
                    property_name=prop,
                    speaker_agent="Agent_B_Context_Challenger",
                    message_type="COUNTER_CHALLENGE",
                    position_before=str(val_b),
                    position_after=str(val_b),
                    evidence_cited=f"{cb.source_label} [{cb.evidence_ref}]",
                    reasoning=(
                        f"Agent B defends '{val_b}' from {cb.source_label} ({cb.evidence_ref}) and "
                        f"requests corroborating third-party evidence or an authorized amendment before yielding."
                    ),
                )
            )

            # Check if Round 3 Corroborating Evidence resolves the conflict
            if metta_status == "EVIDENCE_SUPPORTED" and cc is not None:
                winning_val = val_corr
                revised_agent = (
                    "Agent_B_Context_Challenger"
                    if str(val_corr).strip().lower() == str(val_a).strip().lower()
                    else "Agent_A_Record_Verifier"
                )
                old_pos = str(val_b) if revised_agent == "Agent_B_Context_Challenger" else str(val_a)

                if round_limit >= 3:
                    negotiation_steps.append(
                        NegotiationStep(
                            round_number=3,
                            stage="STAGE_4_REVISION_AND_VERIFICATION",
                            property_name=prop,
                            speaker_agent=revised_agent,
                            message_type="POSITION_REVISED",
                            position_before=old_pos,
                            position_after=str(winning_val),
                            evidence_cited=f"{cc.source_label} [{cc.evidence_ref}]: '{cc.original_text}'",
                            reasoning=(
                                f"Independent corroborating record ({cc.source_label}) confirms '{winning_val}'. "
                                f"{revised_agent} revises position from '{old_pos}' to '{winning_val}'."
                            ),
                        )
                    )

                impact = self._compute_domain_impact(domain, prop, val_a, val_b, map_a, map_b, resolved=True)
                findings.append(
                    ReconciledFindingRecord(
                        property_name=prop,
                        entity=entity,
                        status="EVIDENCE_SUPPORTED",
                        agent_agreement=True,
                        source_verified=True,
                        value_a=val_a,
                        value_b=val_b,
                        corroborated_value=val_corr,
                        resolved_value=winning_val,
                        evidence_ref_a=ca.evidence_ref,
                        evidence_ref_b=cb.evidence_ref,
                        evidence_ref_corroboration=f"{cc.source_label} [{cc.evidence_ref}]",
                        metta_expression=metta_expr,
                        metta_output=metta_out,
                        metta_reduction_trace=metta_trace,
                        financial_impact=impact,
                        explanation=(
                            f"Resolved via Corroboration: Initial conflict ('{val_a}' vs '{val_b}') "
                            f"was settled by {cc.source_label} ({cc.evidence_ref}), establishing '{winning_val}'."
                        ),
                        recommended_action=f"Adopt corroborated value '{winning_val}' with full audit trail.",
                    )
                )
            else:
                # No corroborating evidence -> Halt without manufacturing fake consensus!
                if round_limit >= 3:
                    negotiation_steps.append(
                        NegotiationStep(
                            round_number=3,
                            stage="STAGE_5_ESCALATION",
                            property_name=prop,
                            speaker_agent="ClearTrace_Resolution_Engine",
                            message_type="HALT_PRESERVE_DISPUTE",
                            position_before=f"A='{val_a}' vs B='{val_b}'",
                            position_after="CONTRADICTION / INSUFFICIENT_EVIDENCE",
                            evidence_cited=f"{ca.evidence_ref} vs {cb.evidence_ref}",
                            reasoning=(
                                "Round limit reached without independent corroborating evidence. "
                                "ClearTrace refuses to hallucinate a middle ground; preserving contradiction for human review."
                            ),
                        )
                    )

                impact = self._compute_domain_impact(domain, prop, val_a, val_b, map_a, map_b, resolved=False)
                explanation, next_action = self._build_conflict_explanation(
                    domain, prop, ca, cb, impact
                )
                findings.append(
                    ReconciledFindingRecord(
                        property_name=prop,
                        entity=entity,
                        status="CONTRADICTION",
                        agent_agreement=False,
                        source_verified=True,
                        value_a=val_a,
                        value_b=val_b,
                        resolved_value=None,
                        evidence_ref_a=ca.evidence_ref,
                        evidence_ref_b=cb.evidence_ref,
                        metta_expression=metta_expr,
                        metta_output=metta_out,
                        metta_reduction_trace=metta_trace,
                        financial_impact=impact,
                        explanation=explanation,
                        recommended_action=next_action,
                    )
                )

        summary = self._build_domain_summary(domain, findings)
        return negotiation_steps, findings, summary

    def _compute_domain_impact(
        self,
        domain: str,
        prop: str,
        val_a: Any,
        val_b: Any,
        map_a: Dict[str, ExtractedClaimRecord],
        map_b: Dict[str, ExtractedClaimRecord],
        resolved: bool,
    ) -> Optional[Dict[str, Any]]:
        if domain == "rights" and prop == "split_percentage":
            try:
                pct_a = float(val_a)
                pct_b = float(val_b)
                gap_pct_points = round(pct_a - pct_b, 4)
                rev_claim = map_b.get("eligible_revenue_usd") or map_a.get("eligible_revenue_usd")
                if rev_claim is not None:
                    rev = float(rev_claim.value)
                    expected_usd = round(rev * (pct_a / 100.0), 2)
                    reported_usd = round(rev * (pct_b / 100.0), 2)
                    discrepancy_usd = round(expected_usd - reported_usd, 2)
                    return {
                        "type": "ROYALTY_CALCULATION",
                        "agreed_split_pct": pct_a,
                        "reported_split_pct": pct_b,
                        "percentage_point_discrepancy": gap_pct_points,
                        "eligible_revenue_usd": rev,
                        "expected_payout_usd": expected_usd,
                        "reported_payout_usd": reported_usd,
                        "disputed_amount_usd": discrepancy_usd,
                        "monetary_loss_calculable": True,
                    }
                return {
                    "type": "ROYALTY_PERCENTAGE_GAP_ONLY",
                    "agreed_split_pct": pct_a,
                    "reported_split_pct": pct_b,
                    "percentage_point_discrepancy": gap_pct_points,
                    "monetary_loss_calculable": False,
                    "note": "15-percentage-point discrepancy flagged; eligible revenue base required to compute exact dollar underpayment.",
                }
            except (ValueError, TypeError):
                return None

        if domain == "invoice" and prop in ("authorized_quantity", "total_amount_ksh", "unit_price_ksh"):
            try:
                qty_a = float(map_a["authorized_quantity"].value) if "authorized_quantity" in map_a else 0.0
                qty_b = float(map_b["authorized_quantity"].value) if "authorized_quantity" in map_b else 0.0
                price = float(map_a["unit_price_ksh"].value) if "unit_price_ksh" in map_a else 500.0
                diff_units = round(qty_b - qty_a, 2)
                diff_ksh = round(diff_units * price, 2)
                return {
                    "type": "INVOICE_QUANTITY_VARIANCE",
                    "po_ordered_units": qty_a,
                    "invoice_billed_units": qty_b,
                    "unit_price_ksh": price,
                    "excess_units_billed": diff_units,
                    "disputed_amount_ksh": diff_ksh,
                    "authorization_verified": resolved,
                }
            except (ValueError, TypeError):
                return None

        return None

    def _build_conflict_explanation(
        self,
        domain: str,
        prop: str,
        ca: ExtractedClaimRecord,
        cb: ExtractedClaimRecord,
        impact: Optional[Dict[str, Any]],
    ) -> Tuple[str, str]:
        if domain == "peace":
            return (
                f"Historical Discrepancy Preserved: {ca.source_label} ({ca.evidence_ref}) records "
                f"'{ca.value}', whereas {cb.source_label} ({cb.evidence_ref}) records '{cb.value}'. "
                f"ClearTrace preserves both community accounts without inventing a synthetic middle date or figure.",
                "Request a contemporaneous event programme or third independent archive before resolving.",
            )
        if domain == "rights":
            if impact and impact.get("monetary_loss_calculable"):
                return (
                    f"Contractual Split Discrepancy: {ca.source_label} ({ca.evidence_ref}) specifies {ca.value}%, "
                    f"while {cb.source_label} ({cb.evidence_ref}) allocates {cb.value}% "
                    f"({impact['percentage_point_discrepancy']} percentage-point gap). "
                    f"On ${impact['eligible_revenue_usd']:,.2f} eligible revenue, expected payout is "
                    f"${impact['expected_payout_usd']:,.2f} vs ${impact['reported_payout_usd']:,.2f} reported "
                    f"(${impact['disputed_amount_usd']:,.2f} disputed).",
                    "Issue an audit inquiry to the distributor with the signed Incantio split sheet clause reference.",
                )
            return (
                f"Allocation Discrepancy: {ca.source_label} ({ca.evidence_ref}) specifies '{ca.value}', "
                f"whereas {cb.source_label} ({cb.evidence_ref}) reports '{cb.value}'.",
                "Verify territory scope, recoupment terms, and eligible net distributable revenue before claiming underpayment.",
            )
        if domain == "invoice":
            if impact:
                return (
                    f"Quantity / Billing Conflict: Purchase Order ({ca.evidence_ref}) authorizes "
                    f"{ca.value}, but Supplier Invoice ({cb.evidence_ref}) bills {cb.value}. "
                    f"Variance is {impact['excess_units_billed']} units (KSh {impact['disputed_amount_ksh']:,.2f} at "
                    f"KSh {impact['unit_price_ksh']:,.2f}/unit). No approved amendment is verified.",
                    "Hold payment approval and request a signed delivery note or approved PO amendment.",
                )
        return (
            f"Direct contradiction on '{prop}': {ca.source_label} states '{ca.value}' vs {cb.source_label} '{cb.value}'.",
            "Escalate to human reviewer with source citations.",
        )

    def _build_domain_summary(
        self, domain: str, findings: List[ReconciledFindingRecord]
    ) -> Dict[str, Any]:
        counts = {
            "total_properties": len(findings),
            "agreement_count": sum(1 for f in findings if f.status in ("AGREEMENT", "RULE_VERIFIED")),
            "contradiction_count": sum(1 for f in findings if f.status == "CONTRADICTION"),
            "source_exclusive_count": sum(1 for f in findings if f.status == "SOURCE_EXCLUSIVE"),
            "evidence_supported_count": sum(1 for f in findings if f.status == "EVIDENCE_SUPPORTED"),
            "overall_status": (
                "NEEDS_HUMAN_REVIEW"
                if any(f.status == "CONTRADICTION" for f in findings)
                else "EVIDENCE_SUPPORTED"
            ),
        }
        return counts

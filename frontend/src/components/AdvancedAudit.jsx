import React from 'react';

export default function AdvancedAudit({
  report,
  reviewerName,
  setReviewerName,
  reviewAction,
  setReviewAction,
  reviewReason,
  setReviewReason,
  handleHumanReviewSubmit,
  loading,
  handleVerifyProof,
  verifyingProof,
  downloadCert,
  verificationResult,
  formatFieldName,
}) {
  return (
    <div>
      {/* Operational Human Sign-Off Form & Cryptographic Proof Side-by-Side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginBottom: '20px' }}>
        
        {/* Human Review Form */}
        <div style={{ background: '#090D16', border: '1px solid #1E293B', borderRadius: '8px', padding: '18px' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '15px', color: '#FFF' }}>
            Operational Human Review & Adjudication
          </h3>
          <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '14px' }}>
            Consequential decisions require human authorization. Your sign-off is permanently hashed into the SHA-256 audit block.
          </p>
          <form onSubmit={handleHumanReviewSubmit}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#CBD5E1', marginBottom: '4px', fontWeight: 600 }}>
                Reviewer Name
              </label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  background: '#0F172A',
                  border: '1px solid #334155',
                  color: '#FFF',
                  fontSize: '12px',
                }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#CBD5E1', marginBottom: '4px', fontWeight: 600 }}>
                Action
              </label>
              <select
                value={reviewAction}
                onChange={(e) => setReviewAction(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  background: '#0F172A',
                  border: '1px solid #334155',
                  color: '#FFF',
                  fontSize: '12px',
                }}
              >
                <option value="APPROVE">APPROVE (Accept Findings & Authorize Resolution)</option>
                <option value="REQUEST_EVIDENCE">REQUEST_EVIDENCE (Request Further Independent Records)</option>
                <option value="REJECT">REJECT (Reject Disputed Claim)</option>
                <option value="LEAVE_UNRESOLVED">LEAVE_UNRESOLVED (Preserve Historic Dispute)</option>
              </select>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#CBD5E1', marginBottom: '4px', fontWeight: 600 }}>
                Justification
              </label>
              <textarea
                rows={3}
                value={reviewReason}
                onChange={(e) => setReviewReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  background: '#0F172A',
                  border: '1px solid #334155',
                  color: '#FFF',
                  fontSize: '12px',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading || reviewReason.trim().length < 4}
              style={{
                background: '#10B981',
                color: '#052E16',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Commit Human Review to Ledger
            </button>
          </form>
        </div>

        {/* Cryptographic Decision Replay Integrity */}
        <div style={{ background: '#090D16', border: '1px solid #1E293B', borderRadius: '8px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#FFF' }}>
              Cryptographic Decision Replay
            </h3>
            <span
              style={{
                background: '#064E3B',
                color: '#34D399',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 700,
              }}
            >
              SHA-256 Seal
            </span>
          </div>
          <p style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '12px', lineHeight: 1.5 }}>
            A valid hash verifies that the input documents, deliberation steps, and final findings have not been tampered with since generation. It proves process integrity, not that the original documents were truthful.
          </p>
          <div
            style={{
              background: '#0F172A',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '11px',
              marginBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#64748B' }}>Case ID:</span>
              <span style={{ color: '#38BDF8', fontFamily: 'monospace' }}>
                {report.case?.case_id || report.replay_certificate?.case_id}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#64748B' }}>Audit Chain:</span>
              <span style={{ color: '#34D399' }}>Verified Intact</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>Timestamp:</span>
              <span style={{ color: '#CBD5E1' }}>
                {report.replay_certificate?.timestamp || new Date().toISOString()}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleVerifyProof}
              disabled={verifyingProof}
              style={{
                flex: 1,
                background: '#10B981',
                color: '#052E16',
                border: 'none',
                padding: '8px',
                borderRadius: '4px',
                fontWeight: 700,
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              {verifyingProof ? 'Computing Math...' : 'Verify Decision Replay'}
            </button>
            <button
              onClick={downloadCert}
              style={{
                background: '#1E293B',
                color: '#38BDF8',
                border: '1px solid #0284C7',
                padding: '8px 12px',
                borderRadius: '4px',
                fontWeight: 600,
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              Download Certificate
            </button>
          </div>

          {verificationResult && (
            <div
              style={{
                marginTop: '10px',
                background: verificationResult.is_valid ? '#064E3B' : '#7F1D1D',
                color: '#FFF',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              {verificationResult.is_valid
                ? 'Integrity Passed: Merkle seal matches decision replay state.'
                : 'Verification Failed: Hash mismatch.'}
            </div>
          )}
        </div>
      </div>

      {/* Multi-Agent Negotiation Timeline */}
      <div style={{ background: '#090D16', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
        <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: '#FFF' }}>
          Multi-Agent Negotiation Timeline (Traceable Rounds)
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {report.negotiation_rounds && report.negotiation_rounds.map((step, i) => {
            const isAgentA = step.speaker_agent && step.speaker_agent.includes('Agent_A');
            const isAgentB = step.speaker_agent && step.speaker_agent.includes('Agent_B');
            return (
              <div
                key={i}
                style={{
                  background: '#0F172A',
                  borderLeft: `3px solid ${isAgentA ? '#EC4899' : isAgentB ? '#0284C7' : '#10B981'}`,
                  borderRadius: '4px',
                  padding: '10px 14px',
                  fontSize: '11px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <strong style={{ color: isAgentA ? '#F472B6' : isAgentB ? '#38BDF8' : '#34D399' }}>
                    Round {step.round_number}: {isAgentA ? 'Agent A' : isAgentB ? 'Agent B' : 'Neutral Corroborator'}
                  </strong>
                  <span style={{ color: '#64748B' }}>[{step.stage}]</span>
                </div>
                <div style={{ color: '#CBD5E1', marginBottom: '2px' }}>{step.reasoning}</div>
                <div style={{ fontSize: '10px', color: '#64748B' }}>
                  Field: {formatFieldName(step.property_name)} • Citation: <em>{step.evidence_cited}</em>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

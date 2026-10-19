import React from 'react';

export default function NextSteps({
  onEnableThirdEvidence,
  onOpenAdvancedMode,
  downloadMarkdown,
  downloadCert,
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
      {/* Action Card 1: Add Independent Evidence */}
      <div style={{ background: '#090D16', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase' }}>
          1. Add Supporting Proof
        </div>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFF', marginTop: '4px' }}>
          Have a third record?
        </div>
        <p style={{ fontSize: '12px', color: '#94A3B8', margin: '6px 0 12px', lineHeight: 1.5 }}>
          Enable the optional 3rd document panel above to inject a signed amendment, receipt, or event programme to resolve open conflicts.
        </p>
        <button
          onClick={onEnableThirdEvidence}
          style={{
            background: '#1E293B',
            color: '#38BDF8',
            border: '1px solid #0284C7',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Enable Third Document
        </button>
      </div>

      {/* Action Card 2: Record Human Approval */}
      <div style={{ background: '#090D16', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#10B981', textTransform: 'uppercase' }}>
          2. Record Approval
        </div>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFF', marginTop: '4px' }}>
          Auditor Sign-Off
        </div>
        <p style={{ fontSize: '12px', color: '#94A3B8', margin: '6px 0 12px', lineHeight: 1.5 }}>
          Reviewer records action (<code>APPROVE</code>, <code>REQUEST_EVIDENCE</code>, <code>REJECT</code>) with justification, permanently bound into the audit block.
        </p>
        <button
          onClick={onOpenAdvancedMode}
          style={{
            background: '#10B981',
            color: '#052E16',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Open Review Sign-Off Form
        </button>
      </div>

      {/* Action Card 3: Download Audit Report */}
      <div style={{ background: '#090D16', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#FBBF24', textTransform: 'uppercase' }}>
          3. Finalize & Export
        </div>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFF', marginTop: '4px' }}>
          Export Documentation
        </div>
        <p style={{ fontSize: '12px', color: '#94A3B8', margin: '6px 0 12px', lineHeight: 1.5 }}>
          Download executive Markdown audit report, cryptographic decision certificate, or complete JSON evidence bundle.
        </p>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={downloadMarkdown}
            style={{
              background: '#1E293B',
              color: '#FFF',
              border: '1px solid #334155',
              padding: '6px 10px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Report (.md)
          </button>
          <button
            onClick={downloadCert}
            style={{
              background: '#1E293B',
              color: '#38BDF8',
              border: '1px solid #0284C7',
              padding: '6px 10px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Certificate (.json)
          </button>
        </div>
      </div>
    </div>
  );
}

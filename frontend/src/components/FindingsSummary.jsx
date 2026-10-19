import React from 'react';
import TrustBadge, { OUTCOME_CONFIG } from './TrustBadge';
import { IconChevronDown, IconChevronRight } from './Icons';

export default function FindingsSummary({
  report,
  loading,
  conflictsCount,
  matchesCount,
  resolvedByThirdCount,
  sortedFindings,
  expandedIndex,
  setExpandedIndex,
  formatFieldName,
}) {
  return (
    <section style={{ marginBottom: '24px' }}>
      <div style={{ marginBottom: '14px' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 800,
            color: '#38BDF8',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
          }}
        >
          Action 2
        </div>
        <h2 style={{ margin: '2px 0 0', fontSize: '18px', color: '#FFF', fontWeight: 800 }}>
          Understand the Results
        </h2>
        <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
          See what differs, why it matters, and what you should check next.
        </div>
      </div>

      {!report && !loading ? (
        /* Empty State */
        <div
          style={{
            background: '#0F172A',
            border: '1px dashed #334155',
            borderRadius: '10px',
            padding: '40px 20px',
            textAlign: 'center',
            color: '#94A3B8',
          }}
        >
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
            No comparison run yet
          </div>
          <p style={{ maxWidth: '500px', margin: '0 auto 16px', fontSize: '13px', lineHeight: 1.5 }}>
            Choose a sample scenario above or enter your own documents, then click <strong>Compare My Documents</strong>.
          </p>
        </div>
      ) : report ? (
        <div>
          {/* Plain-Language Outcome Summary Box */}
          <div
            style={{
              background: '#0F172A',
              border: '1px solid #1E293B',
              borderRadius: '10px',
              padding: '18px 22px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFF' }}>
                {conflictsCount === 0
                  ? 'No Unresolved Conflicts Found'
                  : conflictsCount === 1
                  ? 'We found 1 difference'
                  : `We found ${conflictsCount} differences`}
              </div>
              <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>
                {matchesCount} field{matchesCount !== 1 ? 's' : ''} match across both documents. {conflictsCount} need{conflictsCount === 1 ? 's' : ''} attention.
                {resolvedByThirdCount > 0 && ` (${resolvedByThirdCount} resolved via independent 3rd evidence).`}
              </div>
            </div>

            <div
              style={{
                background: conflictsCount > 0 ? '#7F1D1D26' : '#064E3B26',
                color: conflictsCount > 0 ? '#F87171' : '#34D399',
                border: `1px solid ${conflictsCount > 0 ? '#EF4444' : '#10B981'}`,
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 800,
              }}
            >
              {conflictsCount > 0
                ? `${conflictsCount} Conflict${conflictsCount > 1 ? 's' : ''} Detected`
                : 'All Facts Consistent'}
            </div>
          </div>

          {/* Priority Findings Cards (Discrepancies highlighted first) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {sortedFindings.map((f, i) => {
              const isConflict = f.status === 'CONTRADICTION';
              const isSupported = f.status === 'EVIDENCE_SUPPORTED';
              const isExpanded = expandedIndex === i;
              const meta = OUTCOME_CONFIG[f.status] || OUTCOME_CONFIG.SOURCE_EXCLUSIVE;

              return (
                <div
                  key={i}
                  style={{
                    background: '#0F172A',
                    border: `1px solid ${meta.border}`,
                    borderRadius: '8px',
                    padding: '18px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Card Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#FFF' }}>
                        {formatFieldName(f.property_name)}
                      </span>
                    </div>
                    <TrustBadge status={f.status} />
                  </div>

                  {/* Side-by-side comparison */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '12px',
                      background: '#090D16',
                      padding: '12px 14px',
                      borderRadius: '6px',
                      marginBottom: '10px',
                      fontSize: '12px',
                    }}
                  >
                    <div>
                      <div style={{ color: '#64748B', fontSize: '11px', fontWeight: 600 }}>Document A says:</div>
                      <div style={{ color: '#F472B6', fontWeight: 700, marginTop: '2px', fontSize: '14px' }}>
                        {f.value_a !== null && f.value_a !== undefined ? String(f.value_a) : 'Not mentioned'}
                      </div>
                      {f.evidence_ref_a && (
                        <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>
                          Citation: {f.evidence_ref_a}
                        </div>
                      )}
                    </div>

                    <div>
                      <div style={{ color: '#64748B', fontSize: '11px', fontWeight: 600 }}>Document B says:</div>
                      <div style={{ color: '#38BDF8', fontWeight: 700, marginTop: '2px', fontSize: '14px' }}>
                        {f.value_b !== null && f.value_b !== undefined ? String(f.value_b) : 'Not mentioned'}
                      </div>
                      {f.evidence_ref_b && (
                        <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>
                          Citation: {f.evidence_ref_b}
                        </div>
                      )}
                    </div>

                    <div>
                      <div style={{ color: '#64748B', fontSize: '11px', fontWeight: 600 }}>
                        {isSupported
                          ? 'Verified by Independent Proof:'
                          : isConflict
                          ? 'Outcome Status:'
                          : 'Observation:'}
                      </div>
                      <div
                        style={{
                          color: isSupported ? '#60A5FA' : isConflict ? '#F87171' : '#34D399',
                          fontWeight: 700,
                          marginTop: '2px',
                          fontSize: '14px',
                        }}
                      >
                        {isSupported
                          ? String(f.resolved_value)
                          : isConflict
                          ? 'Dispute Preserved (No AI Guessing)'
                          : String(f.resolved_value)}
                      </div>
                      {f.evidence_ref_corroboration && (
                        <div style={{ fontSize: '10px', color: '#60A5FA', marginTop: '2px' }}>
                          Proven by: {f.evidence_ref_corroboration}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Financial Impact Exposure Card (If Applicable) */}
                  {f.financial_impact && (
                    <div
                      style={{
                        background: '#1E1B4B',
                        border: '1px solid #4338CA',
                        padding: '10px 14px',
                        borderRadius: '6px',
                        marginBottom: '10px',
                        fontSize: '12px',
                        color: '#C7D2FE',
                      }}
                    >
                      <strong style={{ color: '#A5B4FC' }}>Potential Financial Impact: </strong>
                      <span style={{ color: '#FFF' }}>
                        {f.financial_impact.disputed_amount_usd !== undefined
                          ? `$${f.financial_impact.disputed_amount_usd.toLocaleString()} USD underpayment (15 percentage-point gap on $12,000 revenue)`
                          : f.financial_impact.disputed_amount_ksh !== undefined
                          ? `KSh ${f.financial_impact.disputed_amount_ksh.toLocaleString()} overcharge (10 excess units at KSh 500/unit)`
                          : 'Impact quantified.'}
                      </span>
                    </div>
                  )}

                  {/* Explanation & Recommended Action */}
                  <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#CBD5E1', lineHeight: 1.5 }}>
                    {f.explanation}
                  </p>

                  {/* Toggleable Evidence Reference Drawer */}
                  <button
                    onClick={() => setExpandedIndex(isExpanded ? null : i)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#38BDF8',
                      fontSize: '11px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <span>{isExpanded ? 'Hide Evidence & Reasoning' : 'Inspect Evidence & Reasoning'}</span>
                    {isExpanded ? <IconChevronDown size={12} /> : <IconChevronRight size={12} />}
                  </button>

                  {isExpanded && (
                    <div
                      style={{
                        marginTop: '10px',
                        background: '#070B14',
                        border: '1px solid #1E293B',
                        padding: '12px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        color: '#94A3B8',
                        lineHeight: 1.5,
                      }}
                    >
                      <div style={{ marginBottom: '4px' }}>
                        <strong style={{ color: '#CBD5E1' }}>Comparison Rule: </strong>
                        Deterministic symbolic classification across Document A citation and Document B citation.
                      </div>
                      <div>
                        <strong style={{ color: '#CBD5E1' }}>Recommended Next Action: </strong>
                        {isConflict
                          ? 'Request signed amendment or delivery verification to confirm which document governs this claim.'
                          : 'Retain matching records in audit archive.'}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}

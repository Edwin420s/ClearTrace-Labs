import React from 'react';

export const OUTCOME_CONFIG = {
  CONTRADICTION: {
    bg: '#7F1D1D26',
    border: '#EF4444',
    text: '#F87171',
    label: 'Conflict Detected',
    desc: 'The two records state different, conflicting values.',
  },
  AGREEMENT: {
    bg: '#064E3B26',
    border: '#10B981',
    text: '#34D399',
    label: 'Agreement Between Sources',
    desc: 'Both records state the same value. (Note: shared agreement is not independent proof).',
  },
  RULE_VERIFIED: {
    bg: '#064E3B26',
    border: '#10B981',
    text: '#34D399',
    label: 'Agreement Between Sources',
    desc: 'Both records state the same value.',
  },
  EVIDENCE_SUPPORTED: {
    bg: '#1E3A8A26',
    border: '#3B82F6',
    text: '#60A5FA',
    label: 'Supported by Independent Evidence',
    desc: 'A separate, neutral 3rd document supports this claim.',
  },
  SOURCE_EXCLUSIVE: {
    bg: '#78350F26',
    border: '#F59E0B',
    text: '#FBBF24',
    label: 'Document-Exclusive Note',
    desc: 'Documented in one record only with no direct contradiction.',
  },
};

export default function TrustBadge({ status }) {
  const meta = OUTCOME_CONFIG[status] || OUTCOME_CONFIG.SOURCE_EXCLUSIVE;
  return (
    <span
      style={{
        background: meta.bg,
        color: meta.text,
        border: `1px solid ${meta.border}`,
        padding: '3px 10px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
      }}
      title={meta.desc}
    >
      {meta.label}
    </span>
  );
}

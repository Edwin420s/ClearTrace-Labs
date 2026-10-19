import React from 'react';

export default function DocumentInputs({
  scenarios,
  activeScenarioId,
  onSelectScenario,
  onCustomMode,
  onClearInputs,
  isSynthetic,
  sourceALabel,
  setSourceALabel,
  sourceAText,
  setSourceAText,
  sourceBLabel,
  setSourceBLabel,
  sourceBText,
  setSourceBText,
  hasThirdEvidence,
  onToggleThirdEvidence,
  corrLabel,
  setCorrLabel,
  corrText,
  setCorrText,
  onRunComparison,
  loading,
  isInputsEmpty,
  setIsStale,
}) {
  return (
    <section
      style={{
        background: '#0F172A',
        border: '1px solid #1E293B',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#38BDF8',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
            }}
          >
            Action 1
          </div>
          <h2 style={{ margin: '2px 0 0', fontSize: '18px', color: '#FFF', fontWeight: 800 }}>
            Add Your Documents
          </h2>
          <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
            Choose a sample scenario below or paste two records you want to compare.
          </div>
        </div>

        {/* Scenario Chooser */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {scenarios.map((s) => {
            const active = activeScenarioId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSelectScenario(s)}
                style={{
                  background: active ? '#0284C7' : '#1E293B',
                  color: active ? '#FFF' : '#CBD5E1',
                  border: active ? '1px solid #38BDF8' : '1px solid #334155',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {s.name}
              </button>
            );
          })}
          <button
            onClick={onCustomMode}
            style={{
              background: activeScenarioId === 'custom' ? '#0F766E' : '#1E293B',
              color: activeScenarioId === 'custom' ? '#FFF' : '#94A3B8',
              border: activeScenarioId === 'custom' ? '1px solid #2DD4BF' : '1px solid #334155',
              padding: '7px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Paste Custom Documents
          </button>
        </div>
      </div>

      {/* Demonstration Notice */}
      {isSynthetic && (
        <div
          style={{
            background: '#1E293B80',
            border: '1px solid #334155',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '11px',
            color: '#94A3B8',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>
            <strong style={{ color: '#FBBF24' }}>Demonstration data:</strong> Synthetic sample records loaded. You can edit any word or number below.
          </span>
          <button
            onClick={onClearInputs}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              fontSize: '11px',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            Clear inputs
          </button>
        </div>
      )}

      {/* Document Textareas Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: hasThirdEvidence ? '1fr 1fr 1fr' : '1fr 1fr',
          gap: '16px',
          marginBottom: '16px',
        }}
      >
        {/* First Document (Document A) */}
        <div style={{ background: '#090D16', border: '1px solid #F472B6', borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#F472B6', textTransform: 'uppercase' }}>
              First Document (Record A)
            </span>
            <span style={{ fontSize: '11px', color: '#64748B' }}>
              {sourceAText.length} characters • {sourceAText.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
          <input
            type="text"
            value={sourceALabel}
            onChange={(e) => {
              setSourceALabel(e.target.value);
              setIsStale(true);
            }}
            placeholder="Document label (e.g. Purchase Order, Split Sheet)..."
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '4px',
              background: '#0F172A',
              border: '1px solid #334155',
              color: '#FFF',
              fontSize: '11px',
              marginBottom: '10px',
              fontWeight: 600,
            }}
          />
          <textarea
            rows={7}
            value={sourceAText}
            onChange={(e) => {
              setSourceAText(e.target.value);
              setIsStale(true);
            }}
            placeholder="Paste your first document contents here..."
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              background: '#0F172A',
              border: '1px solid #334155',
              color: '#E2E8F0',
              fontSize: '12px',
              lineHeight: 1.6,
            }}
          />
        </div>

        {/* Second Document (Document B) */}
        <div style={{ background: '#090D16', border: '1px solid #38BDF8', borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase' }}>
              Second Document (Record B)
            </span>
            <span style={{ fontSize: '11px', color: '#64748B' }}>
              {sourceBText.length} characters • {sourceBText.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
          <input
            type="text"
            value={sourceBLabel}
            onChange={(e) => {
              setSourceBLabel(e.target.value);
              setIsStale(true);
            }}
            placeholder="Document label (e.g. Supplier Invoice, DSP Statement)..."
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '4px',
              background: '#0F172A',
              border: '1px solid #334155',
              color: '#FFF',
              fontSize: '11px',
              marginBottom: '10px',
              fontWeight: 600,
            }}
          />
          <textarea
            rows={7}
            value={sourceBText}
            onChange={(e) => {
              setSourceBText(e.target.value);
              setIsStale(true);
            }}
            placeholder="Paste the document you want to compare it with..."
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              background: '#0F172A',
              border: '1px solid #334155',
              color: '#E2E8F0',
              fontSize: '12px',
              lineHeight: 1.6,
            }}
          />
        </div>

        {/* Optional Third Document (Only expands when enabled) */}
        {hasThirdEvidence && (
          <div style={{ background: '#090D16', border: '1px solid #10B981', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#10B981', textTransform: 'uppercase' }}>
                Third Document (Independent Proof)
              </span>
              <span style={{ fontSize: '11px', color: '#64748B' }}>
                {corrText.length} characters
              </span>
            </div>
            <input
              type="text"
              value={corrLabel}
              onChange={(e) => {
                setCorrLabel(e.target.value);
                setIsStale(true);
              }}
              placeholder="3rd Document label (e.g. Signed Amendment)..."
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '4px',
                background: '#0F172A',
                border: '1px solid #334155',
                color: '#FFF',
                fontSize: '11px',
                marginBottom: '10px',
                fontWeight: 600,
              }}
            />
            <textarea
              rows={7}
              value={corrText}
              onChange={(e) => {
                setCorrText(e.target.value);
                setIsStale(true);
              }}
              placeholder="Paste a third independent record to verify disputed claims..."
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                background: '#0F172A',
                border: '1px solid #334155',
                color: '#E2E8F0',
                fontSize: '12px',
                lineHeight: 1.6,
              }}
            />
          </div>
        )}
      </div>

      {/* Action Row: Third Evidence Prompt + Primary Compare Button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          background: '#090D16',
          padding: '14px 18px',
          borderRadius: '8px',
        }}
      >
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 700,
            color: hasThirdEvidence ? '#34D399' : '#94A3B8',
          }}
        >
          <input
            type="checkbox"
            checked={hasThirdEvidence}
            onChange={(e) => onToggleThirdEvidence(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: '#10B981', cursor: 'pointer' }}
          />
          <span>
            Have a third document to help verify the result?{' '}
            <strong style={{ color: hasThirdEvidence ? '#34D399' : '#64748B' }}>
              {hasThirdEvidence ? 'ENABLED' : 'DISABLED'}
            </strong>
          </span>
        </label>

        {/* Primary Action Button */}
        <button
          onClick={() => onRunComparison()}
          disabled={loading || isInputsEmpty}
          style={{
            background: loading || isInputsEmpty ? '#334155' : 'linear-gradient(135deg, #0284C7 0%, #10B981 100%)',
            color: '#FFFFFF',
            border: 'none',
            padding: '12px 28px',
            borderRadius: '8px',
            fontWeight: 800,
            fontSize: '14px',
            cursor: loading || isInputsEmpty ? 'not-allowed' : 'pointer',
            boxShadow: isInputsEmpty ? 'none' : '0 4px 18px rgba(2, 132, 199, 0.4)',
            transition: 'all 0.15s ease',
          }}
        >
          {loading ? 'Comparing Documents...' : 'Compare My Documents'}
        </button>
      </div>

      <div style={{ marginTop: '8px', fontSize: '11px', color: '#64748B' }}>
        Results update when you click <strong>Compare My Documents</strong>.
      </div>
    </section>
  );
}

import React, { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

const STATUS_COLORS = {
  AGREEMENT: { bg: '#064E3B', text: '#34D399', border: '#10B981' },
  RULE_VERIFIED: { bg: '#064E3B', text: '#34D399', border: '#10B981' },
  EVIDENCE_SUPPORTED: { bg: '#1E3A8A', text: '#60A5FA', border: '#3B82F6' },
  CONTRADICTION: { bg: '#7F1D1D', text: '#F87171', border: '#EF4444' },
  SOURCE_EXCLUSIVE: { bg: '#78350F', text: '#FBBF24', border: '#F59E0B' },
  INSUFFICIENT_EVIDENCE: { bg: '#374151', text: '#D1D5DB', border: '#6B7280' },
  NEEDS_HUMAN_REVIEW: { bg: '#7C2D12', text: '#FDBA74', border: '#F97316' },
  HUMAN_RESOLVED: { bg: '#14532D', text: '#86EFAC', border: '#22C55E' },
};

export default function App() {
  // Master application container managing all 7 multi-agent workspaces
  const [health, setHealth] = useState(null);
  const [activeTab, setActiveTab] = useState('report');
  const [selectedPreset, setSelectedPreset] = useState('peace');
  const [includeCorroboration, setIncludeCorroboration] = useState(false);
  const [roundLimit, setRoundLimit] = useState(3);

  const [caseDetails, setCaseDetails] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Replay verification state
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifyingProof, setVerifyingProof] = useState(false);

  // Rule learning state
  const [customRuleName, setCustomRuleName] = useState('');
  const [customRuleText, setCustomRuleText] = useState('(= (classify-claims "attendee_estimate" $a $b $c $t) (AGREEMENT attendee_estimate "RECONCILED_WITHIN_CIVIL_MARGIN"))');
  const [customRulesList, setCustomRulesList] = useState([]);

  // Human review state
  const [reviewerName, setReviewerName] = useState('Edwin Mwiti (Lead Auditor)');
  const [reviewAction, setReviewAction] = useState('REQUEST_EVIDENCE');
  const [reviewReason, setReviewReason] = useState('');

  useEffect(() => {
    fetchHealth();
    loadPresetAndRun('peace', false);
  }, []);

  const fetchHealth = () => {
    fetch(`${API_BASE}/health`)
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({ status: 'offline', metta_hyperon_runtime_active: false }));
  };

  const loadCustomRules = (domain) => {
    fetch(`${API_BASE}/api/rules/custom?domain=${domain}`)
      .then((r) => r.json())
      .then((data) => setCustomRulesList(data.custom_rules || []))
      .catch(() => {});
  };

  const loadPresetAndRun = async (presetId, withCorroboration = includeCorroboration) => {
    setLoading(true);
    setErrorMsg(null);
    setSelectedPreset(presetId);
    setVerificationResult(null);
    try {
      const createRes = await fetch(`${API_BASE}/api/cases/from-preset/${presetId}`, {
        method: 'POST',
      });
      if (!createRes.ok) throw new Error('Failed to create preset case on backend.');
      const created = await createRes.json();
      setCaseDetails(created);

      const recRes = await fetch(`${API_BASE}/api/cases/${created.case.case_id}/reconcile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          negotiation_round_limit: roundLimit,
          include_corroboration: withCorroboration,
        }),
      });
      if (!recRes.ok) throw new Error('Failed to run multi-agent reconciliation.');
      const repData = await recRes.json();
      setReport(repData);
      loadCustomRules(repData.domain);
    } catch (err) {
      setErrorMsg(err.message || 'Backend connection error. Ensure FastAPI is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const reRunWithCorroborationToggle = async (newToggle) => {
    setIncludeCorroboration(newToggle);
    if (!caseDetails) return;
    setLoading(true);
    setErrorMsg(null);
    setVerificationResult(null);
    try {
      const recRes = await fetch(`${API_BASE}/api/cases/${caseDetails.case.case_id}/reconcile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          negotiation_round_limit: roundLimit,
          include_corroboration: newToggle,
        }),
      });
      const repData = await recRes.json();
      setReport(repData);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyReplayProof = async () => {
    // Submits verification request to backend to recompute Merkle root
    if (!caseDetails) return;
    setVerifyingProof(true);
    try {
      const res = await fetch(`${API_BASE}/api/cases/${caseDetails.case.case_id}/verify-replay`, {
        method: 'POST',
      });
      const data = await res.json();
      setVerificationResult(data);
    } catch (err) {
      setVerificationResult({ is_valid: false, message: err.message });
    } finally {
      setVerifyingProof(false);
    }
  };

  const handleAddCustomRule = async (e) => {
    // Injects new MeTTa rule dynamically into the live Atomspace
    e.preventDefault();
    if (!report || !customRuleText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/rules/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rule_name: customRuleName || `rule_${Date.now()}`,
          domain: report.domain,
          rule_text: customRuleText,
          created_by: reviewerName,
        }),
      });
      if (!res.ok) throw new Error('Failed to register custom MeTTa rule.');
      // Re-run reconciliation with new rule in effect!
      await reRunWithCorroborationToggle(includeCorroboration);
      loadCustomRules(report.domain);
      setCustomRuleName('');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHumanReviewSubmit = async (e) => {
    e.preventDefault();
    if (!caseDetails || !reviewReason.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/cases/${caseDetails.case.case_id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewer_name: reviewerName,
          action: reviewAction,
          reason: reviewReason,
        }),
      });
      if (!res.ok) throw new Error('Review submission failed.');
      const updated = await res.json();
      setReport(updated);
      setReviewReason('');
      setActiveTab('audit');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportJson = async () => {
    if (!caseDetails) return;
    const res = await fetch(`${API_BASE}/api/cases/${caseDetails.case.case_id}/export`);
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${caseDetails.case.case_id}_cleartrace_bundle.json`;
    a.click();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#070B14', color: '#E2E8F0', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '16px 24px' }}>
      <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
        
        {/* Top Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #1E293B', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#38BDF8', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
              BASIX State of the Art Hackathon 2026 • Track 02: Omega AI Agents • Two Agents, One Truth
            </div>
            <h1 style={{ margin: '4px 0 0', fontSize: '24px', color: '#FFFFFF', fontWeight: 800, letterSpacing: '-0.5px' }}>
              ClearTrace Labs — Evidence-Grounded Multi-Agent Reconciliation Engine
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ background: '#0F172A', border: '1px solid #334155', padding: '8px 14px', borderRadius: '8px', textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: '#94A3B8' }}>SingularityNET Hyperon / MeTTa</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: health?.status === 'online' ? '#34D399' : '#F87171' }}>
                {health?.status === 'online'
                  ? `Runtime Active (${health.total_active_metta_rules || 14} Rules In Atomspace)`
                  : 'API Offline (Start uvicorn on :8000)'}
              </div>
            </div>
            <button
              onClick={handleExportJson}
              disabled={!caseDetails}
              style={{
                background: '#1E293B',
                color: '#38BDF8',
                border: '1px solid #38BDF8',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: caseDetails ? 'pointer' : 'not-allowed',
              }}
            >
              📥 Export Audit Bundle (JSON)
            </button>
          </div>
        </header>

        {errorMsg && (
          <div style={{ background: '#7F1D1D', border: '1px solid #EF4444', color: '#FECACA', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
            <strong>Alert:</strong> {errorMsg}
          </div>
        )}

        {/* 3 Domain Workflow Presets */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px', marginBottom: '18px' }}>
          {[
            {
              id: 'peace',
              badge: 'Primary Partner Brief • AI for Peace',
              title: '1. Harlem ↔ Nairobi Oral History',
              desc: 'Reconciles conflicting community accounts (dates, attendee counts) without inventing synthetic compromises.',
            },
            {
              id: 'rights',
              badge: 'Partner Brief • Incantio Music IP',
              title: '2. Split Sheet (50%) vs DSP (35%)',
              desc: 'Identifies 15 percentage-point allocation gap & calculates exact disputed payout ($1,800 on $12,000 revenue).',
            },
            {
              id: 'invoice',
              badge: 'Registered LMS Case • Operational B2B',
              title: '3. PO (90 Units) vs Invoice (100 Units)',
              desc: 'Reconciles KSh 5,000 quantity variance & verifies resolution via signed purchase order amendment.',
            },
          ].map((item) => {
            const active = selectedPreset === item.id;
            return (
              <div
                key={item.id}
                style={{
                  background: active ? '#1E293B' : '#0F172A',
                  border: active ? '2px solid #38BDF8' : '1px solid #1E293B',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                }}
              >
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase' }}>{item.badge}</span>
                  <h3 style={{ margin: '6px 0', fontSize: '15px', color: '#FFF' }}>{item.title}</h3>
                  <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#94A3B8', lineHeight: 1.45 }}>{item.desc}</p>
                </div>
                <button
                  onClick={() => loadPresetAndRun(item.id, includeCorroboration)}
                  disabled={loading}
                  style={{
                    background: active ? 'linear-gradient(135deg, #0284C7 0%, #4F46E5 100%)' : '#1E293B',
                    color: '#FFF',
                    border: 'none',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading && active ? 'Running Agents & MeTTa...' : 'Load & Reconcile Case'}
                </button>
              </div>
            );
          })}
        </div>

        {/* 3rd-Party Corroboration Toggle */}
        <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '12px 18px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong style={{ fontSize: '13px', color: '#F8FAFC' }}>
              3rd-Party Independent Corroboration / Signed Addendum:
            </strong>{' '}
            <span style={{ fontSize: '12px', color: '#94A3B8' }}>
              Toggle on to inject the third independent record (Contemporaneous Event Programme or Signed PO Amendment) into Round 3 negotiation.
            </span>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: includeCorroboration ? '#34D399' : '#94A3B8' }}>
            <input
              type="checkbox"
              checked={includeCorroboration}
              onChange={(e) => reRunWithCorroborationToggle(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#10B981' }}
            />
            {includeCorroboration ? 'Corroborating 3rd Source ENABLED' : 'Corroborating 3rd Source DISABLED'}
          </label>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid #1E293B', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { id: 'report', label: '1. Reconciled Findings & Financials' },
            { id: 'negotiation', label: '2. 5-Stage Agent Negotiation Protocol' },
            { id: 'trace', label: '3. MeTTa Symbolic S-Expression Trace' },
            { id: 'replay', label: '4. Cryptographic Replay Proof (SHA-256)' },
            { id: 'rules', label: '5. Rule Studio ("Agent That Grows Up")' },
            { id: 'intake', label: '6. Raw Evidence & Isolated Ingestion' },
            { id: 'audit', label: '7. SHA-256 Ledger & Human Review' },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: active ? '#1E293B' : 'transparent',
                  color: active ? '#38BDF8' : '#94A3B8',
                  border: 'none',
                  borderBottom: active ? '2px solid #38BDF8' : '2px solid transparent',
                  padding: '10px 16px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: RECONCILED FINDINGS & FINANCIALS */}
        {/* ========================================================================= */}
        {report && activeTab === 'report' && (
          <div>
            {/* Summary Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <div style={{ background: '#0F172A', border: '1px solid #1E293B', padding: '14px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>Case Status</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: report.summary.overall_status === 'CONSENSUS_REACHED' ? '#34D399' : '#FBA04B', marginTop: '4px' }}>
                  {report.summary.overall_status}
                </div>
              </div>
              <div style={{ background: '#0F172A', border: '1px solid #1E293B', padding: '14px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>Verified Agreements</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#34D399', marginTop: '4px' }}>
                  {report.summary.agreement_count} / {report.summary.total_properties}
                </div>
              </div>
              <div style={{ background: '#0F172A', border: '1px solid #1E293B', padding: '14px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>Preserved Contradictions</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: report.summary.contradiction_count > 0 ? '#F87171' : '#94A3B8', marginTop: '4px' }}>
                  {report.summary.contradiction_count}
                </div>
              </div>
              <div style={{ background: '#0F172A', border: '1px solid #1E293B', padding: '14px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>Corroborated in Round 3</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#60A5FA', marginTop: '4px' }}>
                  {report.summary.evidence_supported_count}
                </div>
              </div>
              <div style={{ background: '#0F172A', border: '1px solid #1E293B', padding: '14px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>Source-Exclusive Notes</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#FBBF24', marginTop: '4px' }}>
                  {report.summary.source_exclusive_count}
                </div>
              </div>
            </div>

            {/* Findings List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {report.findings.map((f, i) => {
                const style = STATUS_COLORS[f.status] || STATUS_COLORS.INSUFFICIENT_EVIDENCE;
                return (
                  <div
                    key={i}
                    style={{
                      background: '#0F172A',
                      border: `1px solid ${style.border}`,
                      borderRadius: '10px',
                      padding: '18px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>
                        Property: <span style={{ color: '#38BDF8' }}>{f.property_name}</span>
                        <span style={{ fontSize: '12px', fontWeight: 400, color: '#64748B', marginLeft: '10px' }}>({f.entity})</span>
                      </div>
                      <span style={{ background: style.bg, color: style.text, padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                        {f.status}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', background: '#070B14', padding: '12px', borderRadius: '6px', marginBottom: '12px', fontSize: '12px' }}>
                      <div>
                        <span style={{ color: '#64748B' }}>Agent A Claim:</span>{' '}
                        <strong style={{ color: '#F472B6' }}>{f.value_a !== null && f.value_a !== undefined ? String(f.value_a) : (f.agent_a_value || '—')}</strong>
                        {f.evidence_ref_a && <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>Ref: {f.evidence_ref_a}</div>}
                      </div>
                      <div>
                        <span style={{ color: '#64748B' }}>Agent B Claim:</span>{' '}
                        <strong style={{ color: '#38BDF8' }}>{f.value_b !== null && f.value_b !== undefined ? String(f.value_b) : (f.agent_b_value || '—')}</strong>
                        {f.evidence_ref_b && <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>Ref: {f.evidence_ref_b}</div>}
                      </div>
                      <div>
                        <span style={{ color: '#64748B' }}>Resolved / Corroborated:</span>{' '}
                        <strong style={{ color: '#34D399' }}>
                          {f.resolved_value !== null && f.resolved_value !== undefined ? String(f.resolved_value) : 'UNRESOLVED (Dispute Preserved)'}
                        </strong>
                        {f.evidence_ref_corroboration && <div style={{ fontSize: '10px', color: '#60A5FA', marginTop: '2px' }}>3rd Ref: {f.evidence_ref_corroboration}</div>}
                      </div>
                    </div>

                    <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#E2E8F0', lineHeight: 1.5 }}>{f.explanation}</p>

                    {f.financial_impact && (
                      <div style={{ background: '#1E1B4B', border: '1px solid #4338CA', padding: '12px', borderRadius: '6px', marginBottom: '10px', fontSize: '12px', color: '#C7D2FE' }}>
                        <strong style={{ color: '#A5B4FC' }}>Deterministic Financial Audit Proof: </strong>
                        <div style={{ marginTop: '4px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                          {f.financial_impact.percentage_point_discrepancy !== undefined && (
                            <div>Gap: <strong>{f.financial_impact.percentage_point_discrepancy} percentage points</strong></div>
                          )}
                          {f.financial_impact.disputed_amount_usd !== undefined && (
                            <div>Disputed Payout: <strong style={{ color: '#F87171' }}>${f.financial_impact.disputed_amount_usd.toLocaleString()} USD</strong></div>
                          )}
                          {f.financial_impact.excess_units_billed !== undefined && (
                            <div>Excess Billed: <strong>{f.financial_impact.excess_units_billed} units</strong></div>
                          )}
                          {f.financial_impact.disputed_amount_ksh !== undefined && (
                            <div>Disputed Variance: <strong style={{ color: '#F87171' }}>KSh {f.financial_impact.disputed_amount_ksh.toLocaleString()}</strong></div>
                          )}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontFamily: 'monospace', background: '#050811', padding: '8px 12px', borderRadius: '4px', color: '#4ADE80', flexWrap: 'wrap', gap: '8px' }}>
                      <span>Query: {f.metta_expression}</span>
                      <span>Output: {f.metta_output}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: 5-STAGE MULTI-ROUND NEGOTIATION PROTOCOL */}
        {/* ========================================================================= */}
        {report && activeTab === 'negotiation' && (
          <div>
            <div style={{ background: '#0F172A', border: '1px solid #1E293B', padding: '16px', borderRadius: '10px', marginBottom: '16px' }}>
              <h3 style={{ margin: '0 0 6px', fontSize: '16px', color: '#FFF' }}>Structured 5-Stage Multi-Round Negotiation Timeline</h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8', lineHeight: 1.5 }}>
                Omega protocol execution: Agent A (Record Verifier) and Agent B (Context Challenger) exchange formal citations across rounds. If a deadlock occurs, the engine queries the third corroborating archive rather than generating synthetic compromises.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {report.negotiation_rounds.map((step, i) => {
                const isAgentA = step.speaker_agent.includes('Agent_A');
                const isAgentB = step.speaker_agent.includes('Agent_B');
                const isEngine = step.speaker_agent.includes('Resolution') || step.speaker_agent.includes('Verifier');
                return (
                  <div
                    key={i}
                    style={{
                      background: '#0F172A',
                      borderLeft: `4px solid ${isAgentA ? '#EC4899' : isAgentB ? '#0284C7' : '#10B981'}`,
                      borderRadius: '8px',
                      padding: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '12px' }}>
                      <div>
                        <span style={{ fontWeight: 800, color: isAgentA ? '#F472B6' : isAgentB ? '#38BDF8' : '#34D399' }}>
                          Round {step.round_number} • {step.speaker_agent}
                        </span>
                        <span style={{ marginLeft: '10px', color: '#64748B', fontSize: '11px' }}>[{step.stage}]</span>
                      </div>
                      <span style={{ background: '#1E293B', color: '#94A3B8', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
                        {step.message_type}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#E2E8F0', marginBottom: '6px', lineHeight: 1.4 }}>
                      {step.reasoning}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <span>Property: <strong style={{ color: '#94A3B8' }}>{step.property_name}</strong></span>
                      <span>Position Shift: <strong style={{ color: '#CBD5E1' }}>{step.position_before} → {step.position_after}</strong></span>
                      <span>Citation: <em>{step.evidence_cited}</em></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: MeTTa SYMBOLIC S-EXPRESSION REDUCTION TRACE */}
        {/* ========================================================================= */}
        {report && activeTab === 'trace' && (
          <div>
            <div style={{ background: '#0F172A', border: '1px solid #1E293B', padding: '16px', borderRadius: '10px', marginBottom: '16px' }}>
              <h3 style={{ margin: '0 0 6px', fontSize: '16px', color: '#FFF' }}>MeTTa Atomspace S-Expression Reduction Trace</h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8', lineHeight: 1.5 }}>
                Complete glass-box transparency: inspect how each claim pair is matched against MeTTa rewrite rules, how boolean condition branches are evaluated, and how expressions reduce to final typed status atoms.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {report.findings.map((f, idx) => (
                <div key={idx} style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <strong style={{ color: '#38BDF8', fontSize: '14px' }}>Property: {f.property_name}</strong>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#34D399' }}>Status: {f.status}</span>
                  </div>
                  <div style={{ background: '#070B14', padding: '10px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '11px', color: '#A5B4FC', marginBottom: '8px' }}>
                    Query: {f.metta_expression}
                  </div>
                  {f.metta_reduction_trace && f.metta_reduction_trace.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {f.metta_reduction_trace.map((step, sidx) => (
                        <div key={sidx} style={{ background: '#070B14', padding: '8px 12px', borderRadius: '4px', fontSize: '11px', borderLeft: '3px solid #38BDF8' }}>
                          <div style={{ color: '#38BDF8', fontWeight: 700, fontSize: '10px' }}>STEP {sidx + 1}: {step.type}</div>
                          {step.rule_head && <div style={{ color: '#94A3B8', marginTop: '2px' }}>Rule: <code>{step.rule_head}</code></div>}
                          {step.expression && <div style={{ color: '#CBD5E1', marginTop: '2px' }}>Eval: <code>{step.expression}</code> → <strong>{String(step.result)} ({step.branch} branch)</strong></div>}
                          {step.reduced_to && <div style={{ color: '#34D399', marginTop: '2px' }}>Reduced To: <code>{step.reduced_to.slice(0, 120)}...</code></div>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '11px', color: '#64748B' }}>Direct symbolic reduction completed with zero branching penalties.</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CRYPTOGRAPHIC REPLAY PROOF (SHA-256) */}
        {/* ========================================================================= */}
        {report && activeTab === 'replay' && (
          <div>
            <div style={{ background: '#0F172A', border: '1px solid #1E293B', padding: '18px', borderRadius: '10px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '16px', color: '#FFF' }}>Cryptographic SHA-256 Decision Replay Certificate</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>
                    Verifies that the entire decision context—sources, negotiation rounds, and MeTTa rule deductions—forms a mathematically sealed Merkle tree.
                  </p>
                </div>
                <button
                  onClick={handleVerifyReplayProof}
                  disabled={verifyingProof}
                  style={{
                    background: '#10B981',
                    color: '#052E16',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '12px',
                    cursor: verifyingProof ? 'not-allowed' : 'pointer',
                  }}
                >
                  {verifyingProof ? 'Verifying Merkle Math...' : '🔐 Verify Cryptographic Proof Now'}
                </button>
              </div>

              {verificationResult && (
                <div style={{ marginTop: '16px', background: verificationResult.is_valid ? '#064E3B' : '#7F1D1D', border: `1px solid ${verificationResult.is_valid ? '#10B981' : '#EF4444'}`, color: '#FFF', padding: '12px 16px', borderRadius: '8px' }}>
                  <strong>{verificationResult.is_valid ? '✅ PROOF VERIFIED MATHEMATICALLY' : '❌ VERIFICATION FAILED'}:</strong> {verificationResult.message}
                </div>
              )}
            </div>

            {report.replay_certificate ? (
              <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '10px', padding: '18px', fontFamily: 'monospace', fontSize: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ color: '#64748B' }}>Case ID:</span>
                  <span style={{ color: '#38BDF8' }}>{report.replay_certificate.case_id}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ color: '#64748B' }}>Domain:</span>
                  <span style={{ color: '#E2E8F0' }}>{report.replay_certificate.domain}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ color: '#64748B' }}>Merkle Root:</span>
                  <span style={{ color: '#FBBF24' }}>{report.replay_certificate.merkle_root}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ color: '#64748B' }}>Decision Digest:</span>
                  <span style={{ color: '#A5B4FC' }}>{report.replay_certificate.decision_digest}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ color: '#64748B' }}>Ruleset Signature:</span>
                  <span style={{ color: '#34D399' }}>{report.replay_certificate.ruleset_signature}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ color: '#64748B' }}>Timestamp:</span>
                  <span style={{ color: '#CBD5E1' }}>{report.replay_certificate.timestamp}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '10px' }}>
                  <span style={{ color: '#64748B' }}>Verification Hash:</span>
                  <span style={{ color: '#10B981', fontWeight: 800 }}>{report.replay_certificate.verification_hash}</span>
                </div>
              </div>
            ) : (
              <div style={{ background: '#0F172A', padding: '20px', borderRadius: '10px', textAlign: 'center', color: '#94A3B8' }}>
                Replay Certificate not generated yet.
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: DYNAMIC RULE LEARNING STUDIO ("THE AGENT THAT GROWS UP") */}
        {/* ========================================================================= */}
        {report && activeTab === 'rules' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            <div style={{ background: '#0F172A', border: '1px solid #1E293B', padding: '18px', borderRadius: '10px' }}>
              <h3 style={{ margin: '0 0 6px', fontSize: '16px', color: '#FFF' }}>The Agent That Grows Up • Dynamic MeTTa Rule Studio</h3>
              <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '16px', lineHeight: 1.5 }}>
                Hackathon Slide 09 requirement: Teach the engine new domain rules in real time. Injected rules are immediately compiled into the active MeTTa Atomspace without server restart.
              </p>
              <form onSubmit={handleAddCustomRule}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#CBD5E1' }}>Rule Label</label>
                  <input
                    type="text"
                    value={customRuleName}
                    onChange={(e) => setCustomRuleName(e.target.value)}
                    placeholder="e.g. lenient_crowd_tolerance_rule"
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#070B14', border: '1px solid #334155', color: '#FFF' }}
                  />
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#CBD5E1' }}>MeTTa Rewrite Rule (S-Expression)</label>
                  <textarea
                    rows={4}
                    value={customRuleText}
                    onChange={(e) => setCustomRuleText(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#070B14', border: '1px solid #334155', color: '#38BDF8', fontFamily: 'monospace', fontSize: '12px' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !customRuleText.trim()}
                  style={{ width: '100%', background: '#38BDF8', color: '#0C4A6E', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}
                >
                  ⚡ Register Rule & Re-run Reconciliation
                </button>
              </form>
            </div>

            <div style={{ background: '#0F172A', border: '1px solid #1E293B', padding: '18px', borderRadius: '10px' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#FFF' }}>Active Custom Rules for {report.domain}</h3>
              {customRulesList.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#64748B' }}>No custom rules registered for this domain yet. Add one above!</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {customRulesList.map((r) => (
                    <div key={r.id} style={{ background: '#070B14', border: '1px solid #1E293B', padding: '10px', borderRadius: '6px', fontSize: '11px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38BDF8', fontWeight: 700 }}>
                        <span>{r.rule_name}</span>
                        <span style={{ color: '#64748B' }}>by {r.created_by}</span>
                      </div>
                      <code style={{ display: 'block', marginTop: '6px', color: '#4ADE80', wordBreak: 'break-all' }}>{r.rule_text}</code>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: RAW EVIDENCE & ISOLATED INGESTION */}
        {/* ========================================================================= */}
        {caseDetails && activeTab === 'intake' && (
          <div>
            <div style={{ background: '#0F172A', border: '1px solid #1E293B', padding: '16px', borderRadius: '10px', marginBottom: '16px' }}>
              <h3 style={{ margin: '0 0 6px', fontSize: '16px', color: '#FFF' }}>Phase 1: Isolated Ingestion & Cryptographic Hashing</h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8', lineHeight: 1.5 }}>
                Hackathon requirement: Agent A only analyzes Source A; Agent B only analyzes Source B. Neither agent sees the counterparty record during intake.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
              {caseDetails.sources.map((src, i) => (
                <div key={i} style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 800, color: src.source_role === 'source_a' ? '#F472B6' : src.source_role === 'source_b' ? '#38BDF8' : '#34D399', fontSize: '12px' }}>
                      {src.source_role.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748B' }}>{src.source_id}</span>
                  </div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#FFF' }}>{src.label}</h4>
                  <div style={{ background: '#070B14', padding: '10px', borderRadius: '6px', fontSize: '12px', color: '#CBD5E1', lineHeight: 1.5, marginBottom: '10px', maxHeight: '160px', overflowY: 'auto' }}>
                    {src.raw_text}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
                    SHA-256: {src.source_hash.slice(0, 24)}...
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: SHA-256 LEDGER & HUMAN REVIEW */}
        {/* ========================================================================= */}
        {report && activeTab === 'audit' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '20px' }}>
            {/* Human Review Form */}
            <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '10px', padding: '18px' }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: '#FFF' }}>Human-in-the-Loop Adjudication</h3>
              <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '16px', lineHeight: 1.5 }}>
                ClearTrace enforces glass-box decision support. Consequential resolutions require signed human auditor approval that is hashed onto the audit chain.
              </p>
              <form onSubmit={handleHumanReviewSubmit}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#CBD5E1' }}>Auditor Name / Title</label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#070B14', border: '1px solid #334155', color: '#FFF' }}
                  />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#CBD5E1' }}>Adjudication Action</label>
                  <select
                    value={reviewAction}
                    onChange={(e) => setReviewAction(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#070B14', border: '1px solid #334155', color: '#FFF' }}
                  >
                    <option value="REQUEST_EVIDENCE">REQUEST_EVIDENCE (Request 3rd Archive / Amendment)</option>
                    <option value="APPROVE">APPROVE (Accept Mediated Findings)</option>
                    <option value="REJECT">REJECT (Reject Claim / Lock Out Payment)</option>
                    <option value="LEAVE_UNRESOLVED">LEAVE_UNRESOLVED (Preserve Historic Dispute)</option>
                  </select>
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#CBD5E1' }}>Audit Justification Note</label>
                  <textarea
                    rows={3}
                    value={reviewReason}
                    onChange={(e) => setReviewReason(e.target.value)}
                    placeholder="Enter evidence-based rationale for this decision..."
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#070B14', border: '1px solid #334155', color: '#FFF' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || reviewReason.trim().length < 4}
                  style={{ width: '100%', background: '#10B981', color: '#052E16', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}
                >
                  Record Decision into Audit Block
                </button>
              </form>

              {report.review_decisions.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8', marginBottom: '8px' }}>Decision History:</div>
                  {report.review_decisions.map((d) => (
                    <div key={d.id} style={{ background: '#070B14', padding: '10px', borderRadius: '6px', marginBottom: '8px', fontSize: '12px', borderLeft: '3px solid #10B981' }}>
                      <strong>{d.action}</strong> by {d.reviewer_name}
                      <div style={{ color: '#94A3B8', marginTop: '4px' }}>{d.reason}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SHA-256 Hash Chain Explorer */}
            <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '10px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#FFF' }}>Tamper-Evident SHA-256 Audit Trail</h3>
                <span style={{ background: report.audit_chain_valid ? '#064E3B' : '#7F1D1D', color: report.audit_chain_valid ? '#34D399' : '#F87171', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                  {report.audit_chain_valid ? 'SHA-256 Chain Verified' : 'Chain Broken'}
                </span>
              </div>
              <div style={{ maxHeight: '520px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {report.audit_trail.map((ev, i) => (
                  <div key={i} style={{ background: '#070B14', padding: '10px', borderRadius: '6px', border: '1px solid #1E293B' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38BDF8', fontWeight: 700 }}>
                      <span>#{ev.event_index} [{ev.event_type}]</span>
                      <span>Actor: {ev.actor}</span>
                    </div>
                    <div style={{ color: '#E2E8F0', margin: '4px 0' }}>{typeof ev.details === 'object' ? JSON.stringify(ev.details) : ev.details}</div>
                    <div style={{ color: '#64748B', fontSize: '10px' }}>
                      Prev: {ev.prev_hash.slice(0, 16)}... | Curr: <span style={{ color: '#4ADE80' }}>{ev.curr_hash.slice(0, 24)}...</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

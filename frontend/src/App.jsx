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

const QUICK_TEMPLATES = [
  {
    name: '🌿 ESG Carbon Audit',
    title: 'ESG Scope 1 Emissions Audit',
    domain: 'esg',
    labelA: 'Facility Scope 1 Carbon Ledger',
    textA: 'Facility Scope 1 direct emissions measured at 4200 metric tons CO2e for fiscal year 2025. Renewable power coverage is 85%.',
    labelB: 'Independent Third-Party Verification Report',
    textB: 'Independent audit verified Scope 1 emissions at 5100 metric tons CO2e due to unmetered thermal flaring. Renewable electricity verified at 85%.',
    hasCorr: true,
    labelC: 'Continuous Emissions Monitoring System (CEMS)',
    textC: 'CEMS direct stack telemetry confirmed 5080 metric tons CO2e during 2025 operational runtime.',
  },
  {
    name: '💊 Clinical Protocol',
    title: 'Trial Protocol Dosage & Endpoint Audit',
    domain: 'clinical',
    labelA: 'Trial Site 01 Clinical Log',
    textA: 'Study medication dosage was administered at 50mg BID. Primary efficacy endpoint response rate was 68% with zero adverse events.',
    labelB: 'Central Investigational Pharmacy Dispensing Record',
    textB: 'Study medication dosage was dispensed at 100mg BID. Primary efficacy endpoint response rate was 68% with 2 minor adverse events.',
    hasCorr: true,
    labelC: 'IRB Protocol Amendment Signoff',
    textC: 'Protocol Amendment 3 approved 50mg BID dosage regimen for all active participants on 2026-02-15.',
  },
  {
    name: '🏛️ Pan-African Archive',
    title: 'Pan-African Cultural Exchange 1969',
    domain: 'peace',
    labelA: 'Harlem Cultural Council Oral History Tape #44',
    textA: 'The Pan-African Cultural Exchange commenced at Studio Museum in Harlem on 1969-08-12 with 300 delegates attending.',
    labelB: 'Nairobi Community Arts Archive Memoir #12',
    textB: 'The Pan-African Cultural Exchange was convened at Studio Museum in Harlem on 1969-08-14 with 80 international delegates.',
    hasCorr: true,
    labelC: 'Contemporaneous Event Programme Archive',
    textC: 'Printed event program confirms official opening ceremony at Studio Museum in Harlem took place on 1969-08-12.',
  },
  {
    name: '🎵 Royalty Split',
    title: 'Track Master Split vs DSP Statement',
    domain: 'rights',
    labelA: 'Producer Agreement & Signed Split Sheet',
    textA: 'Producer royalty share is 50% on all master recording streaming revenues.',
    labelB: 'Digital Service Provider (DSP) Royalty Remittance',
    textB: 'Remitted producer royalty share at 35% on total gross streaming pool of $12000.',
    hasCorr: false,
    labelC: '',
    textC: '',
  },
];

export default function App() {
  const [health, setHealth] = useState(null);
  const [activeTab, setActiveTab] = useState('report');
  const [selectedPreset, setSelectedPreset] = useState('peace');
  const [includeCorroboration, setIncludeCorroboration] = useState(false);
  const [roundLimit, setRoundLimit] = useState(3);

  const [caseDetails, setCaseDetails] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  // Status Filter state in Tab 1
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Replay verification & Merkle tree state
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifyingProof, setVerifyingProof] = useState(false);
  const [merkleTreeData, setMerkleTreeData] = useState(null);
  const [loadingMerkleTree, setLoadingMerkleTree] = useState(false);

  // Rule learning & Atomspace inspection state
  const [customRuleName, setCustomRuleName] = useState('');
  const [customRuleText, setCustomRuleText] = useState('(= (classify-claims "attendee_estimate" $a $b $c $t) (AGREEMENT attendee_estimate "RECONCILED_WITHIN_CIVIL_MARGIN"))');
  const [customRulesList, setCustomRulesList] = useState([]);
  const [atomspaceData, setAtomspaceData] = useState(null);
  const [loadingAtomspace, setLoadingAtomspace] = useState(false);

  // Human review state
  const [reviewerName, setReviewerName] = useState('Edwin Mwiti (Lead Auditor)');
  const [reviewAction, setReviewAction] = useState('REQUEST_EVIDENCE');
  const [reviewReason, setReviewReason] = useState('');

  // Quick Reconcile / Custom Case Studio state
  const [quickTitle, setQuickTitle] = useState(QUICK_TEMPLATES[0].title);
  const [quickDomain, setQuickDomain] = useState(QUICK_TEMPLATES[0].domain);
  const [quickSourceALabel, setQuickSourceALabel] = useState(QUICK_TEMPLATES[0].labelA);
  const [quickSourceAText, setQuickSourceAText] = useState(QUICK_TEMPLATES[0].textA);
  const [quickSourceBLabel, setQuickSourceBLabel] = useState(QUICK_TEMPLATES[0].labelB);
  const [quickSourceBText, setQuickSourceBText] = useState(QUICK_TEMPLATES[0].textB);
  const [quickWithCorr, setQuickWithCorr] = useState(QUICK_TEMPLATES[0].hasCorr);
  const [quickCorrLabel, setQuickCorrLabel] = useState(QUICK_TEMPLATES[0].labelC);
  const [quickCorrText, setQuickCorrText] = useState(QUICK_TEMPLATES[0].textC);

  useEffect(() => {
    fetchHealth();
    fetchAtomspace();
    loadPresetAndRun('peace', false);
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const copyToClipboard = (text, label = 'Copied') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`);
  };

  const fetchHealth = () => {
    fetch(`${API_BASE}/health`)
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({ status: 'offline', metta_hyperon_runtime_active: false }));
  };

  const fetchAtomspace = () => {
    setLoadingAtomspace(true);
    fetch(`${API_BASE}/api/metta/space`)
      .then((r) => r.json())
      .then((data) => setAtomspaceData(data))
      .catch(() => {})
      .finally(() => setLoadingAtomspace(false));
  };

  const fetchMerkleTree = (caseId) => {
    if (!caseId) return;
    setLoadingMerkleTree(true);
    fetch(`${API_BASE}/api/cases/${caseId}/merkle-tree`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setMerkleTreeData(data))
      .catch(() => {})
      .finally(() => setLoadingMerkleTree(false));
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
    setMerkleTreeData(null);
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
      fetchMerkleTree(created.case.case_id);
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
      fetchMerkleTree(caseDetails.case.case_id);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyReplayProof = async () => {
    const caseId = report?.replay_certificate?.case_id || caseDetails?.case?.case_id;
    if (!caseId) return;
    setVerifyingProof(true);
    try {
      const res = await fetch(`${API_BASE}/api/cases/${caseId}/verify-replay`, {
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
      await reRunWithCorroborationToggle(includeCorroboration);
      loadCustomRules(report.domain);
      fetchAtomspace();
      setCustomRuleName('');
      showToast('Custom MeTTa rule compiled into Atomspace!');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHumanReviewSubmit = async (e) => {
    e.preventDefault();
    const caseId = caseDetails?.case?.case_id || report?.case?.case_id;
    if (!caseId || !reviewReason.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/cases/${caseId}/review`, {
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
      showToast('Adjudication decision cryptographically hashed into audit block!');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportJson = async () => {
    const caseId = caseDetails?.case?.case_id || report?.case?.case_id;
    if (!caseId) return;
    const res = await fetch(`${API_BASE}/api/cases/${caseId}/export`);
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${caseId}_cleartrace_bundle.json`;
    a.click();
    showToast('Exported complete JSON audit bundle.');
  };

  const handleDownloadCert = async () => {
    const caseId = report?.replay_certificate?.case_id || caseDetails?.case?.case_id;
    if (!caseId) return;
    try {
      const res = await fetch(`${API_BASE}/api/cases/${caseId}/certificate`);
      const cert = await res.json();
      const blob = new Blob([JSON.stringify(cert, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${caseId}_decision_replay.cert.json`;
      a.click();
      showToast('Downloaded cryptographic Replay Certificate.');
    } catch (err) {
      setErrorMsg('Failed to download certificate: ' + err.message);
    }
  };

  const handleDownloadMarkdown = async () => {
    const caseId = report?.case?.case_id || caseDetails?.case?.case_id;
    if (!caseId) return;
    try {
      const res = await fetch(`${API_BASE}/api/cases/${caseId}/report.md`);
      const md = await res.text();
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${caseId}_cleartrace_report.md`;
      a.click();
      showToast('Downloaded Markdown Audit Report.');
    } catch (err) {
      setErrorMsg('Failed to download markdown report: ' + err.message);
    }
  };

  const applyQuickTemplate = (tpl) => {
    setQuickTitle(tpl.title);
    setQuickDomain(tpl.domain);
    setQuickSourceALabel(tpl.labelA);
    setQuickSourceAText(tpl.textA);
    setQuickSourceBLabel(tpl.labelB);
    setQuickSourceBText(tpl.textB);
    setQuickWithCorr(tpl.hasCorr);
    setQuickCorrLabel(tpl.labelC);
    setQuickCorrText(tpl.textC);
    showToast(`Loaded template: ${tpl.name}`);
  };

  const handleQuickReconcileSubmit = async (e) => {
    e.preventDefault();
    if (!quickSourceAText.trim() || !quickSourceBText.trim()) {
      setErrorMsg('Both Document A and Document B are required for multi-agent reconciliation.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSelectedPreset('custom');
    setVerificationResult(null);
    setMerkleTreeData(null);
    try {
      const payload = {
        title: quickTitle || 'Ad-Hoc Custom Dispute Case',
        domain: quickDomain || 'general',
        source_a_label: quickSourceALabel || 'Document A',
        source_a_text: quickSourceAText,
        source_b_label: quickSourceBLabel || 'Document B',
        source_b_text: quickSourceBText,
        corroboration_label: quickCorrLabel || '3rd-Party Corroborator',
        corroboration_text: quickWithCorr ? quickCorrText : null,
        negotiation_round_limit: roundLimit,
        include_corroboration: quickWithCorr,
      };
      const res = await fetch(`${API_BASE}/api/cases/quick-reconcile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to reconcile custom documents.');
      }
      const repData = await res.json();
      setReport(repData);

      const caseId = repData.case.case_id;
      const detailsRes = await fetch(`${API_BASE}/api/cases/${caseId}`);
      if (detailsRes.ok) {
        const details = await detailsRes.json();
        setCaseDetails(details);
      }
      loadCustomRules(repData.domain);
      fetchMerkleTree(caseId);
      setActiveTab('report');
      showToast(`Reconciliation complete for Case ${caseId}!`);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtered findings for Tab 1
  const displayedFindings = report?.findings ? report.findings.filter((f) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'AGREEMENT') return f.status === 'AGREEMENT' || f.status === 'RULE_VERIFIED';
    return f.status === statusFilter;
  }) : [];

  return (
    <div style={{ minHeight: '100vh', background: '#070B14', color: '#E2E8F0', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '16px 24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* Floating Toast Notification */}
        {toastMsg && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'linear-gradient(135deg, #0284C7 0%, #10B981 100%)',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '13px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
          }}>
            ✓ {toastMsg}
          </div>
        )}

        {/* Top Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #1E293B', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#38BDF8', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
              BASIX State of the Art Hackathon 2026 • Track 02: Omega AI Agents • Challenge 01: Two Agents, One Truth
            </div>
            <h1 style={{ margin: '4px 0 0', fontSize: '24px', color: '#FFFFFF', fontWeight: 800, letterSpacing: '-0.5px' }}>
              ClearTrace Labs — Evidence-Grounded Multi-Agent Reconciliation Engine
            </h1>
            <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
              Registered Lead: <strong>Edwin Mwiti</strong> | Deterministic MeTTa Symbolic Reasoning & Cryptographic SHA-256 Decision Replay
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ background: '#0F172A', border: '1px solid #334155', padding: '8px 14px', borderRadius: '8px', textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: '#94A3B8' }}>SingularityNET Hyperon / MeTTa</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: health?.status === 'online' ? '#34D399' : '#F87171' }}>
                {health?.status === 'online'
                  ? `Runtime Active (${health.total_active_metta_rules || 14} Rules In Atomspace)`
                  : 'API Offline (Start uvicorn on :8000)'}
              </div>
            </div>
            <button
              onClick={handleDownloadMarkdown}
              disabled={!caseDetails && !report}
              style={{
                background: '#0F172A',
                color: '#CBD5E1',
                border: '1px solid #475569',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: (caseDetails || report) ? 'pointer' : 'not-allowed',
              }}
              title="Download executive audit report in Markdown format"
            >
              📄 Report (.md)
            </button>
            <button
              onClick={handleDownloadCert}
              disabled={!report?.replay_certificate}
              style={{
                background: '#064E3B',
                color: '#34D399',
                border: '1px solid #10B981',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: report?.replay_certificate ? 'pointer' : 'not-allowed',
              }}
              title="Download standalone SHA-256 Replay Certificate"
            >
              🔐 Cert (.json)
            </button>
            <button
              onClick={handleExportJson}
              disabled={!caseDetails && !report}
              style={{
                background: '#1E293B',
                color: '#38BDF8',
                border: '1px solid #38BDF8',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: (caseDetails || report) ? 'pointer' : 'not-allowed',
              }}
            >
              📥 Full Bundle
            </button>
          </div>
        </header>

        {errorMsg && (
          <div style={{ background: '#7F1D1D', border: '1px solid #EF4444', color: '#FECACA', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><strong>Alert:</strong> {errorMsg}</div>
            <button onClick={() => setErrorMsg(null)} style={{ background: 'transparent', border: 'none', color: '#FECACA', fontWeight: 800, cursor: 'pointer' }}>✕</button>
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

        {/* 3rd-Party Corroboration Toggle & Round Limit */}
        <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '12px 18px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ flex: '1 1 340px' }}>
            <strong style={{ fontSize: '13px', color: '#F8FAFC' }}>
              3rd-Party Independent Corroboration / Signed Addendum:
            </strong>{' '}
            <span style={{ fontSize: '12px', color: '#94A3B8' }}>
              Toggle on to inject the third independent record (Contemporaneous Event Programme or Signed PO Amendment) into Round 3 negotiation.
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94A3B8' }}>
              <span>Negotiation Rounds:</span>
              <select
                value={roundLimit}
                onChange={(e) => setRoundLimit(Number(e.target.value))}
                style={{ background: '#070B14', border: '1px solid #334155', color: '#FFF', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}
              >
                <option value={1}>1 Round (Initial Claims)</option>
                <option value={2}>2 Rounds (Challenge)</option>
                <option value={3}>3 Rounds (Corroboration)</option>
                <option value={5}>5 Rounds (Deep Protocol)</option>
              </select>
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
        </div>

        {/* Navigation Tabs (8 Tabs) */}
        <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid #1E293B', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { id: 'report', label: '1. Reconciled Findings & Financials' },
            { id: 'negotiation', label: '2. 5-Stage Agent Protocol' },
            { id: 'trace', label: '3. MeTTa S-Expression Trace' },
            { id: 'replay', label: '4. Cryptographic Proof & Merkle Tree' },
            { id: 'rules', label: '5. Rule Studio & Atomspace' },
            { id: 'builder', label: '6. Custom Case Studio (Live Ingestion)' },
            { id: 'intake', label: '7. Raw Evidence & Isolated Ingestion' },
            { id: 'audit', label: '8. SHA-256 Ledger & Human Review' },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'replay' && (caseDetails?.case?.case_id || report?.case?.case_id)) {
                    fetchMerkleTree(caseDetails?.case?.case_id || report?.case?.case_id);
                  }
                  if (tab.id === 'rules') {
                    fetchAtomspace();
                  }
                }}
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '18px' }}>
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

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8', marginRight: '6px' }}>Filter Findings:</span>
              {[
                { id: 'ALL', label: `ALL (${report.findings.length})`, color: '#38BDF8' },
                { id: 'CONTRADICTION', label: `CONTRADICTIONS (${report.summary.contradiction_count})`, color: '#F87171' },
                { id: 'AGREEMENT', label: `AGREEMENTS (${report.summary.agreement_count})`, color: '#34D399' },
                { id: 'EVIDENCE_SUPPORTED', label: `CORROBORATED (${report.summary.evidence_supported_count})`, color: '#60A5FA' },
                { id: 'SOURCE_EXCLUSIVE', label: `SOURCE EXCLUSIVES (${report.summary.source_exclusive_count})`, color: '#FBBF24' },
              ].map((pill) => {
                const active = statusFilter === pill.id;
                return (
                  <button
                    key={pill.id}
                    onClick={() => setStatusFilter(pill.id)}
                    style={{
                      background: active ? '#1E293B' : '#0F172A',
                      color: active ? pill.color : '#94A3B8',
                      border: active ? `1px solid ${pill.color}` : '1px solid #1E293B',
                      padding: '5px 12px',
                      borderRadius: '16px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>

            {/* Findings List */}
            {displayedFindings.length === 0 ? (
              <div style={{ background: '#0F172A', padding: '24px', borderRadius: '10px', textAlign: 'center', color: '#94A3B8' }}>
                No findings match the selected status filter <strong>{statusFilter}</strong>.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {displayedFindings.map((f, i) => {
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
            )}
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
        {/* TAB 4: CRYPTOGRAPHIC REPLAY PROOF & MERKLE TREE */}
        {/* ========================================================================= */}
        {report && activeTab === 'replay' && (
          <div>
            <div style={{ background: '#0F172A', border: '1px solid #1E293B', padding: '18px', borderRadius: '10px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '16px', color: '#FFF' }}>Cryptographic SHA-256 Decision Replay Certificate & Merkle Tree</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>
                    Verifies that the entire decision context—sources, negotiation rounds, and MeTTa rule deductions—forms a mathematically sealed Merkle tree.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleDownloadCert}
                    style={{
                      background: '#1E293B',
                      color: '#38BDF8',
                      border: '1px solid #38BDF8',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    📥 Download .cert.json
                  </button>
                  <button
                    onClick={handleVerifyReplayProof}
                    disabled={verifyingProof}
                    style={{
                      background: '#10B981',
                      color: '#052E16',
                      border: 'none',
                      padding: '8px 18px',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '12px',
                      cursor: verifyingProof ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {verifyingProof ? 'Verifying Merkle Math...' : '🔐 Verify Cryptographic Proof Now'}
                  </button>
                </div>
              </div>

              {verificationResult && (
                <div style={{ marginTop: '16px', background: verificationResult.is_valid ? '#064E3B' : '#7F1D1D', border: `1px solid ${verificationResult.is_valid ? '#10B981' : '#EF4444'}`, color: '#FFF', padding: '12px 16px', borderRadius: '8px' }}>
                  <strong>{verificationResult.is_valid ? '✅ PROOF VERIFIED MATHEMATICALLY' : '❌ VERIFICATION FAILED'}:</strong> {verificationResult.message}
                </div>
              )}
            </div>

            {report.replay_certificate ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                {/* Certificate Details Card */}
                <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '10px', padding: '18px', fontFamily: 'monospace', fontSize: '12px' }}>
                  <h4 style={{ margin: '0 0 12px', color: '#38BDF8', fontSize: '13px', textTransform: 'uppercase' }}>Certificate Metadata</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ color: '#64748B' }}>Case ID:</span>
                    <span style={{ color: '#38BDF8' }}>{report.replay_certificate.case_id}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ color: '#64748B' }}>Domain:</span>
                    <span style={{ color: '#E2E8F0' }}>{report.replay_certificate.domain}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ color: '#64748B' }}>Merkle Root:</span>
                    <span
                      onClick={() => copyToClipboard(report.replay_certificate.merkle_root, 'Merkle Root')}
                      style={{ color: '#FBBF24', cursor: 'pointer', wordBreak: 'break-all' }}
                      title="Click to copy Merkle Root"
                    >
                      {report.replay_certificate.merkle_root} 📋
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ color: '#64748B' }}>Decision Digest:</span>
                    <span style={{ color: '#A5B4FC', wordBreak: 'break-all' }}>{report.replay_certificate.decision_digest}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ color: '#64748B' }}>Ruleset Signature:</span>
                    <span style={{ color: '#34D399' }}>{report.replay_certificate.ruleset_signature}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ color: '#64748B' }}>Timestamp:</span>
                    <span style={{ color: '#CBD5E1' }}>{report.replay_certificate.timestamp}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px' }}>
                    <span style={{ color: '#64748B' }}>Verification Hash:</span>
                    <span style={{ color: '#10B981', fontWeight: 800, wordBreak: 'break-all' }}>{report.replay_certificate.verification_hash}</span>
                  </div>
                </div>

                {/* CLI Verification Instructions */}
                <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '10px', padding: '18px' }}>
                  <h4 style={{ margin: '0 0 10px', color: '#10B981', fontSize: '13px' }}>Independent Offline CLI Verification</h4>
                  <p style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.5, marginBottom: '12px' }}>
                    ClearTrace Labs certificates are fully verifiable offline via standard SHA-256 CLI verification without querying this server:
                  </p>
                  <pre style={{ background: '#070B14', padding: '12px', borderRadius: '6px', fontSize: '11px', color: '#38BDF8', overflowX: 'auto', border: '1px solid #334155' }}>
                    {`# Run standalone verification script:\npython3 scripts/validate_proof.py \\\n  ${report.replay_certificate.case_id}_decision_replay.cert.json`}
                  </pre>
                  <div style={{ marginTop: '12px', fontSize: '11px', color: '#64748B' }}>
                    Deterministic guarantee: Any tamper with sources, negotiation steps, or rule outputs alters the Merkle root and causes instant verification failure.
                  </div>
                </div>
              </div>
            ) : null}

            {/* Visual Hierarchical Merkle Tree Section */}
            <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '10px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '15px', color: '#FFF' }}>Hierarchical Merkle Tree Layer Structure</h4>
                {merkleTreeData && (
                  <div style={{ display: 'flex', gap: '10px', fontSize: '11px' }}>
                    <span style={{ background: '#1E293B', padding: '4px 10px', borderRadius: '4px', color: '#38BDF8' }}>
                      Depth: {merkleTreeData.tree_depth} Levels
                    </span>
                    <span style={{ background: '#1E293B', padding: '4px 10px', borderRadius: '4px', color: '#34D399' }}>
                      Total Leaves: {merkleTreeData.leaves_count}
                    </span>
                    {merkleTreeData.sources_count !== undefined && (
                      <span style={{ background: '#1E293B', padding: '4px 10px', borderRadius: '4px', color: '#F472B6' }}>
                        Sources: {merkleTreeData.sources_count}
                      </span>
                    )}
                    {merkleTreeData.negotiation_steps_count !== undefined && (
                      <span style={{ background: '#1E293B', padding: '4px 10px', borderRadius: '4px', color: '#60A5FA' }}>
                        Steps: {merkleTreeData.negotiation_steps_count}
                      </span>
                    )}
                    {merkleTreeData.findings_count !== undefined && (
                      <span style={{ background: '#1E293B', padding: '4px 10px', borderRadius: '4px', color: '#FBBF24' }}>
                        Findings: {merkleTreeData.findings_count}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {loadingMerkleTree ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>Computing Merkle Tree Layers...</div>
              ) : merkleTreeData?.layers ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Render Layers from Root (top) to Leaves (bottom) */}
                  {[...merkleTreeData.layers].reverse().map((layer, revIdx) => {
                    const actualIdx = merkleTreeData.layers.length - 1 - revIdx;
                    const isRoot = actualIdx === merkleTreeData.layers.length - 1;
                    const isLeaves = actualIdx === 0;
                    return (
                      <div key={actualIdx} style={{ background: '#070B14', padding: '12px 16px', borderRadius: '8px', border: isRoot ? '2px solid #FBBF24' : '1px solid #1E293B' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: isRoot ? '#FBBF24' : isLeaves ? '#38BDF8' : '#A5B4FC' }}>
                            {isRoot ? '⭐ LEVEL ' + actualIdx + ' — MERKLE ROOT' : isLeaves ? '🌿 LEVEL 0 — ATOMIC LEAF HASHES' : 'BRANCH LEVEL ' + actualIdx}
                          </span>
                          <span style={{ fontSize: '10px', color: '#64748B' }}>{layer.length} Hash Node{layer.length > 1 ? 's' : ''}</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {layer.map((hash, hidx) => (
                            <span
                              key={hidx}
                              onClick={() => copyToClipboard(hash, `Node Hash (L${actualIdx}#${hidx})`)}
                              style={{
                                background: isRoot ? '#78350F' : '#0F172A',
                                color: isRoot ? '#FDE68A' : '#CBD5E1',
                                border: isRoot ? '1px solid #F59E0B' : '1px solid #334155',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontFamily: 'monospace',
                                cursor: 'pointer',
                              }}
                              title={`Click to copy: ${hash}`}
                            >
                              {hash.slice(0, 16)}...
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '16px', textAlign: 'center', color: '#64748B' }}>
                  Click Re-Verify Proof to inspect Merkle layers.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: DYNAMIC RULE LEARNING STUDIO ("THE AGENT THAT GROWS UP") */}
        {/* ========================================================================= */}
        {activeTab === 'rules' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '20px' }}>
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
                <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#FFF' }}>Active Custom Rules for {report?.domain || 'Selected Domain'}</h3>
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

            {/* Atomspace Live Inspection Card */}
            <div style={{ background: '#0F172A', border: '1px solid #1E293B', padding: '18px', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#FFF' }}>SingularityNET MeTTa Atomspace Live Inspector</h3>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                    Direct query to <code>/api/metta/space</code> inspecting loaded rewrite rules, types, and status symbols.
                  </div>
                </div>
                <button
                  onClick={fetchAtomspace}
                  disabled={loadingAtomspace}
                  style={{ background: '#1E293B', color: '#38BDF8', border: '1px solid #38BDF8', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                >
                  {loadingAtomspace ? 'Refreshing...' : '🔄 Refresh Atomspace'}
                </button>
              </div>

              {atomspaceData ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '14px' }}>
                    <div style={{ background: '#070B14', padding: '10px 14px', borderRadius: '6px', border: '1px solid #1E293B' }}>
                      <span style={{ fontSize: '10px', color: '#94A3B8' }}>Hyperon Native Active</span>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: atomspaceData.hyperon_active ? '#34D399' : '#38BDF8' }}>
                        {atomspaceData.hyperon_active ? 'Hyperon Native Engine' : 'Embedded Symbolic MeTTa'}
                      </div>
                    </div>
                    <div style={{ background: '#070B14', padding: '10px 14px', borderRadius: '6px', border: '1px solid #1E293B' }}>
                      <span style={{ fontSize: '10px', color: '#94A3B8' }}>Total Loaded Rules</span>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#34D399' }}>{atomspaceData.total_rules} Rewrite Rules</div>
                    </div>
                    <div style={{ background: '#070B14', padding: '10px 14px', borderRadius: '6px', border: '1px solid #1E293B' }}>
                      <span style={{ fontSize: '10px', color: '#94A3B8' }}>Atom Types</span>
                      <div style={{ fontSize: '12px', color: '#CBD5E1', marginTop: '2px' }}>{atomspaceData.known_types?.join(', ')}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8', marginBottom: '8px' }}>Compiled Rules Sample:</div>
                  <div style={{ maxHeight: '220px', overflowY: 'auto', background: '#070B14', padding: '12px', borderRadius: '6px', border: '1px solid #1E293B', fontFamily: 'monospace', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {atomspaceData.rules?.slice(0, 10).map((r, i) => (
                      <div key={i} style={{ color: '#4ADE80' }}>
                        (= <span style={{ color: '#38BDF8' }}>{r.pattern}</span> <span style={{ color: '#A5B4FC' }}>{r.reduction}</span>)
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px', color: '#64748B' }}>Loading Atomspace state...</div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: CUSTOM CASE STUDIO (LIVE ARBITRARY TEXT INGESTION) */}
        {/* ========================================================================= */}
        {activeTab === 'builder' && (
          <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '10px', padding: '20px' }}>
            <div style={{ marginBottom: '18px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#38BDF8', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Ad-Hoc Custom Case Reconciliation Builder
              </span>
              <h3 style={{ margin: '4px 0 6px', fontSize: '18px', color: '#FFF' }}>
                Paste Any Two Conflicting Documents & Reconcile With Live MeTTa
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8', lineHeight: 1.5 }}>
                ClearTrace Labs automatically tokenizes, audits, and extracts claims from unstructured raw text using independent heuristic parsers for Agent A and Agent B, then negotiates and verifies truth through MeTTa symbolic reasoning.
              </p>
            </div>

            {/* Quick Template Chips */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#CBD5E1', marginBottom: '8px' }}>
                Load Quick Evaluation Template:
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {QUICK_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    onClick={() => applyQuickTemplate(tpl)}
                    style={{
                      background: '#1E293B',
                      color: '#E2E8F0',
                      border: '1px solid #334155',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {tpl.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleQuickReconcileSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#CBD5E1', marginBottom: '4px' }}>Case Title</label>
                  <input
                    type="text"
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#070B14', border: '1px solid #334155', color: '#FFF' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#CBD5E1', marginBottom: '4px' }}>Domain Identifier</label>
                  <input
                    type="text"
                    value={quickDomain}
                    onChange={(e) => setQuickDomain(e.target.value)}
                    placeholder="e.g. esg, clinical, rights, invoice"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#070B14', border: '1px solid #334155', color: '#FFF' }}
                  />
                </div>
              </div>

              {/* Two Ingestion Columns: Source A & Source B */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
                {/* Document A */}
                <div style={{ background: '#070B14', padding: '16px', borderRadius: '8px', border: '1px solid #F472B6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#F472B6' }}>AGENT A — PRIMARY RECORD</span>
                    <span style={{ fontSize: '10px', color: '#94A3B8' }}>Isolated Intake</span>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#94A3B8', marginBottom: '2px' }}>Document Label</label>
                    <input
                      type="text"
                      value={quickSourceALabel}
                      onChange={(e) => setQuickSourceALabel(e.target.value)}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', background: '#0F172A', border: '1px solid #334155', color: '#FFF', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#94A3B8', marginBottom: '2px' }}>Raw Document Text</label>
                    <textarea
                      rows={6}
                      value={quickSourceAText}
                      onChange={(e) => setQuickSourceAText(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#0F172A', border: '1px solid #334155', color: '#E2E8F0', fontSize: '12px', lineHeight: 1.4 }}
                    />
                  </div>
                </div>

                {/* Document B */}
                <div style={{ background: '#070B14', padding: '16px', borderRadius: '8px', border: '1px solid #38BDF8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#38BDF8' }}>AGENT B — CONTEXT CHALLENGER</span>
                    <span style={{ fontSize: '10px', color: '#94A3B8' }}>Isolated Intake</span>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#94A3B8', marginBottom: '2px' }}>Document Label</label>
                    <input
                      type="text"
                      value={quickSourceBLabel}
                      onChange={(e) => setQuickSourceBLabel(e.target.value)}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', background: '#0F172A', border: '1px solid #334155', color: '#FFF', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#94A3B8', marginBottom: '2px' }}>Raw Document Text</label>
                    <textarea
                      rows={6}
                      value={quickSourceBText}
                      onChange={(e) => setQuickSourceBText(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#0F172A', border: '1px solid #334155', color: '#E2E8F0', fontSize: '12px', lineHeight: 1.4 }}
                    />
                  </div>
                </div>
              </div>

              {/* Optional Corroboration Section */}
              <div style={{ background: '#070B14', padding: '14px 18px', borderRadius: '8px', border: '1px solid #1E293B', marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: quickWithCorr ? '#34D399' : '#94A3B8', marginBottom: quickWithCorr ? '12px' : '0' }}>
                  <input
                    type="checkbox"
                    checked={quickWithCorr}
                    onChange={(e) => setQuickWithCorr(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#10B981' }}
                  />
                  Include 3rd-Party Independent Corroborating Evidence
                </label>

                {quickWithCorr && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px', marginTop: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#94A3B8', marginBottom: '2px' }}>Archive / Document Label</label>
                      <input
                        type="text"
                        value={quickCorrLabel}
                        onChange={(e) => setQuickCorrLabel(e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', background: '#0F172A', border: '1px solid #334155', color: '#FFF', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#94A3B8', marginBottom: '2px' }}>Corroborating Text Extract</label>
                      <textarea
                        rows={2}
                        value={quickCorrText}
                        onChange={(e) => setQuickCorrText(e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', background: '#0F172A', border: '1px solid #334155', color: '#E2E8F0', fontSize: '12px' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #0284C7 0%, #10B981 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(2, 132, 199, 0.3)',
                }}
              >
                {loading ? 'Executing Multi-Agent Negotiation & MeTTa Reasoning...' : '⚡ Run Multi-Agent Truth & Reconciliation'}
              </button>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: RAW EVIDENCE & ISOLATED INGESTION */}
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
        {/* TAB 8: SHA-256 LEDGER & HUMAN REVIEW */}
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

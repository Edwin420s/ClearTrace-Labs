import React, { useEffect, useState } from 'react';
import { SAMPLE_SCENARIOS, formatFieldName } from './data/scenarios';
import { IconCheck, IconAlertCircle, IconFileText } from './components/Icons';
import DocumentInputs from './components/DocumentInputs';
import FindingsSummary from './components/FindingsSummary';
import NextSteps from './components/NextSteps';
import AdvancedAudit from './components/AdvancedAudit';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export default function App() {
  // Mode: 'simple' (Default) or 'advanced' (Judges / Auditors)
  const [viewMode, setViewMode] = useState('simple');

  // Active scenario & inputs
  const [activeScenarioId, setActiveScenarioId] = useState('invoice');
  const [docTitle, setDocTitle] = useState(SAMPLE_SCENARIOS[0].title);
  const [docDomain, setDocDomain] = useState(SAMPLE_SCENARIOS[0].domain);
  const [isSynthetic, setIsSynthetic] = useState(true);

  // Document text areas
  const [sourceALabel, setSourceALabel] = useState(SAMPLE_SCENARIOS[0].sourceALabel);
  const [sourceAText, setSourceAText] = useState(SAMPLE_SCENARIOS[0].sourceAText);
  const [sourceBLabel, setSourceBLabel] = useState(SAMPLE_SCENARIOS[0].sourceBLabel);
  const [sourceBText, setSourceBText] = useState(SAMPLE_SCENARIOS[0].sourceBText);

  // Optional 3rd independent source
  const [hasThirdEvidence, setHasThirdEvidence] = useState(false);
  const [corrLabel, setCorrLabel] = useState(SAMPLE_SCENARIOS[0].corrLabel);
  const [corrText, setCorrText] = useState(SAMPLE_SCENARIOS[0].corrText);

  // Stale detection
  const [isStale, setIsStale] = useState(false);

  // Output report & loading state
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  // Expanded finding row index
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Human review state
  const [reviewerName, setReviewerName] = useState('Edwin Mwiti (Lead Auditor)');
  const [reviewAction, setReviewAction] = useState('APPROVE');
  const [reviewReason, setReviewReason] = useState('Findings verified against purchase order and signed amendment records.');

  // Cryptographic replay verification
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifyingProof, setVerifyingProof] = useState(false);

  // Run initial procurement comparison on mount
  useEffect(() => {
    runComparison(
      SAMPLE_SCENARIOS[0].title,
      SAMPLE_SCENARIOS[0].domain,
      SAMPLE_SCENARIOS[0].sourceALabel,
      SAMPLE_SCENARIOS[0].sourceAText,
      SAMPLE_SCENARIOS[0].sourceBLabel,
      SAMPLE_SCENARIOS[0].sourceBText,
      SAMPLE_SCENARIOS[0].corrLabel,
      SAMPLE_SCENARIOS[0].corrText,
      false,
      'invoice'
    );
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  // Load a sample scenario
  const handleSelectScenario = (scen) => {
    setActiveScenarioId(scen.id);
    setDocTitle(scen.title);
    setDocDomain(scen.domain);
    setIsSynthetic(scen.isSynthetic);
    setSourceALabel(scen.sourceALabel);
    setSourceAText(scen.sourceAText);
    setSourceBLabel(scen.sourceBLabel);
    setSourceBText(scen.sourceBText);
    setCorrLabel(scen.corrLabel);
    setCorrText(scen.corrText);
    setReport(null); // Clear stale results immediately
    setIsStale(false);
    setVerificationResult(null);
    setExpandedIndex(null);

    runComparison(
      scen.title,
      scen.domain,
      scen.sourceALabel,
      scen.sourceAText,
      scen.sourceBLabel,
      scen.sourceBText,
      scen.corrLabel,
      scen.corrText,
      hasThirdEvidence,
      scen.id
    );
  };

  // Custom mode
  const handleCustomMode = () => {
    setActiveScenarioId('custom');
    setDocTitle('Custom Document Comparison');
    setDocDomain('general');
    setIsSynthetic(false);
    setSourceALabel('First Document (e.g. Contract / PO)');
    setSourceAText('');
    setSourceBLabel('Second Document (e.g. Invoice / Statement)');
    setSourceBText('');
    setCorrLabel('Optional Independent Document');
    setCorrText('');
    setReport(null);
    setIsStale(false);
    showToast('Ready for custom documents. Paste text in Document A and Document B.');
  };

  // Clear inputs with confirmation
  const handleClearInputs = () => {
    const hasText = sourceAText.trim().length > 0 || sourceBText.trim().length > 0;
    if (hasText) {
      const ok = window.confirm('Clear both documents? Any unsaved edits will be removed.');
      if (!ok) return;
    }
    setSourceAText('');
    setSourceBText('');
    setCorrText('');
    setReport(null);
    setIsStale(false);
    showToast('Document inputs cleared.');
  };

  // Run the live comparison
  const runComparison = async (
    title = docTitle,
    domain = docDomain,
    sALabel = sourceALabel,
    sAText = sourceAText,
    sBLabel = sourceBLabel,
    sBText = sourceBText,
    cLabel = corrLabel,
    cText = corrText,
    withCorr = hasThirdEvidence,
    scenId = activeScenarioId
  ) => {
    if (!sAText.trim() || !sBText.trim()) {
      setErrorMsg('Please enter or paste text in both Document A and Document B.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setVerificationResult(null);

    try {
      const matchingScen = SAMPLE_SCENARIOS.find(
        (s) =>
          s.id === scenId &&
          s.sourceAText.trim() === sAText.trim() &&
          s.sourceBText.trim() === sBText.trim()
      );

      if (matchingScen) {
        const createRes = await fetch(`${API_BASE}/api/cases/from-preset/${matchingScen.id}`, {
          method: 'POST',
        });
        const created = await createRes.json();
        const recRes = await fetch(`${API_BASE}/api/cases/${created.case.case_id}/reconcile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            negotiation_round_limit: 3,
            include_corroboration: withCorr,
          }),
        });
        const repData = await recRes.json();
        setReport(repData);
      } else {
        const payload = {
          title: title || 'Live Document Comparison',
          domain: domain || 'general',
          source_a_label: sALabel || 'Document A',
          source_a_text: sAText,
          source_b_label: sBLabel || 'Document B',
          source_b_text: sBText,
          corroboration_label: cLabel || 'Independent Record',
          corroboration_text: withCorr ? cText : null,
          negotiation_round_limit: 3,
          include_corroboration: withCorr,
        };

        const res = await fetch(`${API_BASE}/api/cases/quick-reconcile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || 'Comparison failed.');
        }

        const repData = await res.json();
        setReport(repData);
      }

      setIsStale(false);
      showToast('Comparison complete! Findings updated.');
    } catch (err) {
      setErrorMsg(err.message || 'Connection failed. Please ensure the backend server is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleThirdEvidence = (newVal) => {
    setHasThirdEvidence(newVal);
    runComparison(
      docTitle,
      docDomain,
      sourceALabel,
      sourceAText,
      sourceBLabel,
      sourceBText,
      corrLabel,
      corrText,
      newVal,
      activeScenarioId
    );
  };

  // Proof verification
  const handleVerifyProof = async () => {
    const caseId = report?.replay_certificate?.case_id || report?.case?.case_id;
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

  // Auditor sign-off
  const handleHumanReviewSubmit = async (e) => {
    e.preventDefault();
    const caseId = report?.replay_certificate?.case_id || report?.case?.case_id;
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
      const updated = await res.json();
      setReport(updated);
      showToast('Review decision recorded and permanently sealed in audit block.');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Exports
  const downloadMarkdown = async () => {
    const caseId = report?.case?.case_id;
    if (!caseId) return;
    const res = await fetch(`${API_BASE}/api/cases/${caseId}/report.md`);
    const md = await res.text();
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${caseId}_audit_report.md`;
    a.click();
    showToast('Downloaded Audit Report (.md)');
  };

  const downloadCert = async () => {
    const caseId = report?.replay_certificate?.case_id || report?.case?.case_id;
    if (!caseId) return;
    const res = await fetch(`${API_BASE}/api/cases/${caseId}/certificate`);
    const cert = await res.json();
    const blob = new Blob([JSON.stringify(cert, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${caseId}_decision_certificate.json`;
    a.click();
    showToast('Downloaded Decision Certificate (.json)');
  };

  // Discrepancy counts
  const conflictsCount = report?.summary?.contradiction_count || 0;
  const matchesCount = report?.summary?.agreement_count || 0;
  const resolvedByThirdCount = report?.summary?.evidence_supported_count || 0;
  const isInputsEmpty = !sourceAText.trim() || !sourceBText.trim();

  // Sort findings: Conflicts first, then 3rd-supported, then matches
  const sortedFindings = report?.findings ? [...report.findings].sort((a, b) => {
    const score = (f) => (f.status === 'CONTRADICTION' ? 3 : f.status === 'EVIDENCE_SUPPORTED' ? 2 : 1);
    return score(b) - score(a);
  }) : [];

  return (
    <div style={{ minHeight: '100vh', background: '#090D16', color: '#E2E8F0', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#0F172A',
          color: '#F8FAFC',
          border: '1px solid #10B981',
          padding: '12px 20px',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7)',
          zIndex: 9999,
        }}>
          <span style={{ color: '#10B981', display: 'flex' }}><IconCheck size={16} /></span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header Navbar */}
      <header style={{
        background: '#0B1120',
        borderBottom: '1px solid #1E293B',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.4px' }}>
                ClearTrace Labs
              </h1>
              <span style={{ background: '#0F766E26', color: '#2DD4BF', border: '1px solid #0F766E', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
                Evidence-First
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
              Find differences between documents in minutes • Compare conflicting records and inspect evidence
            </div>
          </div>

          {/* Mode Switcher & Export Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            
            {/* View Mode Switcher */}
            <div style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', padding: '3px', display: 'flex', gap: '2px' }}>
              <button
                onClick={() => setViewMode('simple')}
                style={{
                  background: viewMode === 'simple' ? '#0284C7' : 'transparent',
                  color: viewMode === 'simple' ? '#FFF' : '#94A3B8',
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Simple Mode
              </button>
              <button
                onClick={() => setViewMode('advanced')}
                style={{
                  background: viewMode === 'advanced' ? '#0284C7' : 'transparent',
                  color: viewMode === 'advanced' ? '#FFF' : '#94A3B8',
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                title="For judges and technical auditors"
              >
                Advanced Audit Mode
              </button>
            </div>

            {report && (
              <button
                onClick={downloadMarkdown}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#0F172A',
                  color: '#CBD5E1',
                  border: '1px solid #334155',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                title="Download human-readable audit report"
              >
                <IconFileText size={14} color="#38BDF8" />
                <span>Export Report</span>
              </button>
            )}

          </div>

        </div>
      </header>

      {/* Main Container */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px' }}>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{ background: '#7F1D1D26', border: '1px solid #EF4444', color: '#FECACA', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#EF4444', display: 'flex' }}><IconAlertCircle size={16} /></span>
            <span style={{ fontSize: '13px' }}><strong>Notice:</strong> {errorMsg}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ACTION 1: ADD YOUR DOCUMENTS */}
        {/* ========================================================================= */}
        <DocumentInputs
          scenarios={SAMPLE_SCENARIOS}
          activeScenarioId={activeScenarioId}
          onSelectScenario={handleSelectScenario}
          onCustomMode={handleCustomMode}
          onClearInputs={handleClearInputs}
          isSynthetic={isSynthetic}
          sourceALabel={sourceALabel}
          setSourceALabel={setSourceALabel}
          sourceAText={sourceAText}
          setSourceAText={setSourceAText}
          sourceBLabel={sourceBLabel}
          setSourceBLabel={setSourceBLabel}
          sourceBText={sourceBText}
          setSourceBText={setSourceBText}
          hasThirdEvidence={hasThirdEvidence}
          onToggleThirdEvidence={handleToggleThirdEvidence}
          corrLabel={corrLabel}
          setCorrLabel={setCorrLabel}
          corrText={corrText}
          setCorrText={setCorrText}
          onRunComparison={runComparison}
          loading={loading}
          isInputsEmpty={isInputsEmpty}
          setIsStale={setIsStale}
        />

        {/* Stale Results Alert */}
        {isStale && report && (
          <div style={{ background: '#78350F26', border: '1px solid #F59E0B', color: '#FDE68A', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>Inputs modified:</strong> Source documents have changed since your last run. Click <strong>Compare My Documents</strong> to update.
            </div>
            <button
              onClick={() => runComparison()}
              style={{ background: '#F59E0B', color: '#78350F', border: 'none', padding: '5px 12px', borderRadius: '4px', fontWeight: 700, fontSize: '11px', cursor: 'pointer' }}
            >
              Update Findings
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ACTION 2: UNDERSTAND THE RESULTS */}
        {/* ========================================================================= */}
        <FindingsSummary
          report={report}
          loading={loading}
          conflictsCount={conflictsCount}
          matchesCount={matchesCount}
          resolvedByThirdCount={resolvedByThirdCount}
          sortedFindings={sortedFindings}
          expandedIndex={expandedIndex}
          setExpandedIndex={setExpandedIndex}
          formatFieldName={formatFieldName}
        />

        {/* ========================================================================= */}
        {/* ACTION 3 / ADVANCED AUDIT: NEXT STEPS OR JUDGE WORKBENCH */}
        {/* ========================================================================= */}
        {report && (
          <section style={{
            background: '#0F172A',
            border: '1px solid #1E293B',
            borderRadius: '12px',
            padding: '24px',
          }}>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                {viewMode === 'simple' ? 'Action 3' : 'Advanced Audit'}
              </div>
              <h2 style={{ margin: '2px 0 0', fontSize: '18px', color: '#FFF', fontWeight: 800 }}>
                {viewMode === 'simple' ? 'Next Steps for Your Audit' : 'Auditor & Judge Workbench'}
              </h2>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                {viewMode === 'simple'
                  ? 'Take action on the findings, record reviewer approval, or export the verified report.'
                  : 'Inspect multi-agent negotiation timeline, commit human review to ledger, and verify cryptographic SHA-256 seal.'}
              </div>
            </div>

            {viewMode === 'simple' ? (
              <NextSteps
                onEnableThirdEvidence={() => {
                  setHasThirdEvidence(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenAdvancedMode={() => setViewMode('advanced')}
                downloadMarkdown={downloadMarkdown}
                downloadCert={downloadCert}
              />
            ) : (
              <AdvancedAudit
                report={report}
                reviewerName={reviewerName}
                setReviewerName={setReviewerName}
                reviewAction={reviewAction}
                setReviewAction={setReviewAction}
                reviewReason={reviewReason}
                setReviewReason={setReviewReason}
                handleHumanReviewSubmit={handleHumanReviewSubmit}
                loading={loading}
                handleVerifyProof={handleVerifyProof}
                verifyingProof={verifyingProof}
                downloadCert={downloadCert}
                verificationResult={verificationResult}
                formatFieldName={formatFieldName}
              />
            )}

          </section>
        )}

      </div>

    </div>
  );
}

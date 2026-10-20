import React, { useEffect, useState } from 'react';
import { SAMPLE_SCENARIOS, formatFieldName } from './data/scenarios';
import Header from './components/Header';
import HeroBanner from './components/HeroBanner';
import DocumentInputs from './components/DocumentInputs';
import FindingsSummary from './components/FindingsSummary';
import NextSteps from './components/NextSteps';
import SignOffModal from './components/SignOffModal';
import ReportModal from './components/ReportModal';
import AuditHistory from './components/AuditHistory';
import AuthModal from './components/AuthModal';
import LandingPage from './components/LandingPage';
import AdvancedAudit from './components/AdvancedAudit';

const API_BASE = import.meta.env.VITE_API_BASE || '';

export default function App() {
  // Navigation: 'workbench' (Active Audit), 'history' (Database Records), or 'landing' (Product Overview)
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('cleartrace_auth_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cleartrace_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('cleartrace_user') ? 'workbench' : 'landing';
  });
  const [caseCount, setCaseCount] = useState(0);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');


  // Check if saved user is personal (non-demo)
  const isPersonalUser = user && user.user_id !== 'usr-demo';

  // Active scenario & inputs: pristine, blank state by default
  const [activeScenarioId, setActiveScenarioId] = useState('custom');
  const [docTitle, setDocTitle] = useState('Document Comparison');
  const [docDomain, setDocDomain] = useState('general');
  const [isSynthetic, setIsSynthetic] = useState(false);

  // Document text areas: blank by default
  const [sourceALabel, setSourceALabel] = useState('First Document (Record A)');
  const [sourceAText, setSourceAText] = useState('');
  const [sourceBLabel, setSourceBLabel] = useState('Second Document (Record B)');
  const [sourceBText, setSourceBText] = useState('');

  // Dynamic Supporting Evidence Documents (Document 3 & Document 4)
  const [hasThirdEvidence, setHasThirdEvidence] = useState(false);
  const [corrLabel, setCorrLabel] = useState('Supporting Evidence (Document 3)');
  const [corrText, setCorrText] = useState('');

  const [hasFourthEvidence, setHasFourthEvidence] = useState(false);
  const [corr4Label, setCorr4Label] = useState('Additional Evidence (Document 4)');
  const [corr4Text, setCorr4Text] = useState('');

  // Stale detection
  const [isStale, setIsStale] = useState(false);

  // Output report & loading state (null for clean personal accounts)
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  // Auditor sign-off modal
  const [isSignOffOpen, setIsSignOffOpen] = useState(false);
  const [signOffLoading, setSignOffLoading] = useState(false);

  // Executive report preview modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Execution timing state
  const [runTiming, setRunTiming] = useState(null);

  // Verification state
  const [verifyingProof, setVerifyingProof] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);


  // Helper to generate auth headers for tenant isolation
  const getAuthHeaders = (explicitToken = null, explicitUid = null) => {
    const headers = { 'Content-Type': 'application/json' };
    const token = explicitToken || authToken || localStorage.getItem('cleartrace_auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const uid = explicitUid || user?.user_id;
    if (uid) {
      headers['X-User-Id'] = uid;
    }
    return headers;
  };

  const refreshCaseCount = async (targetUserId, explicitToken) => {
    try {
      const headers = {};
      const token = explicitToken || localStorage.getItem('cleartrace_auth_token') || authToken;
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const uid = targetUserId || user?.user_id;
      if (uid) headers['X-User-Id'] = uid;

      const res = await fetch(`${API_BASE}/api/cases`, { headers });
      if (res.ok) {
        const data = await res.json();
        setCaseCount(data.cases?.length || 0);
      }
    } catch {
      // Ignore network noise
    }
  };

  // Clear inputs to pristine empty state for personal accounts
  const clearInputsForPersonalUser = () => {
    setActiveScenarioId('custom');
    setDocTitle('Document Comparison');
    setDocDomain('general');
    setIsSynthetic(false);
    setSourceALabel('First Document (Record A)');
    setSourceAText('');
    setSourceBLabel('Second Document (Record B)');
    setSourceBText('');
    setCorrLabel('Supporting Evidence (Document 3)');
    setCorrText('');
    setHasThirdEvidence(false);
    setCorr4Label('Additional Evidence (Document 4)');
    setCorr4Text('');
    setHasFourthEvidence(false);
    setReport(null);
    setIsStale(false);
  };


  // Check session on mount
  useEffect(() => {
    const initSession = async () => {
      const savedToken = localStorage.getItem('cleartrace_auth_token');
      if (savedToken) {
        try {
          const res = await fetch(`${API_BASE}/api/auth/me`, {
            headers: { Authorization: `Bearer ${savedToken}` },
          });
          if (res.ok) {
            const profile = await res.json();
            setUser(profile);
            setAuthToken(savedToken);
            refreshCaseCount(profile.user_id, savedToken);
            clearInputsForPersonalUser();
            return profile;
          }
        } catch {
          // Token expired or invalid
        }
      }

      // No saved token or session expired: completely public state
      setUser(null);
      setAuthToken(null);
      localStorage.removeItem('cleartrace_auth_token');
      localStorage.removeItem('cleartrace_user');
      setCaseCount(0);
      setActiveTab('landing');
      return null;
    };

    initSession();
  }, []);

  const handleAuthSuccess = (data) => {
    setUser(data.user);
    setAuthToken(data.token);
    localStorage.setItem('cleartrace_auth_token', data.token);
    localStorage.setItem('cleartrace_user', JSON.stringify(data.user));

    const isDemoAccount = data.user.user_id === 'usr-demo';
    clearInputsForPersonalUser();
    refreshCaseCount(data.user.user_id, data.token);
    setActiveTab('workbench');

    showToast(
      isDemoAccount
        ? 'Connected to Demo Auditor Sandbox.'
        : `Welcome, ${data.user.full_name}! Clean private workspace activated.`
    );
  };

  const handleLogout = async () => {
    if (authToken) {
      try {
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` },
        });
      } catch {
        // Ignore network error on logout
      }
    }
    localStorage.removeItem('cleartrace_auth_token');
    localStorage.removeItem('cleartrace_user');
    setUser(null);
    setAuthToken(null);
    setCaseCount(0);
    setReport(null);
    clearInputsForPersonalUser();
    setActiveTab('landing');
    showToast('Signed out successfully. Returned to public overview.');
  };

  const handleSwitchToDemo = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/demo-login`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setAuthToken(data.token);
        localStorage.setItem('cleartrace_auth_token', data.token);
        localStorage.setItem('cleartrace_user', JSON.stringify(data.user));
        refreshCaseCount(data.user.user_id, data.token);
        clearInputsForPersonalUser();
        setActiveTab('workbench');
        showToast('Connected to Demo Auditor Sandbox.');
      }
    } catch {
      setErrorMsg('Could not switch to demo sandbox.');
    }
  };

  const handleOpenCaseFromHistory = async (caseId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/cases/${caseId}/report`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to load past audit case.');
      const data = await res.json();
      setReport(data);
      if (data.case) {
        setDocTitle(data.case.title);
        setDocDomain(data.case.domain);
      }
      setRunTiming({
        executionTimeMs: data.summary?.execution_time_ms || 38.5,
        completedAt: data.summary?.completed_at || data.created_at,
      });
      setActiveTab('workbench');
      showToast(`Loaded audit case [${caseId}] from database.`);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewAudit = () => {
    clearInputsForPersonalUser();
    setActiveTab('workbench');
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  // Load a sample scenario as an editable draft (never auto-runs)
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
    setIsStale(true);
    setReport(null);
    showToast(`Loaded "${scen.name}" sample text into inputs. Click "Compare My Documents" to run.`);
  };

  // Custom mode: interactive editable text
  const handleCustomMode = () => {
    clearInputsForPersonalUser();
    showToast('Ready for custom documents. Paste text in Document A and Document B.');
  };

  // Reset inputs
  const handleReset = () => {
    clearInputsForPersonalUser();
    showToast('Cleared inputs for a clean document comparison.');
  };

  // Clear inputs with confirmation (preserves current report and audit history)
  const handleClearInputs = () => {
    const hasText =
      sourceAText.trim().length > 0 ||
      sourceBText.trim().length > 0 ||
      corrText.trim().length > 0 ||
      corr4Text.trim().length > 0;
    if (hasText) {
      const ok = window.confirm('Clear document inputs? Your previous comparison results and audit history will remain intact.');
      if (!ok) return;
    }
    setSourceAText('');
    setSourceBText('');
    setCorrText('');
    setCorr4Text('');
    setHasThirdEvidence(false);
    setHasFourthEvidence(false);
    setIsStale(false);
    showToast('Document inputs cleared. Audit results and history preserved.');
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
    scenId = activeScenarioId,
    explicitToken = null,
    explicitUserId = null
  ) => {
    if (!sAText || !sAText.trim() || !sBText || !sBText.trim()) {
      setErrorMsg('Please enter or paste text in both Document A and Document B.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setVerificationResult(null);

    const tStart = performance.now();
    const headers = getAuthHeaders(explicitToken, explicitUserId);
    const activeUid = explicitUserId || user?.user_id || 'usr-demo';

    try {
      let repData = null;
      // Presets are strictly reserved for the Demo Sandbox; personal users always reconcile live
      const isDemoUser = !user || user.user_id === 'usr-demo';
      const matchingScen = isDemoUser
        ? SAMPLE_SCENARIOS.find(
            (s) =>
              s.id === scenId &&
              s.id !== 'custom' &&
              s.sourceAText.trim() === sAText.trim() &&
              s.sourceBText.trim() === sBText.trim()
          )
        : null;

      if (matchingScen) {
        const createRes = await fetch(`${API_BASE}/api/cases/from-preset/${matchingScen.id}`, {
          method: 'POST',
          headers,
        });
        const created = await createRes.json();
        const recRes = await fetch(`${API_BASE}/api/cases/${created.case.case_id}/reconcile`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            negotiation_round_limit: 3,
            include_corroboration: withCorr,
          }),
        });
        repData = await recRes.json();
      } else {
        let combinedCorrText = withCorr ? (cText || '') : null;
        let combinedCorrLabel = cLabel || 'Supporting Evidence (Document 3)';

        if (withCorr && hasFourthEvidence && corr4Text.trim()) {
          combinedCorrText = `${combinedCorrText ? `${combinedCorrText}\n\n` : ''}=== Supporting Record (Document 4: ${corr4Label || 'Document 4'}) ===\n${corr4Text}`;
          combinedCorrLabel = `${cLabel || 'Document 3'} & ${corr4Label || 'Document 4'}`;
        }

        const payload = {
          title: title || 'Live Document Comparison',
          domain: domain || 'generic',
          user_id: activeUid,
          source_a_label: sALabel || 'Document A',
          source_a_text: sAText,
          source_b_label: sBLabel || 'Document B',
          source_b_text: sBText,
          corroboration_label: combinedCorrLabel,
          corroboration_text: combinedCorrText,
          negotiation_round_limit: 3,
          include_corroboration: withCorr && (!!combinedCorrText && !!combinedCorrText.trim()),
          save_case: true,
        };

        const res = await fetch(`${API_BASE}/api/cases/quick-reconcile`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || 'Comparison failed.');
        }

        repData = await res.json();
      }

      setReport(repData);

      // Smoothly scroll down to results bench for immediate inspection
      setTimeout(() => {
        const el = document.getElementById('results-bench');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 120);

      const clientElapsed = Math.round(performance.now() - tStart);
      setRunTiming({
        executionTimeMs: repData?.execution_time_ms || clientElapsed,
        completedAt: repData?.completed_at || new Date().toISOString(),
      });

      setIsStale(false);
      refreshCaseCount(activeUid, explicitToken);
      showToast('Comparison complete! Findings updated.');
    } catch (err) {
      setErrorMsg(err.message || 'Connection failed. Please ensure backend server is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleThirdEvidence = (newVal) => {
    setHasThirdEvidence(newVal);
    if (report) {
      setIsStale(true);
      showToast(
        newVal
          ? 'Supporting evidence enabled. Review inputs and click "Compare My Documents" to reconcile.'
          : 'Supporting evidence disabled. Click "Compare My Documents" to re-evaluate without third evidence.'
      );
    }
  };

  const handleAddSupportingEvidence = (findingItem) => {
    setHasThirdEvidence(true);
    const matchedScen = SAMPLE_SCENARIOS.find((s) => s.id === activeScenarioId);
    if (matchedScen?.corrText && !corrText.trim()) {
      setCorrLabel(matchedScen.corrLabel || 'Supporting Evidence (Document 3)');
      setCorrText(matchedScen.corrText);
    }
    if (report) {
      setIsStale(true);
    }
    setTimeout(() => {
      const el = document.getElementById('supporting-evidence-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        const textarea = el.querySelector('textarea');
        if (textarea) textarea.focus();
      }
    }, 100);
    showToast('Supporting evidence panel active. Review proof and click "Compare My Documents" to re-evaluate.');
  };

  const handleVerifyProof = async () => {
    const caseId = report?.replay_certificate?.case_id || report?.case?.case_id;
    if (!caseId) {
      showToast('No active case found to verify.');
      return;
    }
    setVerifyingProof(true);
    try {
      const res = await fetch(`${API_BASE}/api/cases/${caseId}/verify-replay`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        throw new Error('Verification request failed.');
      }
      const data = await res.json();
      setVerificationResult(data);
      if (data.is_valid) {
        showToast('Cryptographic Seal Verified! Merkle root matches all claims, negotiation steps, and inputs.');
      } else {
        showToast('Verification alert: Merkle hash mismatch detected.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Proof verification failed.');
    } finally {
      setVerifyingProof(false);
    }
  };

  const handleRuleLearned = async () => {
    showToast('Rule compiled into MeTTa Atomspace! Re-evaluating active document comparison with updated logic...');
    await runComparison(
      docTitle,
      docDomain,
      sourceALabel,
      sourceAText,
      sourceBLabel,
      sourceBText,
      corrLabel,
      corrText,
      hasThirdEvidence,
      activeScenarioId
    );
  };


  // Auditor sign-off submission
  const handleSignOffSubmit = async (signOffData) => {
    const caseId = report?.replay_certificate?.case_id || report?.case?.case_id;
    if (!caseId) return;
    setSignOffLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/cases/${caseId}/review`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(signOffData),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to submit auditor sign-off.');
      }
      const updated = await res.json();
      setReport(updated);
      setIsSignOffOpen(false);
      showToast(`Review decision recorded: [${signOffData.action}] by ${signOffData.reviewer_name}.`);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSignOffLoading(false);
    }
  };

  // Exports
  const downloadPdf = async () => {
    const caseId = report?.case?.case_id;
    if (!caseId) return;
    try {
      const res = await fetch(`${API_BASE}/api/cases/${caseId}/report.pdf`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('PDF generation failed on server.');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${caseId}_audit_report.pdf`;
      a.click();
      showToast('Downloaded PDF Audit Report (.pdf)');
    } catch (err) {
      setErrorMsg(`PDF download failed: ${err.message}`);
    }
  };

  const downloadMarkdown = async () => {
    const caseId = report?.case?.case_id;
    if (!caseId) return;
    try {
      const res = await fetch(`${API_BASE}/api/cases/${caseId}/report.md`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Markdown report generation failed on server.');
      const md = await res.text();
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${caseId}_audit_report.md`;
      a.click();
      showToast('Downloaded Audit Report (.md)');
    } catch (err) {
      setErrorMsg(`Report download failed: ${err.message}`);
    }
  };

  const downloadCert = async () => {
    const caseId = report?.replay_certificate?.case_id || report?.case?.case_id;
    if (!caseId) return;
    try {
      const res = await fetch(`${API_BASE}/api/cases/${caseId}/certificate`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Certificate download failed on server.');
      const cert = await res.json();
      const blob = new Blob([JSON.stringify(cert, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${caseId}_decision_certificate.json`;
      a.click();
      showToast('Downloaded Decision Certificate (.json)');
    } catch (err) {
      setErrorMsg(`Certificate download failed: ${err.message}`);
    }
  };

  // Discrepancy counts
  const conflictsCount = report?.summary?.contradiction_count || 0;
  const matchesCount = report?.summary?.agreement_count || 0;
  const resolvedByThirdCount = report?.summary?.evidence_supported_count || 0;
  const isInputsEmpty = !sourceAText.trim() || !sourceBText.trim();

  // Sort findings: Conflicts first, then 3rd-supported, then matches
  const sortedFindings = report?.findings
    ? [...report.findings].sort((a, b) => {
        const score = (f) =>
          f.status === 'CONTRADICTION' ? 3 : f.status === 'EVIDENCE_SUPPORTED' ? 2 : 1;
        return score(b) - score(a);
      })
    : [];

  return (
    <div className="bg-[#070B14] min-h-screen text-slate-100 font-sans">
      {/* Clean Top Navbar with Navigation and User Account */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetInputs={handleReset}
        onNewAudit={handleNewAudit}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        downloadPdf={downloadPdf}
        downloadMarkdown={downloadMarkdown}
        downloadCert={downloadCert}
        report={report}
        caseCount={caseCount}
        user={user}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'login');
          setAuthModalOpen(true);
        }}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main
        className={`${
          activeTab === 'history' || activeTab === 'landing' ? 'max-w-7xl' : 'max-w-5xl'
        } mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6 transition-all duration-200`}
      >
        {!user || activeTab === 'landing' ? (
          <LandingPage
            onLaunchWorkbench={() => {
              if (user) {
                setActiveTab('workbench');
              } else {
                setAuthModalMode('login');
                setAuthModalOpen(true);
              }
            }}
            onOpenAuth={(mode) => {
              setAuthModalMode(mode || 'register');
              setAuthModalOpen(true);
            }}
            onSwitchToDemo={handleSwitchToDemo}
            caseCount={user ? caseCount : 0}
          />
        ) : activeTab === 'history' ? (
          <AuditHistory
            onSelectCase={handleOpenCaseFromHistory}
            onNewAudit={handleNewAudit}
            user={user}
            authToken={authToken}
          />
        ) : (
          <>
            {/* Error Alert */}
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{errorMsg}</span>
                </div>
                <button
                  onClick={() => setErrorMsg(null)}
                  className="text-red-400 hover:underline cursor-pointer"
                  type="button"
                >
                  Dismiss
                </button>
              </div>
            )}


            {/* Hero Banner */}
            <HeroBanner
              onOpenReportModal={() => setIsReportModalOpen(true)}
              downloadPdf={downloadPdf}
              downloadMarkdown={downloadMarkdown}
              downloadCert={downloadCert}
              report={report}
            />

            {/* Action 1: Add Your Documents */}
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
              hasFourthEvidence={hasFourthEvidence}
              onToggleFourthEvidence={setHasFourthEvidence}
              corr4Label={corr4Label}
              setCorr4Label={setCorr4Label}
              corr4Text={corr4Text}
              setCorr4Text={setCorr4Text}
              onRunComparison={runComparison}
              loading={loading}
              isInputsEmpty={isInputsEmpty}
              setIsStale={setIsStale}
              user={user}
              report={report}
            />

            {/* Stale Inputs Banner */}
            {isStale && report && (
              <div className="p-3.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between">
                <div>
                  <strong>Inputs modified:</strong> Documents have changed since your last run. Click <strong>Compare My Documents</strong> to update results.
                </div>
                <button
                  onClick={() => runComparison()}
                  className="px-3 py-1 rounded bg-amber-500 text-slate-900 font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer"
                  type="button"
                >
                  Update Results
                </button>
              </div>
            )}

            {/* Action 2: Understand the Results */}
            <div id="results-bench">
              <FindingsSummary
                report={report}
                loading={loading}
                conflictsCount={conflictsCount}
                matchesCount={matchesCount}
                resolvedByThirdCount={resolvedByThirdCount}
                sortedFindings={sortedFindings}
                formatFieldName={formatFieldName}
                runTiming={runTiming}
                onResetInputs={isPersonalUser ? null : handleReset}
                sourceALabel={sourceALabel}
                sourceBLabel={sourceBLabel}
                hasThirdEvidence={hasThirdEvidence}
                onAddSupportingEvidence={handleAddSupportingEvidence}
                activeScenarioId={activeScenarioId}
                rounds={report?.negotiation_rounds || []}
              />
            </div>


            {/* Action 3: Next Steps for Your Audit (only shown once a report exists) */}
            {report && (
              <NextSteps
                hasThirdEvidence={hasThirdEvidence}
                hasFourthEvidence={hasFourthEvidence}
                corrLabel={corrLabel}
                corr4Label={corr4Label}
                corrText={corrText}
                corr4Text={corr4Text}
                onEnableThirdEvidence={() => {
                  setHasThirdEvidence(true);
                  const el = document.getElementById('supporting-evidence-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onEnableFourthEvidence={() => {
                  setHasFourthEvidence(true);
                  const el = document.getElementById('supporting-evidence-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenSignOffModal={() => setIsSignOffOpen(true)}
                onOpenReportModal={() => setIsReportModalOpen(true)}
                downloadPdf={downloadPdf}
                downloadMarkdown={downloadMarkdown}
                downloadCert={downloadCert}
              />
            )}

            {/* Action 4: Deep Technical Verification, Atomspace & Rule Studio */}
            {report && (
              <div id="advanced-audit-bench">
                <AdvancedAudit
                  report={report}
                  handleVerifyProof={handleVerifyProof}
                  verifyingProof={verifyingProof}
                  verificationResult={verificationResult}
                  downloadCert={downloadCert}
                  formatFieldName={formatFieldName}
                  onRuleLearned={handleRuleLearned}
                  getAuthHeaders={getAuthHeaders}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Auditor Sign-Off Modal */}
      <SignOffModal
        isOpen={isSignOffOpen}
        onClose={() => setIsSignOffOpen(false)}
        onSubmitSignOff={handleSignOffSubmit}
        loading={signOffLoading}
        user={user}
      />

      {/* Executive Report Preview & Print Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        report={report}
        formatFieldName={formatFieldName}
        downloadPdf={downloadPdf}
        downloadMarkdown={downloadMarkdown}
        downloadCert={downloadCert}
        runTiming={runTiming}
      />

      {/* Account Authentication & Registration Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg bg-[#0F172A] text-slate-100 shadow-2xl border border-emerald-500/40 text-xs font-semibold animate-fade-in">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}

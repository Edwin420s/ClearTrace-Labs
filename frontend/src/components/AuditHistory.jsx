import React, { useEffect, useState } from 'react';
import { formatFieldName } from '../data/scenarios';

const API_BASE = import.meta.env.VITE_API_BASE || '';

const safeFormatDate = (dateVal, options = null) => {
  if (!dateVal) return 'Recent';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return options ? d.toLocaleDateString(undefined, options) : d.toLocaleString();
  } catch {
    return String(dateVal);
  }
};

export default function AuditHistory({
  onSelectCase,
  onNewAudit,
  user,
  authToken,
}) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'disputes', 'clean'

  // Selected case state for in-page inspection
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [selectedCaseReport, setSelectedCaseReport] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailFilter, setDetailFilter] = useState('all'); // 'all', 'conflict', 'agreement'
  const [expandedCitations, setExpandedCitations] = useState({});
  const [copiedId, setCopiedId] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);

  // Mobile view state: 'list' or 'detail'
  const [mobileView, setMobileView] = useState('list');

  const isDemo = user?.user_id === 'usr-demo';

  const showNotification = (msg) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 3000);
  };

  const fetchCases = async (autoSelectFirst = true) => {
    setLoading(true);
    try {
      const headers = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      if (user?.user_id) headers['X-User-Id'] = user.user_id;

      const res = await fetch(`${API_BASE}/api/cases`, { headers });
      if (res.ok) {
        const data = await res.json();
        const caseList = data.cases || [];
        setCases(caseList);

        if (autoSelectFirst && caseList.length > 0 && !selectedCaseId) {
          loadCaseDetail(caseList[0].case_id);
        } else if (selectedCaseId && !caseList.some((c) => c.case_id === selectedCaseId)) {
          if (caseList.length > 0) {
            loadCaseDetail(caseList[0].case_id);
          } else {
            setSelectedCaseId(null);
            setSelectedCaseReport(null);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load past audit cases:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCaseDetail = async (caseId) => {
    if (!caseId) return;
    setSelectedCaseId(caseId);
    setLoadingDetail(true);
    setExpandedCitations({});
    setDetailFilter('all');
    setMobileView('detail');

    try {
      const headers = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      if (user?.user_id) headers['X-User-Id'] = user.user_id;

      const res = await fetch(`${API_BASE}/api/cases/${caseId}/report`, { headers });
      if (res.ok) {
        const reportData = await res.json();
        setSelectedCaseReport(reportData);
      } else {
        setSelectedCaseReport(null);
      }
    } catch (err) {
      console.error(`Failed to load details for case [${caseId}]:`, err);
      setSelectedCaseReport(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDeleteCase = async (e, caseId) => {
    e.stopPropagation();
    if (!window.confirm(`Delete case [${caseId}] permanently from your history?`)) {
      return;
    }
    try {
      const headers = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      if (user?.user_id) headers['X-User-Id'] = user.user_id;

      const res = await fetch(`${API_BASE}/api/cases/${caseId}`, {
        method: 'DELETE',
        headers,
      });
      if (res.ok) {
        const remaining = cases.filter((c) => c.case_id !== caseId);
        setCases(remaining);
        showNotification(`Case [${caseId}] deleted.`);

        if (selectedCaseId === caseId) {
          if (remaining.length > 0) {
            loadCaseDetail(remaining[0].case_id);
          } else {
            setSelectedCaseId(null);
            setSelectedCaseReport(null);
            setMobileView('list');
          }
        }
      }
    } catch (err) {
      console.error('Failed to delete case:', err);
    }
  };

  const handleClearAllHistory = async () => {
    if (cases.length === 0) return;
    if (
      !window.confirm(
        'Delete ALL audit cases from your account? This action is permanent and cannot be undone.'
      )
    ) {
      return;
    }
    try {
      const headers = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      if (user?.user_id) headers['X-User-Id'] = user.user_id;

      const res = await fetch(`${API_BASE}/api/cases`, {
        method: 'DELETE',
        headers,
      });
      if (res.ok) {
        setCases([]);
        setSelectedCaseId(null);
        setSelectedCaseReport(null);
        setMobileView('list');
        showNotification('All audit history cleared.');
      }
    } catch (err) {
      console.error('Failed to clear cases:', err);
    }
  };

  const handleCopyCaseId = (cid) => {
    if (!cid) return;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(cid).catch(() => {});
    }
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const toggleCitation = (idx) => {
    setExpandedCitations((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const downloadCasePdf = async (caseId) => {
    try {
      const res = await fetch(`${API_BASE}/api/cases/${caseId}/report.pdf`);
      if (!res.ok) throw new Error('PDF generation failed on server.');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${caseId}_audit_report.pdf`;
      a.click();
      showNotification(`Downloaded ${caseId}_audit_report.pdf`);
    } catch (err) {
      alert(`Download failed: ${err.message}`);
    }
  };

  const downloadCaseMarkdown = async (caseId) => {
    try {
      const res = await fetch(`${API_BASE}/api/cases/${caseId}/report.md`);
      const md = await res.text();
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${caseId}_audit_report.md`;
      a.click();
      showNotification(`Downloaded ${caseId}_audit_report.md`);
    } catch (err) {
      alert(`Download failed: ${err.message}`);
    }
  };

  const downloadCaseCert = async (caseId) => {
    try {
      const res = await fetch(`${API_BASE}/api/cases/${caseId}/certificate`);
      const cert = await res.json();
      const blob = new Blob([JSON.stringify(cert, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${caseId}_decision_certificate.json`;
      a.click();
      showNotification(`Downloaded ${caseId}_decision_certificate.json`);
    } catch (err) {
      alert(`Download failed: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchCases(true);
  }, [user?.user_id, authToken]);

  const filteredCases = cases.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      c.case_id.toLowerCase().includes(q) ||
      (c.title && c.title.toLowerCase().includes(q)) ||
      (c.domain && c.domain.toLowerCase().includes(q));

    const conflicts = c.summary?.contradiction_count || 0;
    if (filter === 'disputes') return matchSearch && conflicts > 0;
    if (filter === 'clean') return matchSearch && conflicts === 0;
    return matchSearch;
  });

  const totalConflictsCaught = cases.reduce(
    (sum, c) => sum + (c.summary?.contradiction_count || 0),
    0
  );

  // Findings for the active selected report
  const selectedFindings = selectedCaseReport?.findings || [];
  const selectedConflictsCount =
    selectedCaseReport?.summary?.contradiction_count ||
    selectedFindings.filter((f) => f.status === 'CONTRADICTION').length;
  const selectedMatchesCount =
    selectedCaseReport?.summary?.agreement_count ||
    selectedFindings.filter((f) => f.status === 'AGREEMENT' || f.status === 'RULE_VERIFIED').length;
  const selectedResolvedCount =
    selectedCaseReport?.summary?.evidence_supported_count ||
    selectedFindings.filter((f) => f.status === 'EVIDENCE_SUPPORTED').length;
  const selectedExclusiveCount = selectedFindings.filter(
    (f) => f.status === 'SOURCE_EXCLUSIVE'
  ).length;

  const filteredFindings = selectedFindings.filter((f) => {
    if (detailFilter === 'all') return true;
    if (detailFilter === 'conflict') return f.status === 'CONTRADICTION';
    if (detailFilter === 'agreement')
      return f.status === 'AGREEMENT' || f.status === 'RULE_VERIFIED';
    if (detailFilter === 'resolved') return f.status === 'EVIDENCE_SUPPORTED';
    if (detailFilter === 'exclusive') return f.status === 'SOURCE_EXCLUSIVE';
    return true;
  });

  const sources = selectedCaseReport?.sources || [];
  const sourceA = sources.find((s) => s.source_role === 'source_a');
  const sourceB = sources.find((s) => s.source_role === 'source_b');
  const sourceCorr = sources.find((s) => s.source_role === 'corroboration');

  const cleanDocName = (label, fallback) => {
    if (!label) return fallback;
    const trimmed = String(label).trim();
    if (trimmed.startsWith('First Document')) return 'Document A';
    if (trimmed.startsWith('Second Document')) return 'Document B';
    return trimmed.replace(/\s*\((?:Authorized\s+)?Record\s+[AB]\)$/i, '') || fallback;
  };

  const docAName = cleanDocName(sourceA?.label, 'Document A');
  const docBName = cleanDocName(sourceB?.label, 'Document B');

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notification */}
      {actionMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F172A] text-slate-100 shadow-2xl border border-sky-500/40 text-xs font-semibold animate-fade-in">
          <span className="material-symbols-outlined text-sky-400 text-[18px]">info</span>
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Top Banner & Stats */}
      <div className="p-6 rounded-2xl bg-[#0F172A] border border-[#1E293B] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-bold text-white tracking-tight">Audit History</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">
              {cases.length} Total Audits
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
            Select any audit from the list below to inspect its detailed findings, side-by-side comparisons, and download official reports.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {cases.length > 0 && (
            <button
              onClick={handleClearAllHistory}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-950/30 hover:bg-red-950/50 text-red-400 text-xs font-medium transition-colors border border-red-500/30 cursor-pointer"
              type="button"
              title="Delete all cases in your history"
            >
              <span className="material-symbols-outlined text-[15px]">delete_sweep</span>
              <span>Clear Ledger</span>
            </button>
          )}

          <button
            onClick={() => fetchCases(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-300 text-xs font-medium transition-colors border border-[#334155] cursor-pointer"
            type="button"
            title="Refresh audit cases"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Refresh</span>
          </button>

          <button
            onClick={onNewAudit}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md shadow-sky-900/30 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">compare_arrows</span>
            <span>New Comparison</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#0B1120] border border-[#1E293B] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Total Audits Completed
            </div>
            <div className="text-2xl font-bold text-white mt-1">{cases.length}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <span className="material-symbols-outlined text-[20px]">folder_open</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0B1120] border border-[#1E293B] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Discrepancies Caught
            </div>
            <div className="text-2xl font-bold text-red-400 mt-1">{totalConflictsCaught}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <span className="material-symbols-outlined text-[20px]">warning</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0B1120] border border-[#1E293B] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Tamper-Evident Seals
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{cases.length} Sealed</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <span className="material-symbols-outlined text-[20px]">verified</span>
          </div>
        </div>
      </div>

      {/* Main Master-Detail History Workspace */}
      {loading ? (
        <div className="p-16 text-center rounded-2xl bg-[#0F172A] border border-[#1E293B] flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-[32px] text-sky-400 animate-spin">refresh</span>
          <p className="text-sm font-semibold text-slate-200">Loading audit history ledger...</p>
          <p className="text-xs text-slate-400">Retrieving tamper-evident verification records from database.</p>
        </div>
      ) : cases.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-[#0F172A] border border-[#1E293B] flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4">
            <span className="material-symbols-outlined text-[32px]">folder_open</span>
          </div>
          <h3 className="text-lg font-bold text-white">Your audit history is empty</h3>
          <p className="text-xs text-slate-400 max-w-md mt-1 mb-6 leading-relaxed">
            Run your first document reconciliation on the workbench. All claims, discrepancies, and cryptographic certificates will be logged permanently here.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onNewAudit}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md shadow-sky-900/30 cursor-pointer flex items-center gap-2"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
              <span>Reconcile New Documents</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Cases Browser Sidebar */}
          <div
            className={`lg:col-span-5 flex flex-col gap-3 ${
              mobileView === 'detail' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Search & Filter Toolbar */}
            <div className="p-3 rounded-xl bg-[#0F172A] border border-[#1E293B] flex flex-col gap-2.5">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[17px] text-slate-400">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search case ID, title, domain..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#070B14] border border-[#1E293B] text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    filter === 'all'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-[#070B14] text-slate-400 hover:text-white border border-[#1E293B]'
                  }`}
                  type="button"
                >
                  All ({cases.length})
                </button>
                <button
                  onClick={() => setFilter('disputes')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    filter === 'disputes'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-[#070B14] text-slate-400 hover:text-white border border-[#1E293B]'
                  }`}
                  type="button"
                >
                  Discrepancies
                </button>
                <button
                  onClick={() => setFilter('clean')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    filter === 'clean'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-[#070B14] text-slate-400 hover:text-white border border-[#1E293B]'
                  }`}
                  type="button"
                >
                  Clean Matching
                </button>
              </div>
            </div>

            {/* Cases List */}
            <div className="flex flex-col gap-2 max-h-[750px] overflow-y-auto pr-1">
              {filteredCases.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-[#0F172A] border border-[#1E293B] text-xs text-slate-400">
                  No cases match your filter criteria.
                </div>
              ) : (
                filteredCases.map((c) => {
                  const isSelected = selectedCaseId === c.case_id;
                  const conflicts = c.summary?.contradiction_count || 0;
                  const matches = c.summary?.agreement_count || 0;
                  const isClean = conflicts === 0;

                  const dateStr = safeFormatDate(c.created_at, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <div
                      key={c.case_id}
                      onClick={() => loadCaseDetail(c.case_id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 relative ${
                        isSelected
                          ? 'bg-[#0F172A] border-sky-500 shadow-md shadow-sky-950/40 ring-1 ring-sky-500/50'
                          : 'bg-[#0B1120] border-[#1E293B] hover:bg-[#0F172A] hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-mono text-xs font-bold text-sky-400 tracking-wide">
                            {c.case_id}
                          </span>
                          <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {c.domain || 'Audit'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-slate-500">{dateStr}</span>
                          <button
                            onClick={(e) => handleDeleteCase(e, c.case_id)}
                            className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                            type="button"
                            title="Delete case"
                          >
                            <span className="material-symbols-outlined text-[15px]">delete</span>
                          </button>
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                        {c.title || 'Document Reconciliation'}
                      </h4>

                      <div className="flex items-center justify-between pt-1 border-t border-[#1E293B]/60 text-[11px]">
                        {isClean ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            <span>Clean Match ({matches} items)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-medium">
                            <span className="material-symbols-outlined text-[14px]">error</span>
                            <span>{conflicts} Discrepanc{conflicts === 1 ? 'y' : 'ies'} Found</span>
                          </span>
                        )}

                        <span className="text-xs text-sky-400 font-semibold flex items-center gap-0.5">
                          <span>Inspect</span>
                          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Case Details & Findings Inspector */}
          <div
            className={`lg:col-span-7 flex flex-col gap-4 ${
              mobileView === 'list' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Mobile Back Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileView('list')}
                className="flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300 py-1 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Back to Case List</span>
              </button>
            </div>

            {loadingDetail ? (
              <div className="p-16 text-center rounded-2xl bg-[#0F172A] border border-[#1E293B] flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-[32px] text-sky-400 animate-spin">
                  hourglass_top
                </span>
                <p className="text-sm font-semibold text-white">
                  Loading case details [{selectedCaseId}]...
                </p>
                <p className="text-xs text-slate-400">Extracting findings and document comparisons.</p>
              </div>
            ) : !selectedCaseReport ? (
              <div className="p-16 text-center rounded-2xl bg-[#0F172A] border border-[#1E293B] flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[36px] text-slate-500">touch_app</span>
                <p className="text-sm font-bold text-white">Select a case from the list</p>
                <p className="text-xs text-slate-400 max-w-sm">
                  Click any past reconciliation on the left to immediately inspect all conflicting clauses, matched figures, and download official reports.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {/* Case Header Card */}
                <div className="p-6 rounded-2xl bg-[#0F172A] border border-[#1E293B] shadow-sm flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center gap-1">
                          <span>{selectedCaseReport.case?.case_id || selectedCaseId}</span>
                          <button
                            onClick={() =>
                              handleCopyCaseId(selectedCaseReport.case?.case_id || selectedCaseId)
                            }
                            className="hover:text-white transition-colors cursor-pointer"
                            title="Copy Case ID"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              {copiedId ? 'check' : 'content_copy'}
                            </span>
                          </button>
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {selectedCaseReport.case?.domain || 'General'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {safeFormatDate(selectedCaseReport.created_at)}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
                        {selectedCaseReport.case?.title || 'Document Reconciliation'}
                      </h3>
                    </div>

                    {/* Workbench Open Trigger */}
                    <button
                      onClick={() => onSelectCase(selectedCaseReport.case?.case_id || selectedCaseId)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 text-xs font-semibold border border-sky-500/30 transition-colors cursor-pointer shrink-0 self-start"
                      type="button"
                      title="Load this case into Workbench to edit documents or re-reconcile"
                    >
                      <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                      <span>Open in Workbench</span>
                    </button>
                  </div>

                  {/* Status Banner */}
                  <div
                    className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                      selectedConflictsCount > 0
                        ? 'bg-rose-950/20 border-rose-500/30'
                        : 'bg-emerald-950/20 border-emerald-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`material-symbols-outlined text-2xl ${
                          selectedConflictsCount > 0 ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {selectedConflictsCount > 0 ? 'error' : 'check_circle'}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white">
                          {selectedConflictsCount > 0
                            ? `${selectedConflictsCount} Discrepanc${
                                selectedConflictsCount === 1 ? 'y' : 'ies'
                              } Found — Review Required`
                            : '100% Consistent — All Checked Terms Match'}
                        </div>
                        <div className="text-[11px] text-slate-300 mt-0.5">
                          {selectedConflictsCount > 0
                            ? `${selectedMatchesCount} items match, but ${selectedConflictsCount} item${
                                selectedConflictsCount === 1 ? ' has' : 's have'
                              } contradictory terms.`
                            : 'Zero discrepancies or conflicting clauses detected between the records.'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 hidden sm:block">
                      <span className="text-[11px] text-slate-400 block">
                        Reconciled in{' '}
                        <strong>
                          {selectedCaseReport.summary?.execution_time_ms || 32} ms
                        </strong>
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center justify-end gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[13px]">verified</span>
                        <span>SHA-256 Sealed</span>
                      </span>
                    </div>
                  </div>

                  {/* Export Actions Toolbar */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-[#1E293B]">
                    <span className="text-xs font-semibold text-slate-400">Download Reports:</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() =>
                          downloadCasePdf(selectedCaseReport.case?.case_id || selectedCaseId)
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                        type="button"
                        title="Download executive PDF"
                      >
                        <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                        <span>Download PDF</span>
                      </button>

                      <button
                        onClick={() =>
                          downloadCaseMarkdown(selectedCaseReport.case?.case_id || selectedCaseId)
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-200 text-xs font-semibold border border-[#334155] transition-colors cursor-pointer"
                        type="button"
                        title="Download Markdown report"
                      >
                        <span className="material-symbols-outlined text-[16px] text-slate-400">
                          description
                        </span>
                        <span>Report (.md)</span>
                      </button>

                      <button
                        onClick={() =>
                          downloadCaseCert(selectedCaseReport.case?.case_id || selectedCaseId)
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-200 text-xs font-semibold border border-[#334155] transition-colors cursor-pointer"
                        type="button"
                        title="Download cryptographic certificate"
                      >
                        <span className="material-symbols-outlined text-[16px] text-emerald-400">
                          fingerprint
                        </span>
                        <span>Cert (.json)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Ingested Documents Compared */}
                <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] flex flex-col gap-3">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-sky-400">
                      folder_open
                    </span>
                    <span>Ingested Documents Compared</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#070B14] border border-[#1E293B] flex flex-col gap-1">
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span className="font-semibold text-rose-300 uppercase">Document A</span>
                        <span className="font-mono text-[10px]">Primary Record</span>
                      </div>
                      <div className="font-bold text-white truncate">
                        {sourceA?.label || 'Record A'}
                      </div>
                      {sourceA?.raw_text && (
                        <div className="text-[11px] text-slate-400 mt-1 line-clamp-2 italic leading-relaxed">
                          "{sourceA.raw_text}"
                        </div>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-[#070B14] border border-[#1E293B] flex flex-col gap-1">
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span className="font-semibold text-sky-300 uppercase">Document B</span>
                        <span className="font-mono text-[10px]">Counter Record</span>
                      </div>
                      <div className="font-bold text-white truncate">
                        {sourceB?.label || 'Record B'}
                      </div>
                      {sourceB?.raw_text && (
                        <div className="text-[11px] text-slate-400 mt-1 line-clamp-2 italic leading-relaxed">
                          "{sourceB.raw_text}"
                        </div>
                      )}
                    </div>
                  </div>

                  {sourceCorr && (
                    <div className="p-3 rounded-xl bg-[#070B14] border border-emerald-500/20 flex flex-col gap-1 text-xs">
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span className="font-semibold text-emerald-400 uppercase">
                          Corroborating Evidence (Document 3)
                        </span>
                        <span className="font-mono text-[10px]">Independent Proof</span>
                      </div>
                      <div className="font-bold text-white truncate">{sourceCorr.label}</div>
                      {sourceCorr.raw_text && (
                        <div className="text-[11px] text-slate-400 mt-1 line-clamp-2 italic leading-relaxed">
                          "{sourceCorr.raw_text}"
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Findings & Discrepancies Breakdown */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-sky-400">
                        fact_check
                      </span>
                      <span>Detailed Reconciliation Findings ({selectedFindings.length})</span>
                    </span>

                    {/* Sub-filter tabs */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <button
                        onClick={() => setDetailFilter('all')}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                          detailFilter === 'all'
                            ? 'bg-sky-600 text-white'
                            : 'bg-[#1E293B] text-slate-300 hover:text-white'
                        }`}
                        type="button"
                      >
                        All ({selectedFindings.length})
                      </button>
                      <button
                        onClick={() => setDetailFilter('conflict')}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                          detailFilter === 'conflict'
                            ? 'bg-rose-600 text-white'
                            : 'bg-[#1E293B] text-slate-300 hover:text-white'
                        }`}
                        type="button"
                      >
                        Discrepancies ({selectedConflictsCount})
                      </button>
                      <button
                        onClick={() => setDetailFilter('agreement')}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                          detailFilter === 'agreement'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#1E293B] text-slate-300 hover:text-white'
                        }`}
                        type="button"
                      >
                        Matches ({selectedMatchesCount})
                      </button>
                    </div>
                  </div>

                  {filteredFindings.length === 0 ? (
                    <div className="p-8 rounded-xl bg-[#0F172A] border border-[#1E293B] text-center text-xs text-slate-400">
                      No findings match the current filter.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {filteredFindings.map((item, idx) => {
                        const isConflict = item.status === 'CONTRADICTION';
                        const isAgreement =
                          item.status === 'AGREEMENT' || item.status === 'RULE_VERIFIED';
                        const isSupported = item.status === 'EVIDENCE_SUPPORTED';
                        const isExclusive = item.status === 'SOURCE_EXCLUSIVE';
                        const isExpanded = !!expandedCitations[idx];

                        let borderClass = 'border-l-4 border-l-slate-500';
                        let badgeClass = 'bg-slate-800 text-slate-300 border border-slate-700';
                        let badgeIcon = 'info';
                        let badgeLabel = 'Document Note';

                        if (isConflict) {
                          borderClass = 'border-l-4 border-l-rose-500';
                          badgeClass = 'bg-rose-500/10 text-rose-400 border border-rose-500/30';
                          badgeIcon = 'error';
                          badgeLabel = 'Discrepancy (Needs Review)';
                        } else if (isSupported) {
                          borderClass = 'border-l-4 border-l-sky-500';
                          badgeClass = 'bg-sky-500/10 text-sky-400 border border-sky-500/30';
                          badgeIcon = 'verified';
                          badgeLabel = 'Verified by Third Record';
                        } else if (isAgreement) {
                          borderClass = 'border-l-4 border-l-emerald-500';
                          badgeClass = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
                          badgeIcon = 'check_circle';
                          badgeLabel = 'Matches Exactly';
                        } else if (isExclusive) {
                          borderClass = 'border-l-4 border-l-amber-500/70';
                          badgeClass = 'bg-amber-500/10 text-amber-300 border border-amber-500/30';
                          badgeIcon = 'info';
                          badgeLabel = 'Single-Document Note';
                        }

                        const valAStr =
                          item.value_a !== null && item.value_a !== undefined
                            ? String(item.value_a)
                            : null;
                        const valBStr =
                          item.value_b !== null && item.value_b !== undefined
                            ? String(item.value_b)
                            : null;

                        return (
                          <div
                            key={idx}
                            className={`rounded-xl bg-[#0F172A] p-4 border border-[#1E293B] flex flex-col gap-3 transition-all ${borderClass}`}
                          >
                            {/* Card Top */}
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-xs text-white">
                                  {formatFieldName(item.property_name)}
                                </h4>
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${badgeClass}`}
                                >
                                  <span className="material-symbols-outlined text-[12px]">
                                    {badgeIcon}
                                  </span>
                                  <span>{badgeLabel}</span>
                                </span>
                              </div>

                              <button
                                onClick={() => toggleCitation(idx)}
                                className="text-[11px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                                type="button"
                              >
                                <span>{isExpanded ? 'Hide citations' : 'Show citations'}</span>
                                <span className="material-symbols-outlined text-[15px]">
                                  {isExpanded ? 'expand_less' : 'expand_more'}
                                </span>
                              </button>
                            </div>

                            {/* Side-by-Side Comparison Box */}
                            <div className="rounded-lg bg-[#070B14] border border-[#1E293B] overflow-hidden">
                              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#1E293B]">
                                <div className="p-3 flex flex-col gap-0.5">
                                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                                    <span className="font-semibold truncate">{docAName}</span>
                                    <span className="font-mono uppercase text-slate-500">
                                      Record A
                                    </span>
                                  </div>
                                  <div
                                    className={`text-xs font-semibold break-words mt-0.5 ${
                                      isConflict
                                        ? 'text-rose-300 font-bold'
                                        : valAStr !== null
                                        ? 'text-slate-100'
                                        : 'text-slate-500 italic'
                                    }`}
                                  >
                                    {valAStr !== null ? valAStr : 'Not stated in Record A'}
                                  </div>
                                </div>

                                <div className="p-3 flex flex-col gap-0.5">
                                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                                    <span className="font-semibold truncate">{docBName}</span>
                                    <span className="font-mono uppercase text-slate-500">
                                      Record B
                                    </span>
                                  </div>
                                  <div
                                    className={`text-xs font-semibold break-words mt-0.5 ${
                                      isConflict
                                        ? 'text-sky-300 font-bold'
                                        : valBStr !== null
                                        ? 'text-slate-100'
                                        : 'text-slate-500 italic'
                                    }`}
                                  >
                                    {valBStr !== null ? valBStr : 'Not stated in Record B'}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Financial Impact Banner */}
                            {item.financial_impact && (
                              <div className="bg-amber-950/30 border border-amber-500/30 px-3 py-2 rounded-lg text-xs flex items-center gap-2 text-amber-200">
                                <span className="material-symbols-outlined text-[16px] text-amber-400 shrink-0">
                                  payments
                                </span>
                                <span>
                                  <strong className="text-white">Calculated Financial Gap: </strong>
                                  {item.financial_impact.disputed_amount_usd !== undefined
                                    ? `$${item.financial_impact.disputed_amount_usd.toLocaleString()} USD variance (${item.financial_impact.percentage_point_discrepancy || 15} percentage-point gap on $${(item.financial_impact.eligible_revenue_usd || 12000).toLocaleString()} revenue)`
                                    : item.financial_impact.disputed_amount_ksh !== undefined
                                    ? `KSh ${item.financial_impact.disputed_amount_ksh.toLocaleString()} variance (${item.financial_impact.excess_units_billed || 10} excess units at KSh ${item.financial_impact.unit_price_ksh || 500}/unit)`
                                    : 'Financial difference calculated.'}
                                </span>
                              </div>
                            )}

                            {/* Explanation */}
                            <div className="text-xs text-slate-300 leading-relaxed bg-[#070B14]/60 p-2.5 rounded-lg border border-[#1E293B]">
                              <p className="m-0">
                                {item.explanation ||
                                  (isConflict
                                    ? `Discrepancy: ${docAName} states "${valAStr}", but ${docBName} states "${valBStr}".`
                                    : `Both documents agree on "${valAStr}".`)}
                              </p>
                              {item.recommended_action && isConflict && (
                                <p className="mt-1 pt-1 border-t border-[#1E293B] text-[11px] text-slate-400 m-0">
                                  <strong className="text-slate-300">Suggested Action: </strong>
                                  {item.recommended_action}
                                </p>
                              )}
                            </div>

                            {/* Citations Drawer */}
                            {isExpanded && (
                              <div className="pt-2 border-t border-[#1E293B] text-xs text-slate-400 flex flex-col gap-2">
                                {item.evidence_ref_a && (
                                  <div className="bg-[#070B14] p-2 rounded border border-[#1E293B]">
                                    <span className="text-[10px] font-semibold text-slate-300 block mb-0.5">
                                      {docAName} Citation:
                                    </span>
                                    <span className="font-mono text-[11px] text-slate-400">
                                      {item.evidence_ref_a}
                                    </span>
                                  </div>
                                )}
                                {item.evidence_ref_b && (
                                  <div className="bg-[#070B14] p-2 rounded border border-[#1E293B]">
                                    <span className="text-[10px] font-semibold text-slate-300 block mb-0.5">
                                      {docBName} Citation:
                                    </span>
                                    <span className="font-mono text-[11px] text-slate-400">
                                      {item.evidence_ref_b}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Auditor Sign-Off Decisions (if any exist) */}
                {selectedCaseReport.review_decisions &&
                  selectedCaseReport.review_decisions.length > 0 && (
                    <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] flex flex-col gap-3">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-emerald-400">
                          verified_user
                        </span>
                        <span>Auditor Review Sign-Off History</span>
                      </span>

                      <div className="flex flex-col gap-2">
                        {selectedCaseReport.review_decisions.map((rev, rIdx) => (
                          <div
                            key={rIdx}
                            className="p-3 rounded-xl bg-[#070B14] border border-[#1E293B] flex flex-col gap-1 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white">{rev.reviewer_name}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                  rev.action === 'APPROVE'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : rev.action === 'REJECT'
                                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                    : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                }`}
                              >
                                {rev.action}
                              </span>
                            </div>
                            <p className="text-slate-300 mt-1 m-0 italic">"{rev.reason}"</p>
                            <span className="text-[10px] text-slate-500 mt-0.5">
                              {safeFormatDate(rev.timestamp)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

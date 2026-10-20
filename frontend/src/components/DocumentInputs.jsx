import React, { useRef, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || '';

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
  hasFourthEvidence,
  onToggleFourthEvidence,
  corr4Label,
  setCorr4Label,
  corr4Text,
  setCorr4Text,
  onRunComparison,
  loading,
  isInputsEmpty,
  setIsStale,
  user,
  report,
}) {
  const fileInputARef = useRef(null);
  const fileInputBRef = useRef(null);
  const fileInputCRef = useRef(null);
  const fileInputDRef = useRef(null);

  const [fileAInfo, setFileAInfo] = useState(null);
  const [fileBInfo, setFileBInfo] = useState(null);
  const [fileCInfo, setFileCInfo] = useState(null);
  const [fileDInfo, setFileDInfo] = useState(null);

  const [isDraggingA, setIsDraggingA] = useState(false);
  const [isDraggingB, setIsDraggingB] = useState(false);
  const [isDraggingC, setIsDraggingC] = useState(false);
  const [isDraggingD, setIsDraggingD] = useState(false);

  const [uploadingA, setUploadingA] = useState(false);
  const [uploadingB, setUploadingB] = useState(false);
  const [uploadingC, setUploadingC] = useState(false);
  const [uploadingD, setUploadingD] = useState(false);

  const [isCollapsed, setIsCollapsed] = useState(false);

  const wordsA = sourceAText.trim() ? sourceAText.trim().split(/\s+/).filter(Boolean).length : 0;
  const wordsB = sourceBText.trim() ? sourceBText.trim().split(/\s+/).filter(Boolean).length : 0;
  const wordsC = corrText?.trim() ? corrText.trim().split(/\s+/).filter(Boolean).length : 0;
  const wordsD = corr4Text?.trim() ? corr4Text.trim().split(/\s+/).filter(Boolean).length : 0;

  const handleFileUpload = async (file, target) => {
    if (!file) return;
    const lowerName = file.name.toLowerCase();
    const isBinary = lowerName.endsWith('.docx') || lowerName.endsWith('.pdf');

    if (target === 'A') setUploadingA(true);
    if (target === 'B') setUploadingB(true);
    if (target === 'C') setUploadingC(true);
    if (target === 'D') setUploadingD(true);

    try {
      let extractedText = '';

      if (!isBinary) {
        // Fast local client-side extraction for plain text, markdown, csv, json, logs
        extractedText = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = () => reject(new Error('Failed to read file locally.'));
          reader.readAsText(file);
        });
      } else {
        // Process Word (.docx) or PDF via the backend extraction endpoint
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_BASE}/api/documents/extract-text`, {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || 'Failed to extract text from document.');
        }
        const data = await res.json();
        extractedText = data.text;
      }

      const sizeKb = Math.round(file.size / 1024) || 1;

      if (target === 'A') {
        setSourceAText(extractedText);
        setSourceALabel(file.name);
        setFileAInfo({ name: file.name, sizeKb });
      } else if (target === 'B') {
        setSourceBText(extractedText);
        setSourceBLabel(file.name);
        setFileBInfo({ name: file.name, sizeKb });
      } else if (target === 'C') {
        setCorrText(extractedText);
        setCorrLabel(file.name);
        setFileCInfo({ name: file.name, sizeKb });
      } else if (target === 'D') {
        setCorr4Text(extractedText);
        setCorr4Label(file.name);
        setFileDInfo({ name: file.name, sizeKb });
      }

      setIsStale(true);
    } catch (err) {
      alert(`Could not load ${file.name}: ${err.message}`);
    } finally {
      if (target === 'A') setUploadingA(false);
      if (target === 'B') setUploadingB(false);
      if (target === 'C') setUploadingC(false);
      if (target === 'D') setUploadingD(false);
    }
  };

  const handleScenarioChange = (scen) => {
    setFileAInfo(null);
    setFileBInfo(null);
    setFileCInfo(null);
    setFileDInfo(null);
    onSelectScenario(scen);
  };

  const handleCustomChange = () => {
    setFileAInfo(null);
    setFileBInfo(null);
    setFileCInfo(null);
    setFileDInfo(null);
    onCustomMode();
  };

  const handleClearAll = () => {
    setFileAInfo(null);
    setFileBInfo(null);
    setFileCInfo(null);
    setFileDInfo(null);
    onClearInputs();
  };

  return (
    <section className="flex flex-col gap-4 bg-[#0F172A] p-4 sm:p-6 rounded-xl border border-[#1E293B]">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputARef}
        className="hidden"
        accept=".txt,.md,.markdown,.csv,.tsv,.json,.docx,.pdf,.log,.rtf"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'A');
          e.target.value = '';
        }}
      />
      <input
        type="file"
        ref={fileInputBRef}
        className="hidden"
        accept=".txt,.md,.markdown,.csv,.tsv,.json,.docx,.pdf,.log,.rtf"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'B');
          e.target.value = '';
        }}
      />
      <input
        type="file"
        ref={fileInputCRef}
        className="hidden"
        accept=".txt,.md,.markdown,.csv,.tsv,.json,.docx,.pdf,.log,.rtf"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'C');
          e.target.value = '';
        }}
      />
      <input
        type="file"
        ref={fileInputDRef}
        className="hidden"
        accept=".txt,.md,.markdown,.csv,.tsv,.json,.docx,.pdf,.log,.rtf"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'D');
          e.target.value = '';
        }}
      />

      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-sm border border-sky-500/20 shrink-0">
            1
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Add Your Documents
            </h2>
            <p className="text-xs text-slate-400">
              Pick a sample scenario, paste text, or upload your document files (.docx, .pdf, .txt, .csv, .md).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap pt-1 sm:pt-0">
          {report && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded text-xs text-sky-400 hover:text-white bg-[#1E293B] hover:bg-[#334155] transition-colors cursor-pointer border border-sky-500/20"
              type="button"
              title={isCollapsed ? 'Expand document inputs' : 'Collapse document inputs'}
            >
              <span className="material-symbols-outlined text-[15px]">
                {isCollapsed ? 'unfold_more' : 'unfold_less'}
              </span>
              <span>{isCollapsed ? 'Expand' : 'Collapse'}</span>
            </button>
          )}
          <button
            onClick={handleClearAll}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded text-xs text-slate-400 hover:text-white bg-[#1E293B] hover:bg-[#334155] transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[15px]">clear_all</span>
            <span>Clear inputs</span>
          </button>
        </div>
      </div>

      {isCollapsed && report ? (
        /* Collapsed Compact View When Results Exist */
        <div className="rounded-lg bg-[#0B1120] p-4 border border-[#1E293B] flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-semibold text-slate-300">
              Active Ingested Documents (Compact View)
            </span>
            <button
              onClick={() => setIsCollapsed(false)}
              className="text-xs text-sky-400 hover:text-sky-300 underline font-medium cursor-pointer"
              type="button"
            >
              Expand to edit clauses or upload new files
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded bg-[#0F172A] border border-pink-500/30">
              <span className="text-[10px] uppercase font-bold text-pink-400">Record A</span>
              <div className="font-semibold text-slate-200 truncate mt-0.5">{sourceALabel || 'Document A'}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{sourceAText.length} chars • {wordsA} words</div>
            </div>
            <div className="p-2.5 rounded bg-[#0F172A] border border-sky-500/30">
              <span className="text-[10px] uppercase font-bold text-sky-400">Record B</span>
              <div className="font-semibold text-slate-200 truncate mt-0.5">{sourceBLabel || 'Document B'}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{sourceBText.length} chars • {wordsB} words</div>
            </div>
            {hasThirdEvidence && (
              <div className="p-2.5 rounded bg-[#0F172A] border border-emerald-500/30">
                <span className="text-[10px] uppercase font-bold text-emerald-400">Record 3 (Proof)</span>
                <div className="font-semibold text-slate-200 truncate mt-0.5">{corrLabel || 'Document 3'}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{corrText.length} chars • {wordsC} words</div>
              </div>
            )}
            {hasFourthEvidence && (
              <div className="p-2.5 rounded bg-[#0F172A] border border-emerald-500/30">
                <span className="text-[10px] uppercase font-bold text-emerald-400">Record 4 (Proof)</span>
                <div className="font-semibold text-slate-200 truncate mt-0.5">{corr4Label || 'Document 4'}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{corr4Text.length} chars • {wordsD} words</div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Scenario Template Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 rounded-lg bg-[#0B1120] border border-[#1E293B]">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1 mr-1">
                <span className="material-symbols-outlined text-[15px] text-sky-400">tune</span>
                <span>Intake Mode:</span>
              </span>

              <button
                type="button"
                onClick={handleCustomChange}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeScenarioId === 'custom'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-[#1E293B] text-slate-300 hover:text-white hover:bg-[#334155]'
                }`}
              >
                Custom Documents
              </button>

              {/* Demo Sandbox only: show demo benchmark templates */}
              {(!user || user.user_id === 'usr-demo') && (
                <>
                  <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block"></div>
                  <span className="text-[11px] text-slate-400 hidden sm:inline mr-1">Demo Benchmarks:</span>
                  {scenarios
                    .filter((s) => s.id !== 'custom')
                    .map((scen) => {
                      const isActive = activeScenarioId === scen.id;
                      return (
                        <button
                          key={scen.id}
                          onClick={() => handleScenarioChange(scen)}
                          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-sky-600 text-white shadow-sm'
                              : 'bg-[#1E293B] text-slate-300 hover:text-white hover:bg-[#334155]'
                          }`}
                          type="button"
                          title={scen.subtitle}
                        >
                          {scen.name}
                        </button>
                      );
                    })}
                </>
              )}
            </div>

            {activeScenarioId !== 'custom' && (!user || user.user_id === 'usr-demo') && (
              <span className="text-[11px] text-slate-400 italic">
                Sample benchmark loaded. Edit any field or drop your own files below.
              </span>
            )}
          </div>

          {/* Air-Gapped Multi-Agent Intake Pipeline Architecture Banner */}
          <div className="bg-[#070B14] p-3.5 rounded-xl border border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center -space-x-2">
                <div className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-400 flex items-center justify-center font-bold text-xs shadow-sm">
                  A
                </div>
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center font-bold text-xs shadow-sm">
                  B
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white tracking-wide flex items-center gap-1.5">
                  <span>Air-Gapped Multi-Agent Intake Pods</span>
                  <span className="text-[10px] px-2 py-0.2 rounded font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    AIR-GAP ACTIVE
                  </span>
                </span>
                <span className="text-[11px] text-slate-400">
                  Agent A (*Record Verifier*) and Agent B (*Context Challenger*) ingest documents in total isolation. Zero prompt contamination.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-slate-400 font-mono px-2 py-1 rounded bg-[#0B1120] border border-[#1E293B]">
                Protocol: <strong className="text-sky-400">Omega 5-Stage</strong>
              </span>
              <span className="text-[10px] text-slate-400 font-mono px-2 py-1 rounded bg-[#0B1120] border border-[#1E293B]">
                Engine: <strong className="text-purple-400">MeTTa S-Expr</strong>
              </span>
            </div>
          </div>

          {/* Split Document Inputs — Isolated Agent Intake Pods */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Agent A Pod */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingA(true);
              }}
              onDragLeave={() => setIsDraggingA(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingA(false);
                if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0], 'A');
              }}
              className={`flex flex-col gap-2.5 bg-[#0B1120] p-4 rounded-xl border transition-all ${
                isDraggingA
                  ? 'border-dashed border-pink-400 bg-pink-950/20 ring-2 ring-pink-500/30'
                  : 'border-[#1E293B] hover:border-pink-500/40'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-pink-500/10 border border-pink-500/30 text-pink-400 flex items-center justify-center font-bold font-mono text-[11px] shrink-0">
                    A
                  </div>
                  <div>
                    <span className="text-xs font-bold text-pink-400 uppercase tracking-wide block">
                      Agent A: Record Verifier
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Isolated Pod A • Scoped Claim Register
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#1E293B]">
                  <button
                    onClick={() => fileInputARef.current?.click()}
                    disabled={uploadingA}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1E293B] hover:bg-[#334155] text-slate-200 text-[11px] font-medium transition-colors border border-[#334155] cursor-pointer"
                    type="button"
                    title="Upload document file (.docx, .pdf, .txt, .csv, .md)"
                  >
                    <span className="material-symbols-outlined text-[15px] text-pink-400">upload_file</span>
                    <span>{uploadingA ? 'Loading...' : 'Upload File'}</span>
                  </button>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {sourceAText.length} chars • {wordsA} words
                  </span>
                </div>
              </div>

              {/* Uploaded File Chip */}
              {fileAInfo && (
                <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-pink-950/30 border border-pink-500/30 text-xs text-pink-200">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="material-symbols-outlined text-[16px] text-pink-400">description</span>
                    <span className="font-semibold truncate">{fileAInfo.name}</span>
                    <span className="text-slate-400 text-[11px]">({fileAInfo.sizeKb} KB)</span>
                  </div>
                  <button
                    onClick={() => setFileAInfo(null)}
                    className="text-pink-400 hover:text-pink-300 ml-2 text-[11px] cursor-pointer flex items-center"
                    type="button"
                    title="Dismiss file tag"
                  >
                    <span className="material-symbols-outlined text-[13px]">close</span>
                  </button>
                </div>
              )}

              <input
                type="text"
                value={sourceALabel}
                onChange={(e) => {
                  setSourceALabel(e.target.value);
                  setIsStale(true);
                }}
                className="w-full px-3 py-1.5 rounded bg-[#0F172A] text-xs font-semibold text-white border border-[#334155] focus:outline-none focus:border-pink-500"
                placeholder="Document label (e.g. Purchase Order PO-2026-089)..."
              />

              <textarea
                rows={7}
                value={sourceAText}
                onChange={(e) => {
                  setSourceAText(e.target.value);
                  setIsStale(true);
                }}
                placeholder="Paste your first document text, or drag and drop a file (.docx, .pdf, .txt, .csv) here..."
                className="w-full p-3 rounded bg-[#0F172A] text-xs text-slate-200 leading-relaxed border border-[#334155] focus:outline-none focus:border-pink-500 resize-none font-sans"
              />
            </div>

            {/* Agent B Pod */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingB(true);
              }}
              onDragLeave={() => setIsDraggingB(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingB(false);
                if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0], 'B');
              }}
              className={`flex flex-col gap-2.5 bg-[#0B1120] p-4 rounded-xl border transition-all ${
                isDraggingB
                  ? 'border-dashed border-sky-400 bg-sky-950/20 ring-2 ring-sky-500/30'
                  : 'border-[#1E293B] hover:border-sky-500/40'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold font-mono text-[11px] shrink-0">
                    B
                  </div>
                  <div>
                    <span className="text-xs font-bold text-sky-400 uppercase tracking-wide block">
                      Agent B: Context Challenger
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Isolated Pod B • Scoped Claim Register
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#1E293B]">
                  <button
                    onClick={() => fileInputBRef.current?.click()}
                    disabled={uploadingB}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1E293B] hover:bg-[#334155] text-slate-200 text-[11px] font-medium transition-colors border border-[#334155] cursor-pointer"
                    type="button"
                    title="Upload document file (.docx, .pdf, .txt, .csv, .md)"
                  >
                    <span className="material-symbols-outlined text-[15px] text-sky-400">upload_file</span>
                    <span>{uploadingB ? 'Loading...' : 'Upload File'}</span>
                  </button>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {sourceBText.length} chars • {wordsB} words
                  </span>
                </div>
              </div>

              {/* Uploaded File Chip */}
              {fileBInfo && (
                <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-sky-950/30 border border-sky-500/30 text-xs text-sky-200">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="material-symbols-outlined text-[16px] text-sky-400">description</span>
                    <span className="font-semibold truncate">{fileBInfo.name}</span>
                    <span className="text-slate-400 text-[11px]">({fileBInfo.sizeKb} KB)</span>
                  </div>
                  <button
                    onClick={() => setFileBInfo(null)}
                    className="text-sky-400 hover:text-sky-300 ml-2 text-[11px] cursor-pointer flex items-center"
                    type="button"
                    title="Dismiss file tag"
                  >
                    <span className="material-symbols-outlined text-[13px]">close</span>
                  </button>
                </div>
              )}

              <input
                type="text"
                value={sourceBLabel}
                onChange={(e) => {
                  setSourceBLabel(e.target.value);
                  setIsStale(true);
                }}
                className="w-full px-3 py-1.5 rounded bg-[#0F172A] text-xs font-semibold text-white border border-[#334155] focus:outline-none focus:border-sky-500"
                placeholder="Document label (e.g. Supplier Invoice INV-2026-104)..."
              />

              <textarea
                rows={7}
                value={sourceBText}
                onChange={(e) => {
                  setSourceBText(e.target.value);
                  setIsStale(true);
                }}
                placeholder="Paste the document to compare with, or drag and drop a file (.docx, .pdf, .txt, .csv) here..."
                className="w-full p-3 rounded bg-[#0F172A] text-xs text-slate-200 leading-relaxed border border-[#334155] focus:outline-none focus:border-sky-500 resize-none font-sans"
              />
            </div>
          </div>

          {/* Optional Independent Third & Fourth Sources */}
          <div id="supporting-evidence-section" className="flex flex-col gap-3 bg-[#0B1120] p-4 rounded-lg border border-[#1E293B]">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={hasThirdEvidence}
                  onChange={(e) => onToggleThirdEvidence(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
                <span>
                  Have a supporting document to verify results?{' '}
                  <strong className={hasThirdEvidence ? 'text-emerald-400' : 'text-slate-500'}>
                    {hasThirdEvidence ? '(Enabled)' : '(Disabled)'}
                  </strong>
                </span>
              </label>
              <span className="text-[11px] text-slate-400">
                Inject signed amendments, delivery receipts, or catalogue records to resolve disputes.
              </span>
            </div>

            {hasThirdEvidence && (
              <div className="flex flex-col gap-4 pt-2 border-t border-[#1E293B]">
                {/* Document 3 */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingC(true);
                  }}
                  onDragLeave={() => setIsDraggingC(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingC(false);
                    if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0], 'C');
                  }}
                  className={`flex flex-col gap-2 rounded-lg p-3 transition-all ${
                    isDraggingC
                      ? 'border border-dashed border-emerald-400 bg-emerald-950/20'
                      : 'bg-[#0F172A] border border-[#1E293B]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      <span>Ground-Truth Corroboration Anchor (Neutral Tier 3)</span>
                      {uploadingC && (
                        <span className="text-[10px] text-emerald-300 animate-pulse font-normal">
                          (Extracting...)
                        </span>
                      )}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => fileInputCRef.current?.click()}
                        disabled={uploadingC}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1E293B] hover:bg-[#334155] text-slate-200 text-[11px] font-medium transition-colors border border-[#334155] cursor-pointer"
                        type="button"
                        title="Upload third document file (.docx, .pdf, .txt, .csv, .md)"
                      >
                        <span className="material-symbols-outlined text-[15px] text-emerald-400">upload_file</span>
                        <span>{uploadingC ? 'Loading...' : 'Upload File'}</span>
                      </button>
                      <span className="text-[11px] text-slate-500">{corrText.length} chars • {wordsC} words</span>
                    </div>
                  </div>

                  {fileCInfo && (
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="material-symbols-outlined text-[16px] text-emerald-400">description</span>
                        <span className="font-semibold truncate">{fileCInfo.name}</span>
                        <span className="text-slate-400 text-[11px]">({fileCInfo.sizeKb} KB)</span>
                      </div>
                      <button
                        onClick={() => setFileCInfo(null)}
                        className="text-emerald-400 hover:text-emerald-300 ml-2 text-[11px] cursor-pointer flex items-center"
                        type="button"
                        title="Dismiss file tag"
                      >
                        <span className="material-symbols-outlined text-[13px]">close</span>
                      </button>
                    </div>
                  )}

                  <input
                    type="text"
                    value={corrLabel}
                    onChange={(e) => {
                      setCorrLabel(e.target.value);
                      setIsStale(true);
                    }}
                    className="w-full px-3 py-1.5 rounded bg-[#0B1120] text-xs font-semibold text-white border border-[#334155] focus:outline-none focus:border-emerald-500"
                    placeholder="3rd Document label (e.g. Signed Amendment / Addendum)..."
                  />
                  <textarea
                    rows={4}
                    value={corrText}
                    onChange={(e) => {
                      setCorrText(e.target.value);
                      setIsStale(true);
                    }}
                    placeholder="Paste independent third document here, or drag and drop a file..."
                    className="w-full p-3 rounded bg-[#0B1120] text-xs text-slate-200 leading-relaxed border border-[#334155] focus:outline-none focus:border-emerald-500 resize-none font-sans"
                  />
                </div>

                {/* Document 4 (Optional Second Supporting Proof) */}
                {hasFourthEvidence ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingD(true);
                    }}
                    onDragLeave={() => setIsDraggingD(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingD(false);
                      if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0], 'D');
                    }}
                    className={`flex flex-col gap-2 rounded-lg p-3 transition-all ${
                      isDraggingD
                        ? 'border border-dashed border-emerald-400 bg-emerald-950/20'
                        : 'bg-[#0F172A] border border-[#1E293B]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                          <span>Fourth Document (Proof 2)</span>
                          {uploadingD && (
                            <span className="text-[10px] text-emerald-300 animate-pulse font-normal">
                              (Extracting...)
                            </span>
                          )}
                        </span>
                        <button
                          onClick={() => onToggleFourthEvidence(false)}
                          className="text-[11px] text-red-400 hover:text-red-300 ml-1 cursor-pointer"
                          type="button"
                          title="Remove Document 4"
                        >
                          (Remove)
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => fileInputDRef.current?.click()}
                          disabled={uploadingD}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1E293B] hover:bg-[#334155] text-slate-200 text-[11px] font-medium transition-colors border border-[#334155] cursor-pointer"
                          type="button"
                          title="Upload fourth document file (.docx, .pdf, .txt, .csv, .md)"
                        >
                          <span className="material-symbols-outlined text-[15px] text-emerald-400">upload_file</span>
                          <span>{uploadingD ? 'Loading...' : 'Upload File'}</span>
                        </button>
                        <span className="text-[11px] text-slate-500">{corr4Text.length} chars • {wordsD} words</span>
                      </div>
                    </div>

                    {fileDInfo && (
                      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="material-symbols-outlined text-[16px] text-emerald-400">description</span>
                          <span className="font-semibold truncate">{fileDInfo.name}</span>
                          <span className="text-slate-400 text-[11px]">({fileDInfo.sizeKb} KB)</span>
                        </div>
                        <button
                          onClick={() => setFileDInfo(null)}
                          className="text-emerald-400 hover:text-emerald-300 ml-2 text-[11px] cursor-pointer flex items-center"
                          type="button"
                          title="Dismiss file tag"
                        >
                          <span className="material-symbols-outlined text-[13px]">close</span>
                        </button>
                      </div>
                    )}

                    <input
                      type="text"
                      value={corr4Label}
                      onChange={(e) => {
                        setCorr4Label(e.target.value);
                        setIsStale(true);
                      }}
                      className="w-full px-3 py-1.5 rounded bg-[#0B1120] text-xs font-semibold text-white border border-[#334155] focus:outline-none focus:border-emerald-500"
                      placeholder="4th Document label (e.g. Delivery Receipt / Certified Log)..."
                    />
                    <textarea
                      rows={4}
                      value={corr4Text}
                      onChange={(e) => {
                        setCorr4Text(e.target.value);
                        setIsStale(true);
                      }}
                      placeholder="Paste additional fourth document here, or drag and drop a file..."
                      className="w-full p-3 rounded bg-[#0B1120] text-xs text-slate-200 leading-relaxed border border-[#334155] focus:outline-none focus:border-emerald-500 resize-none font-sans"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#0F172A] border border-[#1E293B]">
                    <span className="text-xs text-slate-400">
                      Have another supporting record (like a separate delivery note or catalogue item)?
                    </span>
                    <button
                      onClick={() => onToggleFourthEvidence(true)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#1E293B] hover:bg-[#334155] text-emerald-400 hover:text-emerald-300 text-xs font-semibold transition-colors border border-emerald-500/30 cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[15px]">add_circle</span>
                      <span>+ Add Document 4 (Next Proof)</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Primary Action Button */}
      <div className="flex items-center justify-end pt-2">
        <button
          onClick={() => onRunComparison()}
          disabled={loading || isInputsEmpty}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
            loading || isInputsEmpty
              ? 'bg-slate-700 text-slate-400 opacity-60 cursor-not-allowed'
              : 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/20 active:scale-98'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
          <span>{loading ? 'Comparing Documents...' : 'Compare My Documents'}</span>
        </button>
      </div>
    </section>
  );
}

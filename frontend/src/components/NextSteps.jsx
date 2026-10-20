import React from 'react';

export default function NextSteps({
  hasThirdEvidence,
  hasFourthEvidence,
  corrLabel,
  corr4Label,
  corrText,
  corr4Text,
  onEnableThirdEvidence,
  onEnableFourthEvidence,
  onOpenSignOffModal,
  onOpenReportModal,
  downloadPdf,
  downloadMarkdown,
  downloadCert,
}) {
  const isDoc3Active = !!hasThirdEvidence;
  const isDoc4Active = !!hasFourthEvidence;
  const hasDoc3Content = isDoc3Active && (corrText?.trim()?.length > 0 || corrLabel?.trim()?.length > 0);
  const hasDoc4Content = isDoc4Active && (corr4Text?.trim()?.length > 0 || corr4Label?.trim()?.length > 0);

  return (
    <section className="flex flex-col gap-4">
      {/* Step Header */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-sm border border-sky-500/20">
          3
        </div>
        <div>
          <h2 className="text-base font-bold text-white">
            Next Steps for Your Audit
          </h2>
          <p className="text-xs text-slate-400">
            Take action on identified discrepancies, record your review decision, or export audit reports.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Add Supporting Proof */}
        <div className="flex flex-col justify-between gap-4 p-5 rounded-xl bg-[#0F172A] border border-[#1E293B]">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[18px]">attachment</span>
              <span>
                {isDoc4Active
                  ? 'Supporting Proof Active (Docs 3 & 4)'
                  : isDoc3Active
                  ? 'Supporting Proof Active (Doc 3)'
                  : '1. Add Supporting Proof'}
              </span>
            </div>

            <h3 className="font-bold text-sm text-white">
              {isDoc4Active
                ? `Documents 3 & 4 Attached`
                : isDoc3Active
                ? `Document 3 Included: ${corrLabel || 'Supporting Record'}`
                : 'Have an amendment or receipt?'}
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              {isDoc4Active ? (
                <span>
                  Two independent records (<strong>{corrLabel || 'Doc 3'}</strong> and <strong>{corr4Label || 'Doc 4'}</strong>) are attached to corroborate disputed terms.
                </span>
              ) : isDoc3Active ? (
                <span>
                  <strong>{corrLabel || 'Document 3'}</strong> is active. You can attach an additional corroborating record (Document 4) if needed.
                </span>
              ) : (
                'Enable supporting proof above to attach a signed change order, delivery receipt, or catalogue record to resolve open disputes.'
              )}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {!isDoc3Active ? (
              <button
                onClick={onEnableThirdEvidence}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-200 text-xs font-semibold transition-colors border border-[#334155] cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-emerald-400 text-[16px]">add_circle</span>
                <span>Enable Document 3</span>
              </button>
            ) : !isDoc4Active ? (
              <button
                onClick={onEnableFourthEvidence}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 text-xs font-semibold transition-colors border border-emerald-500/40 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-emerald-400 text-[16px]">add_circle</span>
                <span>+ Add Document 4 (Next Proof)</span>
              </button>
            ) : (
              <div className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                <span className="material-symbols-outlined text-emerald-400 text-[16px]">verified</span>
                <span>Supporting Proof Configured</span>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Record Approval */}
        <div className="flex flex-col justify-between gap-4 p-5 rounded-xl bg-[#0F172A] border border-[#1E293B]">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[18px]">draw</span>
              <span>2. Record Approval</span>
            </div>
            <h3 className="font-bold text-sm text-white">
              Auditor Sign-Off Form
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Record a formal action (Approve, Request Evidence, or Reject) with a written justification permanently saved to the audit ledger.
            </p>
          </div>
          <button
            onClick={onOpenSignOffModal}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Open Review Sign-Off Form</span>
          </button>
        </div>

        {/* Card 3: Finalize & Export */}
        <div className="flex flex-col justify-between gap-4 p-5 rounded-xl bg-[#0F172A] border border-[#1E293B]">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>3. Finalize & Export</span>
            </div>
            <h3 className="font-bold text-sm text-white">
              Download Audit Reports
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Download the executive PDF report, preview print format, or export plain Markdown and cryptographic certificates.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={downloadPdf}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                type="button"
                title="Download executive PDF document"
              >
                <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                <span>Download PDF</span>
              </button>
              <button
                onClick={onOpenReportModal}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-200 text-xs font-semibold transition-colors border border-[#334155] cursor-pointer"
                type="button"
                title="Preview report and print"
              >
                <span className="material-symbols-outlined text-[16px] text-sky-400">visibility</span>
                <span>Preview</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={downloadMarkdown}
                className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-200 text-xs font-medium transition-colors border border-[#334155] cursor-pointer"
                type="button"
                title="Download plain-English Markdown report"
              >
                <span className="material-symbols-outlined text-[15px] text-sky-400">article</span>
                <span>Report (.md)</span>
              </button>
              <button
                onClick={downloadCert}
                className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-200 text-xs font-medium transition-colors border border-[#334155] cursor-pointer"
                type="button"
                title="Download cryptographic JSON certificate"
              >
                <span className="material-symbols-outlined text-[15px] text-emerald-400">token</span>
                <span>Cert (.json)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

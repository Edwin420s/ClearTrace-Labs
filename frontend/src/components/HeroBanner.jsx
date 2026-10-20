import React from 'react';

export default function HeroBanner({
  onOpenReportModal,
  downloadPdf,
  downloadMarkdown,
  downloadCert,
  report,
}) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-[#0F172A] p-4 sm:p-6 md:p-8 shadow-sm border border-[#1E293B]">
      {/* Soft Ambient Glow Orbs */}
      <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-sky-500/5 blur-3xl pointer-events-none"></div>
      <div className="absolute right-1/3 -bottom-24 w-72 h-72 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-5 sm:gap-6">
        <div className="flex flex-col gap-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-[11px] sm:text-xs font-semibold text-emerald-400 tracking-wide uppercase">
              Evidence-First Reconciliation
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Compare Two Documents. Spot Discrepancies Instantly.
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Upload or paste two conflicting records—such as a Purchase Order and an Invoice, or a Split Sheet and a Royalty Statement. ClearTrace highlights what matches, flags disagreements, and calculates the exact financial impact without making assumptions.
          </p>
        </div>

        {report && (
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#1E293B]">
            {downloadPdf && (
              <button
                onClick={downloadPdf}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                type="button"
                title="Download formatted executive PDF"
              >
                <span className="material-symbols-outlined text-[17px]">picture_as_pdf</span>
                <span>Download PDF</span>
              </button>
            )}
            <button
              onClick={onOpenReportModal}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-200 text-xs font-semibold border border-[#334155] transition-colors cursor-pointer"
              type="button"
              title="Preview, print, or download audit report"
            >
              <span className="material-symbols-outlined text-sky-400 text-[17px]">visibility</span>
              <span>Preview & Print</span>
            </button>
            <button
              onClick={downloadMarkdown}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-200 text-xs font-semibold border border-[#334155] transition-colors cursor-pointer"
              type="button"
              title="Download human-readable markdown report"
            >
              <span className="material-symbols-outlined text-slate-400 text-[17px]">description</span>
              <span>Report (.md)</span>
            </button>
            <button
              onClick={downloadCert}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-200 text-xs font-semibold border border-[#334155] transition-colors cursor-pointer"
              type="button"
              title="Download tamper-evident certificate"
            >
              <span className="material-symbols-outlined text-emerald-400 text-[17px]">fingerprint</span>
              <span>Cert (.json)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

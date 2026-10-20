import React, { useState, useEffect } from 'react';

export default function SignOffModal({
  isOpen,
  onClose,
  onSubmitSignOff,
  loading,
  user,
}) {
  const getDefaultName = () => {
    if (user?.full_name) {
      return `${user.full_name}, ${user.organization || 'Auditor'}`;
    }
    return '';
  };

  const [auditorName, setAuditorName] = useState(getDefaultName());
  const [decision, setDecision] = useState('');
  const [rationale, setRationale] = useState('');

  useEffect(() => {
    if (user?.full_name) {
      setAuditorName(`${user.full_name}, ${user.organization || 'Auditor'}`);
    }
  }, [user]);

  if (!isOpen) return null;

  const isValid =
    decision &&
    auditorName.trim().length >= 3 &&
    rationale.trim().length >= 10;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmitSignOff({
      reviewer_name: auditorName.trim(),
      action: decision,
      reason: rationale.trim(),
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signoff-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0B1120] border border-[#1E293B] shadow-2xl p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-mono font-bold text-sm shadow-sm">
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
            </div>
            <div>
              <h3 id="signoff-modal-title" className="text-base font-bold text-white tracking-tight">
                Cryptographic Auditor Sign-Off
              </h3>
              <p className="text-xs text-slate-400">
                Record a formal sign-off decision sealed into the permanent audit ledger.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-white hover:bg-[#1E293B] p-1.5 rounded-lg transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Reviewer Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              Auditor Identity / Examiner
            </label>
            <input
              type="text"
              value={auditorName}
              onChange={(e) => setAuditorName(e.target.value)}
              placeholder="e.g. Jane Doe, Senior Internal Auditor"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#070B14] text-white text-xs border border-[#1E293B] focus:outline-none focus:border-sky-500 transition-colors font-medium"
              required
            />
          </div>

          {/* Decision */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              Formal Review Action
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <label
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl cursor-pointer transition-all border text-center ${
                  decision === 'APPROVE'
                    ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300 shadow-sm'
                    : 'bg-[#070B14] border-[#1E293B] text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="signoff-decision"
                  value="APPROVE"
                  checked={decision === 'APPROVE'}
                  onChange={(e) => setDecision(e.target.value)}
                  className="hidden"
                />
                <span className="material-symbols-outlined text-[20px] text-emerald-400">check_circle</span>
                <span className="text-xs font-bold">Approve</span>
                <span className="text-[10px] text-slate-400">Accept terms</span>
              </label>

              <label
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl cursor-pointer transition-all border text-center ${
                  decision === 'REQUEST_EVIDENCE'
                    ? 'bg-sky-950/30 border-sky-500/50 text-sky-300 shadow-sm'
                    : 'bg-[#070B14] border-[#1E293B] text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="signoff-decision"
                  value="REQUEST_EVIDENCE"
                  checked={decision === 'REQUEST_EVIDENCE'}
                  onChange={(e) => setDecision(e.target.value)}
                  className="hidden"
                />
                <span className="material-symbols-outlined text-[20px] text-sky-400">help</span>
                <span className="text-xs font-bold">Request Proof</span>
                <span className="text-[10px] text-slate-400">Hold for evidence</span>
              </label>

              <label
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl cursor-pointer transition-all border text-center ${
                  decision === 'REJECT'
                    ? 'bg-rose-950/30 border-rose-500/50 text-rose-300 shadow-sm'
                    : 'bg-[#070B14] border-[#1E293B] text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="signoff-decision"
                  value="REJECT"
                  checked={decision === 'REJECT'}
                  onChange={(e) => setDecision(e.target.value)}
                  className="hidden"
                />
                <span className="material-symbols-outlined text-[20px] text-rose-400">cancel</span>
                <span className="text-xs font-bold">Reject</span>
                <span className="text-[10px] text-slate-400">Flag dispute</span>
              </label>
            </div>
            {!decision && (
              <p className="text-[11px] text-amber-400/90 flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[14px]">info</span>
                <span>Select a formal action above to record an accountable human-in-the-loop audit sign-off.</span>
              </p>
            )}
          </div>

          {/* Rationale */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                Auditor Justification Rationale
              </label>
              <span className="text-[10px] text-slate-400">
                {rationale.trim().length < 10
                  ? `${10 - rationale.trim().length} more characters required`
                  : 'Meets minimum justification'}
              </span>
            </div>
            <textarea
              rows={3}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Provide your specific auditor findings, reason for approval, dispute hold, or needed documents..."
              className="w-full h-24 p-3 rounded-lg bg-[#070B14] text-white text-xs border border-[#1E293B] focus:outline-none focus:border-sky-500 leading-relaxed resize-none transition-colors"
              required
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-[#1E293B]">
            <span className="text-[11px] text-slate-400">
              {!decision
                ? 'Action required'
                : !auditorName.trim()
                ? 'Auditor name required'
                : rationale.trim().length < 10
                ? 'Min 10 chars rationale required'
                : 'Ready to seal'}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-300 text-xs font-semibold border border-[#334155] transition-colors cursor-pointer"
                type="button"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !isValid}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                  loading || !isValid
                    ? 'bg-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
                    : 'bg-sky-600 hover:bg-sky-500 text-white cursor-pointer shadow-sky-900/30'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>{loading ? 'Sealing...' : 'Sign & Seal Decision'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

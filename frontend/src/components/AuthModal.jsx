import React, { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || '';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!email.trim() || !password || !fullName.trim()) {
          throw new Error('Please fill in all required fields (Name, Email, Password).');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        const res = await fetch(`${API_BASE}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password,
            full_name: fullName.trim(),
            organization: organization.trim() || 'Independent Auditor',
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.detail || 'Account registration failed.');
        }

        onAuthSuccess(data);
        onClose();
      } else {
        if (!email.trim() || !password) {
          throw new Error('Please enter your email and password.');
        }

        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.detail || 'Sign-in failed. Please verify your credentials.');
        }

        onAuthSuccess(data);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      <div className="bg-[#0B1120] border border-[#1E293B] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-[#1E293B] bg-gradient-to-b from-[#0F172A] to-[#0B1120] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-mono font-bold text-sm shadow-sm shrink-0">
              CT
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-base sm:text-lg font-bold text-white tracking-tight">
                {mode === 'register' ? 'Create Auditor Account' : 'Sign In to ClearTrace'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                {mode === 'register'
                  ? 'Independent, private workspace for your documents'
                  : 'Access your private reconciliations and audit certificates'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1E293B] transition-colors cursor-pointer shrink-0"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-5">
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#070B14] border border-[#1E293B]">
            <button
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              type="button"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              type="button"
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 flex flex-col gap-3.5 sm:gap-4 overflow-y-auto">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name <span className="text-sky-400">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#070B14] border border-[#1E293B] text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Email Address <span className="text-sky-400">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. sarah@forensicaudit.com"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#070B14] border border-[#1E293B] text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Organization / Firm <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. Apex Forensic Partners"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#070B14] border border-[#1E293B] text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Password <span className="text-sky-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter your password'}
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-[#070B14] border border-[#1E293B] text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-sky-900/50 text-white font-semibold text-xs transition-colors shadow-lg shadow-sky-900/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">
                  {mode === 'register' ? 'person_add' : 'login'}
                </span>
                <span>{mode === 'register' ? 'Create Private Account' : 'Sign In'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

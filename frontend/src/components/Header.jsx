import React, { useState, useRef, useEffect } from 'react';

export default function Header({
  activeTab,
  setActiveTab,
  onResetInputs,
  onNewAudit,
  onOpenReportModal,
  report,
  caseCount = 0,
  user,
  onOpenAuth,
  onLogout,
}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDemo = user?.user_id === 'usr-demo';

  const getUserInitials = () => {
    if (!user || !user.full_name) return 'AU';
    const parts = user.full_name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return user.full_name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 w-full z-50 bg-[#0B1120]/95 backdrop-blur-xl border-b border-[#1E293B] shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-3 py-3">
        {/* Left: Logo and Brand */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setActiveTab('landing')}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 font-bold font-mono text-sm cursor-pointer shadow-sm shadow-sky-900/20"
            title="ClearTrace Labs Home"
          >
            CT
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span
                onClick={() => setActiveTab('landing')}
                className="font-bold text-base text-white tracking-tight cursor-pointer hover:text-sky-300 transition-colors"
              >
                ClearTrace Labs
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Evidence-First
              </span>
            </div>
            <span className="text-xs text-slate-400 hidden sm:block">
              Multi-Agent Document Discrepancy & Reconciliation Engine
            </span>
          </div>
        </div>

        {/* Center: Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-[#0F172A] p-1 rounded-xl border border-[#1E293B]">
          <button
            onClick={() => setActiveTab('landing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'landing'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-[#1E293B]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">hub</span>
            <span>Product</span>
          </button>

          <button
            onClick={() => {
              if (!user) {
                onOpenAuth('login');
                return;
              }
              setActiveTab('workbench');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'workbench'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-[#1E293B]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">compare_arrows</span>
            <span>Reconcile</span>
          </button>

          <button
            onClick={() => {
              if (!user) {
                onOpenAuth('login');
                return;
              }
              setActiveTab('history');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-[#1E293B]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">folder_open</span>
            <span><span className="hidden sm:inline">Audit </span>History</span>
            {user && caseCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#1E293B] text-slate-300 ml-0.5">
                {caseCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right: Actions Cluster & User Account */}
        <div className="flex items-center gap-2">
          {/* New Audit Quick Action (only for logged-in users) */}
          {user && (
            <button
              onClick={onNewAudit}
              className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 text-xs font-semibold border border-sky-500/30 transition-colors cursor-pointer"
              type="button"
              title="Start a new document comparison"
            >
              <span className="material-symbols-outlined text-[15px]">add</span>
              <span>New Audit</span>
            </button>
          )}

          {/* Export Report Trigger (only for logged-in users with report) */}
          {user && report && (
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] text-slate-200 text-xs font-medium border border-[#334155] transition-colors cursor-pointer"
              type="button"
              title="Preview, print, or download audit report"
            >
              <span className="material-symbols-outlined text-[15px] text-sky-400">description</span>
              <span className="hidden sm:inline">Export Report</span>
            </button>
          )}

          {/* Reset / Reload inputs (only for logged-in users) */}
          {user && (
            <button
              onClick={onResetInputs}
              className="p-1.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] text-slate-400 hover:text-white border border-[#334155] transition-colors cursor-pointer"
              title="Reload default procurement benchmark"
              aria-label="Reload default procurement benchmark"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            </button>
          )}

          {/* User Account Cluster */}
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl border transition-all cursor-pointer ${
                  isDemo
                    ? 'bg-amber-950/30 border-amber-500/40 hover:bg-amber-950/50 text-amber-200'
                    : 'bg-[#0F172A] border-sky-500/40 hover:bg-[#1E293B] text-slate-100'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isDemo
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-sky-600 text-white'
                  }`}
                >
                  {getUserInitials()}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold leading-tight max-w-[120px] truncate">
                    {user.full_name}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-tight">
                    {isDemo ? 'Demo Mode' : user.organization || 'Auditor'}
                  </span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-slate-400">
                  {isUserMenuOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#0B1120] border border-[#1E293B] shadow-2xl p-3 z-50 animate-fade-in flex flex-col gap-2">
                  <div className="p-2.5 rounded-xl bg-[#070B14] border border-[#1E293B]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">{user.full_name}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                          isDemo
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        }`}
                      >
                        {isDemo ? 'Demo Auditor' : 'Private Auditor'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block truncate mt-0.5">{user.email}</span>
                    <span className="text-[10px] text-slate-500 font-mono block mt-1">ID: {user.user_id}</span>
                  </div>

                  {/* Actions */}
                  <div className="pt-1 flex flex-col gap-1">
                    {isDemo && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenAuth('register');
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">person_add</span>
                        <span>Create Private Account</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full py-2 px-3 rounded-lg hover:bg-red-950/30 text-red-400 font-medium text-xs flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">logout</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#1E293B] transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Sub-Bar (Touch-Friendly Bottom Segment on Small Devices) */}
      <div className="md:hidden border-t border-[#1E293B] bg-[#070B14]/95 px-3 py-1.5 flex items-center justify-around gap-1">
        <button
          onClick={() => setActiveTab('landing')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'landing'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">hub</span>
          <span>Product</span>
        </button>

        <button
          onClick={() => {
            if (!user) {
              onOpenAuth('login');
              return;
            }
            setActiveTab('workbench');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'workbench'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">compare_arrows</span>
          <span>Reconcile</span>
        </button>

        <button
          onClick={() => {
            if (!user) {
              onOpenAuth('login');
              return;
            }
            setActiveTab('history');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">folder_open</span>
          <span>History</span>
          {user && caseCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#1E293B] text-slate-300 ml-0.5">
              {caseCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

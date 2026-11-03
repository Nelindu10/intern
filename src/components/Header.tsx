import React from 'react';
import {
  Bell,
  Sparkles,
  ShieldCheck,
  Terminal,
  Building2,
  GraduationCap,
  CreditCard,
  Cloud,
  LogOut,
  UserCheck,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'simulation' | 'dashboard' | 'playground';
  setActiveTab: (tab: 'simulation' | 'dashboard' | 'playground') => void;
  activeCompany: string;
  onOpenPricing: () => void;
  unlockedPlan?: string;
  role: 'admin' | 'student';
  userEmail: string;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeCompany,
  onOpenPricing,
  unlockedPlan = 'Institutional NIBM Premium',
  role,
  userEmail,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all text-[#131b2e]">
      {/* Top institution status ticker */}
      <div className="bg-[#0f172a] text-[#dae2fd] text-xs py-1 px-4 sm:px-8 flex flex-wrap items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <GraduationCap className="w-3.5 h-3.5 text-[#635bff]" />
          <span className="font-semibold text-white">NIBM</span>
          <span className="text-[#94a3b8]">| National Institute of Business Management</span>
          <span className="hidden md:inline-block px-1.5 py-0.2 rounded bg-white/10 text-[10px] text-[#e2dfff]">
            BSE / Computing Industry Simulation Core
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-medium">Gemini 3.8 Flash Engine</span>
          </div>
          <span className="text-slate-500">|</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 text-white font-semibold">
            {role === 'admin' ? '🛡️ Role: Admin' : '🎓 Role: Student (Undergraduate)'}
          </span>
        </div>
      </div>

      {/* Main SimulateHub Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Logo & Breadcrumbs */}
        <div className="flex items-center gap-4 flex-wrap">
          <div
            onClick={() => {
              if (role === 'admin') setActiveTab('dashboard');
              else setActiveTab('simulation');
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#493ee5] to-[#635bff] flex items-center justify-center text-white shadow-sm shadow-[#635bff]/20 group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <circle cx="6" cy="6" r="3" />
                <circle cx="18" cy="6" r="3" />
                <circle cx="12" cy="18" r="3" />
                <path d="M7.5 7.5L10.5 16.5M16.5 7.5L13.5 16.5M8 6h8" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight font-display text-[#0f172a]">
              SimulateHub
            </span>
          </div>

          {/* Breadcrumb row */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-semibold">{activeCompany}</span>
            <span className="text-slate-300">/</span>
            <span>Simulations</span>
            <span className="text-slate-300">/</span>
            <span className="text-[#493ee5] font-semibold bg-[#ede9fe] px-2 py-0.5 rounded-md">
              {role === 'admin' ? 'NIBM Institutional Oversight' : 'Quantitative Analysis'}
            </span>
            <span className="text-slate-300">/</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {role === 'admin' ? 'Administrative Access Active' : 'In Progress · Milestone 3/5'}
            </span>
          </div>
        </div>

        {/* Right: Actions, RBAC Tabs & Logout */}
        <div className="flex items-center gap-3">
          {/* Role-Based Navigation Mode Tabs */}
          <div className="flex items-center bg-[#f1f5f9] p-1 rounded-xl border border-slate-200">
            {/* Student only tab: Sandbox Workspace */}
            {role === 'student' && (
              <button
                onClick={() => setActiveTab('simulation')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'simulation'
                    ? 'bg-white text-[#493ee5] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Sandbox Workspace</span>
              </button>
            )}

            {/* Admin only tabs: NIBM HR Dashboard & AI Engine API */}
            {role === 'admin' && (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-white text-[#493ee5] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>NIBM HR Dashboard</span>
                </button>

                <button
                  onClick={() => setActiveTab('playground')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'playground'
                      ? 'bg-white text-[#493ee5] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>AI Engine API Sandbox</span>
                </button>
              </>
            )}
          </div>

          {/* Pricing button */}
          <button
            onClick={onOpenPricing}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#ede9fe] text-[#493ee5] hover:bg-[#ddd6fe] transition-colors border border-[#635bff]/15"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pricing</span>
          </button>

          {/* User profile & Logout button */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-[#0f172a]">{userEmail}</span>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">
                {role === 'admin' ? 'Super Admin' : 'IT Student'}
              </span>
            </div>

            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ${
                role === 'admin'
                  ? 'bg-gradient-to-tr from-purple-700 to-indigo-600 ring-purple-300'
                  : 'bg-gradient-to-tr from-[#635bff] to-[#8b5cf6] ring-[#635bff]/20'
              }`}
            >
              {role === 'admin' ? 'AD' : 'KW'}
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              title="Logout of session"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors text-xs font-semibold cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

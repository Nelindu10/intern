import React from 'react';
import {
  Bell,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  Terminal,
  Building2,
  GraduationCap,
  CreditCard,
  Cloud,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'simulation' | 'dashboard' | 'playground';
  setActiveTab: (tab: 'simulation' | 'dashboard' | 'playground') => void;
  activeCompany: string;
  onOpenPricing: () => void;
  unlockedPlan?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeCompany,
  onOpenPricing,
  unlockedPlan = 'Institutional NIBM Premium',
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
          <span className="text-slate-300">Actions: generate_task · search_and_generate · evaluate</span>
        </div>
      </div>

      {/* Main SimulateHub Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Logo & Breadcrumbs */}
        <div className="flex items-center gap-4 flex-wrap">
          <div
            onClick={() => setActiveTab('simulation')}
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

          {/* Breadcrumb row as shown in screen_f251a6c4.png */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-semibold">{activeCompany}</span>
            <span className="text-slate-300">/</span>
            <span>Simulations</span>
            <span className="text-slate-300">/</span>
            <span className="text-[#493ee5] font-semibold bg-[#ede9fe] px-2 py-0.5 rounded-md">
              Quantitative Analysis
            </span>
            <span className="text-slate-300">/</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              In Progress · Milestone 3/5
            </span>
            <span className="text-slate-300">/</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
              <Cloud className="w-3 h-3 text-slate-400" />
              Saved to Cloud
            </span>
          </div>
        </div>

        {/* Right: Actions, Plan & Profile */}
        <div className="flex items-center gap-3">
          {/* Navigation Mode Tabs */}
          <div className="flex items-center bg-[#f1f5f9] p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('simulation')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'simulation'
                  ? 'bg-white text-[#493ee5] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sandbox Workspace</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-[#493ee5] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">NIBM HR Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('playground')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'playground'
                  ? 'bg-white text-[#493ee5] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Engine API</span>
            </button>
          </div>

          {/* Choose Plan button (Matches screen_56a05b79.png) */}
          <button
            onClick={onOpenPricing}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#ede9fe] text-[#493ee5] hover:bg-[#ddd6fe] transition-colors border border-[#635bff]/15"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Choose Plan</span>
          </button>

          {/* User profile avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <button className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#635bff] to-[#8b5cf6] flex items-center justify-center text-white text-xs font-bold ring-2 ring-[#635bff]/20">
              KW
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

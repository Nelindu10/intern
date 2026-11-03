import React, { useState, useRef, useEffect } from 'react';
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
  User,
  Settings,
  FolderGit2,
  ChevronDown,
  ExternalLink,
  Shield,
  Layers,
  Sliders,
  Check,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'simulation' | 'dashboard' | 'playground';
  setActiveTab: (tab: 'simulation' | 'dashboard' | 'playground') => void;
  activeCompany: string;
  onOpenPricing: () => void;
  unlockedPlan?: string;
  role: 'admin' | 'student';
  userEmail: string;
  userName?: string;
  plan?: string;
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
  userName,
  plan = 'pro',
  onLogout,
}) => {
  // Profile dropdown open/close state
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Format initials
  const initials = role === 'admin'
    ? 'AD'
    : userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'ST';

  // Format plan label
  const planDisplay = plan ? `${plan.charAt(0).toUpperCase() + plan.slice(1)} Tier` : 'Pro Tier';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/10 text-white font-semibold">
            {role === 'admin' ? (
              <>🛡️ Role: Admin (Full Access)</>
            ) : (
              <>
                🎓 Role: Student · <span className="text-[#c3c0ff] uppercase">{planDisplay}</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Main SimulateHub Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 relative">
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

        {/* Right: Actions, RBAC Tabs & Profile Menu */}
        <div className="flex items-center gap-3">
          {/* Role-Based Navigation Mode Tabs */}
          <div className="flex items-center bg-[#f1f5f9] p-1 rounded-xl border border-slate-200">
            {/* Student only tab: Sandbox Workspace */}
            {role === 'student' && (
              <button
                onClick={() => setActiveTab('simulation')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
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
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
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
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
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
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#ede9fe] text-[#493ee5] hover:bg-[#ddd6fe] transition-colors border border-[#635bff]/15 cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pricing</span>
          </button>

          {/* Notification bell */}
          <button className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer">
            <Bell className="w-4 h-4" />
          </button>

          {/* ========================================================================= */}
          {/* INTERACTIVE PROFILE AVATAR & DROPDOWN MENU                                */}
          {/* ========================================================================= */}
          <div className="relative pl-1 border-l border-slate-200" ref={dropdownRef}>
            {/* Clickable Profile Trigger */}
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100/80 transition-all cursor-pointer focus:outline-none"
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="true"
            >
              {/* Profile Avatar circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 transition-transform hover:scale-105 shadow-xs ${
                  role === 'admin'
                    ? 'bg-gradient-to-tr from-purple-700 to-indigo-600 ring-purple-300'
                    : 'bg-gradient-to-tr from-[#635bff] to-[#8b5cf6] ring-[#635bff]/25'
                }`}
              >
                {initials}
              </div>

              {/* User text indicator */}
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-[#0f172a] truncate max-w-[120px] leading-tight">
                  {userName || userEmail.split('@')[0]}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {role === 'admin' ? 'Super Admin' : planDisplay}
                </span>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isProfileMenuOpen ? 'rotate-180 text-[#635bff]' : ''
                }`}
              />
            </button>

            {/* DROPDOWN MENU PANEL */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-[#635bff]/10 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* 1. Header Information */}
                <div className="px-4 py-3 border-b border-slate-100 bg-[#faf8ff] -mt-2.5 rounded-t-2xl">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs ${
                        role === 'admin'
                          ? 'bg-gradient-to-tr from-purple-700 to-indigo-600'
                          : 'bg-gradient-to-tr from-[#635bff] to-[#8b5cf6]'
                      }`}
                    >
                      {initials}
                    </div>
                    <div className="overflow-hidden flex-1">
                      <div className="text-xs font-bold text-[#0f172a] truncate">
                        {userName || (role === 'admin' ? 'NIBM Placement Administrator' : 'IT Student')}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate font-mono">
                        {userEmail}
                      </div>
                    </div>
                  </div>

                  {/* Plan / Role Badge */}
                  <div className="mt-2.5 flex items-center justify-between">
                    {role === 'student' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#ede9fe] text-[#493ee5] border border-[#635bff]/15">
                        <Sparkles className="w-3 h-3 text-[#635bff]" />
                        <span>{planDisplay}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                        <ShieldCheck className="w-3 h-3 text-purple-700" />
                        <span>Institutional Admin</span>
                      </span>
                    )}

                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Verified
                    </span>
                  </div>
                </div>

                {/* 2. Menu Items conditioned on Role */}
                <div className="py-2 text-xs text-slate-700 font-medium">
                  {role === 'student' ? (
                    <>
                      {/* Student Menu Items */}
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          alert('Navigating to candidate portfolio & assessment certificates.');
                        }}
                        className="w-full px-4 py-2 hover:bg-[#faf8ff] hover:text-[#493ee5] flex items-center gap-2.5 transition-colors text-left cursor-pointer"
                      >
                        <FolderGit2 className="w-4 h-4 text-slate-400 group-hover:text-[#635bff]" />
                        <span>My Portfolio</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          alert('Account Settings: Profile details, GitHub linkage, and email notification preferences.');
                        }}
                        className="w-full px-4 py-2 hover:bg-[#faf8ff] hover:text-[#493ee5] flex items-center gap-2.5 transition-colors text-left cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Account Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onOpenPricing();
                        }}
                        className="w-full px-4 py-2 hover:bg-[#faf8ff] hover:text-[#493ee5] flex items-center justify-between transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <CreditCard className="w-4 h-4 text-[#635bff]" />
                          <span className="font-semibold text-[#493ee5]">Upgrade Plan</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ede9fe] text-[#493ee5] font-bold">
                          Promo
                        </span>
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Admin Menu Items */}
                      <button
                        onClick={() => {
                          setActiveTab('dashboard');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 hover:bg-[#faf8ff] hover:text-[#493ee5] flex items-center gap-2.5 transition-colors text-left cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#635bff]" />
                        <span className="font-semibold text-slate-900">NIBM Admin Console</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('playground');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 hover:bg-[#faf8ff] hover:text-[#493ee5] flex items-center gap-2.5 transition-colors text-left cursor-pointer"
                      >
                        <Terminal className="w-4 h-4 text-slate-400" />
                        <span>System Settings & API Engine</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          alert('Institutional Analytics: Cohort benchmark distribution and placement export.');
                        }}
                        className="w-full px-4 py-2 hover:bg-[#faf8ff] hover:text-[#493ee5] flex items-center gap-2.5 transition-colors text-left cursor-pointer"
                      >
                        <Sliders className="w-4 h-4 text-slate-400" />
                        <span>Institutional Analytics</span>
                      </button>
                    </>
                  )}
                </div>

                {/* 3. Red Styled Logout Button at Bottom */}
                <div className="pt-1.5 border-t border-slate-100 px-2">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Check,
  Tag,
  User,
  CreditCard,
  Building,
} from 'lucide-react';

export type PricingPlan = 'basic' | 'pro' | 'premium';

export interface UserSession {
  email: string;
  role: 'admin' | 'student';
  name: string;
  plan?: PricingPlan;
}

interface LoginProps {
  onLogin: (session: UserSession) => void;
}

// 5 hardcoded valid promo codes for beta testers to unlock the Pro Plan (Hidden from UI)
export const VALID_PROMO_CODES = [
  'NIBM-VIP',
  'PRO-ACCESS',
  'BETA-TESTER',
  'VIP-PASS',
  'FRIEND-CODE',
];

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  // Mode toggle: 'signin' or 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default to 'basic' (Free Plan) unless promo code upgraded it
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>(() => {
    try {
      const stored = localStorage.getItem('selectedPlan');
      if (stored === 'pro' || stored === 'premium') {
        return stored;
      }
    } catch (e) {
      // ignore
    }
    return 'basic';
  });

  // Sync selectedPlan to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('selectedPlan', selectedPlan);
    } catch (e) {
      // ignore
    }
  }, [selectedPlan]);

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Status message
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle promo code application: validates against the 5 valid codes (codes hidden from UI)
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoMessage(null);
    const clean = promoCode.trim().toUpperCase();

    if (!clean) {
      setPromoMessage({
        type: 'error',
        text: 'Please enter a promo code.',
      });
      return;
    }

    if (VALID_PROMO_CODES.includes(clean)) {
      setSelectedPlan('pro');
      localStorage.setItem('selectedPlan', 'pro');
      setPromoMessage({
        type: 'success',
        text: 'Promo code applied! Session upgraded to Pro Plan.',
      });
    } else {
      setPromoMessage({
        type: 'error',
        text: 'Invalid promo code. Please check your code and try again.',
      });
    }
  };

  // ---------------------------------------------------------------------------
  // REAL MONGODB AUTHENTICATION FLOW
  // ---------------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedName = name.trim();

    // 1. HARDCODED ADMIN EXCEPTION: vipadmin@gmail.com / 123 (bypasses standard DB checks)
    if (trimmedEmail === 'vipadmin@gmail.com' && trimmedPassword === '123') {
      const adminSession: UserSession = {
        email: 'vipadmin@gmail.com',
        role: 'admin',
        name: 'VIP System Administrator',
        plan: 'premium',
      };
      localStorage.setItem('selectedPlan', 'premium');
      onLogin(adminSession);
      setIsSubmitting(false);
      return;
    }

    // Secondary fallback admin check
    if (trimmedEmail === 'admin@nibm.lk' && trimmedPassword === 'admin123') {
      const adminSession: UserSession = {
        email: 'admin@nibm.lk',
        role: 'admin',
        name: 'NIBM Placement Administrator',
        plan: 'premium',
      };
      localStorage.setItem('selectedPlan', 'premium');
      onLogin(adminSession);
      setIsSubmitting(false);
      return;
    }

    // -------------------------------------------------------------
    // SIGN UP FLOW: Saves user to MongoDB 'users' collection
    // On success: Displays success notice & switches to Sign In tab
    // -------------------------------------------------------------
    if (authMode === 'signup') {
      if (!trimmedEmail || !trimmedPassword) {
        setErrorMessage('Please provide both email and password.');
        setIsSubmitting(false);
        return;
      }

      if (trimmedPassword.length < 3) {
        setErrorMessage('Password must be at least 3 characters long.');
        setIsSubmitting(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: trimmedEmail,
            password: trimmedPassword,
            name: trimmedName || trimmedEmail.split('@')[0],
            selectedPlan: selectedPlan === 'pro' ? 'pro' : 'basic',
          }),
        });

        const rawText = await response.text();
        let data: any = {};
        try {
          data = JSON.parse(rawText);
        } catch (e) {
          console.error('[Sign Up] Non-JSON server response:', rawText);
          setErrorMessage(`Server returned non-JSON response (${response.status}): ${rawText.slice(0, 100)}`);
          setIsSubmitting(false);
          return;
        }

        if (!response.ok) {
          setErrorMessage(data.error || data.message || `Signup failed with status code ${response.status}`);
          setIsSubmitting(false);
          return;
        }

        // Show success and switch to Sign In tab as specified in rule 1
        setSuccessMessage('Account registered successfully! Please Sign In with your credentials.');
        setPassword('');
        setAuthMode('signin');
      } catch (err: any) {
        console.error('[Sign Up Error]:', err);
        setErrorMessage(err?.message ? `Sign up error: ${err.message}` : 'Network error connecting to authentication service.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // -------------------------------------------------------------
    // SIGN IN FLOW: Real MongoDB verification against 'users' collection
    // If email doesn't exist: strictly blocks access and shows "Account not found. Please Sign Up first."
    // If password wrong: shows "Incorrect password."
    // -------------------------------------------------------------
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          password: trimmedPassword,
        }),
      });

      const rawText = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        console.error('[Sign In] Non-JSON server response:', rawText);
        setErrorMessage(`Server returned non-JSON response (${response.status}): ${rawText.slice(0, 100)}`);
        setIsSubmitting(false);
        return;
      }

      if (!response.ok) {
        setErrorMessage(data.error || data.message || `Sign in failed with status code ${response.status}`);
        setIsSubmitting(false);
        return;
      }

      // Success: determine active tier (if promo code was already used, keep pro)
      const user = data.user;
      const activePlan = selectedPlan === 'pro' ? 'pro' : user.plan || 'basic';
      localStorage.setItem('selectedPlan', activePlan);

      onLogin({
        email: user.email,
        role: user.role || 'student',
        name: user.name,
        plan: activePlan,
      });
    } catch (err: any) {
      console.error('[Sign In Error]:', err);
      setErrorMessage(err?.message ? `Sign in error: ${err.message}` : 'Network error during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex flex-col font-sans selection:bg-[#ede9fe] selection:text-[#493ee5] relative">
      {/* Top Navbar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#493ee5] to-[#635bff] flex items-center justify-center text-white shadow-sm shadow-[#635bff]/20">
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

          <div className="flex items-center gap-3 sm:gap-6 text-xs font-semibold text-slate-600">
            <span className="text-[#635bff] bg-[#ede9fe] px-3 py-1 rounded-full border border-[#635bff]/20">
              MongoDB Cloud Ingress
            </span>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-500 font-normal">
              <GraduationCap className="w-4 h-4 text-[#635bff]" />
              <span>NIBM IT Simulation Platform</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Two-Column View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ========================================================================= */}
          {/* LEFT PANEL: Authentication Card (5 cols)                                   */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 relative">
            {/* Soft background aura */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ede9fe]/40 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            {/* Portal Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#ede9fe] text-[#493ee5] uppercase tracking-wider mb-3 border border-[#635bff]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#635bff]"></span>
              Secure Database Authentication
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0f172a] font-display">
              {authMode === 'signup' ? 'Create your student account' : 'Sign in to your account'}
            </h1>
            <p className="text-xs text-slate-500 mt-1.5">
              {authMode === 'signup'
                ? 'Register with your email to persist your account in MongoDB. Standard accounts start on the Basic Plan.'
                : 'Enter your account credentials to access company simulations and technical evaluations.'}
            </p>

            {/* SIGN IN / SIGN UP TOGGLE */}
            <div className="flex items-center bg-[#f1f5f9] p-1 rounded-xl mt-5 border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-white text-[#493ee5] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-white text-[#493ee5] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error & Success Messages */}
            {errorMessage && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-xs text-emerald-800 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-semibold">{successMessage}</span>
              </div>
            )}

            {/* Form - Real Database Authentication */}
            <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
              {/* Full Name (Sign Up only) */}
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Kasun Wickramasinghe"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#635bff] focus:ring-2 focus:ring-[#635bff]/15 text-slate-900 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  University or Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@university.edu or student@nibm.lk"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#635bff] focus:ring-2 focus:ring-[#635bff]/15 text-slate-900 bg-white"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  {authMode === 'signin' && (
                    <span className="text-[11px] text-slate-400">
                      Standard or Admin
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#635bff] focus:ring-2 focus:ring-[#635bff]/15 text-slate-900 bg-white font-mono"
                  />
                </div>
              </div>

              {/* Plan notice banner */}
              <div className="p-3 rounded-xl bg-[#faf8ff] border border-[#635bff]/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#635bff]" />
                  <span className="text-slate-600">Assigned Plan:</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[11px] uppercase ${
                    selectedPlan === 'pro'
                      ? 'bg-[#ede9fe] text-[#493ee5]'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {selectedPlan === 'pro' ? 'Pro Plan (Unlocked)' : 'Basic (Free) Plan'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {selectedPlan === 'pro' ? 'Promo Active' : 'Default Tier'}
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#635bff] hover:bg-[#5248e5] text-white text-xs font-bold transition-all shadow-md shadow-[#635bff]/25 flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-60"
              >
                <span>
                  {isSubmitting
                    ? 'Connecting to MongoDB...'
                    : authMode === 'signup'
                    ? 'Create Account & Save to Database'
                    : 'Sign In to Workspace'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Academic Trust Card */}
            <div className="mt-5 p-3 rounded-xl bg-[#faf8ff] border border-[#635bff]/15 flex items-start gap-2.5 text-xs">
              <GraduationCap className="w-4 h-4 text-[#635bff] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[10px] uppercase tracking-wider text-[#493ee5] block">
                  Enterprise Simulation Core
                </span>
                <span className="text-[11px] text-slate-600 leading-tight">
                  Simulate real-world business analysis sprints for Stripe, CareCloud Health, IFS Cloud, Apex FinTech, and NeoScale.
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT PANEL: Pricing Tiers & PROMO CODE SYSTEM (Codes Hidden from UI)     */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#ede9fe] text-[#493ee5] uppercase tracking-wider mb-1.5 border border-[#635bff]/20">
                Subscription & Access Control
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0f172a] font-display">
                Choose your simulation capacity
              </h2>
              <p className="text-xs text-slate-500">
                All standard student accounts automatically start on the <strong>Basic (Free) Plan</strong>. Beta testers can enter a promo code below to immediately unlock the <strong>Pro Plan</strong>.
              </p>
            </div>

            {/* 2. PROMO CODE REDEMPTION BOX: Codes Completely Hidden from UI */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#f2f3ff] to-[#faf8ff] border-2 border-[#635bff]/30 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0f172a]">
                  <Tag className="w-4 h-4 text-[#635bff]" />
                  <span>Beta Tester Promo Code (Unlock Pro Plan)</span>
                </div>
                <span className="text-[10px] font-semibold text-[#493ee5] bg-white px-2 py-0.5 rounded border border-[#635bff]/20">
                  Instant Pro Upgrade
                </span>
              </div>

              <form onSubmit={handleApplyPromo} className="flex items-center gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter Promo Code"
                  className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#635bff] focus:ring-2 focus:ring-[#635bff]/20 uppercase font-mono text-slate-800"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#635bff] hover:bg-[#5248e5] text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Apply Code</span>
                </button>
              </form>

              {promoMessage && (
                <div
                  className={`mt-2 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in ${
                    promoMessage.type === 'success' ? 'text-emerald-700' : 'text-red-600'
                  }`}
                >
                  {promoMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span>{promoMessage.text}</span>
                </div>
              )}
            </div>

            {/* 3 Pricing Plan Cards */}
            <div className="space-y-3.5">
              
              {/* 1. BASIC PLAN CARD (DEFAULT STUDENT PLAN) */}
              <div
                onClick={() => setSelectedPlan('basic')}
                className={`p-4 sm:p-5 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  selectedPlan === 'basic'
                    ? 'border-2 border-[#635bff] bg-[#f8f7ff] shadow-md ring-2 ring-[#635bff]/20 -translate-y-0.5'
                    : 'border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 shadow-xs'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-[#0f172a] font-display">Basic Plan</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                      Default Free Tier
                    </span>
                    {selectedPlan === 'basic' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ede9fe] text-[#493ee5]">
                        <Check className="w-3 h-3 text-[#635bff]" />
                        Active Selection
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#635bff] font-semibold">2 Companies Unlocked (Stripe & CareCloud)</div>
                  <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-3 gap-y-0.5 pt-0.5">
                    <span>✓ First 2 employer simulations</span>
                    <span>✓ Automated AI rubric evaluation</span>
                    <span>🔒 Custom AI search locked</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xl sm:text-2xl font-black text-[#0f172a] font-display">
                    $0<span className="text-xs font-normal text-slate-400"> forever</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan('basic');
                    }}
                    className={`mt-1.5 px-3.5 py-1 text-xs rounded-lg font-semibold transition-colors cursor-pointer ${
                      selectedPlan === 'basic'
                        ? 'bg-[#635bff] text-white font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {selectedPlan === 'basic' ? 'Default Selected' : 'Choose Free'}
                  </button>
                </div>
              </div>

              {/* 2. PRO PLAN CARD (BETA TESTER TARGET) */}
              <div
                onClick={() => setSelectedPlan('pro')}
                className={`p-4 sm:p-5 rounded-2xl relative transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  selectedPlan === 'pro'
                    ? 'border-2 border-[#635bff] bg-[#f8f7ff] shadow-lg ring-2 ring-[#635bff]/20 -translate-y-0.5'
                    : 'border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 shadow-xs'
                }`}
              >
                {/* Floating Tag */}
                <span className="absolute -top-2.5 right-6 px-2.5 py-0.5 rounded-full bg-[#635bff] text-white text-[10px] font-bold tracking-wider shadow-xs">
                  ★ UNLOCKED VIA PROMO CODE
                </span>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-[#0f172a] font-display">Pro Plan</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ede9fe] text-[#493ee5] font-semibold">
                      Full Student Access
                    </span>
                    {selectedPlan === 'pro' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ede9fe] text-[#493ee5]">
                        <Check className="w-3 h-3 text-[#635bff]" />
                        Active Selection
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#635bff] font-semibold">4 Companies Unlocked (Stripe, CareCloud, IFS, Apex)</div>
                  <div className="text-[11px] text-slate-600 space-y-0.5 pt-0.5">
                    <div>✓ 4 full enterprise simulations & milestone progression</div>
                    <div>✓ Verified institutional score history & PDF evaluation reports</div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xl sm:text-2xl font-black text-[#0f172a] font-display">
                    $29<span className="text-xs font-normal text-slate-400"> /mo</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold block">
                    {selectedPlan === 'pro' ? 'Waived with Promo' : 'Free with Promo Code'}
                  </span>
                </div>
              </div>

              {/* 3. PREMIUM PLAN CARD */}
              <div
                onClick={() => setSelectedPlan('premium')}
                className={`p-4 sm:p-5 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  selectedPlan === 'premium'
                    ? 'border-2 border-[#635bff] bg-[#f8f7ff] shadow-lg ring-2 ring-[#635bff]/20 -translate-y-0.5'
                    : 'border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 shadow-xs'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-[#0f172a] font-display">Premium Plan</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                      Ultimate
                    </span>
                    {selectedPlan === 'premium' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ede9fe] text-[#493ee5]">
                        <Check className="w-3 h-3 text-[#635bff]" />
                        Active Selection
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#635bff] font-semibold">ALL Companies Unlocked + Custom AI Discovery</div>
                  <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-3 gap-y-0.5 pt-0.5">
                    <span>✓ All 5 company tracks unlocked</span>
                    <span>✓ Custom AI company generator enabled</span>
                    <span>✓ Direct recruiter fast-track audit</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xl sm:text-2xl font-black text-[#0f172a] font-display">
                    $69<span className="text-xs font-normal text-slate-400"> /mo</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Institutional Tier</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-semibold text-slate-700">SimulateHub Virtual Career Platform</span>
            <span className="mx-2">•</span>
            <span>National Institute of Business Management (NIBM)</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            MongoDB User Directory Active · Real Database Authentication
          </div>
        </div>
      </footer>
    </div>
  );
};

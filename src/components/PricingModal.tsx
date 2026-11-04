import React, { useState } from 'react';
import {
  X,
  Check,
  Sparkles,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Building,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPromoSuccess: (code: string) => void;
}

const VALID_PROMO_CODES = ['NIBM-VIP', 'PRO-ACCESS', 'BETA-TESTER', 'VIP-PASS', 'FRIEND-CODE', 'NIBM-BATCH26'];

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  onApplyPromoSuccess,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<string | null>(null);
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('student@nibm.lk');
  const [password, setPassword] = useState('••••••••••••');

  if (!isOpen) return null;

  const handleApplyPromo = () => {
    const clean = promoCode.trim().toUpperCase();
    if (VALID_PROMO_CODES.includes(clean)) {
      setPromoStatus('success');
      localStorage.setItem('selectedPlan', 'pro');
      setTimeout(() => {
        onApplyPromoSuccess(clean);
        onClose();
      }, 1000);
    } else {
      setPromoStatus('invalid');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#faf8ff] rounded-3xl max-w-5xl w-full border border-slate-200 shadow-2xl overflow-hidden relative text-[#131b2e]">
        {/* Top Navbar */}
        <div className="bg-white px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#493ee5] to-[#635bff] flex items-center justify-center text-white shadow-sm">
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

          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <span className="text-[#635bff] font-semibold bg-[#ede9fe] px-2.5 py-1 rounded-full">
              Choose Plan
            </span>
            <span className="hover:text-slate-900 cursor-pointer hidden sm:inline">Billing Details</span>
            <span className="hover:text-slate-900 cursor-pointer hidden sm:inline">Help Center</span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Main Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 max-h-[80vh] overflow-y-auto">
          {/* Left Column: Sign In Portal Access (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#ede9fe] text-[#493ee5] uppercase tracking-wider mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#635bff]"></span>
                SimulateHub Portal Access
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-[#0f172a] font-display">
                Welcome to your virtual career journey
              </h2>
              <p className="text-xs text-slate-500 mt-1.5">
                Sign in or create an account to start real-world engineering and product simulations.
              </p>

              {/* Sign In / Sign Up toggle */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl mt-4">
                <button
                  onClick={() => setAuthTab('signin')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    authTab === 'signin'
                      ? 'bg-white text-[#493ee5] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthTab('signup')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    authTab === 'signup'
                      ? 'bg-white text-[#493ee5] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Social Logins */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button className="flex items-center justify-center gap-2 p-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                  <span className="text-red-500 font-bold">G</span> Continue with Google
                </button>
                <button className="flex items-center justify-center gap-2 p-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                  <span className="text-slate-900 font-bold"></span> Continue with GitHub
                </button>
              </div>

              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <span className="relative bg-white px-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Or continue with work or university email
                </span>
              </div>

              {/* Form Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">University or Work Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@university.edu"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#635bff] focus:ring-2 focus:ring-[#635bff]/15"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Password</label>
                    <a href="#forgot" className="text-[11px] text-[#635bff] hover:underline">Forgot password?</a>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#635bff] focus:ring-2 focus:ring-[#635bff]/15 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 text-xs text-slate-600">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#635bff]" />
                <span>Remember this device for 30 days</span>
              </div>

              <button
                onClick={onClose}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#635bff] hover:bg-[#5248e5] text-white text-xs font-bold transition-all shadow-md shadow-[#635bff]/20"
              >
                <span>Sign In to Access Simulations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Academic Trust Card */}
            <div className="mt-5 p-3 rounded-xl bg-[#faf8ff] border border-[#635bff]/15 flex items-start gap-2.5 text-xs">
              <GraduationCap className="w-4 h-4 text-[#635bff] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[11px] uppercase tracking-wider text-[#493ee5] block">
                  Academic & Corporate Trust
                </span>
                <span className="text-[11px] text-slate-600 leading-tight">
                  Trusted by 45,000+ candidates from NIBM, Stanford, MIT, CMU, UC Berkeley, and Imperial College London.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing Tiers & Student Promo Code (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#ede9fe] text-[#493ee5] uppercase tracking-wider mb-1.5">
                Institutional & Direct Pricing
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0f172a] font-display">
                Select your simulation capacity
              </h3>
              <p className="text-xs text-slate-500">
                Gain verified portfolio badges and benchmark against top tech employers.
              </p>
            </div>

            {/* 3 Pricing Cards */}
            <div className="space-y-3">
              {/* Basic Tier */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-4 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#0f172a]">Basic</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">Free</span>
                  </div>
                  <div className="text-xs text-[#635bff] font-semibold mt-0.5">2 Companies Included</div>
                  <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-x-3">
                    <span>✓ 2 full industry simulations</span>
                    <span>✓ Automated syntax & linter checks</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-black text-[#0f172a]">$0<span className="text-xs font-normal text-slate-400"> forever</span></div>
                  <button className="mt-1 px-3 py-1 text-xs rounded-lg bg-slate-100 text-slate-500 font-semibold" disabled>
                    Current Tier
                  </button>
                </div>
              </div>

              {/* Pro Tier (Recommended / Most Popular) */}
              <div className="p-4 rounded-2xl bg-white border-2 border-[#635bff] relative shadow-md shadow-[#635bff]/10 flex items-center justify-between gap-4">
                <span className="absolute -top-2.5 right-6 px-2.5 py-0.5 rounded-full bg-[#635bff] text-white text-[10px] font-bold tracking-wider">
                  ★ MOST POPULAR
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#0f172a]">Pro</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ede9fe] text-[#493ee5] font-semibold">Recommended</span>
                  </div>
                  <div className="text-xs text-[#635bff] font-semibold mt-0.5">5 Companies Included</div>
                  <div className="text-[11px] text-slate-600 mt-1 space-y-0.5">
                    <div>✓ 5 full industry simulations · AI code evaluation within 60s</div>
                    <div>✓ Verified recruiter visibility badge · Downloadable project artifacts</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xl font-black text-[#0f172a]">$29<span className="text-xs font-normal text-slate-400"> /mo</span></div>
                  <button onClick={onClose} className="mt-1 px-4 py-1.5 text-xs rounded-lg bg-[#635bff] hover:bg-[#5248e5] text-white font-bold transition-colors">
                    Choose Pro Tier
                  </button>
                </div>
              </div>

              {/* Premium Tier */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-4 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#0f172a]">Premium</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">Ultimate</span>
                  </div>
                  <div className="text-xs text-[#635bff] font-semibold mt-0.5">15 Companies Included</div>
                  <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-x-3">
                    <span>✓ 15 company simulations across all tracks</span>
                    <span>✓ 1-on-1 mentor feedback</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-black text-[#0f172a]">$69<span className="text-xs font-normal text-slate-400"> /mo</span></div>
                  <button onClick={onClose} className="mt-1 px-3 py-1.5 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition-colors">
                    Choose Premium Tier
                  </button>
                </div>
              </div>
            </div>

            {/* Student Promo Code Redemption Card (Matches screen_56a05b79.png) */}
            <div className="p-4 rounded-2xl bg-[#f2f3ff] border border-[#635bff]/25 mt-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0f172a] mb-2">
                <KeyRound className="w-4 h-4 text-[#635bff]" />
                <span>Enter Beta Tester Promo Code (Unlock Pro Plan)</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter Promo Code"
                  className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#635bff] uppercase font-mono"
                />
                <button
                  onClick={handleApplyPromo}
                  className="px-5 py-2.5 rounded-xl bg-[#635bff] hover:bg-[#5248e5] text-white text-xs font-bold transition-all shadow-sm"
                >
                  Apply Code
                </button>
              </div>

              {promoStatus === 'success' && (
                <div className="mt-2 text-xs text-emerald-700 font-semibold flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Promo code applied! Pro Plan access successfully unlocked.</span>
                </div>
              )}
              {promoStatus === 'invalid' && (
                <div className="mt-2 text-xs text-red-600 font-medium">
                  Invalid promo code. Please check your code and try again.
                </div>
              )}

              <p className="text-[11px] text-slate-500 mt-2">
                ℹ University partner codes waive subscription fees and automatically unlock Premium simulation capacity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

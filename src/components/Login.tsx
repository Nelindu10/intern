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
  UserCheck,
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

export interface RegisteredStudent {
  name: string;
  email: string;
  password: string;
  accessKey?: string;
  role: 'student';
  selectedPlan: PricingPlan;
  registeredAt: string;
}

interface LoginProps {
  onLogin: (session: UserSession) => void;
}

const LOCAL_STORAGE_STUDENTS_KEY = 'registeredStudents';

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  // Mode toggle: 'signin' or 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessKey, setAccessKey] = useState('');

  // Interactive Pricing Tier selection
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>('pro');

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Status message
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initial setup: ensure default registered students exist if empty
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_STUDENTS_KEY);
      if (!stored) {
        const initialStudents: RegisteredStudent[] = [
          {
            name: 'Kasun Wickramasinghe',
            email: 'student@nibm.lk',
            password: 'student123',
            accessKey: 'NIBM-BATCH26',
            role: 'student',
            selectedPlan: 'pro',
            registeredAt: new Date().toISOString(),
          },
        ];
        localStorage.setItem(LOCAL_STORAGE_STUDENTS_KEY, JSON.stringify(initialStudents));
      }
    } catch (e) {
      console.warn('LocalStorage access issue:', e);
    }
  }, []);

  // Handle promo code application
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoMessage(null);
    const clean = promoCode.trim().toUpperCase();

    if (clean === 'NIBM-BATCH26' || clean === 'STANFORD-SPRING25' || clean.startsWith('NIBM')) {
      setSelectedPlan('premium');
      setAccessKey(clean);
      setPromoMessage({
        type: 'success',
        text: `Promo code "${clean}" applied! Premium tier waived and unlocked.`,
      });
    } else {
      setPromoMessage({
        type: 'error',
        text: 'Invalid promo code. Try "NIBM-BATCH26" or "STANFORD-SPRING25".',
      });
    }
  };

  // Handle form submission (Sign In or Sign Up)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedKey = accessKey.trim();
    const trimmedName = name.trim();

    // -------------------------------------------------------------
    // SIGN UP FLOW: Dynamic registration to localStorage
    // -------------------------------------------------------------
    if (authMode === 'signup') {
      if (!trimmedEmail || !trimmedPassword) {
        setErrorMessage('Please provide both email and password.');
        return;
      }

      if (trimmedPassword.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }

      try {
        const storedStr = localStorage.getItem(LOCAL_STORAGE_STUDENTS_KEY);
        const studentsList: RegisteredStudent[] = storedStr ? JSON.parse(storedStr) : [];

        // Check if user already exists
        const exists = studentsList.some(
          (s) => s.email.toLowerCase() === trimmedEmail || trimmedEmail === 'admin@nibm.lk'
        );

        if (exists) {
          setErrorMessage('An account with this email already exists. Please switch to Sign In.');
          return;
        }

        const newStudent: RegisteredStudent = {
          name: trimmedName || trimmedEmail.split('@')[0],
          email: trimmedEmail,
          password: trimmedPassword,
          accessKey: trimmedKey || 'NIBM-BATCH26',
          role: 'student',
          selectedPlan: selectedPlan,
          registeredAt: new Date().toISOString(),
        };

        studentsList.push(newStudent);
        localStorage.setItem(LOCAL_STORAGE_STUDENTS_KEY, JSON.stringify(studentsList));

        setSuccessMessage('Account registered successfully! Redirecting to student workspace...');

        setTimeout(() => {
          onLogin({
            email: newStudent.email,
            role: 'student',
            name: newStudent.name,
            plan: newStudent.selectedPlan,
          });
        }, 600);
      } catch (err) {
        console.error(err);
        setErrorMessage('Could not save user registration. Please try again.');
      }
      return;
    }

    // -------------------------------------------------------------
    // SIGN IN FLOW: Hardcoded Admin OR localStorage registered students
    // -------------------------------------------------------------

    // 1. HARDCODED ADMIN CHECK (Bypasses localStorage and gets full HR dashboard access)
    if (trimmedEmail === 'admin@nibm.lk' && trimmedPassword === 'admin123') {
      onLogin({
        email: 'admin@nibm.lk',
        role: 'admin',
        name: 'NIBM Placement Administrator',
      });
      return;
    }

    // 2. CHECK LOCAL STORAGE FOR REGISTERED STUDENTS
    try {
      const storedStr = localStorage.getItem(LOCAL_STORAGE_STUDENTS_KEY);
      const studentsList: RegisteredStudent[] = storedStr ? JSON.parse(storedStr) : [];

      const foundStudent = studentsList.find((s) => s.email.toLowerCase() === trimmedEmail);

      if (foundStudent) {
        if (foundStudent.password !== trimmedPassword) {
          setErrorMessage('Invalid password for this student account.');
          return;
        }

        // Validate access key if provided
        if (trimmedKey && trimmedKey !== (foundStudent.accessKey || 'NIBM-BATCH26') && trimmedKey !== 'NIBM-BATCH26') {
          setErrorMessage('Invalid Student Access Key. Please contact NIBM Admin.');
          return;
        }

        onLogin({
          email: foundStudent.email,
          role: 'student',
          name: foundStudent.name,
          plan: foundStudent.selectedPlan || selectedPlan,
        });
        return;
      }

      // Default demo student check fallback
      if (trimmedEmail === 'student@nibm.lk' && trimmedPassword === 'student123') {
        if (trimmedKey && trimmedKey !== 'NIBM-BATCH26') {
          setErrorMessage('Invalid Student Access Key. Please contact NIBM Admin.');
          return;
        }

        onLogin({
          email: 'student@nibm.lk',
          role: 'student',
          name: 'Kasun Wickramasinghe (Undergraduate)',
          plan: selectedPlan,
        });
        return;
      }

      setErrorMessage('Account not found. Please verify credentials or switch to "Sign Up" to create an account.');
    } catch (err) {
      console.error(err);
      setErrorMessage('Authentication error. Please try again.');
    }
  };

  // Demo auto-fill helpers
  const fillDemo = (role: 'admin' | 'student') => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (role === 'admin') {
      setAuthMode('signin');
      setEmail('admin@nibm.lk');
      setPassword('admin123');
      setAccessKey('');
    } else {
      setAuthMode('signin');
      setEmail('student@nibm.lk');
      setPassword('student123');
      setAccessKey('NIBM-BATCH26');
      setSelectedPlan('pro');
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
            <span className="text-[#635bff] bg-[#ede9fe] px-3 py-1 rounded-full">
              Authentication & Capacity Gateway
            </span>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-500 font-normal">
              <GraduationCap className="w-4 h-4 text-[#635bff]" />
              <span>NIBM IT Placement Cell</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Two-Column View matching screen_56a05b79.png */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ========================================================================= */}
          {/* LEFT PANEL: Dynamic Sign In / Sign Up Card (5 cols)                       */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 relative">
            {/* Soft background aura */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ede9fe]/40 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            {/* Portal Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#ede9fe] text-[#493ee5] uppercase tracking-wider mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#635bff]"></span>
              SimulateHub Portal Access
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0f172a] font-display">
              Welcome to your virtual career journey
            </h1>
            <p className="text-xs text-slate-500 mt-1.5">
              {authMode === 'signup'
                ? 'Create a student profile to start industry-level software engineering simulations.'
                : 'Sign in to access real-world company sprint simulations and technical manager briefings.'}
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

            {/* Social Authentication */}
            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <button
                type="button"
                onClick={() => fillDemo('student')}
                className="flex items-center justify-center gap-2 p-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span className="text-red-500 font-bold">G</span> Continue with Google
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="flex items-center justify-center gap-2 p-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span className="text-slate-900 font-bold"></span> Continue with GitHub
              </button>
            </div>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <span className="relative bg-white px-2.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Or continue with work or university email
              </span>
            </div>

            {/* Error & Success Messages */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-xs text-emerald-800 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-semibold">{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
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
                    <span className="text-[11px] text-[#635bff] hover:underline cursor-pointer">
                      Forgot password?
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
                    placeholder="Enter password (min 6 chars)"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#635bff] focus:ring-2 focus:ring-[#635bff]/15 text-slate-900 bg-white font-mono"
                  />
                </div>
              </div>

              {/* Student Access Key (Optional for Admin, validated for Student) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Student Access Key / Batch Code
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {authMode === 'signup' ? 'Default: NIBM-BATCH26' : 'Required for student'}
                  </span>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    placeholder="e.g. NIBM-BATCH26"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#635bff] focus:ring-2 focus:ring-[#635bff]/15 text-slate-900 bg-white font-mono uppercase"
                  />
                </div>
              </div>

              {/* Active Plan preview in Sign Up mode */}
              {authMode === 'signup' && (
                <div className="p-2.5 rounded-xl bg-[#faf8ff] border border-[#635bff]/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#635bff]" />
                    <span className="text-slate-600">Selected Plan:</span>
                    <strong className="text-[#493ee5] uppercase font-mono">{selectedPlan}</strong>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Click right card to change</span>
                </div>
              )}

              {/* Remember checkbox */}
              <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
                <input
                  type="checkbox"
                  id="remember-device"
                  defaultChecked
                  className="rounded border-slate-300 text-[#635bff] focus:ring-[#635bff]"
                />
                <label htmlFor="remember-device" className="cursor-pointer">
                  Remember this device for 30 days
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#635bff] hover:bg-[#5248e5] text-white text-xs font-bold transition-all shadow-md shadow-[#635bff]/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>{authMode === 'signup' ? 'Create Account & Enter Workspace' : 'Sign In to Access Simulations'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick Demo Autofill Bar */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center">
                Demo Quick-Fill Accounts
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemo('admin')}
                  className="p-2 rounded-xl border border-purple-200 bg-[#faf8ff] hover:bg-[#ede9fe] text-left transition-colors text-xs flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <span className="font-bold text-[#493ee5] block text-[11px]">Admin User</span>
                    <span className="text-[10px] text-slate-500 font-mono">admin@nibm.lk</span>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                    HR
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemo('student')}
                  className="p-2 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 text-left transition-colors text-xs flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <span className="font-bold text-emerald-800 block text-[11px]">Student User</span>
                    <span className="text-[10px] text-slate-500 font-mono">student@nibm.lk</span>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Workspace
                  </span>
                </button>
              </div>
            </div>

            {/* Academic Trust Card */}
            <div className="mt-5 p-3 rounded-xl bg-[#faf8ff] border border-[#635bff]/15 flex items-start gap-2.5 text-xs">
              <GraduationCap className="w-4 h-4 text-[#635bff] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[10px] uppercase tracking-wider text-[#493ee5] block">
                  Academic & Corporate Trust
                </span>
                <span className="text-[11px] text-slate-600 leading-tight">
                  Trusted by 45,000+ candidates from Stanford, MIT, CMU, UC Berkeley, Imperial College London, and NIBM.
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT PANEL: Interactive Clickable Pricing Plans (7 cols)                 */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#ede9fe] text-[#493ee5] uppercase tracking-wider mb-1.5">
                Institutional & Direct Pricing
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0f172a] font-display">
                Select your simulation capacity
              </h2>
              <p className="text-xs text-slate-500">
                Click a plan below to choose your tier. When you sign up, this plan will be linked to your student profile.
              </p>
            </div>

            {/* 3 Clickable Pricing Cards */}
            <div className="space-y-3.5">
              
              {/* 1. BASIC PLAN CARD */}
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
                    <span className="font-bold text-base text-[#0f172a] font-display">Basic</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                      Free
                    </span>
                    {selectedPlan === 'basic' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ede9fe] text-[#493ee5]">
                        <Check className="w-3 h-3 text-[#635bff]" />
                        Active Choice
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#635bff] font-semibold">2 Companies Included</div>
                  <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-3 gap-y-0.5 pt-0.5">
                    <span>✓ 2 full industry simulations</span>
                    <span>✓ Automated syntax & linter checks</span>
                    <span>✓ Community forum access</span>
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
                        ? 'bg-[#635bff] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {selectedPlan === 'basic' ? 'Selected' : 'Select Free'}
                  </button>
                </div>
              </div>

              {/* 2. PRO PLAN CARD (MOST POPULAR) */}
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
                  ★ MOST POPULAR
                </span>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-[#0f172a] font-display">Pro</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ede9fe] text-[#493ee5] font-semibold">
                      Recommended
                    </span>
                    {selectedPlan === 'pro' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ede9fe] text-[#493ee5]">
                        <Check className="w-3 h-3 text-[#635bff]" />
                        Active Choice
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#635bff] font-semibold">5 Companies Included</div>
                  <div className="text-[11px] text-slate-600 space-y-0.5 pt-0.5">
                    <div>✓ 5 full industry simulations · AI code evaluation within 60s</div>
                    <div>✓ Verified recruiter visibility badge · Downloadable project artifacts</div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xl sm:text-2xl font-black text-[#0f172a] font-display">
                    $29<span className="text-xs font-normal text-slate-400"> /mo</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan('pro');
                    }}
                    className={`mt-1.5 px-4 py-1.5 text-xs rounded-lg font-bold transition-colors cursor-pointer shadow-xs ${
                      selectedPlan === 'pro'
                        ? 'bg-[#635bff] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-[#ede9fe] hover:text-[#493ee5]'
                    }`}
                  >
                    {selectedPlan === 'pro' ? 'Selected Pro' : 'Choose Pro Tier'}
                  </button>
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
                    <span className="font-bold text-base text-[#0f172a] font-display">Premium</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                      Ultimate
                    </span>
                    {selectedPlan === 'premium' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ede9fe] text-[#493ee5]">
                        <Check className="w-3 h-3 text-[#635bff]" />
                        Active Choice
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#635bff] font-semibold">15 Companies Included</div>
                  <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-3 gap-y-0.5 pt-0.5">
                    <span>✓ 15 company simulations across all tracks</span>
                    <span>✓ 1-on-1 industry mentor feedback</span>
                    <span>✓ Direct recruiter fast-track referral</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xl sm:text-2xl font-black text-[#0f172a] font-display">
                    $69<span className="text-xs font-normal text-slate-400"> /mo</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan('premium');
                    }}
                    className={`mt-1.5 px-3.5 py-1 text-xs rounded-lg font-semibold transition-colors cursor-pointer ${
                      selectedPlan === 'premium'
                        ? 'bg-[#635bff] text-white font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {selectedPlan === 'premium' ? 'Selected Premium' : 'Choose Premium'}
                  </button>
                </div>
              </div>
            </div>

            {/* Student Promo Code Waiver Box */}
            <div className="p-4 rounded-2xl bg-[#f2f3ff] border border-[#635bff]/25 mt-5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0f172a] mb-2">
                <Tag className="w-4 h-4 text-[#635bff]" />
                <span>Enter Student Promo Code (e.g., NIBM-BATCH26)</span>
              </div>
              <form onSubmit={handleApplyPromo} className="flex items-center gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="e.g. NIBM-BATCH26 or STANFORD-SPRING25"
                  className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#635bff] uppercase font-mono text-slate-800"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#635bff] hover:bg-[#5248e5] text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                >
                  Apply Code
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

              <p className="text-[11px] text-slate-500 mt-2">
                ℹ University partner codes waive subscription fees and automatically unlock Premium simulation capacity.
              </p>
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
            Strict RBAC Security Gateway v2.4 · LocalStorage Persistence Active
          </div>
        </div>
      </footer>
    </div>
  );
};

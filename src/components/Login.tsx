import React, { useState } from 'react';
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
} from 'lucide-react';

export interface UserSession {
  email: string;
  role: 'admin' | 'student';
  name: string;
}

interface LoginProps {
  onLogin: (session: UserSession) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedKey = accessKey.trim();

    // 1. Admin Authentication Check
    if (trimmedEmail === 'admin@nibm.lk' && trimmedPassword === 'admin123') {
      onLogin({
        email: 'admin@nibm.lk',
        role: 'admin',
        name: 'NIBM Placement Administrator',
      });
      return;
    }

    // 2. Student Authentication Check
    if (trimmedEmail === 'student@nibm.lk' && trimmedPassword === 'student123') {
      if (trimmedKey !== 'NIBM-BATCH26') {
        setErrorMessage('Invalid Student Access Key. Please contact NIBM Admin.');
        return;
      }

      onLogin({
        email: 'student@nibm.lk',
        role: 'student',
        name: 'Kasun Wickramasinghe (Undergraduate)',
      });
      return;
    }

    // 3. Fallback error for invalid credentials
    setErrorMessage('Invalid email or password. Please verify your credentials.');
  };

  // Quick fill helper for demonstration testing
  const fillCredentials = (type: 'admin' | 'student' | 'student_wrong_key') => {
    setErrorMessage(null);
    if (type === 'admin') {
      setEmail('admin@nibm.lk');
      setPassword('admin123');
      setAccessKey('');
    } else if (type === 'student') {
      setEmail('student@nibm.lk');
      setPassword('student123');
      setAccessKey('NIBM-BATCH26');
    } else {
      setEmail('student@nibm.lk');
      setPassword('student123');
      setAccessKey('WRONG-KEY-999');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background soft ambient luminescence */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#ede9fe] to-[#e2dfff]/60 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      {/* Institutional Top Brand Pill */}
      <div className="mb-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#635bff]/20 shadow-xs text-xs">
        <GraduationCap className="w-4 h-4 text-[#635bff]" />
        <span className="font-bold text-[#0f172a]">NIBM</span>
        <span className="text-slate-400">|</span>
        <span className="text-slate-600 font-medium">National Institute of Business Management</span>
        <span className="bg-[#ede9fe] text-[#493ee5] text-[10px] font-bold px-2 py-0.5 rounded-full">
          RBAC Protected
        </span>
      </div>

      {/* Main Login Card */}
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 relative">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#493ee5] to-[#635bff] flex items-center justify-center text-white mx-auto shadow-md shadow-[#635bff]/25 mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a] font-display">
            Virtual Internship Portal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sign in with your role-verified institutional credentials
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Institutional Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nibm.lk or student@nibm.lk"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#635bff] focus:ring-2 focus:ring-[#635bff]/15 text-slate-900 bg-white"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
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

          {/* Student Access Key Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Student Access Key
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                Required for students, optional for admin
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

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-xl bg-[#635bff] hover:bg-[#5248e5] text-white text-xs font-bold transition-all shadow-md shadow-[#635bff]/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Sign In to Platform</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Demo Fast-Fill Helper Cards */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center">
            Demo Credentials (Click to Auto-Fill)
          </span>

          <div className="space-y-2">
            {/* Admin demo button */}
            <button
              type="button"
              onClick={() => fillCredentials('admin')}
              className="w-full p-2.5 rounded-xl border border-purple-200 bg-[#faf8ff] hover:bg-[#ede9fe] text-left transition-colors flex items-center justify-between text-xs"
            >
              <div>
                <div className="flex items-center gap-1.5 font-bold text-[#493ee5]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin User Role</span>
                </div>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                  admin@nibm.lk · admin123
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-[#635bff]/20 font-semibold text-[#493ee5]">
                HR Dashboard Only
              </span>
            </button>

            {/* Student demo button */}
            <button
              type="button"
              onClick={() => fillCredentials('student')}
              className="w-full p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 text-left transition-colors flex items-center justify-between text-xs"
            >
              <div>
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Student User Role</span>
                </div>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                  student@nibm.lk · student123 · NIBM-BATCH26
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-emerald-300 font-semibold text-emerald-800">
                Workspace Only
              </span>
            </button>

            {/* Wrong key test button */}
            <button
              type="button"
              onClick={() => fillCredentials('student_wrong_key')}
              className="w-full p-2 rounded-lg border border-dashed border-slate-300 text-slate-500 hover:text-slate-700 hover:bg-slate-50 text-left transition-colors text-[11px] flex items-center justify-between"
            >
              <span>Test: Student with Wrong Key (WRONG-KEY-999)</span>
              <span className="text-red-500 font-semibold text-[10px]">Test Validation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-slate-400">
        NIBM School of Computing & Engineering · Strict RBAC Enforced
      </div>
    </div>
  );
};

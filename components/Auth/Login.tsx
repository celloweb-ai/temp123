
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Mail, Lock, User as UserIcon, Shield, Loader2, CheckCircle, Info, Key, Hexagon, Zap, ArrowLeft } from 'lucide-react';

type AuthMode = 'signin' | 'signup' | 'recovery';

const Login: React.FC = () => {
  const { login, register, recoverPassword } = useApp();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Engineer' | 'Manager' | 'Auditor'>('Engineer');
  const [rememberMe, setRememberMe] = useState(true);

  const suggestedProfiles = [
    { email: 'alex.thompson@mocstudio.com', label: 'Engineer', role: 'Engineer' },
    { email: 'sarah.miller@mocstudio.com', label: 'Manager', role: 'Manager' },
    { email: 'chief.auditor@mocstudio.com', label: 'Auditor', role: 'Auditor' },
  ];

  const handleQuickLogin = async (profile: typeof suggestedProfiles[0]) => {
    setError(null);
    setEmail(profile.email);
    const mockPwd = 'industrial_secure_2024';
    setPassword(mockPwd);
    setLoading(true);
    const success = await login(profile.email, mockPwd, rememberMe);
    if (!success) {
      setError('Bypass failed. Check system logs.');
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const success = await login(email, password, rememberMe);
    if (!success) {
      setError('Access Denied. Invalid credentials.');
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const success = await register(name, email, role);
    if (success) {
      setSuccessMsg('Account created. Logging in...');
    }
    setLoading(false);
  };

  const inputClasses = "w-full bg-slate-50 border border-slate-300 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const labelClasses = "block text-sm font-bold text-slate-700 mb-1 uppercase tracking-tight";

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-100 font-sans">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-white overflow-hidden p-8 md:p-12">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 mb-4">
            <Hexagon className="text-white fill-white/10" size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
            MOC<span className="text-blue-600">.</span>STUDIO
          </h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Management of Change</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm font-medium animate-in fade-in zoom-in duration-200">
            <Info size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700 text-sm font-medium animate-in fade-in zoom-in duration-200">
            <CheckCircle size={18} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-5">
            <div>
              <label className={labelClasses}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="engineer@mocstudio.com"
                  className={inputClasses}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className={labelClasses}>Password</label>
                <button type="button" onClick={() => setMode('recovery')} className="text-xs font-bold text-blue-600 hover:text-blue-700">
                  Forgot Key?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Remember device</span>
              </label>
            </div>

            <button
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3.5 rounded-xl text-white font-bold text-lg flex items-center justify-center space-x-3 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <span>Sign In</span>}
            </button>

            <div className="text-center text-sm font-medium text-slate-500 pt-2">
              Need access?{' '}
              <button type="button" onClick={() => setMode('signup')} className="text-blue-600 font-bold hover:underline">
                Request Clearance
              </button>
            </div>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className={labelClasses}>Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Doe"
                  className={inputClasses}
                />
              </div>
            </div>
            <div>
              <label className={labelClasses}>Engineering Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@mocstudio.com"
                  className={inputClasses}
                />
              </div>
            </div>
            <div>
              <label className={labelClasses}>Role Selection</label>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  className={`${inputClasses} appearance-none cursor-pointer`}
                >
                  <option value="Engineer">Project Engineer</option>
                  <option value="Manager">Operations Manager</option>
                  <option value="Auditor">Compliance Auditor</option>
                </select>
              </div>
            </div>
            <button
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3.5 rounded-xl text-white font-bold text-lg flex items-center justify-center transition-all disabled:opacity-50 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <span>Create Account</span>}
            </button>
            <button type="button" onClick={() => setMode('signin')} className="w-full text-sm font-bold text-slate-500 hover:text-blue-600 pt-2">
              Back to Sign In
            </button>
          </form>
        )}

        {mode === 'recovery' && (
          <form onSubmit={(e) => { e.preventDefault(); setMode('signin'); }} className="space-y-5">
            <div>
              <label className={labelClasses}>Registered Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  type="email"
                  placeholder="name@mocstudio.com"
                  className={inputClasses}
                />
              </div>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 py-3.5 rounded-xl text-white font-bold transition-all">
              Send Reset Link
            </button>
            <button type="button" onClick={() => setMode('signin')} className="w-full text-sm font-bold text-slate-500 hover:text-blue-600">
              Back to Sign In
            </button>
          </form>
        )}

        {/* Bypass Section - Sandbox Only */}
        {mode === 'signin' && (
          <div className="mt-10 pt-8 border-t border-slate-100">
            <div className="flex items-center justify-center space-x-2 mb-6 opacity-60">
              <span className="h-px w-10 bg-slate-200"></span>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Sandbox Bypass</span>
              <span className="h-px w-10 bg-slate-200"></span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {suggestedProfiles.map(p => (
                <button
                  key={p.email}
                  onClick={() => handleQuickLogin(p)}
                  disabled={loading}
                  className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-200 group-hover:bg-blue-200 flex items-center justify-center text-slate-500 group-hover:text-blue-600 mb-2">
                    <UserIcon size={16} />
                  </div>
                  <span className="text-[9px] font-bold text-slate-700 uppercase">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
      
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-50">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-200 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-emerald-100 blur-[120px] rounded-full"></div>
      </div>
    </div>
  );
};

export default Login;


import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../App';
import { Shield, Mail, Lock, ChevronRight, AlertCircle, Clock } from 'lucide-react';

const Login = () => {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('admin@moctudio.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isExpired = searchParams.get('expired') === 'true';

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-200 dark:shadow-none mb-6">
            <Shield size={40} />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-slate-100">MOC Studio</h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">Sistema de Gerenciamento de Mudanças Segura</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-slate-700 transition-all duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            {isExpired && !error && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-2xl flex items-center gap-3 text-sm font-medium border border-amber-100 dark:border-amber-900/50">
                <Clock size={20} />
                Sua sessão expirou. Por favor, faça login novamente.
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-medium border border-red-100 dark:border-red-900/50">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 px-1">E-mail Corporativo</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-700 border border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-600 outline-none transition-all"
                  placeholder="admin@moctudio.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 px-1">Senha de Acesso</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-700 border border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-600 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-gray-500 dark:text-slate-400">Lembrar-me</span>
              </label>
              <Link to="/forgot-password" size="sm" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">Esqueceu a senha?</Link>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Autenticação Segura
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="mt-8 flex flex-col items-center gap-4 animate-fadeIn">
          <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">CREDENCIAIS DE ACESSO RÁPIDO</p>
          <div className="flex gap-2">
            <button 
              onClick={() => setEmail('admin@moctudio.com')}
              className="px-3 py-1 text-[10px] font-bold bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-slate-400 rounded-full hover:bg-gray-300 transition-colors"
            >
              ADMIN
            </button>
            <button 
              onClick={() => setEmail('carlos@oilgas.com')}
              className="px-3 py-1 text-[10px] font-bold bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-slate-400 rounded-full hover:bg-gray-300 transition-colors"
            >
              ENGENHEIRO
            </button>
            <button 
              onClick={() => setEmail('ana@oilgas.com')}
              className="px-3 py-1 text-[10px] font-bold bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-slate-400 rounded-full hover:bg-gray-300 transition-colors"
            >
              HSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

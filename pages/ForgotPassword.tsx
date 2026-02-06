
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, ChevronLeft, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      await api.resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao processar solicitação.');
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
          <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-slate-100">Recuperar Acesso</h1>
          <p className="text-gray-500 mt-2">Enviaremos um link de redefinição para o seu e-mail.</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-slate-700">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-medium">
                  <AlertCircle size={20} />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 px-1">E-mail Corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-700 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="exemplo@moctudio.com"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Solicitar Link
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6 animate-fadeIn">
              <div className="flex justify-center">
                <div className="p-4 bg-emerald-100 text-emerald-600 rounded-full">
                  <CheckCircle size={48} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold">Solicitação Enviada!</h3>
                <p className="text-gray-500 mt-2">
                  Se o e-mail <strong>{email}</strong> estiver cadastrado, você receberá as instruções em instantes.
                </p>
              </div>
              <Link 
                to="/login"
                className="block w-full py-4 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all"
              >
                Voltar para o Login
              </Link>
            </div>
          )}

          {!success && (
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700 text-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                <ChevronLeft size={16} />
                Lembrei minha senha
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;


import React, { useState, useEffect } from 'react';
import { Shield, Search, Filter, Clock, Activity, AlertCircle, ChevronDown, ChevronRight, FileJson, ArrowRight, CornerDownRight, ArrowDown } from 'lucide-react';
import { api } from '../services/api';
import { AuditEntry, AuditChange } from '../types';

const AuditTrail = () => {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    api.getAuditTrail().then(data => {
      setLogs(data);
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, []);

  const filteredLogs = logs.filter(log => 
    log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionStyles = (action: AuditEntry['action'], details?: string) => {
    if (action === 'SECURITY_VIOLATION' || details?.includes('TENTATIVA NEGADA')) {
      return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30';
    }
    switch (action) {
      case 'WRITE': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30';
      case 'LOGIN': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30';
      case 'DELETE': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900/30';
      case 'STATUS_CHANGE': return 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/30';
      default: return 'text-gray-600 bg-gray-50 dark:bg-slate-700 border-gray-100 dark:border-slate-600';
    }
  };

  const formatValue = (val: any): string => {
    if (val === null) return 'null';
    if (val === undefined) return '(vazio)';
    if (typeof val === 'object') return JSON.stringify(val);
    if (typeof val === 'boolean') return val ? 'Sim' : 'Não';
    return String(val);
  };

  const renderChanges = (changes: AuditChange[]) => {
    return (
      <div className="mt-4 space-y-6 animate-slideDown overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 ml-4">
          <div className="flex items-center gap-3 text-[11px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-[0.15em]">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
              <CornerDownRight size={16} />
            </div>
            Diferencial de Atributos ({changes.length} Campos Modificados)
          </div>
          <div className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl text-[10px] font-black text-gray-500 uppercase flex items-center gap-2">
            <Shield size={14} className="text-blue-500" />
            Integridade de Dados Assegurada
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 ml-4">
          {changes.map((change, idx) => (
            <div key={idx} className="group relative bg-white dark:bg-slate-800/90 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-900/50 transition-all">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-4 py-1.5 rounded-full uppercase tracking-widest border border-blue-100 dark:border-blue-800/50">
                  {change.field.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-300 opacity-50"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-100 opacity-20"></div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="relative pl-6 border-l-2 border-red-100 dark:border-red-900/30 group-hover:border-red-400 transition-colors">
                  <p className="text-[9px] text-gray-400 dark:text-slate-500 uppercase font-black mb-2 tracking-[0.2em]">Estado Original</p>
                  <div className="p-4 bg-red-50/20 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl border border-red-50 dark:border-red-900/20 break-words italic font-medium">
                    {formatValue(change.oldValue)}
                  </div>
                </div>

                <div className="flex items-center justify-center -my-3 relative z-10">
                   <div className="bg-white dark:bg-slate-700 p-2.5 rounded-full border border-gray-100 dark:border-slate-600 shadow-md group-hover:scale-110 transition-transform">
                     <ArrowDown className="text-blue-500" size={18} strokeWidth={3} />
                   </div>
                </div>

                <div className="relative pl-6 border-l-2 border-emerald-100 dark:border-emerald-900/30 group-hover:border-emerald-400 transition-colors">
                  <p className="text-[9px] text-gray-400 dark:text-slate-500 uppercase font-black mb-2 tracking-[0.2em]">Novo Estado Consolidado</p>
                  <div className="p-4 bg-emerald-50/20 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-300 rounded-2xl border border-emerald-50 dark:border-emerald-900/20 break-words font-black">
                    {formatValue(change.newValue)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-gray-900 dark:text-white">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none">
              <Shield size={28} />
            </div>
            Trilha de Auditoria Governamental
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2 font-medium">Log granular para conformidade com NR-13 e padrões de segurança operacional imutáveis.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 p-5 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Filtrar por autoridade, recurso, campo técnico ou ação executada..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
          />
        </div>
        <button className="p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl hover:bg-gray-100 transition-colors text-gray-500">
           <Filter size={20} />
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[3rem] shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400 text-[10px] uppercase tracking-[0.25em] font-black">
                <th className="px-10 py-6 w-12"></th>
                <th className="px-10 py-6">Eixo Temporal</th>
                <th className="px-10 py-6">Autoridade Responsável</th>
                <th className="px-10 py-6">Contexto da Operação</th>
                <th className="px-10 py-6">Sumário de Auditoria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {isLoading ? (
                <tr><td colSpan={5} className="px-10 py-24 text-center text-gray-400 font-black uppercase tracking-widest animate-pulse">Sincronizando registros imutáveis...</td></tr>
              ) : filteredLogs.length > 0 ? filteredLogs.map((log) => (
                <React.Fragment key={log.id}>
                  <tr 
                    onClick={() => log.changes && log.changes.length > 0 && setExpandedRow(expandedRow === log.id ? null : log.id)}
                    className={`group transition-all ${log.changes && log.changes.length > 0 ? 'cursor-pointer hover:bg-blue-50/30 dark:hover:bg-blue-900/10' : 'hover:bg-gray-50/50 dark:hover:bg-slate-700/30'}`}
                  >
                    <td className="px-10 py-8">
                      {log.changes && log.changes.length > 0 && (
                        <div className={`p-2 rounded-xl transition-all shadow-sm ${expandedRow === log.id ? 'rotate-90 bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-400 group-hover:text-blue-500'}`}>
                          <ChevronRight size={20} />
                        </div>
                      )}
                    </td>
                    <td className="px-10 py-8 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-xs font-mono font-black text-gray-400 mb-2">
                        <Clock size={14} className="text-blue-400" />
                        {log.timestamp}
                      </div>
                      <div className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                        UUID: {log.id.split('-').slice(0, 2).join('-')}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-lg shadow-inner group-hover:scale-105 transition-transform">
                          {log.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-sm text-gray-900 dark:text-slate-100 tracking-tight">{log.userName}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                             <Shield size={10} className="text-blue-500" />
                             <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">{log.userRole.replace('_', ' ')}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-3">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border shadow-sm ${getActionStyles(log.action, log.details)}`}>
                          {log.action.replace('_', ' ')}
                        </span>
                        <p className="text-xs font-bold text-gray-700 dark:text-slate-200 flex items-center gap-2">
                          <Activity size={14} className="text-blue-500" />
                          {log.resource}
                        </p>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className={`flex items-start gap-4 p-5 rounded-[2rem] border transition-all ${
                        log.action === 'SECURITY_VIOLATION' || log.details?.includes('TENTATIVA NEGADA') 
                        ? 'bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30 text-red-700 dark:text-red-400 shadow-xl shadow-red-500/5' 
                        : 'bg-gray-50 dark:bg-slate-700/50 border-gray-100 dark:border-slate-700 text-gray-600 dark:text-slate-300'
                      } ${expandedRow === log.id ? 'border-blue-200 dark:border-blue-900 shadow-lg' : ''}`}>
                        <div className={`p-2 rounded-xl shrink-0 ${
                           log.action === 'SECURITY_VIOLATION' || log.details?.includes('TENTATIVA NEGADA') 
                           ? 'bg-red-100 text-red-600'
                           : 'bg-white dark:bg-slate-800 text-blue-500 shadow-sm'
                        }`}>
                          {log.action === 'SECURITY_VIOLATION' ? <AlertCircle size={18} /> : <Shield size={18} />}
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[11px] leading-relaxed font-bold">
                            {log.details || 'Operação registrada e validada em trilha segura.'}
                          </span>
                          {log.changes && log.changes.length > 0 && (
                            <div className="flex items-center gap-2 mt-1">
                               <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-[9px] font-black rounded-lg uppercase tracking-widest border border-blue-200 dark:border-blue-800">
                                 {log.changes.length} {log.changes.length === 1 ? 'CAMPO' : 'CAMPOS'}
                               </span>
                               {expandedRow !== log.id && (
                                 <span className="text-[9px] font-black text-gray-400 uppercase animate-pulse">
                                   Clique para detalhar
                                 </span>
                               )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                  {expandedRow === log.id && log.changes && (
                    <tr className="bg-gray-50/30 dark:bg-slate-900/10 no-print">
                      <td colSpan={5} className="px-10 py-10 pb-20">
                        {renderChanges(log.changes)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )) : (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-6 text-gray-300">
                      <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center">
                        <Shield size={48} />
                      </div>
                      <div>
                        <p className="font-black text-xl text-gray-400 uppercase tracking-[0.2em]">Cofre de Auditoria Vazio</p>
                        <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto font-medium">Todas as interações autenticadas e tentativas de violação RBAC serão persistidas aqui com carimbo de tempo imutável.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditTrail;

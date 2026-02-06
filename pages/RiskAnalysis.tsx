
import React, { useState } from 'react';
import { storage } from '../services/storage';
import { RiskLevel, RiskAssessment } from '../types';
import { ShieldAlert, Info, Save, ChevronRight, Printer, Loader2, Shield } from 'lucide-react';
import { useAuth } from '../App';

const RiskAnalysis = () => {
  const { user } = useAuth();
  const [p, setP] = useState(0); // Probability
  const [s, setS] = useState(0); // Severity
  const [mitigation, setMitigation] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  const getRiskResult = (p: number, s: number): { label: RiskLevel; color: string; hex: string } => {
    const score = p * s;
    if (score >= 20) return { label: RiskLevel.CRITICO, color: 'bg-red-600', hex: '#dc2626' };
    if (score >= 12) return { label: RiskLevel.ALTO, color: 'bg-orange-500', hex: '#f97316' };
    if (score >= 6) return { label: RiskLevel.MEDIO, color: 'bg-yellow-400', hex: '#facc15' };
    return { label: RiskLevel.BAIXO, color: 'bg-emerald-500', hex: '#10b981' };
  };

  const currentResult = p > 0 && s > 0 ? getRiskResult(p, s) : null;

  const handleExportReport = async () => {
    const element = document.getElementById('risk-report-content');
    if (!element || !currentResult) return;

    // @ts-ignore
    const html2pdfLib = (window as any).html2pdf;
    if (!html2pdfLib) return;

    setIsExporting(true);
    
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Analise_Risco_MOC_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { 
        scale: 3, 
        useCORS: true, 
        letterRendering: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      await html2pdfLib().set(opt).from(element).save();
    } catch (error) {
      console.error(error);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const renderMatrix = () => {
    const rows = [5, 4, 3, 2, 1];
    const cols = [1, 2, 3, 4, 5];

    return (
      <div className="grid grid-cols-6 gap-2 max-w-xl mx-auto keep-grid">
        <div className="row-span-6 flex items-center justify-center -rotate-90 font-black text-gray-400 uppercase tracking-widest text-[10px]">
          Probabilidade
        </div>
        
        {rows.map(row => (
          <React.Fragment key={row}>
            {cols.map(col => {
              const res = getRiskResult(row, col);
              const isActive = p === row && s === col;
              return (
                <div 
                  key={`${row}-${col}`}
                  onClick={() => { setP(row); setS(col); }}
                  className={`risk-cell rounded-lg text-white shadow-sm border-2 ${res.color} ${isActive ? 'ring-4 ring-offset-2 ring-blue-500 scale-110 z-10' : 'border-transparent opacity-90'}`}
                >
                  {row * col}
                </div>
              );
            })}
          </React.Fragment>
        ))}
        <div className="col-start-2 col-span-5 flex justify-between px-4 mt-2 font-black text-gray-400 uppercase tracking-widest text-[8px]">
          <span>Insignificante</span>
          <span>Catastrófico</span>
        </div>
        <div className="col-start-2 col-span-5 text-center mt-4 font-black text-gray-400 uppercase tracking-widest text-[10px]">
          Severidade
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Análise de Risco Preliminar</h1>
          <p className="text-gray-500 dark:text-slate-400">Determine o nível de risco através da matriz técnica 5x5.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportReport}
            disabled={isExporting || !currentResult}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg font-bold disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="animate-spin" size={20} /> : <Printer size={20} />}
            {isExporting ? 'Processando...' : 'Exportar Relatório A4'}
          </button>
        </div>
      </div>

      <div id="risk-report-content" className="max-w-5xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-slate-800">
        <div className="hidden print:block mb-12 border-b-4 border-blue-600 pb-6 bg-white p-8 rounded-t-[3rem]">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg">
                <Shield size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tighter">MOC Studio Enterprise</h1>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Relatório Técnico de Avaliação de Risco</p>
              </div>
            </div>
            <div className="text-right text-[10px] font-bold text-gray-500 uppercase leading-relaxed">
              <p>Autor: {user?.name}</p>
              <p>Data: {new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="bg-gray-50 dark:bg-slate-800/50 p-10 rounded-[3rem] border border-gray-100 dark:border-slate-800 page-break-avoid">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-2">
              <ShieldAlert className="text-blue-600" size={18} /> Matriz de Risco 5x5
            </h3>
            {renderMatrix()}
          </div>

          <div className="space-y-8">
            <div className={`p-8 rounded-[2.5rem] border-l-[12px] shadow-sm page-break-avoid ${currentResult ? 'bg-gray-50 dark:bg-slate-800' : 'bg-gray-100 dark:bg-slate-800/50'}`} 
                 style={{ borderLeftColor: currentResult ? currentResult.hex : 'transparent' }}>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Classificação Técnica</h3>
              {currentResult ? (
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`px-6 py-2 rounded-full text-white text-xs font-black uppercase tracking-widest shadow-lg ${currentResult.color}`}>
                      Risco {currentResult.label}
                    </span>
                    <p className="text-4xl font-black mt-4 text-gray-900 dark:text-white">Fator: {p * s}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 font-bold italic py-4">Aguardando seleção na matriz...</p>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 page-break-avoid">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Info size={14} className="text-blue-500" /> Memorial de Medidas Mitigadoras
              </label>
              <textarea 
                className="w-full p-6 bg-white dark:bg-slate-700 border-none rounded-[1.5rem] focus:ring-2 focus:ring-blue-500 outline-none h-48 resize-none shadow-inner font-medium text-sm leading-relaxed no-print"
                placeholder="Descreva as barreiras, redundâncias e controles..."
                value={mitigation}
                onChange={(e) => setMitigation(e.target.value)}
              />
              <div className="hidden print:block p-6 bg-white rounded-2xl border border-gray-200 min-h-[250px] text-sm italic text-gray-700 leading-relaxed">
                {mitigation || "Nenhuma medida mitigadora informada pelo avaliador técnico."}
              </div>
            </div>
          </div>
        </div>

        <div className="hidden print:block mt-16 pt-8 border-t-2 border-gray-100">
          <div className="flex items-center gap-4 bg-blue-50 p-8 rounded-[2rem]">
            <Shield className="text-blue-600" size={32} />
            <p className="text-xs font-bold text-gray-800 leading-relaxed">
              Este documento é parte integrante do dossier de engenharia e possui validade técnica para fins de aprovação do workflow de Gestão de Mudanças.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAnalysis;

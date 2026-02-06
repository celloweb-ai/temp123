
import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area
} from 'recharts';
import { ClipboardList, AlertCircle, CheckCircle, Clock, Printer, Shield, Loader2, TrendingUp, ShieldAlert, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';
import { storage } from '../services/storage';
import { MOCStatus, RiskLevel } from '../types';
import { useAuth } from '../App';
import { RISK_LEVEL_COLORS } from '../constants';

const Dashboard = () => {
  const mocs = storage.getMOCs();
  const risks = storage.getRisks();
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  
  const stats = useMemo(() => [
    { title: 'Total MOCs', value: mocs.length, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Pendentes', value: mocs.filter(m => m.status === MOCStatus.SUBMETIDO || m.status === MOCStatus.EM_AVALIACAO).length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { title: 'Concluídos', value: mocs.filter(m => m.status === MOCStatus.CONCLUIDO).length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Críticos', value: mocs.filter(m => m.status === MOCStatus.REJEITADO).length, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
  ], [mocs]);

  const riskSummary = useMemo(() => {
    const pendingMocs = mocs.filter(m => m.status === MOCStatus.SUBMETIDO || m.status === MOCStatus.EM_AVALIACAO);
    const counts = {
      [RiskLevel.BAIXO]: 0,
      [RiskLevel.MEDIO]: 0,
      [RiskLevel.ALTO]: 0,
      [RiskLevel.CRITICO]: 0,
    };

    pendingMocs.forEach(moc => {
      const assessment = risks.find(r => r.mocId === moc.id);
      if (assessment) {
        counts[assessment.residualRisk]++;
      }
    });

    return [
      { level: RiskLevel.BAIXO, count: counts[RiskLevel.BAIXO], icon: ShieldCheck, color: 'emerald', hex: '#10b981' },
      { level: RiskLevel.MEDIO, count: counts[RiskLevel.MEDIO], icon: ShieldAlert, color: 'yellow', hex: '#facc15' },
      { level: RiskLevel.ALTO, count: counts[RiskLevel.ALTO], icon: AlertTriangle, color: 'orange', hex: '#f97316' },
      { level: RiskLevel.CRITICO, count: counts[RiskLevel.CRITICO], icon: Flame, color: 'red', hex: '#dc2626' },
    ];
  }, [mocs, risks]);

  const chartData = useMemo(() => {
    return Object.values(MOCStatus).map(status => ({
      name: status,
      count: mocs.filter(m => m.status === status).length
    }));
  }, [mocs]);

  const timelineData = [
    { name: 'Jan', value: 4 },
    { name: 'Fev', value: 7 },
    { name: 'Mar', value: 5 },
    { name: 'Abr', value: 12 },
    { name: 'Mai', value: 8 },
    { name: 'Jun', value: 15 },
  ];

  const handleExportReport = async () => {
    const element = document.getElementById('dashboard-content');
    if (!element) return;

    // @ts-ignore
    const html2pdfLib = (window as any).html2pdf;
    if (!html2pdfLib) {
      alert('Módulo PDF ainda carregando...');
      return;
    }

    setIsExporting(true);
    
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Relatorio_Dashboard_MOC_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
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

  return (
    <div id="dashboard-content" className="space-y-8 animate-fadeIn bg-gray-50 dark:bg-slate-900 p-4 rounded-[2rem]">
      {/* Cabeçalho do PDF */}
      <div className="hidden print:block mb-8 border-b-4 border-blue-600 pb-6 bg-white p-8 rounded-t-[2rem]">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg">
              <Shield size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tighter">MOC Studio Enterprise</h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Dashboard Consolidado de Gestão</p>
            </div>
          </div>
          <div className="text-right text-[10px] font-bold text-gray-500 uppercase leading-relaxed">
            <p>Emitido por: {user?.name}</p>
            <p>Data: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Dashboard Operacional</h1>
          <p className="text-gray-500 dark:text-slate-400">Visão analítica do fluxo de gestão de mudanças.</p>
        </div>
        <button 
          onClick={handleExportReport}
          disabled={isExporting}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg font-bold disabled:opacity-50"
        >
          {isExporting ? <Loader2 className="animate-spin" size={20} /> : <Printer size={20} />}
          {isExporting ? 'Processando...' : 'Exportar Dashboard A4'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 page-break-avoid">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-700">
            <div className={`p-4 ${stat.bg} ${stat.color} rounded-2xl w-fit mb-6`}>
              <stat.icon size={28} />
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{stat.title}</p>
            <p className="text-4xl font-black text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-sm border border-gray-100 dark:border-slate-700 page-break-avoid">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black flex items-center gap-3">
            <ShieldAlert className="text-blue-600" size={24} /> Perfil de Risco em Pendência
          </h3>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Solicitações Ativas</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {riskSummary.map((item) => (
            <div key={item.level} className={`relative p-6 rounded-[2rem] border-2 border-${item.color}-50 dark:border-${item.color}-900/20 bg-${item.color}-50/30 dark:bg-${item.color}-900/10`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-white dark:bg-slate-700 rounded-xl shadow-sm text-${item.color}-500`}>
                  <item.icon size={20} />
                </div>
                <span className={`text-2xl font-black text-${item.color}-600`}>{item.count}</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Risco {item.level}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 page-break-avoid">
        <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-sm border border-gray-100 dark:border-slate-700">
          <h3 className="text-xl font-black mb-10 flex items-center gap-3">
            <ClipboardList className="text-blue-600" size={24} /> Status por Workflow
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-sm border border-gray-100 dark:border-slate-700">
          <h3 className="text-xl font-black mb-10 flex items-center gap-3">
            <TrendingUp className="text-blue-600" size={24} /> Tendência de Abertura
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

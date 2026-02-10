
import React from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, AlertCircle, CheckCircle, TrendingUp, Flame, Plus, ArrowRight, ShieldAlert } from 'lucide-react';

const data = [
  { name: 'Jan', count: 4 },
  { name: 'Feb', count: 7 },
  { name: 'Mar', count: 5 },
  { name: 'Apr', count: 12 },
  { name: 'May', count: 9 },
  { name: 'Jun', count: 15 },
];

const statusData = [
  { name: 'Draft', value: 12 },
  { name: 'Evaluation', value: 8 },
  { name: 'Approved', value: 5 },
  { name: 'Active', value: 14 },
];

const Dashboard: React.FC = () => {
  const { language, mocs, theme, startEmergencyMOC } = useApp();
  const t = TRANSLATIONS[language];
  const isDark = theme === 'dark';

  const stats = [
    { label: t.activeMocs, value: mocs.length, icon: <Activity className="text-blue-500 dark:text-blue-400" />, change: '+12%' },
    { label: t.criticalRisks, value: '3', icon: <AlertCircle className="text-orange-500 dark:text-orange-400" />, change: '-2%' },
    { label: t.completed, value: '89', icon: <CheckCircle className="text-emerald-500 dark:text-emerald-400" />, change: '+5%' },
    { label: t.systemHealth, value: '98%', icon: <TrendingUp className="text-purple-500 dark:text-purple-400" />, change: 'Stable' },
  ];

  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const axisColor = isDark ? '#64748b' : '#94a3b8';
  const tooltipBg = isDark ? '#0f172a' : '#ffffff';
  const tooltipBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const tooltipColor = isDark ? '#ffffff' : '#0f172a';

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-blue-600 dark:text-blue-400 mb-2 tracking-tight glow-title">
            {t.welcome}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">{t.engMonitoring} | v2.4.0</p>
        </div>
        <div className="hidden md:flex gap-4">
           <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3">
              <ShieldAlert size={16} className="text-blue-600 dark:text-blue-400" />
              <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">Safety Protocol active</span>
           </div>
        </div>
      </header>

      {/* Quick Action & Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="glass-panel p-6 rounded-[2.5rem] hover:border-blue-500/40 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-500/10 dark:bg-blue-400/20 rounded-2xl group-hover:bg-blue-500/30 transition-colors">
                  {stat.icon}
                </div>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-500/10 text-slate-500 dark:text-slate-400'}`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{stat.value}</div>
              <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Emergency Fast-Track Card */}
        <div className="lg:col-span-4 glass-panel p-8 rounded-[3rem] bg-gradient-to-br from-red-600/10 to-transparent border-red-500/20 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-500"><Flame size={120} className="text-red-600 dark:text-red-500" /></div>
           <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                   <Flame size={24} className="text-red-600 dark:text-red-500 animate-pulse" />
                   Emergency Protocol
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-bold leading-relaxed max-w-[85%] uppercase tracking-tight">
                  Accelerated Change Workflow for Critical Safety Interventions.
                </p>
              </div>
              <button 
                onClick={startEmergencyMOC}
                className="mt-6 bg-red-600 hover:bg-red-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 shadow-xl shadow-red-600/20 transition-all active:scale-95"
              >
                 <span>Initiate Bypass</span>
                 <ArrowRight size={18} />
              </button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-8 rounded-[3.5rem]">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
            <TrendingUp size={22} className="text-blue-500 dark:text-blue-400" />
            {t.changeTrends}
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="name" stroke={axisColor} axisLine={false} tickLine={false} dy={10} fontSize={10} fontWeight="bold" />
                <YAxis stroke={axisColor} axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" />
                <Tooltip 
                  contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '16px', color: tooltipColor, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: tooltipColor, fontWeight: 'bold', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-[3.5rem]">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
             <Activity size={22} className="text-emerald-500 dark:text-emerald-400" />
             {t.workflowDist}
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="name" stroke={axisColor} axisLine={false} tickLine={false} dy={10} fontSize={10} fontWeight="bold" />
                <YAxis stroke={axisColor} axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" />
                <Tooltip 
                   contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '16px', color: tooltipColor }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

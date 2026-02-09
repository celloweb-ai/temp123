
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS, MOC_STATUS_COLORS, FACILITIES } from '../constants';
import { 
  AlertCircle, ArrowLeft, ArrowRight, Ban, Calendar, Check, CheckCircle2, 
  ChevronDown, ChevronUp, Cpu, Download, Eye, File, FileCheck, FileText, Filter, 
  Image as ImageIcon, Info, Loader2, MapPin, Maximize2, MoreVertical, Paperclip, 
  Plus, RotateCcw, Save, Search, Shield, ShieldAlert, ShieldCheck, Sparkles, Tag, Trash2, 
  Upload, User, Zap, Globe, Settings, X, Clock, ClipboardList, History, AlertTriangle,
  Flame, ShieldX, Fingerprint, Edit2, GitCommit, ListTree, Timer, Gauge, FileWarning,
  Activity, Scale, Target, BarChart, Binary, SearchX, CheckCircle, ClipboardCheck,
  ExternalLink, ArrowUpRight, Bold, Italic, List, ListOrdered, Heading1, Heading2, Type,
  Wrench, Users2, FileSignature, ClipboardCheck as ClipboardCheckIcon, FileCheck as FileCheckIcon,
  Hammer, Box, Layers, Factory
} from 'lucide-react';
import { MOCRequest, MOCStatus, Attachment, MOCPriority, ChangeType, MOCTask, RiskAssessment, TaskStatus } from '../types';
import { storageService } from '../services/storageService';
import { geminiService } from '../services/geminiService';

const getRiskColor = (score: number) => {
  if (score >= 15) return 'bg-red-600';
  if (score >= 8) return 'bg-orange-500';
  if (score >= 4) return 'bg-yellow-500';
  return 'bg-emerald-500';
};

const getStatusDotColor = (status: MOCStatus) => {
  switch (status) {
    case 'Evaluation': return 'bg-blue-500';
    case 'Approved': return 'bg-emerald-500';
    case 'Implementation': return 'bg-orange-500';
    case 'Completed': return 'bg-purple-500';
    default: return 'bg-slate-400';
  }
};

const getStatusHoverClasses = (status: MOCStatus) => {
  const base = 'hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]';
  switch (status) {
    case 'Draft': return `${base} hover:border-slate-400/40 hover:shadow-[0_20px_40px_-10px_rgba(148,163,184,0.3)]`;
    case 'Evaluation': return `${base} hover:border-blue-500/40 hover:shadow-[0_20px_40px_-10px_rgba(59,130,246,0.3)]`;
    case 'Approved': return `${base} hover:border-emerald-500/40 hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)]`;
    case 'Implementation': return `${base} hover:border-orange-500/40 hover:shadow-[0_20px_40px_-10px_rgba(245,158,11,0.3)]`;
    case 'Completed': return `${base} hover:border-purple-500/40 hover:shadow-[0_20px_40px_-10px_rgba(168,85,247,0.3)]`;
    default: return `${base} hover:border-blue-500/40 hover:shadow-[0_20px_40px_-10px_rgba(59,130,246,0.3)]`;
  }
};

const getDisciplineIcon = (discipline: string) => {
  const d = discipline.toLowerCase();
  if (d.includes('mechanical')) return <Wrench size={12} />;
  if (d.includes('electrical')) return <Zap size={12} />;
  if (d.includes('process')) return <Activity size={12} />;
  if (d.includes('personnel')) return <Users2 size={12} />;
  if (d.includes('procedure')) return <FileSignature size={12} />;
  if (d.includes('instrumentation')) return <Cpu size={12} />;
  if (d.includes('civil')) return <Hammer size={12} />;
  return <Settings size={12} />;
};

const getDisciplineColor = (discipline: string) => {
  const d = discipline.toLowerCase();
  if (d.includes('mechanical')) return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
  if (d.includes('electrical')) return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
  if (d.includes('process')) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
  if (d.includes('instrumentation')) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  if (d.includes('civil')) return 'text-orange-600 bg-orange-600/10 border-orange-600/20';
  return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
};

const stripHtml = (html: string) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const MOCList: React.FC = () => {
  const { language, mocs, refreshMOCs, user, users, assets, addNotification, emergencyWizardActive, closeEmergencyMOC } = useApp();
  const t = TRANSLATIONS[language];
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<MOCStatus | 'All'>('All');
  const [disciplineFilter, setDisciplineFilter] = useState<string | 'All'>('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeDetailTab, setActiveDetailTab] = useState<'general' | 'tasks' | 'audit' | 'related-assets' | 'risk-details'>('general');

  const [selectedMoc, setSelectedMoc] = useState<MOCRequest | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskForm, setTaskForm] = useState<Omit<MOCTask, 'id' | 'completed' | 'status'>>({
    title: '',
    assignee: '',
    dueDate: new Date().toISOString().split('T')[0],
    type: 'Pre'
  });
  
  const [newMoc, setNewMoc] = useState<Partial<MOCRequest>>({
    title: '',
    requester: '',
    facility: FACILITIES[0].name,
    priority: 'Medium',
    changeType: 'Mechanical',
    discipline: 'Mechanical',
    description: '',
    status: 'Draft',
    impacts: { safety: false, environmental: false, operational: false, regulatory: false, emergency: false },
    attachments: [],
    tasks: [],
    technicalAssessment: ''
  });

  const filteredMocs = useMemo(() => {
    return mocs.filter(m => {
      const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            m.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
      const matchesDiscipline = disciplineFilter === 'All' || m.discipline === disciplineFilter;
      const matchesDate = (!startDate || m.createdAt >= startDate) && 
                          (!endDate || m.createdAt <= endDate);
      
      return matchesSearch && matchesStatus && matchesDiscipline && matchesDate;
    });
  }, [mocs, searchTerm, statusFilter, disciplineFilter, startDate, endDate]);

  useEffect(() => {
    if (emergencyWizardActive) {
      handleOpenEmergency();
    }
  }, [emergencyWizardActive]);

  const handleOpenEmergency = () => {
    setIsEmergencyMode(true);
    setIsEditing(false);
    setNewMoc({
      title: '[EMERGENCY] ',
      requester: user?.name || '',
      facility: FACILITIES[0].name,
      priority: 'Critical',
      changeType: 'Mechanical',
      discipline: 'Mechanical',
      description: '<strong>EMERGENCY PROTOCOL ACTIVATED:</strong> ',
      status: 'Implementation',
      impacts: { safety: true, environmental: true, operational: true, regulatory: true, emergency: true },
      attachments: [],
      tasks: [],
      technicalAssessment: ''
    });
    setIsCreating(true);
  };

  const handleOpenAdd = () => {
    setIsEmergencyMode(false);
    setIsEditing(false);
    setNewMoc({
      title: '',
      requester: user?.name || '',
      facility: FACILITIES[0].name,
      priority: 'Medium',
      changeType: 'Mechanical',
      discipline: 'Mechanical',
      description: '',
      status: 'Draft',
      impacts: { safety: false, environmental: false, operational: false, regulatory: false, emergency: false },
      attachments: [],
      tasks: [],
      technicalAssessment: ''
    });
    setIsCreating(true);
  };

  const handleOpenEdit = (moc: MOCRequest) => {
    setIsEditing(true);
    setIsEmergencyMode(moc.impacts.emergency || false);
    setNewMoc({ ...moc });
    setIsCreating(true);
    setSelectedMoc(null);
  };

  const handleCloseWizard = () => {
    setIsCreating(false);
    setIsEmergencyMode(false);
    setIsEditing(false);
    closeEmergencyMOC(); 
  };

  const handleDeleteMoc = async (id: string) => {
    await storageService.deleteMOC(id);
    await refreshMOCs();
    setIsDeleting(null);
    setSelectedMoc(null);
    addNotification({ title: language === 'pt-BR' ? 'Dossier Removido' : 'Dossier Purged', message: `${id} has been removed from the archive.`, type: 'warning' });
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    if (!selectedMoc) return;
    const updatedTasks = selectedMoc.tasks?.map(t => t.id === taskId ? { ...t, status: newStatus, completed: newStatus === 'Done' } : t);
    const updatedMoc = { ...selectedMoc, tasks: updatedTasks, auditLog: [...selectedMoc.auditLog, { timestamp: Date.now(), user: user?.name || 'System', action: 'Task Lifecycle Update', details: `Action item ${taskId} shifted to ${newStatus}.` }] };
    await storageService.saveMOC(updatedMoc);
    setSelectedMoc(updatedMoc);
    await refreshMOCs();
  };

  const handleAddTask = async () => {
    if (!selectedMoc || !taskForm.title || !taskForm.assignee) return;
    const newTask: MOCTask = { ...taskForm, id: `T${Date.now().toString().slice(-4)}`, status: 'To Do', completed: false };
    const updatedMoc = { ...selectedMoc, tasks: [...(selectedMoc.tasks || []), newTask], auditLog: [...selectedMoc.auditLog, { timestamp: Date.now(), user: user?.name || 'System', action: 'Task Provisioned', details: `Provisioned action item "${newTask.title}" assigned to ${newTask.assignee}.` }] };
    await storageService.saveMOC(updatedMoc);
    setSelectedMoc(updatedMoc);
    await refreshMOCs();
    setIsAddingTask(false);
    setTaskForm({ title: '', assignee: '', dueDate: new Date().toISOString().split('T')[0], type: 'Pre' });
  };

  const handleGenerateAISummary = async () => {
    if (!selectedMoc) return;
    setIsGeneratingSummary(true);
    try {
      const summary = await geminiService.summarizeMOC(stripHtml(selectedMoc.description));
      const updatedMoc = { ...selectedMoc, technicalSummary: summary, auditLog: [...selectedMoc.auditLog, { timestamp: Date.now(), user: user?.name || 'System', action: 'AI Update', details: 'Technical Summary generated by Gemini AI.' }] };
      await storageService.saveMOC(updatedMoc);
      setSelectedMoc(updatedMoc);
      await refreshMOCs();
      addNotification({ title: language === 'pt-BR' ? 'Resumo IA Pronto' : 'AI Insights Ready', message: 'Technical summary compiled successfully.', type: 'success' });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const relatedAssets = useMemo(() => {
    if (!selectedMoc?.relatedAssetTags) return [];
    return assets.filter(a => selectedMoc.relatedAssetTags?.includes(a.tag));
  }, [selectedMoc, assets]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight leading-none mb-1 glow-title">
            {t.mocs}
          </h2>
          <p className="text-slate-500 dark:text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">
            Governance Ecosystem • {mocs.length} {t.techDossier}
          </p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl flex items-center gap-2 font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-blue-500/20 active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          <span>{t.createNew}</span>
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder={t.fullTextSearch}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm focus:bg-white dark:focus:bg-slate-950"
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative group w-full md:w-56">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" size={16} />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full appearance-none bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-10 text-[10px] font-black text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer uppercase tracking-widest shadow-sm hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <option value="All">{t.workflowStatus}: {language === 'pt-BR' ? 'TODOS' : 'ALL'}</option>
                <option value="Draft">DRAFT</option>
                <option value="Evaluation">{language === 'pt-BR' ? 'AVALIAÇÃO' : 'EVALUATION'}</option>
                <option value="Approved">{language === 'pt-BR' ? 'APROVADO' : 'APPROVED'}</option>
                <option value="Implementation">{language === 'pt-BR' ? 'IMPLEMENTAÇÃO' : 'IMPLEMENTATION'}</option>
                <option value="Completed">{language === 'pt-BR' ? 'CONCLUÍDO' : 'COMPLETED'}</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>

            <div className="relative group w-full md:w-56">
              <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" size={16} />
              <select 
                value={disciplineFilter}
                onChange={(e) => setDisciplineFilter(e.target.value as any)}
                className="w-full appearance-none bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-10 text-[10px] font-black text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer uppercase tracking-widest shadow-sm hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <option value="All">{t.discipline}: {language === 'pt-BR' ? 'TODAS' : 'ALL'}</option>
                <option value="Mechanical">MECHANICAL</option>
                <option value="Process">PROCESS</option>
                <option value="Electrical">ELECTRICAL</option>
                <option value="Instrumentation">INSTRUMENTATION</option>
                <option value="Civil">CIVIL</option>
                <option value="Personnel">PERSONNEL</option>
                <option value="Procedure">PROCEDURE</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]">
        {filteredMocs.map((moc, index) => {
          const completedTasks = moc.tasks?.filter(t => t.status === 'Done').length || 0;
          const totalTasks = moc.tasks?.length || 0;
          const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
          
          return (
            <div 
              key={moc.id}
              onClick={() => setSelectedMoc(moc)}
              className={`glass-panel p-8 rounded-[3.5rem] cursor-pointer border group relative overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700 ${getStatusHoverClasses(moc.status)}`}
            >
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-black text-blue-500 dark:text-blue-400 uppercase tracking-tight">{moc.id}</span>
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-widest ${getDisciplineColor(moc.discipline)}`}>
                      {getDisciplineIcon(moc.discipline)}
                      {moc.discipline}
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${MOC_STATUS_COLORS[moc.status]}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(moc.status)}`}></div>
                    {moc.status}
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white ${getRiskColor(moc.riskScore)}`}>
                  Risk {moc.riskScore}
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-4 uppercase tracking-tight truncate">
                {moc.title}
              </h3>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-10 font-bold leading-relaxed uppercase tracking-tight">
                {stripHtml(moc.description)}
              </p>
              <div className="flex items-center justify-between pt-8 border-t border-black/5 dark:border-white/10 mt-auto">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 text-[11px] font-black border border-blue-500/20">
                    {moc.requester.charAt(0)}
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase block leading-none">{moc.requester}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1 block">{moc.createdAt}</span>
                  </div>
                </div>
                <div className="w-10 h-10 relative">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15" fill="transparent" stroke="currentColor" strokeWidth="3" className="text-slate-100 dark:text-white/5" />
                    <circle cx="18" cy="18" r="15" fill="transparent" stroke="currentColor" strokeWidth="3" strokeDasharray={95} strokeDashoffset={95 - (95 * progress / 100)} strokeLinecap="round" className="text-blue-500" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-slate-400">{Math.round(progress)}%</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedMoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-10 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md" onClick={() => setSelectedMoc(null)}></div>
          <div className="glass-panel w-full max-w-6xl h-full max-h-[92vh] rounded-[4rem] overflow-hidden flex flex-col relative z-10 border-white/10 shadow-2xl">
             <header className="px-12 py-10 border-b border-white/5 flex justify-between items-start bg-slate-900/60 backdrop-blur-2xl">
                <div className="space-y-6 flex-1">
                   <div className="flex items-center gap-4">
                     <span className="text-sm font-mono font-black text-blue-400 bg-blue-500/10 px-5 py-2 rounded-xl border border-blue-500/20">{selectedMoc.id}</span>
                     <span className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-[0.25em] shadow-lg ${MOC_STATUS_COLORS[selectedMoc.status]}`}>
                       {selectedMoc.status}
                     </span>
                     {selectedMoc.impacts.emergency && (
                       <span className="px-5 py-2 bg-red-600 rounded-xl text-[11px] font-black text-white uppercase tracking-[0.25em] flex items-center gap-2 animate-pulse shadow-lg">
                         <Flame size={12} /> EMERGENCY BYPASS
                       </span>
                     )}
                   </div>
                   <h3 className="text-4xl font-black text-white leading-tight tracking-tight uppercase">{selectedMoc.title}</h3>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedMoc(null)} className="p-4 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all"><X size={40} /></button>
                </div>
             </header>

             <div className="flex px-12 border-b border-white/5 bg-slate-900/40 overflow-x-auto no-scrollbar">
                {[
                  { id: 'general', icon: <Info size={16} />, label: t.techScope },
                  { id: 'tasks', icon: <ClipboardList size={16} />, label: `${language === 'pt-BR' ? 'Tarefas' : 'Tasks'} (${selectedMoc.tasks?.length || 0})` },
                  { id: 'related-assets', icon: <Box size={16} />, label: language === 'pt-BR' ? 'Ativos Relacionados' : 'Related Assets' },
                  { id: 'risk-details', icon: <ShieldAlert size={16} />, label: 'Risk Analysis' },
                  { id: 'audit', icon: <History size={16} />, label: t.auditLog }
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveDetailTab(tab.id as any)} 
                    className={`shrink-0 px-10 py-8 text-[12px] font-black uppercase tracking-[0.3em] border-b-2 transition-all flex items-center gap-4 relative ${
                      activeDetailTab === tab.id ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar p-12 lg:p-20 space-y-16">
                {activeDetailTab === 'general' && (
                  <div className="space-y-16 animate-in fade-in slide-in-from-left-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                       <div className="space-y-8">
                         <h4 className="text-xs font-black text-blue-500 uppercase tracking-[0.4em] flex items-center gap-4"><span className="w-10 h-px bg-blue-500/30"></span> {t.identityParams}</h4>
                         <div className="space-y-4 pl-14">
                            <div className="flex justify-between border-b border-white/5 py-4"><span className="text-[11px] font-black text-slate-500 uppercase">Lead Requester</span><span className="text-sm font-black text-white uppercase">{selectedMoc.requester}</span></div>
                            <div className="flex justify-between border-b border-white/5 py-4"><span className="text-[11px] font-black text-slate-500 uppercase">{t.discipline}</span><span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg border ${getDisciplineColor(selectedMoc.discipline)}`}>{selectedMoc.discipline}</span></div>
                            <div className="flex justify-between border-b border-white/5 py-4"><span className="text-[11px] font-black text-slate-500 uppercase">Facility</span><span className="text-sm font-black text-white uppercase">{selectedMoc.facility}</span></div>
                         </div>
                       </div>
                       <div className="space-y-8">
                         <h4 className="text-xs font-black text-emerald-500 uppercase tracking-[0.4em] flex items-center gap-4"><span className="w-10 h-px bg-emerald-500/30"></span> AI Insights</h4>
                         <div className="pl-14">
                            {selectedMoc.technicalSummary ? (
                              <div className="p-8 bg-blue-600/5 border border-blue-500/20 rounded-[2.5rem] italic text-slate-200 text-sm">"{selectedMoc.technicalSummary}"</div>
                            ) : (
                              <button onClick={handleGenerateAISummary} disabled={isGeneratingSummary} className="w-full flex items-center justify-center gap-4 p-8 border-2 border-dashed border-white/10 rounded-[2.5rem] hover:bg-white/5 transition-all text-slate-500 hover:text-blue-400 font-black uppercase text-[10px] tracking-widest">{isGeneratingSummary ? <Loader2 className="animate-spin" /> : <Sparkles />} Generate with Gemini</button>
                            )}
                         </div>
                       </div>
                    </div>
                    <section className="space-y-8">
                      <h4 className="text-xs font-black text-blue-500 uppercase tracking-[0.4em] flex items-center gap-4"><span className="w-10 h-px bg-blue-500/30"></span> Engineering Scope</h4>
                      <div className="p-10 bg-slate-900/60 rounded-[3rem] border border-white/5 prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: selectedMoc.description }} />
                    </section>
                  </div>
                )}

                {activeDetailTab === 'related-assets' && (
                  <div className="space-y-12 animate-in fade-in slide-in-from-left-4">
                    <h4 className="text-xs font-black text-blue-500 uppercase tracking-[0.4em] flex items-center gap-4"><span className="w-10 h-px bg-blue-500/30"></span> Linked Digital Assets</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {relatedAssets.length > 0 ? relatedAssets.map(asset => (
                        <div key={asset.tag} className="glass-panel p-6 rounded-[2.5rem] border-white/5 hover:border-blue-500/30 transition-all group">
                           <div className="flex justify-between items-start mb-6">
                              <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all"><Box size={20} /></div>
                              <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-white/5 rounded-lg border border-white/10 text-slate-400">{asset.type}</span>
                           </div>
                           <div className="text-[10px] font-mono font-black text-blue-500 uppercase mb-1">{asset.tag}</div>
                           <h5 className="text-lg font-black text-white uppercase tracking-tight mb-4">{asset.name}</h5>
                           <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{asset.facility}</span>
                              <button className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1.5 hover:text-blue-400 transition-colors">View Twin <ExternalLink size={10} /></button>
                           </div>
                        </div>
                      )) : (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-30 grayscale border-2 border-dashed border-white/10 rounded-[3rem]">
                           <Box size={64} className="mb-4 text-slate-500" />
                           <p className="text-xs font-black uppercase tracking-widest">No matching assets linked</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeDetailTab === 'tasks' && (
                  <div className="space-y-12 animate-in fade-in slide-in-from-left-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black text-blue-500 uppercase tracking-[0.4em] flex items-center gap-4"><span className="w-10 h-px bg-blue-500/30"></span> Action Item Tracker</h4>
                      <button onClick={() => setIsAddingTask(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all">
                        <Plus size={16} strokeWidth={3} /> Provision Task
                      </button>
                    </div>
                    <div className="space-y-4">
                      {selectedMoc.tasks?.map(task => (
                        <div key={task.id} className="glass-panel p-6 rounded-[2.5rem] border-white/5 flex items-center justify-between group hover:bg-white/5 transition-all">
                           <div className="flex items-center gap-6">
                              <button onClick={() => handleUpdateTaskStatus(task.id, task.status === 'Done' ? 'To Do' : 'Done')} className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${task.status === 'Done' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/10 hover:border-emerald-500/50'}`}>
                                {task.status === 'Done' && <Check size={18} strokeWidth={3} />}
                              </button>
                              <div>
                                <h5 className={`text-sm font-black uppercase tracking-tight ${task.status === 'Done' ? 'text-slate-500 line-through' : 'text-white'}`}>{task.title}</h5>
                                <div className="flex gap-4 mt-1.5 opacity-60">
                                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><User size={10} /> {task.assignee}</span>
                                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={10} /> Due: {task.dueDate}</span>
                                </div>
                              </div>
                           </div>
                           <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${task.status === 'Done' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-blue-500 bg-blue-500/10 border-blue-500/20'}`}>
                             {task.status}
                           </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeDetailTab === 'risk-details' && (
                  <div className="space-y-12 animate-in fade-in slide-in-from-left-4">
                    <h4 className="text-xs font-black text-blue-500 uppercase tracking-[0.4em] flex items-center gap-4"><span className="w-10 h-px bg-blue-500/30"></span> Quantitative Risk Assessment</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       <div className="glass-panel p-8 rounded-[3.5rem] border-white/5 text-center">
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Calculated Score</div>
                          <div className={`text-6xl font-black mb-4 ${getRiskColor(selectedMoc.riskScore).replace('bg-', 'text-')}`}>{selectedMoc.riskScore}</div>
                          <div className="text-xs font-black text-white uppercase tracking-[0.2em]">{selectedMoc.riskScore >= 15 ? 'Extreme Threshold' : 'Managed Risk'}</div>
                       </div>
                       <div className="md:col-span-2 glass-panel p-8 rounded-[3.5rem] border-white/5 space-y-6">
                          <h5 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3"><ShieldAlert size={18} className="text-red-500" /> Assessment Rationale</h5>
                          <p className="text-slate-400 leading-relaxed text-sm font-medium">
                            {selectedMoc.riskAssessment?.rationale || "Automated risk calculation based on priority, discipline, and impact dimensions. A full quantitative safety review is required for implementation clearance."}
                          </p>
                          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                             <div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Impact Safety</span>
                                <div className={`w-3 h-3 rounded-full ${selectedMoc.impacts.safety ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-white/5'}`}></div>
                             </div>
                             <div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Environmental</span>
                                <div className={`w-3 h-3 rounded-full ${selectedMoc.impacts.environmental ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-white/5'}`}></div>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                )}

                {activeDetailTab === 'audit' && (
                  <div className="space-y-12 animate-in fade-in slide-in-from-left-4">
                    <h4 className="text-xs font-black text-blue-500 uppercase tracking-[0.4em] flex items-center gap-4"><span className="w-10 h-px bg-blue-500/30"></span> Governance Audit Trail</h4>
                    <div className="relative pl-10 space-y-10 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-white/5">
                      {selectedMoc.auditLog.map((log, idx) => (
                        <div key={idx} className="relative group">
                           <div className="absolute -left-[31px] top-1 w-6 h-6 rounded-full bg-slate-900 border-2 border-blue-500 flex items-center justify-center z-10 group-hover:scale-125 transition-transform"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div></div>
                           <div className="flex justify-between items-start">
                              <div>
                                 <h5 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-3">{log.action} <span className="text-[10px] text-slate-500 font-bold px-2 py-0.5 bg-white/5 rounded-lg border border-white/5">Verified</span></h5>
                                 <p className="text-slate-400 text-xs mt-2 font-medium">{log.details}</p>
                              </div>
                              <div className="text-right">
                                 <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Date(log.timestamp).toLocaleDateString()}</div>
                                 <div className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter mt-1">{log.user}</div>
                              </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MOCList;

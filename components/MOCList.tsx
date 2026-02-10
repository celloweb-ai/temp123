
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS, MOC_STATUS_COLORS, FACILITIES } from '../constants';
import { 
  AlertCircle, ArrowLeft, ArrowRight, Ban, Calendar, Check, CheckCircle2, 
  ChevronDown, Cpu, Edit2, FileText, Filter, 
  Fingerprint, Info, Loader2, Maximize2, Plus, Save, Search, Shield, 
  ShieldAlert, ShieldCheck, Tag, Trash2, 
  Upload, User, Zap, X, Clock, ClipboardList, History, 
  Flame, Wrench, Users2, FileSignature, 
  Hammer, Box, Layers, Factory, SearchX, ExternalLink, Activity, Scale, AlertTriangle,
  Circle, Play, CheckCircle
} from 'lucide-react';
import { MOCRequest, MOCStatus, Attachment, MOCTask, TaskStatus } from '../types';
import { storageService } from '../services/storageService';

const getRiskColor = (score: number) => {
  if (score >= 15) return 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]';
  if (score >= 8) return 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]';
  if (score >= 4) return 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]';
  return 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]';
};

const getStatusDotColor = (status: MOCStatus) => {
  switch (status) {
    case 'Evaluation': return 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]';
    case 'Approved': return 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]';
    case 'Implementation': return 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]';
    case 'Completed': return 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]';
    default: return 'bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.8)]';
  }
};

const getStatusHoverClasses = (status: MOCStatus) => {
  const base = 'hover:-translate-y-2 hover:scale-[1.03] active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]';
  switch (status) {
    case 'Draft': return `${base} hover:border-slate-400/40 hover:shadow-[0_25px_60px_-12px_rgba(148,163,184,0.3)]`;
    case 'Evaluation': return `${base} hover:border-blue-500/40 hover:shadow-[0_25px_60px_-12px_rgba(59,130,246,0.3)]`;
    case 'Approved': return `${base} hover:border-emerald-500/40 hover:shadow-[0_25px_60px_-12px_rgba(16,185,129,0.3)]`;
    case 'Implementation': return `${base} hover:border-orange-500/40 hover:shadow-[0_25px_60px_-12px_rgba(245,158,11,0.3)]`;
    case 'Completed': return `${base} hover:border-purple-500/40 hover:shadow-[0_25px_60px_-12px_rgba(168,85,247,0.3)]`;
    default: return `${base} hover:border-blue-500/40 hover:shadow-[0_25px_60px_-12px_rgba(59,130,246,0.3)]`;
  }
};

const getDisciplineIcon = (discipline: string) => {
  const d = discipline.toLowerCase();
  if (d.includes('mechanical')) return <Wrench size={12} />;
  if (d.includes('electrical')) return <Zap size={12} />;
  if (d.includes('process')) return <Factory size={12} />;
  if (d.includes('personnel')) return <Users2 size={12} />;
  if (d.includes('procedure')) return <FileSignature size={12} />;
  if (d.includes('instrumentation')) return <Cpu size={12} />;
  if (d.includes('civil')) return <Hammer size={12} />;
  return <Box size={12} />;
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
  if (!html) return "";
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const MOCList: React.FC = () => {
  const { language, mocs, refreshMOCs, user, assets, addNotification, emergencyWizardActive, closeEmergencyMOC } = useApp();
  const t = TRANSLATIONS[language];
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<MOCStatus | 'All'>('All');
  const [disciplineFilter, setDisciplineFilter] = useState<string | 'All'>('All');
  const [activeDetailTab, setActiveDetailTab] = useState<'general' | 'tasks' | 'audit' | 'risk-details' | 'risk-assessment'>('general');

  const [selectedMoc, setSelectedMoc] = useState<MOCRequest | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newMoc, setNewMoc] = useState<Partial<MOCRequest>>({
    title: '',
    requester: '',
    facility: FACILITIES[0].name,
    priority: 'Medium',
    changeType: 'Mechanical',
    discipline: 'Mechanical',
    description: '',
    technicalSummary: '',
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
      return matchesSearch && matchesStatus && matchesDiscipline;
    });
  }, [mocs, searchTerm, statusFilter, disciplineFilter]);

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
      description: 'EMERGENCY PROTOCOL ACTIVATED: ',
      technicalSummary: '',
      status: 'Implementation',
      impacts: { safety: true, environmental: true, operational: true, regulatory: true, emergency: true },
      attachments: [],
      tasks: [],
      technicalAssessment: ''
    });
    setCreateStep(1);
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
      technicalSummary: '',
      status: 'Draft',
      impacts: { safety: false, environmental: false, operational: false, regulatory: false, emergency: false },
      attachments: [],
      tasks: [],
      technicalAssessment: ''
    });
    setCreateStep(1);
    setIsCreating(true);
  };

  const handleOpenEdit = (moc: MOCRequest) => {
    setIsEmergencyMode(moc.impacts.emergency || false);
    setIsEditing(true);
    setNewMoc({ ...moc });
    setCreateStep(1);
    setIsCreating(true);
  };

  const handleCloseWizard = () => {
    setIsCreating(false);
    setIsEmergencyMode(false);
    setIsEditing(false);
    closeEmergencyMOC(); 
  };

  const estimatedRisk = useMemo(() => {
    if (isEmergencyMode && !isEditing) return 25; 
    let base = 0;
    if (newMoc.priority === 'Critical') base = 15;
    else if (newMoc.priority === 'High') base = 10;
    else if (newMoc.priority === 'Medium') base = 5;
    else base = 2;

    const impactCount = Object.values(newMoc.impacts || {}).filter(Boolean).length;
    return base + (impactCount * 2);
  }, [newMoc.priority, newMoc.impacts, isEmergencyMode, isEditing]);

  const handleSaveMoc = async () => {
    setIsSubmitting(true);
    try {
      const id = newMoc.id || `MOC-2024-${Math.floor(Math.random() * 900 + 100)}`;
      const mocToSave: MOCRequest = {
        ...(newMoc as MOCRequest),
        id,
        createdAt: newMoc.createdAt || new Date().toISOString().split('T')[0],
        riskScore: estimatedRisk,
        auditLog: [
          ...(newMoc.auditLog || []),
          {
            timestamp: Date.now(),
            user: user?.name || 'System',
            action: isEditing ? 'Modification' : 'Submission',
            details: isEmergencyMode ? 'Emergency Override Protocol' : 'Standard Lifecycle Update'
          }
        ]
      };
      await storageService.saveMOC(mocToSave);
      await refreshMOCs();
      handleCloseWizard();
      addNotification({ 
        title: isEditing ? 'Dossier Updated' : 'Change Request Registered', 
        message: `${mocToSave.id} has been synchronized with the technical archive.`, 
        type: 'success' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    if (!selectedMoc) return;
    
    const updatedTasks = (selectedMoc.tasks || []).map(t => 
      t.id === taskId ? { ...t, status: newStatus, completed: newStatus === 'Done' } : t
    );
    
    const updatedMoc: MOCRequest = {
      ...selectedMoc,
      tasks: updatedTasks,
      auditLog: [
        ...selectedMoc.auditLog,
        {
          timestamp: Date.now(),
          user: user?.name || 'System',
          action: 'Task Update',
          details: `Task ID ${taskId} status changed to ${newStatus}`
        }
      ]
    };
    
    try {
      await storageService.saveMOC(updatedMoc);
      await refreshMOCs();
      setSelectedMoc(updatedMoc);
      addNotification({
        title: 'Registry Updated',
        message: `Task status for ${selectedMoc.id} has been successfully synchronized.`,
        type: 'success'
      });
    } catch (err) {
      addNotification({
        title: 'Sync Error',
        message: 'Unable to update task status in the governance archive.',
        type: 'error'
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const newAttachment: Attachment = { name: file.name, type: file.type, size: file.size, data: base64 };
        setNewMoc(prev => ({ ...prev, attachments: [...(prev.attachments || []), newAttachment] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const getTaskStatusMeta = (status: TaskStatus) => {
    switch (status) {
      case 'Done': return { color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: <CheckCircle2 size={14} /> };
      case 'In Progress': return { color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', icon: <Activity size={14} /> };
      case 'Blocked': return { color: 'text-red-500 bg-red-500/10 border-red-500/20', icon: <Ban size={14} /> };
      default: return { color: 'text-slate-500 bg-slate-500/10 border-slate-500/20', icon: <Circle size={14} /> };
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 relative pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none glow-title">
            {t.mocs}
          </h2>
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
             <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                <ClipboardList size={14} /> {mocs.length} TECHNICAL DOSSIERS
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Governance Archive v3.1</span>
          </div>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="group relative overflow-hidden bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-[2rem] flex items-center gap-3 font-black uppercase tracking-[0.15em] text-[11px] transition-all shadow-2xl shadow-blue-500/30 active:scale-95 hover:ring-4 hover:ring-blue-500/20"
        >
          <Plus size={20} strokeWidth={4} className="group-hover:rotate-90 transition-transform duration-500" />
          <span>{t.createNew}</span>
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-6 rounded-[2.5rem] border-black/5 dark:border-white/5 flex flex-col lg:flex-row gap-6 items-center shadow-xl hover:shadow-2xl transition-all duration-500">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder={t.fullTextSearch}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-900/50 border-2 border-transparent focus:border-blue-500/50 rounded-[2rem] py-4 pl-16 pr-6 text-sm font-bold text-slate-900 dark:text-white outline-none transition-all shadow-inner placeholder:text-slate-500 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-900"
          />
        </div>
        
        <div className="flex gap-4 w-full lg:w-auto">
          <div className="relative group flex-1 lg:w-56">
            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-blue-500 transition-colors" size={16} />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-14 pr-10 text-[10px] font-black text-slate-700 dark:text-slate-300 outline-none focus:ring-4 focus:ring-blue-500/20 transition-all cursor-pointer uppercase tracking-widest shadow-sm hover:border-blue-500/30"
            >
              <option value="All">{t.workflowStatus}</option>
              {['Draft', 'Evaluation', 'Approved', 'Implementation', 'Completed'].map(s => (
                <option key={s} value={s}>{s.toUpperCase()}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:translate-y-[-40%] transition-transform" size={16} />
          </div>

          <div className="relative group flex-1 lg:w-56">
            <Layers className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-blue-500 transition-colors" size={16} />
            <select 
              value={disciplineFilter}
              onChange={(e) => setDisciplineFilter(e.target.value as any)}
              className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-14 pr-10 text-[10px] font-black text-slate-700 dark:text-slate-300 outline-none focus:ring-4 focus:ring-blue-500/20 transition-all cursor-pointer uppercase tracking-widest shadow-sm hover:border-blue-500/30"
            >
              <option value="All">{t.discipline}</option>
              {['Mechanical', 'Process', 'Electrical', 'Instrumentation', 'Civil', 'Personnel', 'Procedure'].map(d => (
                <option key={d} value={d}>{d.toUpperCase()}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:translate-y-[-40%] transition-transform" size={16} />
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="relative min-h-[400px]">
        {filteredMocs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMocs.map((moc, index) => {
              const completedTasks = moc.tasks?.filter(t => t.status === 'Done').length || 0;
              const totalTasks = moc.tasks?.length || 0;
              const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
              
              return (
                <div 
                  key={moc.id}
                  onClick={() => setSelectedMoc(moc)}
                  style={{ animationDelay: `${index * 60}ms` }}
                  className={`group glass-panel p-8 rounded-[3.5rem] cursor-pointer border relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 flex flex-col h-full bg-white/40 dark:bg-slate-900/40 border-black/5 dark:border-white/5 ${getStatusHoverClasses(moc.status)}`}
                >
                  {/* Visual Accent */}
                  <div className={`absolute top-0 left-0 w-full h-2 opacity-60 ${MOC_STATUS_COLORS[moc.status].split(' ')[0].replace('/20', '')} group-hover:h-3 transition-all duration-300`}></div>
                  
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                          <Tag size={12} />
                        </div>
                        <span className="text-[11px] font-mono font-black text-slate-900 dark:text-blue-400 uppercase tracking-tighter">{moc.id}</span>
                      </div>
                      <div className={`flex items-center gap-2.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${MOC_STATUS_COLORS[moc.status]} transition-all group-hover:scale-105`}>
                        <div className={`w-2 h-2 rounded-full ${getStatusDotColor(moc.status)}`}></div>
                        {moc.status}
                      </div>
                    </div>
                    <div className={`px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] text-white flex items-center gap-2 transform group-hover:scale-110 group-hover:rotate-2 transition-transform ${getRiskColor(moc.riskScore)}`}>
                      <ShieldAlert size={14} />
                      RISK {moc.riskScore}
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-[1.1] mb-5 uppercase tracking-tighter transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {moc.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-6">
                     <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all group-hover:border-current ${getDisciplineColor(moc.discipline)}`}>
                        {getDisciplineIcon(moc.discipline)}
                        {moc.discipline}
                      </div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Factory size={12} /> {moc.facility.split(' ')[0]}
                      </span>
                  </div>

                  <p className="text-[14px] text-slate-500 dark:text-slate-400 line-clamp-3 mb-10 font-medium leading-relaxed uppercase tracking-tight opacity-80 group-hover:opacity-100 transition-opacity">
                    {stripHtml(moc.description)}
                  </p>

                  <div className="flex items-center justify-between pt-8 border-t border-black/5 dark:border-white/10 mt-auto">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-slate-700 dark:text-blue-400 text-sm font-black border border-black/5 dark:border-white/10 shadow-lg group-hover:rotate-6 transition-transform">
                        {moc.requester.charAt(0)}
                      </div>
                      <div>
                        <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase block leading-none mb-1 group-hover:text-blue-500 transition-colors">{moc.requester}</span>
                        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                          <Clock size={10} /> {moc.createdAt}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors">Progress</div>
                      <div className="w-32 h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner border border-black/5 dark:border-white/5 group-hover:w-40 transition-all duration-500">
                        <div 
                          className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000 ease-out" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Hover Action Overlay */}
                  <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-all duration-500 pointer-events-none flex items-center justify-center">
                     <div className="p-4 bg-blue-600 text-white rounded-full translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 shadow-2xl scale-0 group-hover:scale-100">
                        <ExternalLink size={20} strokeWidth={3} />
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
             <div className="w-32 h-32 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-8 border border-black/5 dark:border-white/5 shadow-inner">
                <SearchX size={64} className="text-slate-300 dark:text-slate-700 animate-pulse" />
             </div>
             <h3 className="text-2xl font-black text-slate-800 dark:text-slate-200 uppercase tracking-tighter mb-3">{t.noMatches}</h3>
             <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] max-w-xs">{t.adjustFilters}</p>
             <button 
              onClick={() => { setSearchTerm(''); setStatusFilter('All'); setDisciplineFilter('All'); }}
              className="mt-8 px-8 py-3 bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95"
             >
               Clear All Registry Filters
             </button>
          </div>
        )}
      </div>

      {/* Creation/Edit Wizard Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-10 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={handleCloseWizard}></div>
           <div className="glass-panel w-full max-w-4xl h-fit max-h-[90vh] rounded-[4rem] overflow-hidden flex flex-col relative z-110 border-white/10 shadow-2xl">
              <header className={`px-12 py-10 border-b border-white/5 flex justify-between items-center ${isEmergencyMode ? 'bg-red-600/10' : 'bg-blue-600/10'}`}>
                 <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-xl ${isEmergencyMode ? 'bg-red-500 shadow-red-500/40' : 'bg-blue-600 shadow-blue-500/40'}`}>
                       {isEmergencyMode ? <Flame size={32} /> : isEditing ? <Edit2 size={32} /> : <Plus size={32} strokeWidth={3} />}
                    </div>
                    <div>
                       <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                          {isEmergencyMode ? 'Emergency Fast-Track' : isEditing ? 'Modify Technical Dossier' : 'New Change Request'}
                       </h3>
                       <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Lifecycle Wizard</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Step {createStep} of 3</span>
                       </div>
                    </div>
                 </div>
                 <button onClick={handleCloseWizard} className="p-4 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all transform hover:rotate-90 duration-300"><X size={32} /></button>
              </header>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-12 space-y-10">
                 {/* Step Indicator */}
                 <div className="flex justify-between items-center px-10 relative">
                    <div className="absolute left-10 right-10 top-1/2 h-0.5 bg-white/5 -z-10"></div>
                    {[1, 2, 3].map(s => (
                       <div key={s} className={`w-10 h-10 rounded-full border-4 flex items-center justify-center font-black transition-all duration-500 ${
                          createStep >= s ? 'bg-blue-600 border-blue-500 text-white scale-110 shadow-lg shadow-blue-600/20' : 'bg-slate-900 border-white/5 text-slate-600'
                       }`}>
                          {createStep > s ? <Check size={18} strokeWidth={4} /> : s}
                       </div>
                    ))}
                 </div>

                 {createStep === 1 && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                       <div className="space-y-3">
                          <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Technical Title</label>
                          <input 
                            value={newMoc.title}
                            onChange={(e) => setNewMoc({...newMoc, title: e.target.value})}
                            placeholder="Briefly state the engineering intent..."
                            className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-blue-500 rounded-2xl py-5 px-8 text-lg font-black text-slate-900 dark:text-white outline-none transition-all uppercase shadow-inner"
                          />
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Technical Discipline</label>
                             <select 
                               value={newMoc.discipline}
                               onChange={(e) => setNewMoc({...newMoc, discipline: e.target.value})}
                               className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl py-5 px-8 text-sm font-black text-slate-900 dark:text-white outline-none cursor-pointer focus:ring-4 focus:ring-blue-500/20 transition-all"
                             >
                                <option value="Mechanical">Mechanical</option>
                                <option value="Process">Process</option>
                                <option value="Electrical">Electrical</option>
                                <option value="Instrumentation">Instrumentation</option>
                                <option value="Civil">Civil</option>
                                <option value="Personnel">Personnel</option>
                                <option value="Procedure">Procedure</option>
                             </select>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Asset Facility</label>
                             <select 
                               value={newMoc.facility}
                               onChange={(e) => setNewMoc({...newMoc, facility: e.target.value})}
                               className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl py-5 px-8 text-sm font-black text-slate-900 dark:text-white outline-none cursor-pointer focus:ring-4 focus:ring-blue-500/20 transition-all"
                             >
                                {FACILITIES.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                             </select>
                          </div>
                       </div>
                    </div>
                 )}

                 {createStep === 2 && (
                    <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                          <div className="space-y-6">
                             <h4 className="text-xs font-black text-blue-500 uppercase tracking-[0.3em]">Impact Matrix</h4>
                             <div className="grid grid-cols-1 gap-4">
                                {Object.entries(newMoc.impacts || {}).map(([key, val]) => (
                                   <button 
                                      key={key}
                                      type="button"
                                      onClick={() => setNewMoc({...newMoc, impacts: {...newMoc.impacts!, [key]: !val}})}
                                      className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${val ? 'bg-blue-600/10 border-blue-500 text-blue-400 shadow-lg scale-[1.02]' : 'bg-slate-900 border-white/5 text-slate-500 hover:border-white/10'}`}
                                   >
                                      <span className="text-[11px] font-black uppercase tracking-widest">{key}</span>
                                      {val ? <CheckCircle2 size={18} className="animate-in zoom-in" /> : <div className="w-4 h-4 rounded-full border border-white/20"></div>}
                                   </button>
                                ))}
                             </div>
                          </div>
                          <div className="space-y-8 flex flex-col justify-center text-center">
                             <div className="animate-pulse-slow">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Calculated Risk Index</div>
                                <div className={`text-8xl font-black mb-4 transition-colors duration-500 ${getRiskColor(estimatedRisk).split(' ')[0].replace('bg-', 'text-')}`}>{estimatedRisk}</div>
                                <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Composite Score</div>
                             </div>
                             <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-white/10 space-y-4 shadow-2xl">
                                <div className="flex items-center gap-2 justify-center text-blue-500">
                                   <ShieldCheck size={18} />
                                   <span className="text-[10px] font-black uppercase tracking-widest">Governance Rule</span>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed italic font-medium transition-all">
                                   {estimatedRisk >= 15 ? 'Critical Threshold: High-integrity technical review and dual HSE verification required.' : 'Standard Profile: Cross-disciplinary peer review and technical lead clearance required.'}
                                </p>
                             </div>
                          </div>
                       </div>
                    </div>
                 )}

                 {createStep === 3 && (
                    <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                       <div className="space-y-3">
                          <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Engineering Scope Description</label>
                          <textarea 
                            rows={4}
                            value={newMoc.description}
                            onChange={(e) => setNewMoc({...newMoc, description: e.target.value})}
                            placeholder="Detailed technical rationale for this change..."
                            className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-blue-500 rounded-[2rem] py-6 px-8 text-sm leading-relaxed text-slate-900 dark:text-white outline-none transition-all resize-none shadow-inner focus:bg-white dark:focus:bg-slate-950"
                          />
                       </div>

                       <div className="space-y-3">
                          <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Technical Executive Summary</label>
                          <textarea 
                            rows={3}
                            value={newMoc.technicalSummary}
                            onChange={(e) => setNewMoc({...newMoc, technicalSummary: e.target.value})}
                            placeholder="High-level engineering overview for the approval dossier..."
                            className="w-full bg-blue-50 dark:bg-blue-900/10 border-2 border-transparent focus:border-blue-500/50 rounded-[2rem] py-6 px-8 text-sm leading-relaxed text-slate-900 dark:text-white outline-none transition-all resize-none shadow-inner focus:bg-white dark:focus:bg-blue-950/20"
                          />
                       </div>

                       <div className="space-y-4">
                          <div className="flex items-center justify-between px-1">
                             <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Supporting Documentation</label>
                             <button 
                               type="button"
                               onClick={() => fileInputRef.current?.click()}
                               className="flex items-center gap-2 text-blue-500 hover:text-blue-400 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105"
                             >
                                <Upload size={14} /> Attach Technical Data
                             </button>
                             <input 
                               type="file" 
                               ref={fileInputRef} 
                               className="hidden" 
                               multiple 
                               onChange={handleFileChange}
                             />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {newMoc.attachments?.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-2xl group hover:border-blue-500/30 transition-all animate-in zoom-in">
                                   <div className="flex items-center gap-4 min-w-0">
                                      <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                                         <FileText size={18} />
                                      </div>
                                      <div className="min-w-0">
                                         <p className="text-xs font-black text-slate-900 dark:text-white truncate uppercase">{file.name}</p>
                                         <p className="text-[9px] font-bold text-slate-400 uppercase">{(file.size / 1024).toFixed(1)} KB</p>
                                      </div>
                                   </div>
                                   <button 
                                      type="button" 
                                      onClick={(e) => { e.stopPropagation(); setIsSubmitting(true); setTimeout(() => { setNewMoc(prev => ({...prev, attachments: prev.attachments?.filter((_, i) => i !== idx)})); setIsSubmitting(false); }, 200); }}
                                      className="p-2 text-slate-400 hover:text-red-500 transition-all hover:scale-125"
                                   >
                                      <Trash2 size={16} />
                                   </button>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 )}
              </div>

              <footer className="px-12 py-10 border-t border-white/5 flex justify-between items-center bg-slate-900/60 backdrop-blur-2xl">
                 <button 
                  onClick={handleCloseWizard}
                  className="px-8 py-4 rounded-2xl font-black text-slate-500 hover:text-white transition-all text-[11px] uppercase tracking-widest hover:bg-white/5"
                 >
                    Discard Changes
                 </button>
                 <div className="flex gap-4">
                    {createStep > 1 && (
                       <button 
                        onClick={() => setCreateStep(createStep - 1)}
                        className="px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] flex items-center gap-3 transition-all active:scale-95 border border-white/5"
                       >
                          <ArrowLeft size={16} strokeWidth={3} /> Back
                       </button>
                    )}
                    <button 
                      onClick={() => createStep < 3 ? setCreateStep(createStep + 1) : handleSaveMoc()}
                      disabled={isSubmitting || !newMoc.title}
                      className={`px-12 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.15em] text-[11px] flex items-center gap-3 shadow-2xl transition-all active:scale-95 disabled:opacity-50 ${isEmergencyMode ? 'bg-red-600 hover:bg-red-500 shadow-red-500/30 ring-red-500/20 hover:ring-4' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/30 ring-blue-500/20 hover:ring-4'} text-white`}
                    >
                       {isSubmitting ? (
                          <>
                             <Loader2 size={16} className="animate-spin" />
                             Synchronizing...
                          </>
                       ) : (
                          <>
                             {createStep === 3 ? (isEditing ? 'Commit Update' : 'Finalize Dossier') : 'Advance Progress'}
                             <ArrowRight size={18} strokeWidth={3} />
                          </>
                       )}
                    </button>
                 </div>
              </footer>
           </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedMoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-10 animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md" onClick={() => setSelectedMoc(null)}></div>
          <div className="glass-panel w-full max-w-6xl h-full max-h-[94vh] rounded-[4rem] overflow-hidden flex flex-col relative z-10 border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] animate-in zoom-in duration-500">
             <header className="px-12 py-10 border-b border-white/5 flex justify-between items-start bg-slate-900/60 backdrop-blur-3xl">
                <div className="space-y-6 flex-1">
                   <div className="flex flex-wrap items-center gap-4">
                     <div className="flex items-center gap-3 bg-blue-500/10 px-5 py-2.5 rounded-2xl border border-blue-500/20">
                        <span className="text-sm font-mono font-black text-blue-400">{selectedMoc.id}</span>
                     </div>
                     <span className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] shadow-xl ${MOC_STATUS_COLORS[selectedMoc.status]}`}>
                       {selectedMoc.status}
                     </span>
                     {selectedMoc.impacts.emergency && (
                       <span className="px-6 py-2.5 bg-red-600 rounded-2xl text-[11px] font-black text-white uppercase tracking-[0.25em] flex items-center gap-2 animate-pulse shadow-xl shadow-red-600/30">
                         <Flame size={14} /> EMERGENCY OVERRIDE
                       </span>
                     )}
                   </div>
                   <h3 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tighter uppercase max-w-4xl">{selectedMoc.title}</h3>
                </div>
                <button onClick={() => setSelectedMoc(null)} className="p-4 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all transform hover:rotate-90 duration-300"><X size={40} /></button>
             </header>

             <div className="flex px-12 border-b border-white/5 bg-slate-900/40 overflow-x-auto no-scrollbar scroll-smooth">
                {[
                  { id: 'general', icon: <Info size={16} />, label: t.techScope },
                  { id: 'tasks', icon: <ClipboardList size={16} />, label: `Workflow Stages (${selectedMoc.tasks?.length || 0})` },
                  { id: 'risk-assessment', icon: <Activity size={16} />, label: t.riskAssessment },
                  { id: 'risk-details', icon: <ShieldAlert size={16} />, label: 'Quant. Summary' },
                  { id: 'audit', icon: <History size={16} />, label: t.auditLog }
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveDetailTab(tab.id as any)} 
                    className={`shrink-0 px-10 py-8 text-[12px] font-black uppercase tracking-[0.3em] border-b-4 transition-all flex items-center gap-4 relative group ${
                      activeDetailTab === tab.id ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <div className={`transition-transform group-hover:scale-125 ${activeDetailTab === tab.id ? 'scale-110' : ''}`}>{tab.icon}</div> 
                    {tab.label}
                  </button>
                ))}
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar p-12 lg:p-20 space-y-16">
                {activeDetailTab === 'general' && (
                  <div className="space-y-16 animate-in fade-in slide-in-from-left-6 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                       <div className="space-y-10">
                         <h4 className="text-xs font-black text-blue-500 uppercase tracking-[0.5em] flex items-center gap-6"><span className="w-16 h-px bg-blue-500/30"></span> {t.identityParams}</h4>
                         <div className="space-y-6 pl-14">
                            <div className="flex justify-between border-b border-white/5 pb-5"><span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Lead Engineer</span><span className="text-sm font-black text-white uppercase tracking-tight">{selectedMoc.requester}</span></div>
                            <div className="flex justify-between border-b border-white/5 pb-5"><span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{t.discipline}</span><span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-xl border ${getDisciplineColor(selectedMoc.discipline)}`}>{selectedMoc.discipline}</span></div>
                            <div className="flex justify-between border-b border-white/5 pb-5"><span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Facility Hub</span><span className="text-sm font-black text-white uppercase tracking-tight">{selectedMoc.facility}</span></div>
                            <div className="flex justify-between border-b border-white/5 pb-5"><span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Priority Grade</span><span className={`text-[10px] font-black uppercase tracking-widest ${selectedMoc.priority === 'Critical' ? 'text-red-500' : 'text-slate-300'}`}>{selectedMoc.priority}</span></div>
                         </div>
                       </div>
                       <div className="space-y-10">
                         <h4 className="text-xs font-black text-emerald-500 uppercase tracking-[0.5em] flex items-center gap-6"><span className="w-16 h-px bg-emerald-500/30"></span> Technical Summary</h4>
                         <div className="pl-14">
                            {selectedMoc.technicalSummary ? (
                              <div className="p-10 bg-blue-600/5 border-2 border-blue-500/20 rounded-[3.5rem] italic text-slate-200 text-lg leading-relaxed shadow-inner animate-in slide-in-from-top-4">
                                <div className="mb-4 text-blue-400 opacity-30"><FileText size={48} /></div>
                                "{selectedMoc.technicalSummary}"
                              </div>
                            ) : (
                              <div className="p-14 border-2 border-dashed border-white/10 rounded-[3.5rem] text-slate-600 font-black uppercase text-[11px] tracking-[0.3em] text-center bg-black/10">No high-level summary provisioned</div>
                            )}
                         </div>
                       </div>
                    </div>
                    
                    <section className="space-y-10">
                      <h4 className="text-xs font-black text-blue-500 uppercase tracking-[0.5em] flex items-center gap-6"><span className="w-16 h-px bg-blue-500/30"></span> Detailed Engineering Scope</h4>
                      <div className="p-12 bg-slate-900/80 rounded-[4rem] border border-white/10 prose prose-invert max-w-none shadow-2xl relative group/scope transition-all hover:bg-slate-900">
                        <div className="absolute top-8 right-8 opacity-5 group-hover/scope:opacity-10 transition-opacity duration-1000"><Cpu size={120} /></div>
                        <div dangerouslySetInnerHTML={{ __html: selectedMoc.description }} className="relative z-10 leading-loose font-medium text-slate-300 text-base" />
                      </div>
                    </section>

                    <section className="space-y-10">
                       <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.5em] flex items-center gap-6"><span className="w-16 h-px bg-slate-500/30"></span> Attachment Gallery</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pl-14">
                          {selectedMoc.attachments?.length ? selectedMoc.attachments.map((file, i) => (
                             <div key={i} className="glass-panel p-6 rounded-[2.5rem] border-white/5 hover:border-blue-500/30 transition-all flex flex-col items-center text-center gap-4 group hover:scale-105">
                                <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-3xl text-slate-400 group-hover:text-blue-500 transition-colors shadow-lg group-hover:shadow-blue-500/20 group-hover:rotate-3">
                                   <FileText size={32} />
                                </div>
                                <div className="min-w-0 w-full">
                                   <p className="text-[11px] font-black text-white uppercase truncate">{file.name}</p>
                                   <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">{(file.size/1024).toFixed(1)} KB</p>
                                </div>
                             </div>
                          )) : <div className="col-span-full py-10 opacity-20 italic uppercase text-[10px] tracking-widest">Digital vault empty</div>}
                       </div>
                    </section>
                  </div>
                )}

                {activeDetailTab === 'tasks' && (
                  <div className="space-y-12 animate-in fade-in slide-in-from-right-6 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                      {['Pre', 'Post'].map((type) => (
                        <div key={type} className="space-y-8">
                          <h4 className="text-xs font-black text-blue-500 uppercase tracking-[0.5em] flex items-center gap-6">
                            <span className="w-16 h-px bg-blue-500/30"></span> 
                            {type === 'Pre' ? 'Pre-Implementation Checkpoints' : 'Post-Implementation Closeout'}
                          </h4>
                          
                          <div className="space-y-4 pl-4">
                            {selectedMoc.tasks?.filter(t => t.type === type).length ? (
                              selectedMoc.tasks?.filter(t => t.type === type).map((task, idx) => {
                                const meta = getTaskStatusMeta(task.status);
                                return (
                                  <div 
                                    key={task.id} 
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                    className="glass-panel p-6 rounded-[2.5rem] border-white/5 flex flex-col gap-6 group hover:border-blue-500/20 transition-all animate-in slide-in-from-bottom-4"
                                  >
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1 min-w-0">
                                        <h5 className="text-sm font-black text-white uppercase tracking-tight mb-2 group-hover:text-blue-400 transition-colors">{task.title}</h5>
                                        <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                          <span className="flex items-center gap-1.5"><User size={12} className="text-blue-500" /> {task.assignee}</span>
                                          <span className="flex items-center gap-1.5"><Calendar size={12} className="text-orange-500" /> Due: {task.dueDate}</span>
                                        </div>
                                      </div>
                                      
                                      <div className="relative group/status">
                                        <div className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[9px] font-black uppercase tracking-widest border transition-all ${meta.color} cursor-default group-hover:scale-105`}>
                                          {meta.icon}
                                          {task.status}
                                        </div>
                                        
                                        {/* Status Picker Dropdown */}
                                        <div className="absolute right-0 top-full mt-2 w-48 glass-panel rounded-2xl border-white/10 shadow-2xl opacity-0 group-hover/status:opacity-100 pointer-events-none group-hover/status:pointer-events-auto transition-all z-20 overflow-hidden translate-y-2 group-hover/status:translate-y-0">
                                          {(['To Do', 'In Progress', 'Blocked', 'Done'] as TaskStatus[]).map(s => (
                                            <button
                                              key={s}
                                              onClick={() => handleUpdateTaskStatus(task.id, s)}
                                              className={`w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${
                                                task.status === s ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                              }`}
                                            >
                                              {s === 'Done' ? <CheckCircle size={14} /> : s === 'In Progress' ? <Activity size={14} /> : s === 'Blocked' ? <Ban size={14} /> : <Circle size={14} />}
                                              {s}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="py-12 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center opacity-30 italic uppercase text-[10px] tracking-widest">
                                No technical actions assigned
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeDetailTab === 'risk-assessment' && (
                  <div className="space-y-12 animate-in fade-in slide-in-from-right-6 duration-500">
                    <h4 className="text-xs font-black text-blue-500 uppercase tracking-[0.5em] flex items-center gap-6">
                      <span className="w-16 h-px bg-blue-500/30"></span> Detailed Analytical Profile
                    </h4>

                    {selectedMoc.riskAssessment ? (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Summary Metrics */}
                        <div className="lg:col-span-1 space-y-6">
                          <div className="glass-panel p-8 rounded-[3rem] border-white/10 flex flex-col items-center text-center space-y-4 hover:border-blue-500/20 transition-all duration-500 hover:scale-[1.02]">
                            <div className="p-4 bg-blue-600/10 text-blue-500 rounded-2xl">
                              <Scale size={32} />
                            </div>
                            <div>
                              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Probability (P)</div>
                              <div className="text-5xl font-black text-white">{selectedMoc.riskAssessment.probability}</div>
                            </div>
                          </div>

                          <div className="glass-panel p-8 rounded-[3rem] border-white/10 flex flex-col items-center text-center space-y-4 hover:border-orange-500/20 transition-all duration-500 hover:scale-[1.02]">
                            <div className="p-4 bg-orange-600/10 text-orange-500 rounded-2xl">
                              <AlertTriangle size={32} />
                            </div>
                            <div>
                              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Severity (S)</div>
                              <div className="text-5xl font-black text-white">{selectedMoc.riskAssessment.severity}</div>
                            </div>
                          </div>

                          <div className={`glass-panel p-8 rounded-[3rem] border-white/10 flex flex-col items-center text-center space-y-4 ${getRiskColor(selectedMoc.riskAssessment.score)} transition-all duration-500 hover:scale-[1.02] hover:brightness-110`}>
                            <div className="p-4 bg-white/20 text-white rounded-2xl">
                              <Shield size={32} />
                            </div>
                            <div className="text-white">
                              <div className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Total Risk Index</div>
                              <div className="text-6xl font-black">{selectedMoc.riskAssessment.score}</div>
                            </div>
                          </div>
                        </div>

                        {/* Rationale & Logic */}
                        <div className="lg:col-span-2 space-y-8">
                           <div className="glass-panel p-10 lg:p-14 rounded-[4rem] border-white/10 bg-slate-900/60 flex-1 flex flex-col h-full hover:border-blue-500/20 transition-all duration-500">
                              <h5 className="text-sm font-black text-blue-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
                                <FileText size={18} /> Engineering Rationale
                              </h5>
                              <div className="flex-1 text-slate-200 text-xl font-medium leading-relaxed italic border-l-4 border-blue-500/40 pl-8 mb-10 animate-in fade-in duration-1000">
                                "{selectedMoc.riskAssessment.rationale}"
                              </div>
                              <div className="pt-8 border-t border-white/5 flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                 <span>Timestamp: {new Date(selectedMoc.riskAssessment.assessedAt).toLocaleString()}</span>
                                 <span className="flex items-center gap-2"><Fingerprint size={14} className="text-blue-500" /> Digital Sign-off Verified</span>
                              </div>
                           </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-24 flex flex-col items-center justify-center text-center glass-panel rounded-[4rem] border-dashed border-white/10 transition-all hover:border-blue-500/30">
                        <Scale size={64} className="text-slate-700 mb-6 opacity-20" />
                        <h4 className="text-xl font-black text-slate-500 uppercase tracking-tighter mb-2">Extended Analytics Missing</h4>
                        <p className="text-[11px] text-slate-600 font-bold uppercase tracking-widest max-w-xs">Detailed PxS object not initialized for this legacy dossier.</p>
                        <button className="mt-8 px-8 py-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95">Execute Re-assessment</button>
                      </div>
                    )}
                  </div>
                )}
                
                {activeDetailTab === 'risk-details' && (
                  <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center justify-center h-full text-center space-y-12">
                     <div className="relative group/score">
                        <div className={`text-[12rem] font-black leading-none tracking-tighter ${getRiskColor(selectedMoc.riskScore).split(' ')[0].replace('bg-', 'text-')} group-hover/score:scale-105 transition-transform duration-700`}>{selectedMoc.riskScore}</div>
                        <div className="absolute -top-4 -right-12 px-6 py-3 bg-white text-slate-900 rounded-[2rem] font-black uppercase text-sm shadow-2xl tracking-widest transform rotate-12 group-hover/score:rotate-6 transition-all">Composite Score</div>
                     </div>
                     <div className="max-w-xl space-y-6">
                        <h4 className="text-3xl font-black text-white uppercase tracking-tighter">Quantitative Summary Assessment</h4>
                        <p className="text-slate-400 font-medium leading-relaxed">
                           Calculated using the standard MOC Studio $P \times S$ engine. The risk level for this technical dossier is classified as 
                           <span className={`px-3 py-1 mx-2 rounded-lg font-black uppercase text-white ${getRiskColor(selectedMoc.riskScore)}`}>
                             {selectedMoc.riskScore >= 15 ? 'Critical' : selectedMoc.riskScore >= 8 ? 'High' : 'Moderate'}
                           </span>
                        </p>
                     </div>
                  </div>
                )}

                {activeDetailTab === 'audit' && (
                  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-500">
                    <h4 className="text-xs font-black text-blue-500 uppercase tracking-[0.5em] flex items-center gap-6">
                      <span className="w-16 h-px bg-blue-500/30"></span> Governance Chain of Custody
                    </h4>
                    
                    <div className="relative space-y-0 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-white/10 ml-4">
                      {selectedMoc.auditLog?.map((entry, i) => (
                        <div key={i} className="relative pl-12 pb-10 group/entry">
                          <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center z-10 group-hover/entry:border-blue-500/50 group-hover/entry:scale-110 transition-all">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          </div>
                          <div className="glass-panel p-6 rounded-[2rem] border-white/5 group-hover/entry:border-blue-500/10 group-hover/entry:translate-x-2 transition-all">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="text-sm font-black text-white uppercase tracking-tight group-hover/entry:text-blue-400 transition-colors">{entry.action}</h5>
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{new Date(entry.timestamp).toLocaleString()}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium leading-relaxed mb-4">{entry.details}</p>
                            <div className="flex items-center gap-2 text-[9px] font-black text-blue-500 uppercase tracking-widest">
                              <User size={10} /> Verified by: {entry.user}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
             </div>
             
             <footer className="px-12 py-10 border-t border-white/5 bg-slate-900/80 backdrop-blur-2xl flex justify-between items-center">
                <button 
                  onClick={() => setIsEmergencyMode(true)}
                  className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-red-500/10 text-slate-500 hover:text-red-500 font-black uppercase text-[10px] tracking-widest transition-all border border-white/5 active:scale-95"
                >
                  Terminate Dossier
                </button>
                <div className="flex gap-4">
                  <button onClick={() => handleOpenEdit(selectedMoc)} className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl active:scale-95 transition-all hover:ring-4 hover:ring-blue-600/20">Modify Registry</button>
                </div>
             </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default MOCList;

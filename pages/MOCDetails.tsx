
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  MessageSquare, 
  Wrench, 
  ShieldCheck, 
  User as UserIcon,
  Send,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Printer,
  Zap,
  Plus,
  Link as LinkIcon,
  X,
  Search,
  Shield,
  Activity,
  Layers,
  Check,
  Calendar,
  Clock,
  ArrowUpRight,
  History,
  FileText,
  RefreshCw,
  ArrowRight,
  Loader2,
  Download,
  Link2,
  FileSearch,
  ClipboardCheck,
  UserPlus,
  Settings,
  Info,
  ExternalLink,
  PlusSquare,
  ListPlus,
  FileEdit,
  GitBranch
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../App';
import { MOCRequest, WorkOrder, MOCStatus, MOCHistoryEntry, UserRole, AuditEntry } from '../types';
import { MOC_STATUS_COLORS } from '../constants';

const MOCDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [moc, setMoc] = useState<MOCRequest | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isListLoading, setIsListLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Modals state
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isWOModalOpen, setIsWOModalOpen] = useState(false);
  
  // Filtering state for History Section
  const [historyFilter, setHistoryFilter] = useState<'all' | 'status' | 'comment' | 'wo' | 'audit'>('all');
  
  // Logic states
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState('');
  const [revisionReason, setRevisionReason] = useState('');
  const [revisionError, setRevisionError] = useState('');
  const [woMode, setWoMode] = useState<'create' | 'link'>('create');
  const [unlinkedWOs, setUnlinkedWOs] = useState<WorkOrder[]>([]);
  const [selectedUnlinkedIds, setSelectedUnlinkedIds] = useState<string[]>([]);
  const [woModalSearch, setWoModalSearch] = useState('');
  const [newWO, setNewWO] = useState({ title: '', assignedTo: '', dueDate: '' });

  const fetchMocData = useCallback(async () => {
    if (!id) return;
    try {
      const [mocData, woData, allAuditLogs] = await Promise.all([
        api.getMOCById(id),
        api.getWorkOrdersByMOC(id),
        api.getAuditTrail()
      ]);

      if (mocData) {
        setMoc(mocData);
        setWorkOrders(woData);
        const relevantLogs = allAuditLogs.filter(log => log.resource.includes(id));
        setAuditLogs(relevantLogs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMocData();
  }, [fetchMocData]);

  const fetchUnlinkedWOs = useCallback(async () => {
    setIsListLoading(true);
    try {
      const data = await api.getUnlinkedWorkOrders();
      setUnlinkedWOs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsListLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isWOModalOpen && woMode === 'link') {
      fetchUnlinkedWOs();
    }
  }, [isWOModalOpen, woMode, fetchUnlinkedWOs]);

  // Unified Timeline Generator
  const unifiedDetailedTimeline = useMemo(() => {
    if (!moc) return [];
    
    let events: any[] = [];
    
    // 1. MOC Internal History
    moc.history.forEach(h => {
      let icon = Activity;
      let color = 'bg-slate-500';
      let typeLabel = 'Evento';
      let borderColor = 'border-slate-100 dark:border-slate-700';

      if (h.type === 'status_change') {
        icon = RefreshCw;
        color = 'bg-purple-600';
        typeLabel = 'Workflow';
        borderColor = 'border-purple-200 dark:border-purple-900/40';
        
        if (h.action.toLowerCase().includes('aprovado')) { icon = ShieldCheck; color = 'bg-emerald-600'; }
        if (h.action.toLowerCase().includes('rejeitado')) { icon = XCircle; color = 'bg-red-600'; }
        if (h.action.toLowerCase().includes('revisão')) { icon = RefreshCw; color = 'bg-amber-600'; }
        if (h.action.toLowerCase().includes('implementado')) { icon = Zap; color = 'bg-indigo-500'; }
        if (h.action.toLowerCase().includes('concluído')) { icon = CheckCircle2; color = 'bg-teal-600'; }
      } else if (h.type === 'comment') {
        icon = MessageSquare;
        color = 'bg-blue-500';
        typeLabel = 'Nota Técnica';
        borderColor = 'border-blue-200 dark:border-blue-900/40';
      } else if (h.type === 'system') {
        icon = Settings;
        color = 'bg-slate-500';
        typeLabel = 'Sistema';
        borderColor = 'border-slate-200 dark:border-slate-700/50';
      }

      events.push({ 
        ...h, 
        source: 'history',
        eventIcon: icon,
        iconBg: color,
        typeLabel: typeLabel,
        borderColor: borderColor
      });
    });

    // 2. Audit Logs Integration
    auditLogs.forEach(log => {
      const isDuplicate = events.some(e => e.timestamp === log.timestamp && e.userId === log.userId);
      if (!isDuplicate) {
        let icon = Shield;
        let color = 'bg-indigo-500';
        let typeLabel = 'Auditoria';
        
        if (log.action === 'SECURITY_VIOLATION') { icon = AlertCircle; color = 'bg-red-700'; }
        if (log.action === 'WRITE') { icon = FileEdit; color = 'bg-blue-600'; }

        events.push({
          id: log.id,
          userId: log.userId,
          userName: log.userName,
          action: `Log de Auditoria: ${log.action.replace('_', ' ')}`,
          timestamp: log.timestamp,
          type: 'audit',
          details: log.details,
          changes: log.changes,
          source: 'audit',
          eventIcon: icon,
          iconBg: color,
          typeLabel: typeLabel,
          borderColor: 'border-indigo-200 dark:border-indigo-900/40'
        });
      }
    });

    // 3. Work Order Associations
    workOrders.forEach(wo => {
      events.push({
        id: `wo-${wo.id}`,
        userId: 'system',
        userName: 'SISTEMA',
        action: `Vínculo de Engenharia: OS ${wo.id}`,
        timestamp: wo.createdAt || moc.createdAt,
        type: 'work_order',
        details: `Associação da atividade técnica: ${wo.title}`,
        source: 'wo',
        eventIcon: Wrench,
        iconBg: 'bg-emerald-500',
        typeLabel: 'Execução',
        borderColor: 'border-emerald-200 dark:border-emerald-900/40'
      });
    });

    // Filtering
    if (historyFilter !== 'all') {
      events = events.filter(e => {
        if (historyFilter === 'status') return e.type === 'status_change';
        if (historyFilter === 'comment') return e.type === 'comment';
        if (historyFilter === 'wo') return e.type === 'work_order';
        if (historyFilter === 'audit') return e.type === 'audit';
        return true;
      });
    }

    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [moc, auditLogs, workOrders, historyFilter]);

  // Added filteredUnlinked memo to resolve build errors
  const filteredUnlinked = useMemo(() => {
    return unlinkedWOs.filter(wo => 
      wo.title.toLowerCase().includes(woModalSearch.toLowerCase()) ||
      wo.id.toLowerCase().includes(woModalSearch.toLowerCase()) ||
      wo.assignedTo.toLowerCase().includes(woModalSearch.toLowerCase())
    );
  }, [unlinkedWOs, woModalSearch]);

  const handleExportDossier = async () => {
    const element = document.getElementById('moc-dossier-container');
    if (!element || !moc) return;
    const html2pdfLib = (window as any).html2pdf;
    if (!html2pdfLib) return;

    setIsExporting(true);
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Dossier_MOC_${moc.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 3, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      await html2pdfLib().set(opt).from(element).save();
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !moc || !user) return;
    setIsSubmitting(true);
    const entry: MOCHistoryEntry = {
      id: `comment-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      action: 'Nota Técnica Registrada',
      timestamp: new Date().toLocaleString(),
      type: 'comment',
      details: newComment.trim()
    };
    const updatedMoc = { ...moc, history: [entry, ...moc.history] };
    try {
      await api.updateMOC(updatedMoc);
      await fetchMocData();
      setNewComment('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeStatus = async (newStatus: MOCStatus, reason?: string) => {
    if (!moc || !user) return;
    setIsSubmitting(true);
    const entry: MOCHistoryEntry = {
      id: `status-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      action: `Status Transacionado para: ${newStatus}`,
      timestamp: new Date().toLocaleString(),
      type: 'status_change',
      details: reason || 'Alteração de estado via workflow central.'
    };
    const updatedMoc = { ...moc, status: newStatus, history: [entry, ...moc.history] };
    try {
      await api.updateMOC(updatedMoc);
      await fetchMocData();
      return true;
    } catch (err: any) {
      alert(err.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectionSubmit = async () => {
    if (!rejectionReason.trim()) {
      setRejectionError("Informe a justificativa técnica obrigatória.");
      return;
    }
    const success = await handleChangeStatus(MOCStatus.REJEITADO, rejectionReason.trim());
    if (success) {
        setIsRejectionModalOpen(false);
        setRejectionReason('');
        setRejectionError('');
    }
  };

  const handleRevisionSubmit = async () => {
    if (!revisionReason.trim()) {
      setRevisionError("Informe as correções técnicas necessárias.");
      return;
    }
    const success = await handleChangeStatus(MOCStatus.EM_REVISAO, revisionReason.trim());
    if (success) {
        setIsRevisionModalOpen(false);
        setRevisionReason('');
        setRevisionError('');
    }
  };

  const handleCreateWO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWO.title || !newWO.assignedTo || !newWO.dueDate || !id) return;
    setIsSubmitting(true);
    const wo: WorkOrder = {
      id: `WO-${Date.now().toString().slice(-4)}`,
      mocId: id,
      title: newWO.title,
      assignedTo: newWO.assignedTo,
      dueDate: newWO.dueDate,
      status: 'Pendente',
      createdAt: new Date().toLocaleString()
    };
    try {
      await api.createWorkOrder(wo);
      await fetchMocData();
      setIsWOModalOpen(false);
      setNewWO({ title: '', assignedTo: '', dueDate: '' });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkWOs = async () => {
    if (selectedUnlinkedIds.length === 0 || !id) return;
    setIsSubmitting(true);
    try {
      await api.linkMultipleWorkOrders(selectedUnlinkedIds, id);
      await fetchMocData();
      setIsWOModalOpen(false);
      setSelectedUnlinkedIds([]);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSelectUnlinked = (woId: string) => {
    setSelectedUnlinkedIds(prev => 
      prev.includes(woId) ? prev.filter(id => id !== woId) : [...prev, woId]
    );
  };

  if (isLoading) return <div className="p-20 text-center font-bold text-blue-600 animate-pulse">Sincronizando Dossier Técnico...</div>;
  if (!moc) return <div className="p-20 text-center font-black text-red-500">MOC não localizada ou acesso negado.</div>;

  const isAdminOrCommittee = user?.role === UserRole.ADMIN || user?.role === UserRole.COMITE_APROVACAO;
  const isProcessEngineer = user?.role === UserRole.ENG_PROCESSO || user?.role === UserRole.ADMIN;

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fadeIn pb-32">
      {/* Header Panel */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-sm border border-gray-100 dark:border-slate-700 no-print">
        <div className="flex items-center gap-6">
          <Link to="/mocs" className="p-4 bg-gray-50 dark:bg-slate-700 rounded-[1.5rem] hover:bg-blue-600 hover:text-white transition-all shadow-sm group">
            <ChevronLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div className="space-y-2">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-[10px] font-black font-mono text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 rounded-full uppercase tracking-tighter shadow-inner">
                {moc.id}
              </span>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${MOC_STATUS_COLORS[moc.status]}`}>
                {moc.status}
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">{moc.title}</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={handleExportDossier} 
            disabled={isExporting}
            className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-[1.5rem] font-black text-sm hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
            {isExporting ? 'Processando...' : 'Gerar Relatório A4'}
          </button>
          
          {(moc.status === MOCStatus.SUBMETIDO || moc.status === MOCStatus.EM_AVALIACAO) && isAdminOrCommittee && (
            <div className="flex gap-2">
              <button onClick={() => handleChangeStatus(MOCStatus.APROVADO)} className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black text-sm hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100">
                <CheckCircle2 size={20} /> Aprovar
              </button>
              <button onClick={() => setIsRevisionModalOpen(true)} className="flex items-center gap-3 px-8 py-4 bg-purple-600 text-white rounded-[1.5rem] font-black text-sm hover:bg-purple-700 transition-all shadow-xl shadow-purple-100">
                <RefreshCw size={20} /> Revisão
              </button>
              <button onClick={() => setIsRejectionModalOpen(true)} className="flex items-center gap-3 px-8 py-4 bg-red-50 text-red-600 rounded-[1.5rem] font-black text-sm hover:bg-red-100 transition-all">
                <XCircle size={20} /> Rejeitar
              </button>
            </div>
          )}

          {moc.status === MOCStatus.EM_REVISAO && isProcessEngineer && (
             <button onClick={() => handleChangeStatus(MOCStatus.SUBMETIDO, "Dossier revisado e reenviado pelo Engenheiro.")} className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-[1.5rem] font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
               <Send size={20} /> Re-enviar
             </button>
          )}
        </div>
      </div>

      <div id="moc-dossier-container" className="space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-12">
            {/* Visual Timeline Section */}
            <section className="bg-white dark:bg-slate-800 rounded-[3.5rem] p-12 shadow-sm border border-gray-100 dark:border-slate-700 page-break-avoid">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-16 border-b border-gray-50 dark:border-slate-700 pb-10">
                <div className="flex items-center gap-6">
                  <div className="p-5 bg-blue-600 text-white rounded-[1.5rem] shadow-lg shadow-blue-100">
                    <History size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Timeline de Engenharia</h2>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Trilha cronológica auditável de interações</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 p-1.5 bg-gray-50 dark:bg-slate-700 rounded-[1.5rem] no-print">
                  {[
                    { id: 'all', label: 'Tudo' },
                    { id: 'status', label: 'Workflow' },
                    { id: 'comment', label: 'Notas' },
                    { id: 'wo', label: 'Ações' },
                    { id: 'audit', label: 'Auditoria' }
                  ].map((f) => (
                    <button 
                      key={f.id} 
                      onClick={() => setHistoryFilter(f.id as any)} 
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${historyFilter === f.id ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                {/* Vertical line connector */}
                <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-slate-700"></div>
                
                <div className="space-y-12">
                  {unifiedDetailedTimeline.map((event, idx) => (
                    <div key={event.id || idx} className="relative flex items-start gap-10 pl-2 group page-break-avoid">
                      {/* Timeline Icon Node */}
                      <div className={`relative z-10 h-12 w-12 flex items-center justify-center rounded-2xl shrink-0 text-white shadow-lg transition-all group-hover:scale-110 ${event.iconBg}`}>
                        <event.eventIcon size={20} strokeWidth={2.5} />
                      </div>

                      {/* Event Card Content */}
                      <div className={`flex-1 bg-gray-50/50 dark:bg-slate-900/20 p-8 rounded-[2.5rem] border-2 ${event.borderColor} hover:bg-white dark:hover:bg-slate-800/80 transition-all shadow-sm hover:shadow-xl`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-blue-600 text-[11px] font-black shadow-sm border border-gray-100 dark:border-slate-600">
                                {event.userName.charAt(0)}
                             </div>
                             <div>
                               <div className="flex items-center gap-2">
                                 <span className="text-sm font-black text-gray-900 dark:text-slate-100 tracking-tight">
                                   {event.userName}
                                 </span>
                                 <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-gray-200 dark:border-slate-700">
                                    {event.typeLabel}
                                 </span>
                               </div>
                               <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                                  <Clock size={12} /> {event.timestamp}
                               </div>
                             </div>
                          </div>
                        </div>

                        <h4 className="font-black text-lg text-gray-900 dark:text-slate-100 mb-2">
                          {event.action}
                        </h4>

                        {event.details && (
                          <div className="mt-4 bg-white/60 dark:bg-slate-900/40 p-5 rounded-2xl border border-gray-100 dark:border-slate-800/50">
                            <p className="text-sm text-gray-600 dark:text-slate-400 font-medium leading-relaxed italic">
                              "{event.details}"
                            </p>
                          </div>
                        )}
                        
                        {/* Audit Details (if any) */}
                        {event.changes && event.changes.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 grid grid-cols-1 gap-2">
                             {event.changes.map((c: any, ci: number) => (
                               <div key={ci} className="flex items-center gap-2 text-[10px] font-bold">
                                  <span className="text-gray-400 uppercase">{c.field}:</span>
                                  <span className="text-red-400 line-through">{String(c.oldValue)}</span>
                                  <ArrowRight size={10} className="text-gray-300" />
                                  <span className="text-emerald-500 font-black">{String(c.newValue)}</span>
                               </div>
                             ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {unifiedDetailedTimeline.length === 0 && (
                    <div className="py-20 text-center text-gray-400 font-black uppercase tracking-widest">Nenhum evento registrado</div>
                  )}
                </div>
              </div>
            </section>

            {/* General Info Sections */}
            <section className="bg-white dark:bg-slate-800 rounded-[3.5rem] p-12 shadow-sm border border-gray-100 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-12 page-break-avoid">
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-gray-400 font-black uppercase tracking-widest">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl"><Layers size={20} /></div>
                  <h3>Escopo Técnico</h3>
                </div>
                <p className="text-gray-700 dark:text-slate-300 leading-relaxed font-medium bg-gray-50 dark:bg-slate-900/30 p-8 rounded-[2rem] border border-gray-100 dark:border-slate-700">{moc.scope}</p>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-gray-400 font-black uppercase tracking-widest">
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl"><ShieldCheck size={20} /></div>
                  <h3>Análise de Justificativa</h3>
                </div>
                <p className="text-gray-700 dark:text-slate-300 leading-relaxed font-medium bg-gray-50 dark:bg-slate-900/30 p-8 rounded-[2rem] border border-gray-100 dark:border-slate-700">{moc.justification}</p>
              </div>
            </section>
          </div>

          <div className="lg:col-span-4 space-y-10">
            <section className="bg-white dark:bg-slate-800 rounded-[3rem] p-10 shadow-sm border border-gray-100 dark:border-slate-700 sticky top-10 page-break-avoid">
              {/* Interaction Panel */}
              <div className="no-print mb-8">
                <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                  <MessageSquare className="text-blue-600" size={24} /> Nota Técnica
                </h3>
                <textarea 
                  value={newComment} 
                  onChange={(e) => setNewComment(e.target.value)} 
                  placeholder="Descreva observações, evidências ou notas de revisão..." 
                  className="w-full p-6 bg-gray-50 dark:bg-slate-700 rounded-[2rem] outline-none h-40 resize-none font-medium mb-4 focus:ring-2 focus:ring-blue-500 transition-all border-none shadow-inner" 
                />
                <button 
                  onClick={handleAddComment} 
                  disabled={!newComment.trim() || isSubmitting} 
                  className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-3"
                >
                  <Send size={18} />
                  {isSubmitting ? 'Gravando...' : 'Registrar Nota'}
                </button>
              </div>
              
              <div className="mt-12 pt-10 border-t border-gray-100 dark:border-slate-700 space-y-8">
                 <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                       <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                          <Wrench size={14} className="text-blue-500" /> Ordens de Serviço (OS)
                       </h3>
                       <button onClick={() => { setIsWOModalOpen(true); setWoMode('create'); }} className="p-2.5 bg-gray-50 dark:bg-slate-700 text-gray-500 rounded-xl hover:bg-gray-100 transition-all no-print" title="Nova Ordem">
                         <Plus size={20} />
                       </button>
                    </div>

                    <button 
                      onClick={() => { setIsWOModalOpen(true); setWoMode('link'); }}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100 dark:border-blue-800 no-print"
                    >
                      <ListPlus size={16} />
                      Vincular OS Pendentes
                    </button>
                 </div>
                 
                 <div className="space-y-4">
                   {workOrders.length > 0 ? workOrders.map(wo => (
                     <div key={wo.id} className="p-6 bg-gray-50 dark:bg-slate-900/40 rounded-[1.5rem] border border-gray-100 dark:border-slate-700 hover:border-blue-200 transition-all page-break-avoid">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-[9px] font-black font-mono text-blue-600">#{wo.id}</span>
                           <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${wo.status === 'Concluída' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                             {wo.status}
                           </span>
                        </div>
                        <p className="font-bold text-sm mb-3 text-gray-900 dark:text-slate-100">{wo.title}</p>
                        <div className="flex items-center justify-between text-[9px] text-gray-400 font-black">
                           <div className="flex items-center gap-1.5"><UserIcon size={12} /> {wo.assignedTo}</div>
                           <div className="flex items-center gap-1.5"><Calendar size={12} /> {wo.dueDate}</div>
                        </div>
                     </div>
                   )) : (
                     <p className="text-center py-8 text-xs font-black text-gray-300 uppercase tracking-widest border-2 border-dashed border-gray-50 dark:border-slate-700 rounded-[1.5rem]">Sem OS Vinculadas</p>
                   )}
                 </div>
              </div>
            </section>
          </div>
        </div>

        <div className="hidden print:block mt-16 pt-8 border-t-2 border-gray-100">
           <div className="flex items-center gap-6 bg-blue-50 p-8 rounded-[2.5rem]">
              <div className="p-4 bg-white rounded-2xl shadow-sm text-blue-600">
                <Shield size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Dossier Certificado NR-13 / ANP</p>
                <p className="text-xs font-bold text-gray-800 leading-relaxed">
                  Este documento possui validade técnica oficial para fins de conformidade. O histórico é imutável e auditável através do MOC Studio Enterprise.
                </p>
              </div>
           </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {isRejectionModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-12 max-w-2xl w-full shadow-2xl animate-slideUp border border-red-50 dark:border-red-900/20">
            <div className="flex items-center gap-6 mb-8">
              <div className="p-4 bg-red-100 text-red-600 rounded-2xl shadow-inner"><XCircle size={36} /></div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Justificativa de Rejeição</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Este registro será permanente no dossier técnico</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Motivo Técnico *</label>
                <textarea 
                  value={rejectionReason}
                  onChange={(e) => { setRejectionReason(e.target.value); setRejectionError(''); }}
                  placeholder="Descreva detalhadamente as inconformidades ou riscos que impedem esta mudança..."
                  className={`w-full p-6 bg-gray-50 dark:bg-slate-900 border-none rounded-[2rem] focus:ring-2 ${rejectionError ? 'ring-2 ring-red-500' : 'focus:ring-red-500'} outline-none font-medium h-48 resize-none leading-relaxed shadow-inner dark:text-white`}
                />
                {rejectionError && <p className="text-red-500 text-[10px] font-black uppercase ml-1">{rejectionError}</p>}
              </div>

              <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-[2rem] border border-red-100 dark:border-red-900/30 flex items-start gap-4">
                 <AlertCircle className="text-red-600 shrink-0 mt-1" size={18} />
                 <p className="text-xs font-medium text-red-800 dark:text-red-300 leading-relaxed">
                   A confirmação moverá a MOC para o estado imutável de <strong>REJEITADO</strong>.
                 </p>
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button onClick={() => { setIsRejectionModalOpen(false); setRejectionReason(''); setRejectionError(''); }} className="flex-1 py-5 bg-gray-100 dark:bg-slate-700 rounded-[1.5rem] font-black text-sm hover:bg-gray-200 transition-all text-gray-700 dark:text-slate-300">Cancelar</button>
              <button 
                onClick={handleRejectionSubmit} 
                disabled={isSubmitting} 
                className="flex-1 py-5 bg-red-600 text-white rounded-[1.5rem] font-black text-sm hover:bg-red-700 shadow-xl shadow-red-100 dark:shadow-none transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'Processando...' : 'Confirmar Rejeição'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {isRevisionModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-12 max-w-2xl w-full shadow-2xl animate-slideUp border border-purple-50 dark:border-purple-900/20">
            <div className="flex items-center gap-6 mb-8">
              <div className="p-4 bg-purple-100 text-purple-600 rounded-2xl shadow-inner"><RefreshCw size={36} /></div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Solicitar Revisão Técnica</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Oriente o solicitante sobre os ajustes necessários</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Correções Necessárias *</label>
                <textarea 
                  value={revisionReason}
                  onChange={(e) => { setRevisionReason(e.target.value); setRevisionError(''); }}
                  placeholder="Relacione os pontos do dossier que precisam de complementação documental ou ajustes de escopo..."
                  className={`w-full p-6 bg-gray-50 dark:bg-slate-900 border-none rounded-[2rem] focus:ring-2 ${revisionError ? 'ring-2 ring-purple-500' : 'focus:ring-purple-500'} outline-none font-medium h-48 resize-none leading-relaxed shadow-inner dark:text-white`}
                />
                {revisionError && <p className="text-purple-500 text-[10px] font-black uppercase ml-1">{revisionError}</p>}
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button onClick={() => { setIsRevisionModalOpen(false); setRevisionReason(''); setRevisionError(''); }} className="flex-1 py-5 bg-gray-100 dark:bg-slate-700 rounded-[1.5rem] font-black text-sm hover:bg-gray-200 transition-all text-gray-700 dark:text-slate-300">Cancelar</button>
              <button 
                onClick={handleRevisionSubmit} 
                disabled={isSubmitting} 
                className="flex-1 py-5 bg-purple-600 text-white rounded-[1.5rem] font-black text-sm hover:bg-purple-700 shadow-xl shadow-purple-100 dark:shadow-none transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'Enviando...' : 'Solicitar Correções'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WO Management Modal */}
      {isWOModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-[3rem] w-full max-w-2xl shadow-2xl flex flex-col h-[80vh] overflow-hidden animate-slideUp">
            <div className="p-10 border-b border-gray-100 dark:border-slate-700">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl shadow-inner">
                        <Wrench size={24} />
                     </div>
                     <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Gestão de Atividades Técnicas</h3>
                  </div>
                  <button onClick={() => setIsWOModalOpen(false)} className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-2xl"><X size={24} /></button>
               </div>
               <div className="flex bg-gray-50 dark:bg-slate-900 p-1.5 rounded-2xl">
                  <button onClick={() => setWoMode('create')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${woMode === 'create' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-md' : 'text-gray-400'}`}>Nova Ordem de Serviço</button>
                  <button onClick={() => setWoMode('link')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${woMode === 'link' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-md' : 'text-gray-400'}`}>Vincular Pendências</button>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              {woMode === 'create' ? (
                <form id="woCreateForm" onSubmit={handleCreateWO} className="space-y-8 animate-fadeIn">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Título da Atividade</label>
                    <input required type="text" value={newWO.title} onChange={(e) => setNewWO({...newWO, title: e.target.value})} className="w-full p-5 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl outline-none shadow-inner font-bold dark:text-white" placeholder="Ex: Substituição de válvula..." />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Técnico Designado</label>
                      <input required type="text" value={newWO.assignedTo} onChange={(e) => setNewWO({...newWO, assignedTo: e.target.value})} className="w-full p-5 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl outline-none shadow-inner dark:text-white" placeholder="Nome..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Data Limite</label>
                      <input required type="date" value={newWO.dueDate} onChange={(e) => setNewWO({...newWO, dueDate: e.target.value})} className="w-full p-5 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl outline-none shadow-inner dark:text-white" />
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-6 animate-fadeIn h-full flex flex-col">
                   <div className="flex items-center justify-between mb-2">
                      <div className="relative flex-1 mr-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" value={woModalSearch} onChange={(e) => setWoModalSearch(e.target.value)} placeholder="Pesquisar ordens órfãs..." className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl outline-none shadow-inner dark:text-white" />
                      </div>
                      <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                         {selectedUnlinkedIds.length} Ativas
                      </div>
                   </div>
                   
                   {isListLoading ? (
                     <div className="flex-1 flex items-center justify-center text-gray-400 font-black uppercase tracking-widest animate-pulse">Sincronizando Banco de Dados...</div>
                   ) : filteredUnlinked.length > 0 ? (
                     <div className="flex-1 min-h-0 space-y-3">
                       {filteredUnlinked.map(wo => {
                         const isSelected = selectedUnlinkedIds.includes(wo.id);
                         return (
                           <div 
                            key={wo.id} 
                            onClick={() => toggleSelectUnlinked(wo.id)} 
                            className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center justify-between hover:scale-[1.02] active:scale-95 ${isSelected ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-50 dark:border-slate-800 bg-white dark:bg-slate-800'}`}
                           >
                             <div className="flex items-center gap-4">
                               <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-slate-700 text-gray-400'}`}>
                                  {isSelected ? <Check size={20} /> : <ListPlus size={20} />}
                               </div>
                               <div>
                                  <p className="font-black text-gray-900 dark:text-slate-100 tracking-tight">{wo.title}</p>
                                  <div className="flex items-center gap-3 mt-1 text-[9px] text-gray-400 font-bold uppercase">
                                    <span className="font-mono text-blue-500">#{wo.id}</span>
                                    <span className="flex items-center gap-1"><UserIcon size={10} /> {wo.assignedTo}</span>
                                    <span className="flex items-center gap-1"><Calendar size={10} /> {wo.dueDate}</span>
                                  </div>
                               </div>
                             </div>
                           </div>
                         );
                       })}
                     </div>
                   ) : (
                     <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                        <CheckCircle2 size={48} className="text-gray-200 mb-4" />
                        <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Não existem ordens pendentes para vínculo.</p>
                     </div>
                   )}
                </div>
              )}
            </div>

            <div className="p-10 border-t border-gray-100 dark:border-slate-700 flex items-center justify-end gap-4 bg-gray-50/50 dark:bg-slate-900/30">
               <button onClick={() => setIsWOModalOpen(false)} className="px-8 py-4 bg-white dark:bg-slate-800 text-gray-500 border border-gray-100 dark:border-slate-700 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all">Cancelar</button>
               <button 
                  onClick={woMode === 'create' ? undefined : handleLinkWOs} 
                  type={woMode === 'create' ? 'submit' : 'button'} 
                  form={woMode === 'create' ? 'woCreateForm' : undefined} 
                  disabled={isSubmitting || (woMode === 'link' && selectedUnlinkedIds.length === 0)} 
                  className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
               >
                 {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (woMode === 'create' ? <PlusSquare size={18} /> : <Link2 size={18} />)}
                 {isSubmitting ? 'Salvando...' : (woMode === 'create' ? 'Gerar OS' : `Vincular ${selectedUnlinkedIds.length} Atividades`)}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MOCDetails;

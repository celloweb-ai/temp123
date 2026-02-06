
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Eye, 
  FileText, 
  X, 
  ClipboardCheck, 
  Factory, 
  AlignLeft, 
  Info, 
  Send, 
  Settings, 
  ShieldAlert, 
  Zap, 
  BookOpen, 
  AlertCircle, 
  ListChecks, 
  CheckCircle2, 
  ChevronRight, 
  HelpCircle, 
  Loader2,
  Clock,
  RefreshCw,
  XCircle,
  ShieldCheck,
  FileEdit,
  GitBranch,
  AlertTriangle,
  FileSearch
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../App';
import { MOCRequest, UserRole, MOCStatus, Facility } from '../types';
import { MOC_STATUS_COLORS } from '../constants';

const MOC_TEMPLATES = {
  ROUTINE: {
    id: 'ROUTINE',
    label: 'Manutenção de Rotina',
    icon: Settings,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    description: 'Substituição pontual de componentes sem alteração de design original.',
    detailedSummary: {
      applicability: 'Substituições "like-for-like" (idênticas), reparos em componentes padronizados e manutenções preventivas que não alteram a lógica de processo ou limites de projeto.',
      workflow: 'Workflow simplificado com aprovação prioritária pelo Gerente da Instalação ou Engenheiro de Processo.',
      requirements: 'Não exige atualização de P&ID. Requer registro fotográfico e teste de estanqueidade funcional.'
    },
    sections: [
      { title: 'Plano de Isolamento', icon: ShieldAlert, placeholder: 'Descreva os bloqueios de energia e processo necessários...' },
      { title: 'Checklist de Testes', icon: ListChecks, placeholder: 'Enumere os testes funcionais pós-instalação...' }
    ],
    scope: 'Remover o componente atual e instalar sobressalente idêntico (form-fit-function). Realizar testes de estanqueidade.',
    justification: 'Garantir a disponibilidade operacional e prevenir falhas por degradação física de componentes.'
  },
  MAJOR: {
    id: 'MAJOR',
    label: 'Grande Modificação',
    icon: GitBranch,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    description: 'Alteração no projeto original, novos sistemas ou mudança de parâmetros operacionais.',
    detailedSummary: {
      applicability: 'Instalação de novos equipamentos, mudança de setpoints de segurança, alteração de materiais em linhas críticas ou expansão de capacidade de planta.',
      workflow: 'Workflow completo: Exige análise HAZOP, revisão por Comitê Multidisciplinar e Aprovação Final por Facility Manager.',
      requirements: 'Atualização obrigatória de P&ID, Isométricos e Matriz de Causa e Efeito. Exige PSSR (Pre-Startup Safety Review).'
    },
    sections: [
      { title: 'Impacto em Desenhos Técnicos', icon: FileText, placeholder: 'Relacione P&IDs e Isométricos que sofrerão revisão...' },
      { title: 'Análise de Impacto de Processo', icon: Zap, placeholder: 'Descreva mudanças em pressões, temperaturas ou vazões nominais...' }
    ],
    scope: 'Implementação conforme projeto de engenharia nº XXX. Revisão de prontuários e atualização de P&ID.',
    justification: 'Otimização de performance operacional e conformidade com novos requisitos normativos.'
  },
  EMERGENCY: {
    id: 'EMERGENCY',
    label: 'Emergencial',
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    description: 'Intervenção crítica e imediata para mitigação de riscos de segurança ou meio ambiente.',
    detailedSummary: {
      applicability: 'Vazamentos descontrolados, falhas em sistemas de segurança contra incêndio (F&G) ou situações com risco imediato à vida ou ao meio ambiente.',
      workflow: 'Aprovação verbal imediata seguida de formalização documental em no máximo 24 horas.',
      requirements: 'Avaliação de risco em tempo real. Exige notificação imediata à autoridade reguladora se houver impacto ambiental.'
    },
    sections: [
      { title: 'Justificativa de Emergência', icon: AlertCircle, placeholder: 'Por que esta mudança não pode aguardar o fluxo normal?' },
      { title: 'Controles Temporários', icon: ShieldAlert, placeholder: 'Quais barreiras extras serão aplicadas durante a execução?' }
    ],
    scope: 'Ações imediatas para reparo definitivo ou paliativo seguro de falha catastrófica iminente.',
    justification: 'Prevenção de acidentes graves e proteção da integridade de pessoas e instalações.'
  }
};

const MOC_STATUS_ICONS: Record<MOCStatus, any> = {
  [MOCStatus.RASCUNHO]: FileEdit,
  [MOCStatus.SUBMETIDO]: Send,
  [MOCStatus.EM_AVALIACAO]: FileSearch,
  [MOCStatus.EM_REVISAO]: RefreshCw,
  [MOCStatus.APROVADO]: CheckCircle2,
  [MOCStatus.REJEITADO]: XCircle,
  [MOCStatus.IMPLEMENTADO]: Zap,
  [MOCStatus.CONCLUIDO]: ShieldCheck,
};

const MOCRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mocs, setMocs] = useState<MOCRequest[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    scope: '',
    justification: '',
    facilityId: '',
    customSections: {} as Record<string, string>
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [mocData, facilityData] = await Promise.all([
        api.getMOCs(),
        api.getFacilities()
      ]);
      setMocs(mocData);
      setFacilities(facilityData);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const applyTemplate = (typeKey: keyof typeof MOC_TEMPLATES) => {
    const template = MOC_TEMPLATES[typeKey];
    setFormData({
      ...formData,
      type: template.id,
      description: template.description,
      scope: template.scope,
      justification: template.justification,
      customSections: {}
    });
  };

  const handleCreateMOC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const extraInfo = Object.entries(formData.customSections)
        .map(([key, val]) => `[${key}]: ${val}`)
        .join('\n\n');

      const newMoc: MOCRequest = {
        id: `MOC-${new Date().getFullYear().toString().slice(-2)}-${(mocs.length + 1).toString().padStart(3, '0')}`,
        title: formData.title,
        description: formData.description + (extraInfo ? '\n\n' + extraInfo : ''),
        scope: formData.scope,
        justification: formData.justification,
        facilityId: formData.facilityId,
        status: MOCStatus.SUBMETIDO,
        requesterId: user.id,
        createdAt: new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString(),
        type: formData.type,
        history: [{
          id: `hist-${Date.now()}`,
          userId: user.id,
          userName: user.name,
          action: 'Abertura de Solicitação',
          timestamp: new Date().toLocaleString(),
          type: 'system',
          details: `MOC criada via template ${formData.type}.`
        }]
      };

      await api.createMOC(newMoc);
      await fetchData();
      setIsCreateModalOpen(false);
      setFormData({ type: '', title: '', description: '', scope: '', justification: '', facilityId: '', customSections: {} });
    } catch (err: any) {
      alert("Erro ao criar MOC: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = mocs.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canCreate = [UserRole.ADMIN, UserRole.ENG_PROCESSO, UserRole.GERENTE_INSTALACAO].includes(user?.role || UserRole.TECNICO_MANUTENCAO);

  const selectedTemplate = formData.type ? MOC_TEMPLATES[formData.type as keyof typeof MOC_TEMPLATES] : null;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">MOC Requests</h1>
          <p className="text-gray-500 dark:text-slate-400">Fluxo formal de aprovação de mudanças técnicas.</p>
        </div>
        {canCreate && (
          <button 
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none font-bold"
          >
            <Plus size={20} />
            Nova Solicitação
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por ID ou Título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
              <th className="px-8 py-5">Identificação</th>
              <th className="px-8 py-5">Tipo de Mudança</th>
              <th className="px-8 py-5">Status Workflow</th>
              <th className="px-8 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {isLoading ? (
              <tr><td colSpan={4} className="px-8 py-16 text-center text-gray-400 font-medium">Sincronizando registros...</td></tr>
            ) : filtered.length > 0 ? filtered.map((moc) => {
              const template = moc.type ? MOC_TEMPLATES[moc.type as keyof typeof MOC_TEMPLATES] : null;
              const TypeIcon = template?.icon || Info;
              const StatusIcon = MOC_STATUS_ICONS[moc.status] || AlertCircle;

              return (
                <tr key={moc.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black font-mono text-blue-600 dark:text-blue-400 mb-1">{moc.id}</span>
                      <span className="font-bold text-gray-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">{moc.title}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${template?.bg || 'bg-gray-100'} ${template?.color || 'text-gray-400'} shadow-sm`}>
                        <TypeIcon size={18} strokeWidth={2.5} />
                      </div>
                      <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        {template ? template.label : 'Geral'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${MOC_STATUS_COLORS[moc.status]}`}>
                      <StatusIcon size={12} strokeWidth={3} />
                      {moc.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      type="button"
                      onClick={() => navigate(`/mocs/${moc.id}`)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all font-bold text-xs"
                    >
                      <Eye size={18} />
                      Analisar
                    </button>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-gray-400 font-bold uppercase tracking-widest">Nenhuma Solicitação de Mudança Localizada</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-[3rem] w-full max-w-6xl shadow-2xl border border-gray-100 dark:border-slate-700 flex flex-col max-h-[95vh] overflow-hidden animate-slideUp">
            <div className="p-10 border-b border-gray-100 dark:border-slate-700">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl shadow-inner">
                      <ClipboardCheck size={28} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Criação de Dossier MOC</h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Selecione uma categoria técnica para carregar os requisitos específicos</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setIsCreateModalOpen(false)} className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-2xl transition-all">
                    <X size={24} />
                  </button>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Templates Técnicos por Categoria de Risco</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(Object.keys(MOC_TEMPLATES) as Array<keyof typeof MOC_TEMPLATES>).map((key) => {
                      const template = MOC_TEMPLATES[key];
                      const Icon = template.icon;
                      const isActive = formData.type === template.id;
                      return (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => applyTemplate(key)}
                          className={`flex flex-col items-start p-6 rounded-[2.5rem] border-2 transition-all text-left group relative ${
                            isActive 
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/10 shadow-lg' 
                              : 'border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-200'
                          }`}
                        >
                          {isActive && (
                            <div className="absolute top-4 right-4 text-blue-600">
                              <CheckCircle2 size={24} />
                            </div>
                          )}
                          <div className={`p-4 rounded-2xl mb-4 transition-transform group-hover:scale-110 ${template.bg} ${template.color}`}>
                            <Icon size={28} />
                          </div>
                          
                          <div className="flex items-center justify-between w-full mb-2">
                            <h4 className="font-black text-base flex items-center gap-2 text-gray-900 dark:text-white">
                              {template.label}
                            </h4>
                          </div>

                          <p className="text-[10px] font-medium text-gray-500 leading-relaxed line-clamp-2">
                            {template.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-4 flex flex-col h-full">
                  <div className={`flex-1 p-8 rounded-[2.5rem] border-2 transition-all ${selectedTemplate ? 'bg-white dark:bg-slate-900 border-blue-100 dark:border-blue-900' : 'bg-gray-50 dark:bg-slate-800/50 border-dashed border-gray-200 dark:border-slate-700 flex items-center justify-center'}`}>
                    {selectedTemplate ? (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
                          <HelpCircle className="text-blue-500" size={20} />
                          <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Guia de Aplicabilidade</h4>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Onde se Aplica</p>
                            <p className="text-xs text-gray-600 dark:text-slate-400 font-medium leading-relaxed">
                              {selectedTemplate.detailedSummary.applicability}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-purple-500 uppercase tracking-widest">Fluxo de Workflow</p>
                            <p className="text-xs text-gray-600 dark:text-slate-400 font-medium leading-relaxed">
                              {selectedTemplate.detailedSummary.workflow}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Requisitos Críticos</p>
                            <p className="text-xs text-gray-600 dark:text-slate-400 font-medium leading-relaxed">
                              {selectedTemplate.detailedSummary.requirements}
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-slate-800 p-4 rounded-xl">
                          <ShieldAlert size={14} className="text-amber-500" />
                          Garante conformidade com normas API e NR-13
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-6">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                          <AlignLeft size={32} />
                        </div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Selecione uma categoria para ver as orientações técnicas</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {formData.type && (
                <form id="mocCreateForm" onSubmit={handleCreateMOC} className="space-y-12 animate-fadeIn">
                  <div className="bg-gray-50/50 dark:bg-slate-900/20 p-10 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 space-y-8">
                    <h4 className="text-xs font-black uppercase text-blue-600 tracking-widest flex items-center gap-2">
                       <Info size={14} /> Dados Fundamentais do Dossier
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Título do Projeto de Mudança</label>
                        <input 
                          required 
                          type="text" 
                          value={formData.title} 
                          onChange={(e) => setFormData({...formData, title: e.target.value})} 
                          placeholder="Ex: Upgrade de Sistema SCADA - Malha de Controle A"
                          className="w-full p-5 bg-white dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-lg shadow-sm" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unidade Operacional Afetada</label>
                        <select 
                          required 
                          value={formData.facilityId} 
                          onChange={(e) => setFormData({...formData, facilityId: e.target.value})} 
                          className="w-full p-5 bg-white dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold appearance-none shadow-sm dark:text-white"
                        >
                          <option value="">Selecione...</option>
                          {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Escopo de Engenharia</label>
                      <textarea 
                        required 
                        value={formData.scope} 
                        onChange={(e) => setFormData({...formData, scope: e.target.value})} 
                        className="w-full p-6 bg-gray-50 dark:bg-slate-900 border-none rounded-[2rem] focus:ring-2 focus:ring-blue-600 outline-none font-medium h-48 resize-none leading-relaxed shadow-inner dark:text-white" 
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Análise de Justificativa</label>
                      <textarea 
                        required 
                        value={formData.justification} 
                        onChange={(e) => setFormData({...formData, justification: e.target.value})} 
                        className="w-full p-6 bg-gray-50 dark:bg-slate-900 border-none rounded-[2rem] focus:ring-2 focus:ring-blue-600 outline-none font-medium h-48 resize-none leading-relaxed shadow-inner dark:text-white" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {selectedTemplate?.sections.map((section, idx) => (
                      <div key={idx} className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <section.icon size={14} className="text-blue-500" /> {section.title}
                        </label>
                        <textarea 
                          required
                          value={formData.customSections[section.title] || ''}
                          onChange={(e) => setFormData({
                            ...formData, 
                            customSections: { ...formData.customSections, [section.title]: e.target.value }
                          })}
                          placeholder={section.placeholder}
                          className="w-full p-6 bg-gray-50 dark:bg-slate-900 border-none rounded-[2rem] focus:ring-2 focus:ring-blue-600 outline-none font-medium h-40 resize-none shadow-inner dark:text-white"
                        />
                      </div>
                    ))}
                  </div>
                </form>
              )}
            </div>

            <div className="p-10 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between gap-4">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-slate-800 flex items-center justify-center text-blue-600 font-black text-lg shadow-inner">
                   {user?.name.charAt(0)}
                 </div>
                 <div className="hidden sm:block">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Autor do Dossier</p>
                   <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{user?.name}</p>
                 </div>
               </div>
               <div className="flex items-center gap-4">
                 <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-8 py-4 bg-white dark:bg-slate-800 text-gray-500 border border-gray-100 dark:border-slate-700 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all">Cancelar</button>
                 <button 
                  type="submit" 
                  form="mocCreateForm" 
                  disabled={isSubmitting || !formData.type} 
                  className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-2xl shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
                 >
                   {isSubmitting ? (
                     <>
                        <Loader2 className="animate-spin" size={20} />
                        Processando Workflow...
                     </>
                   ) : (
                     <>
                       <Send size={20} />
                       Iniciar Ciclo de Aprovação
                     </>
                   )}
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MOCRequests;

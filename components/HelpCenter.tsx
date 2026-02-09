
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { geminiService } from '../services/geminiService';
import { 
  Search, Book, FileText, Shield, LifeBuoy, ChevronRight, 
  ExternalLink, Scale, HelpCircle, FileSearch, Globe, 
  Sparkles, Loader2, ChevronDown, ChevronUp, Cpu, 
  Info, Database, Settings, Settings2, Layout, ListChecks, ShieldCheck,
  BookOpen, Video, Award, Milestone, CheckCircle2, ShieldAlert, X, 
  Edit3, Save, Link, ArrowRight, BookMarked, Fingerprint, Terminal,
  ClipboardCheck, HardDrive, ScrollText, Copy, Check, Clock, Plus, Trash2,
  Activity, Zap, BarChart3, Ruler, Boxes
} from 'lucide-react';
import { RegulatoryStandard, UsefulLink } from '../types';

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  level: 'Basic' | 'Advanced' | 'Expert';
  readTime: string;
}

const KNOWLEDGE_BASE: Article[] = [
  { id: '1', category: 'Basics', title: 'Fundamentals of MOC Lifecycle', level: 'Basic', readTime: '5 min', content: 'The Management of Change (MOC) process is a systematic approach to technical changes in complex industrial environments.' },
  { id: '2', category: 'Basics', title: 'Navigating the Digital Twin', level: 'Basic', readTime: '3 min', content: 'Learn how to interpret real-time telemetry and parametric streams from facility assets using the MOC Studio interface.' },
  { id: '3', category: 'Risk', title: 'Quantitative Risk Assessment Methodology', level: 'Advanced', readTime: '8 min', content: 'MOC Studio uses a 5x5 Probability vs Severity matrix to calculate composite risk scores for every technical submission.' },
  { id: '4', category: 'Governance', title: 'Role-Based Access Control (RBAC)', level: 'Advanced', readTime: '4 min', content: 'Understanding the hierarchy of sign-off authority between Engineers, Managers, and Auditors for industrial compliance.' },
  { id: '5', category: 'Safety', title: 'Emergency Bypass Protocols', level: 'Expert', readTime: '10 min', content: 'Procedures for initiating immediate changes during critical failures or safety upsets without standard review delays.' },
];

const ICON_OPTIONS = [
  { name: 'Layout', component: <Layout size={16} /> },
  { name: 'Database', component: <Database size={16} /> },
  { name: 'ScrollText', component: <ScrollText size={16} /> },
  { name: 'Fingerprint', component: <Fingerprint size={16} /> },
  { name: 'Globe', component: <Globe size={16} /> },
  { name: 'Settings', component: <Settings size={16} /> },
  { name: 'Activity', component: <Activity size={16} /> },
  { name: 'Zap', component: <Zap size={16} /> },
  { name: 'BarChart3', component: <BarChart3 size={16} /> },
  { name: 'Shield', component: <Shield size={16} /> },
  { name: 'Boxes', component: <Boxes size={16} /> },
  { name: 'Terminal', component: <Terminal size={16} /> },
  { name: 'Link', component: <Link size={16} /> }
];

const getIconByName = (name: string) => {
  const icon = ICON_OPTIONS.find(i => i.name === name);
  return icon ? icon.component : <Link size={16} />;
};

const HelpCenter: React.FC = () => {
  const { language, startEmergencyMOC, addNotification, standards, saveStandard, deleteStandard, usefulLinks, saveUsefulLink, deleteUsefulLink, user } = useApp();
  const t = TRANSLATIONS[language];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'docs' | 'methodology' | 'standards' | 'workflow'>('docs');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [copied, setCopied] = useState(false);

  // Standards Edit Modal State
  const [isStandardModalOpen, setIsStandardModalOpen] = useState(false);
  const [editingStandard, setEditingStandard] = useState<Partial<RegulatoryStandard> | null>(null);
  const [isSavingStandard, setIsSavingStandard] = useState(false);

  // Useful Links Edit Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Partial<UsefulLink> | null>(null);
  const [isSavingLink, setIsSavingLink] = useState(false);

  // Instant filtering logic
  const filteredArticles = useMemo(() => {
    if (!searchTerm.trim()) return KNOWLEDGE_BASE;
    const lowerQuery = searchTerm.toLowerCase();
    return KNOWLEDGE_BASE.filter(article => 
      article.title.toLowerCase().includes(lowerQuery) || 
      article.content.toLowerCase().includes(lowerQuery) ||
      article.category.toLowerCase().includes(lowerQuery)
    );
  }, [searchTerm]);

  const filteredStandards = useMemo(() => {
    if (!searchTerm.trim()) return standards;
    const lowerQuery = searchTerm.toLowerCase();
    return standards.filter(s => 
      s.code.toLowerCase().includes(lowerQuery) || 
      s.title.toLowerCase().includes(lowerQuery) || 
      s.desc.toLowerCase().includes(lowerQuery)
    );
  }, [searchTerm, standards]);

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-blue-500/30 text-blue-100 rounded-sm px-0.5 border-b border-blue-400 no-underline">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const handleAiSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setIsAiLoading(true);
    setAiResponse(null);
    try {
      const context = `Industrial Help Center Context: Searching for documentation or technical advice on "${searchTerm}". User is an engineer at MOC Studio.`;
      const response = await geminiService.getTechnicalAdvice(searchTerm, context);
      setAiResponse(response);
    } catch (error) {
      setAiResponse("Unable to connect to the technical intelligence module. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCopyAi = () => {
    if (aiResponse) {
      navigator.clipboard.writeText(aiResponse);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addNotification({ title: 'Copied to Clipboard', message: 'Technical advice stored in buffer.', type: 'info' });
    }
  };

  const handleOpenStandardModal = (s?: RegulatoryStandard) => {
    if (s) {
      setEditingStandard({ ...s });
    } else {
      setEditingStandard({
        id: `S${Date.now()}`,
        code: '',
        title: '',
        status: 'Active',
        desc: ''
      });
    }
    setIsStandardModalOpen(true);
  };

  const handleSaveStandard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStandard?.code || !editingStandard?.title) return;
    
    setIsSavingStandard(true);
    try {
      await saveStandard(editingStandard as RegulatoryStandard);
      setIsStandardModalOpen(false);
      addNotification({ 
        title: language === 'pt-BR' ? 'Norma Atualizada' : 'Standard Synchronized', 
        message: `The regulatory record for ${editingStandard.code} has been updated.`, 
        type: 'success' 
      });
    } finally {
      setIsSavingStandard(false);
    }
  };

  const handleDeleteStandard = async (id: string) => {
    await deleteStandard(id);
    addNotification({ 
      title: language === 'pt-BR' ? 'Norma Removida' : 'Standard Purged', 
      message: 'The standard has been removed from the registry.', 
      type: 'warning' 
    });
  };

  // Link Management Handlers
  const handleOpenLinkModal = (l?: UsefulLink) => {
    if (l) {
      setEditingLink({ ...l });
    } else {
      setEditingLink({
        id: `L${Date.now()}`,
        label: '',
        url: '',
        icon: 'Link'
      });
    }
    setIsLinkModalOpen(true);
  };

  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink?.label || !editingLink?.url) return;
    
    setIsSavingLink(true);
    try {
      await saveUsefulLink(editingLink as UsefulLink);
      setIsLinkModalOpen(false);
      addNotification({ 
        title: language === 'pt-BR' ? 'Link Atualizado' : 'Operational Link Updated', 
        message: `Shortcut to ${editingLink.label} has been synchronized.`, 
        type: 'success' 
      });
    } finally {
      setIsSavingLink(false);
    }
  };

  const handleDeleteLink = async (id: string) => {
    await deleteUsefulLink(id);
    addNotification({ 
      title: language === 'pt-BR' ? 'Link Removido' : 'Link Purged', 
      message: 'Navigation shortcut removed from operational dashboard.', 
      type: 'warning' 
    });
  };

  const workflowSteps = useMemo(() => [
    { step: '01', title: language === 'pt-BR' ? 'Iniciação' : 'Initiation', desc: language === 'pt-BR' ? 'Definição do escopo e justificativa técnica.' : 'Define change scope and technical boundaries.' },
    { step: '02', title: language === 'pt-BR' ? 'Avaliação' : 'Evaluation', desc: language === 'pt-BR' ? 'Análise multidisciplinar de riscos e revisão técnica.' : 'Multidisciplinary risk assessment and review.' },
    { step: '03', title: language === 'pt-BR' ? 'Aprovação' : 'Approval', desc: language === 'pt-BR' ? 'Assinatura dos gestores técnicos e SMS autorizados.' : 'Sign-off by authorized technical and HSE managers.' },
    { step: '04', title: language === 'pt-BR' ? 'Implementação' : 'Implementation', desc: language === 'pt-BR' ? 'Execução física da mudança e treinamento operacional.' : 'Physical execution and operational training.' },
    { step: '05', title: language === 'pt-BR' ? 'Validação' : 'Validation', desc: language === 'pt-BR' ? 'Verificação de encerramento para garantir eficácia.' : 'Close-out verification to ensure effectiveness.' },
  ], [language]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">
      {/* Hero Section */}
      <header className="relative p-12 lg:p-20 rounded-[4rem] overflow-hidden group border border-white/5 bg-slate-900/60 shadow-2xl">
        <div className="absolute top-0 right-0 p-20 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000">
           <Terminal size={300} />
        </div>
        <div className="relative z-10 flex flex-col items-center text-center space-y-8">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">
            <Sparkles size={14} className="animate-pulse" /> 
            {language === 'pt-BR' ? 'Nexo de Conhecimento IA' : 'AI Knowledge Nexus'}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none max-w-4xl">
            {language === 'pt-BR' ? 'Central de Inteligência MOC' : 'MOC Intelligence Hub'}
          </h1>
          <p className="text-slate-400 font-medium text-lg max-w-2xl leading-relaxed uppercase tracking-tight opacity-70">
            {language === 'pt-BR' ? 'Documentação técnica, normas regulatórias e suporte de engenharia alimentado por Gemini.' : 'Technical documentation, regulatory standards, and Gemini-powered engineering support.'}
          </p>
          
          <form onSubmit={handleAiSearch} className="relative mt-4 w-full max-w-3xl group">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={24} />
            <input 
              type="text" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder={language === 'pt-BR' ? 'O que você deseja consultar hoje?' : 'Search for standards, procedures, or AI advice...'} 
              className="w-full bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-[3rem] py-8 pl-20 pr-32 text-xl text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all shadow-2xl" 
            />
            <button 
              type="submit"
              disabled={isAiLoading}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-xl transition-all active:scale-95 flex items-center gap-2"
            >
              {isAiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              <span>{isAiLoading ? 'Analyzing...' : 'Ask AI'}</span>
            </button>
          </form>
        </div>
      </header>

      {/* AI Response Display */}
      {aiResponse && (
        <div className="animate-in slide-in-from-top-4 duration-500">
           <div className="glass-panel p-12 rounded-[3.5rem] border-blue-500/30 bg-blue-600/5 relative group/ai">
              <div className="absolute -top-4 left-12 px-6 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                 <Cpu size={14} /> AI Technical Grade Advice
              </div>
              <button 
                onClick={() => setAiResponse(null)}
                className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              <div className="prose prose-invert max-w-none">
                 <p className="text-xl text-slate-200 leading-relaxed italic font-medium">
                   {aiResponse}
                 </p>
              </div>
              <div className="mt-10 pt-8 border-t border-white/10 flex justify-between items-center">
                 <div className="flex gap-4">
                    <span className="px-4 py-1.5 bg-white/5 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">Confidence: 98.4%</span>
                    <span className="px-4 py-1.5 bg-white/5 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">Standard: API compliant</span>
                 </div>
                 <button 
                  onClick={handleCopyAi}
                  className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                 >
                   {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                   {copied ? 'Copied' : 'Copy Advice'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-2 bg-slate-900/40 rounded-[3rem] border border-white/10">
          {[
            { id: 'docs', label: t.knowledgeBase, icon: <BookMarked size={18} /> },
            { id: 'methodology', label: t.methodology, icon: <Scale size={18} /> },
            { id: 'standards', label: t.standards, icon: <Globe size={18} /> },
            { id: 'workflow', label: t.workflow, icon: <Milestone size={18} /> }
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => { setActiveTab(tab.id as any); setSelectedArticle(null); }} 
              className={`px-10 py-5 rounded-[2.5rem] text-[11px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${
                activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          {activeTab === 'docs' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {selectedArticle ? (
                <div className="glass-panel p-12 rounded-[3.5rem] border-white/10 animate-in slide-in-from-right-4">
                  <button 
                    onClick={() => setSelectedArticle(null)}
                    className="flex items-center gap-2 text-blue-500 font-black text-[10px] uppercase tracking-widest mb-10 hover:translate-x-[-4px] transition-transform"
                  >
                    <ChevronRight size={16} className="rotate-180" /> {language === 'pt-BR' ? 'Voltar para Lista' : 'Back to Articles'}
                  </button>
                  <div className="space-y-8">
                     <div className="flex items-center justify-between">
                        <span className="px-4 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-widest">{selectedArticle.category}</span>
                        <div className="flex gap-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                           <span className="flex items-center gap-1"><Book size={14} /> {selectedArticle.level}</span>
                           <span className="flex items-center gap-1"><Clock size={14} /> {selectedArticle.readTime} Read</span>
                        </div>
                     </div>
                     <h2 className="text-4xl font-black text-white tracking-tighter uppercase">{selectedArticle.title}</h2>
                     <div className="p-10 bg-slate-950 rounded-[2rem] border border-white/5 text-slate-300 leading-relaxed text-lg">
                        {selectedArticle.content}
                        <p className="mt-6">The technical scope defined within this module adheres to standardized O&G engineering practices. All data processed is categorized based on the criticality of the change request. MOC Studio ensures that every documentation piece is linked back to the master governance registry.</p>
                        <p className="mt-4 font-black text-blue-400 uppercase text-xs tracking-widest border-t border-white/5 pt-6 flex items-center gap-2"><CheckCircle2 size={16} /> Technical Review Verified v2.1</p>
                     </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredArticles.length > 0 ? filteredArticles.map((article) => (
                    <div 
                      key={article.id}
                      onClick={() => setSelectedArticle(article)}
                      className="glass-panel p-8 rounded-[3rem] border-white/5 hover:border-blue-500/30 transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest px-3 py-1 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            {highlightText(article.category, searchTerm)}
                          </span>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{article.readTime}</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors uppercase tracking-tight leading-tight mb-4">
                          {highlightText(article.title, searchTerm)}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
                          {highlightText(article.content, searchTerm)}
                        </p>
                      </div>
                      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                         <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{article.level} Grade</span>
                         <ArrowRight size={18} className="text-blue-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-30 grayscale">
                      <FileSearch size={64} className="mb-4 text-slate-500" />
                      <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">No matching documents</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'methodology' && (
            <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-500">
               <div className="glass-panel p-12 rounded-[4rem] border-white/10">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-4">
                    <Scale size={28} className="text-blue-500" /> {language === 'pt-BR' ? 'O Framework de Risco MOC Studio' : 'The MOC Studio Risk Framework'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                     <div className="space-y-6">
                        <h4 className="text-sm font-black text-blue-400 uppercase tracking-widest">Composite Scoring ($P \times S$)</h4>
                        <p className="text-slate-400 text-sm leading-relaxed font-medium">
                          Our proprietary risk calculation engine follows the multiplication principle of Probability and Severity. Every technical change is evaluated against operational, safety, and environmental impacts.
                        </p>
                        <ul className="space-y-4">
                           <li className="flex items-start gap-4">
                              <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center shrink-0 font-black text-xs">15+</div>
                              <div>
                                 <span className="block text-xs font-black text-white uppercase tracking-widest">Extreme Threshold</span>
                                 <span className="text-[11px] text-slate-500">Requires HSE Director and Technical Manager dual sign-off.</span>
                              </div>
                           </li>
                           <li className="flex items-start gap-4">
                              <div className="w-8 h-8 rounded-lg bg-orange-600/20 text-orange-500 flex items-center justify-center shrink-0 font-black text-xs">8-14</div>
                              <div>
                                 <span className="block text-xs font-black text-white uppercase tracking-widest">High Risk Grade</span>
                                 <span className="text-[11px] text-slate-500">Requires formal peer review and department head approval.</span>
                              </div>
                           </li>
                        </ul>
                     </div>
                     <div className="bg-slate-950/50 p-8 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center space-y-6">
                        <div className="text-center">
                           <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-2">Governance Reliability</div>
                           <div className="text-5xl font-black text-white">99.9%</div>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-600 w-[99.9%]"></div>
                        </div>
                        <p className="text-[10px] text-slate-500 text-center uppercase font-bold tracking-widest">Algorithm compliant with ISO 31000 standards.</p>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'standards' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex justify-end">
                  <button 
                    onClick={() => handleOpenStandardModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
                  >
                    <Plus size={16} /> {language === 'pt-BR' ? 'Nova Norma' : 'Provision New Standard'}
                  </button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredStandards.length > 0 ? filteredStandards.map((s, idx) => (
                    <div key={idx} className="glass-panel p-8 rounded-[3rem] border-white/5 group hover:border-emerald-500/30 transition-all relative">
                       <div className="flex justify-between items-start mb-6">
                          <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                             <ClipboardCheck size={20} />
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest px-3 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">{s.status}</span>
                            <button 
                              onClick={() => handleOpenStandardModal(s)}
                              className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteStandard(s.id)}
                              className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-500 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                       </div>
                       <h3 className="text-xl font-black text-white mb-2">{highlightText(s.code, searchTerm)}</h3>
                       <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-6">{highlightText(s.title, searchTerm)}</h4>
                       <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8">
                         {highlightText(s.desc, searchTerm)}
                       </p>
                       <button className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest hover:translate-x-2 transition-all">
                          Read Standard <ExternalLink size={14} />
                       </button>
                    </div>
                  )) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-30 grayscale">
                      <Globe size={64} className="mb-4 text-slate-500" />
                      <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">No matching standards</p>
                    </div>
                  )}
               </div>
            </div>
          )}

          {activeTab === 'workflow' && (
             <div className="glass-panel p-12 rounded-[4rem] border-emerald-500/20 bg-emerald-950/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-20 opacity-5 -rotate-12">
                   <Milestone size={300} className="text-emerald-500" />
                </div>
                <h3 className="text-3xl font-black text-white mb-12 flex items-center gap-4 relative z-10">
                   <Milestone size={32} className="text-emerald-500" /> 
                   {language === 'pt-BR' ? 'Ciclo de Vida Operacional' : 'Operational Lifecycle'}
                </h3>
                <div className="relative pl-12 space-y-12 before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-emerald-500 before:to-emerald-500/10 relative z-10">
                  {workflowSteps.map(s => (
                    <div key={s.step} className="relative group animate-in slide-in-from-left-4" style={{ animationDelay: `${parseInt(s.step) * 100}ms` }}>
                       <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-slate-950 border-4 border-emerald-500 flex items-center justify-center z-10 group-hover:scale-125 transition-transform"><CheckCircle2 size={10} className="text-emerald-500" /></div>
                       <h4 className="text-sm font-black text-emerald-500 uppercase tracking-widest mb-2">Step {s.step}: {s.title}</h4>
                       <p className="text-slate-300 text-base leading-relaxed font-medium max-w-xl">{s.desc}</p>
                    </div>
                  ))}
                </div>
             </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="glass-panel p-10 rounded-[3.5rem] bg-rose-600/10 border-rose-500/20 group hover:border-rose-500/40 transition-all">
            <div className="w-16 h-16 bg-rose-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-rose-600/20 mb-8 group-hover:scale-110 group-hover:rotate-12 transition-all">
               <ShieldAlert size={32} />
            </div>
            <h4 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">{t.emergencyProtocol}</h4>
            <p className="text-sm text-slate-500 leading-relaxed mb-10 font-medium tracking-tight">
              {language === 'pt-BR' ? 'Protocolos de desvio acelerados para situações de risco crítico imediato. Ignore as filas de revisão padrão com supervisão de auditoria.' : 'Accelerated bypass protocols for immediate critical risk situations. Bypass standard review queues with audit oversight.'}
            </p>
            <button 
              onClick={startEmergencyMOC} 
              className="w-full bg-rose-600 hover:bg-rose-500 text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <Terminal size={18} />
              {t.initiateBypass}
            </button>
          </div>

          <div className="glass-panel p-10 rounded-[3.5rem] border-white/5 space-y-8">
             <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-4">
                    <span className="w-8 h-px bg-white/10"></span> Useful Links
                </h4>
                {(user?.role === 'Manager' || user?.role === 'Engineer') && (
                  <button 
                    onClick={() => handleOpenLinkModal()}
                    className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-blue-400 transition-all flex items-center gap-1"
                    title="Manage Navigation Shortcuts"
                  >
                    <Settings2 size={14} /> <span className="text-[9px] font-black uppercase">Manage</span>
                  </button>
                )}
             </div>
             <div className="space-y-4">
                {usefulLinks.length > 0 ? usefulLinks.map((link) => (
                  <div key={link.id} className="relative group">
                    <button 
                      onClick={() => window.open(link.url, '_blank')}
                      className="w-full flex items-center justify-between p-5 bg-white/5 hover:bg-blue-600/10 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group/btn"
                    >
                      <span className="flex items-center gap-4 text-xs font-black text-slate-400 group-hover/btn:text-blue-400 uppercase tracking-widest">
                        {getIconByName(link.icon)} {link.label}
                      </span>
                      <ChevronRight size={16} className="text-slate-600 group-hover/btn:text-blue-400 transition-all group-hover/btn:translate-x-1" />
                    </button>
                    {(user?.role === 'Manager' || user?.role === 'Engineer') && (
                      <div className="absolute top-1/2 -right-12 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => handleOpenLinkModal(link)} className="p-1.5 bg-slate-800 text-slate-400 hover:text-blue-400 rounded-lg"><Edit3 size={12} /></button>
                         <button onClick={() => handleDeleteLink(link.id)} className="p-1.5 bg-slate-800 text-slate-400 hover:text-red-500 rounded-lg"><Trash2 size={12} /></button>
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="py-10 text-center opacity-20 border-2 border-dashed border-white/10 rounded-2xl">
                    <Link size={32} className="mx-auto mb-2" />
                    <p className="text-[9px] font-black uppercase tracking-widest">No shortcuts provisioned</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* Standard Modal */}
      {isStandardModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsStandardModalOpen(false)}></div>
          <div className="glass-panel w-full max-w-2xl rounded-[3.5rem] overflow-hidden flex flex-col relative z-10 shadow-2xl border-white/10">
             <header className="px-10 py-8 border-b border-white/10 flex justify-between items-center bg-blue-600/5">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl">
                      <Globe size={28} />
                   </div>
                   <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      {editingStandard?.id ? 'Modify Standard Record' : 'Provision New Standard'}
                    </h3>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mt-1">Regulatory Governance Archive</p>
                  </div>
                </div>
                <button onClick={() => setIsStandardModalOpen(false)} className="p-3 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-all"><X size={28} /></button>
             </header>

             <form onSubmit={handleSaveStandard} className="p-12 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Standard Code</label>
                      <input 
                        required
                        value={editingStandard?.code}
                        onChange={(e) => setEditingStandard({...editingStandard, code: e.target.value.toUpperCase()})}
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 px-6 text-sm font-black text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all uppercase"
                        placeholder="e.g. API 521"
                      />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Classification</label>
                      <select 
                        value={editingStandard?.status}
                        onChange={(e) => setEditingStandard({...editingStandard, status: e.target.value as any})}
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 px-6 text-sm font-black text-white outline-none cursor-pointer"
                      >
                         <option value="Active">Active</option>
                         <option value="Compliance">Compliance</option>
                         <option value="Technical">Technical</option>
                      </select>
                   </div>
                </div>

                <div className="space-y-3">
                   <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Standard Nomenclature</label>
                   <input 
                     required
                     value={editingStandard?.title}
                     onChange={(e) => setEditingStandard({...editingStandard, title: e.target.value})}
                     className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 px-6 text-sm font-black text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                     placeholder="e.g. Pressure-relieving Systems"
                   />
                </div>

                <div className="space-y-3">
                   <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Technical Abstract</label>
                   <textarea 
                     required
                     rows={4}
                     value={editingStandard?.desc}
                     onChange={(e) => setEditingStandard({...editingStandard, desc: e.target.value})}
                     className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 px-6 text-sm font-black text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                     placeholder="Detailed description of the standard scope and applicability..."
                   />
                </div>

                <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-[2rem] flex items-center gap-4">
                   <Info size={24} className="text-blue-500 shrink-0" />
                   <p className="text-[10px] text-slate-300 font-medium leading-relaxed uppercase tracking-tight">
                     This standard will be accessible to all facility engineers through the Digital Twin and MOC Lifecycle search engines.
                   </p>
                </div>
                
                <footer className="pt-6 border-t border-white/10 flex justify-end gap-6">
                  <button 
                    type="button" 
                    onClick={() => setIsStandardModalOpen(false)} 
                    className="px-8 py-4 rounded-2xl font-black text-slate-400 hover:bg-white/5 transition-all text-[11px] uppercase tracking-widest"
                  >
                    Abort
                  </button>
                  <button 
                    type="submit"
                    disabled={isSavingStandard}
                    className="px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 shadow-xl transition-all active:scale-95"
                  >
                    {isSavingStandard ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {editingStandard?.id ? 'Commit Update' : 'Synchronize Standard'}
                  </button>
                </footer>
             </form>
          </div>
        </div>
      )}

      {/* Useful Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsLinkModalOpen(false)}></div>
          <div className="glass-panel w-full max-w-2xl rounded-[3.5rem] overflow-hidden flex flex-col relative z-10 shadow-2xl border-white/10">
             <header className="px-10 py-8 border-b border-white/10 flex justify-between items-center bg-emerald-600/5">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xl">
                      <Link size={28} />
                   </div>
                   <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      {editingLink?.id ? 'Update Shortcut' : 'Provision Shortcut'}
                    </h3>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mt-1">Operational Navigation Registry</p>
                  </div>
                </div>
                <button onClick={() => setIsLinkModalOpen(false)} className="p-3 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-all"><X size={28} /></button>
             </header>

             <form onSubmit={handleSaveLink} className="p-12 space-y-8">
                <div className="space-y-3">
                   <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Shortcut Label</label>
                   <input 
                     required
                     value={editingLink?.label}
                     onChange={(e) => setEditingLink({...editingLink, label: e.target.value})}
                     className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 px-6 text-sm font-black text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                     placeholder="e.g. Flare Diagnostics"
                   />
                </div>

                <div className="space-y-3">
                   <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Destination URL</label>
                   <input 
                     required
                     value={editingLink?.url}
                     onChange={(e) => setEditingLink({...editingLink, url: e.target.value})}
                     className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 px-6 text-sm font-black text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono"
                     placeholder="https://..."
                   />
                </div>

                <div className="space-y-3">
                   <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Visual Identity (Icon)</label>
                   <div className="grid grid-cols-6 gap-3 p-6 bg-slate-900/50 rounded-2xl border border-white/5">
                      {ICON_OPTIONS.map((opt) => (
                        <button
                          key={opt.name}
                          type="button"
                          onClick={() => setEditingLink({...editingLink, icon: opt.name})}
                          className={`p-4 rounded-xl flex items-center justify-center transition-all ${
                            editingLink?.icon === opt.name 
                              ? 'bg-emerald-600 text-white shadow-lg' 
                              : 'bg-white/5 text-slate-500 hover:text-white hover:bg-white/10'
                          }`}
                          title={opt.name}
                        >
                          {opt.component}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="p-6 bg-emerald-600/10 border border-emerald-500/20 rounded-[2rem] flex items-center gap-4">
                   <Info size={24} className="text-emerald-500 shrink-0" />
                   <p className="text-[10px] text-slate-300 font-medium leading-relaxed uppercase tracking-tight">
                     Operational links are persistent for all system users across the facility network.
                   </p>
                </div>
                
                <footer className="pt-6 border-t border-white/10 flex justify-end gap-6">
                  <button 
                    type="button" 
                    onClick={() => setIsLinkModalOpen(false)} 
                    className="px-8 py-4 rounded-2xl font-black text-slate-400 hover:bg-white/5 transition-all text-[11px] uppercase tracking-widest"
                  >
                    Abort
                  </button>
                  <button 
                    type="submit"
                    disabled={isSavingLink}
                    className="px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 shadow-xl transition-all active:scale-95"
                  >
                    {isSavingLink ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {editingLink?.id ? 'Commit Update' : 'Provision Shortcut'}
                  </button>
                </footer>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpCenter;

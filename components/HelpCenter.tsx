
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { jsPDF } from 'jspdf';
import { 
  Search, Book, FileText, Shield, LifeBuoy, ChevronRight, 
  ExternalLink, Scale, HelpCircle, FileSearch, Globe, 
  Loader2, ChevronDown, ChevronUp, Cpu, 
  Info, Database, Settings, Settings2, Layout, ListChecks, ShieldCheck,
  BookOpen, Video, Award, Milestone, CheckCircle2, ShieldAlert, X, 
  Edit3, Save, Link as LinkIcon, ArrowRight, BookMarked, Fingerprint, Terminal,
  ClipboardCheck, HardDrive, ScrollText, Copy, Check, Clock, Plus, Trash2,
  Activity, Zap, BarChart3, Ruler, Boxes, Play, PlayCircle, MonitorPlay,
  Layers, Navigation, MoveRight, Share2, Globe2, Tag, Filter, BookOpenCheck,
  AlertTriangle, CheckSquare, Microscope, ArrowLeft, Calendar, FileCheck, ArrowUpRight
} from 'lucide-react';
import { RegulatoryStandard, UsefulLink } from '../types';

interface Article {
  id: string;
  title: string;
  category: 'Safety' | 'Technical' | 'Compliance' | 'Operations';
  content: string;
  abstract: string;
  level: 'Basic' | 'Advanced' | 'Expert';
  readTime: string;
  lastUpdated: string;
}

const KNOWLEDGE_BASE: Article[] = [
  { 
    id: '1', 
    category: 'Operations', 
    title: 'Fundamentals of MOC Lifecycle', 
    level: 'Basic', 
    readTime: '5 min', 
    lastUpdated: '2024-02-15',
    abstract: 'A foundational overview of how technical changes are tracked from initiation to close-out.',
    content: 'The Management of Change (MOC) process ensures that changes to process chemicals, technology, equipment, and procedures are properly managed to prevent incidents. In MOC Studio, every change follows a 5-step validation protocol aligned with OSHA 1910.119.' 
  },
  { 
    id: '2', 
    category: 'Technical', 
    title: 'Navigating the Digital Twin', 
    level: 'Basic', 
    readTime: '3 min', 
    lastUpdated: '2024-01-20',
    abstract: 'Guide on interpreting real-time telemetry and parametric streams in the asset inventory.',
    content: 'The Digital Twin module provides real-time mirroring of physical assets. Parametric streams (Pressure, Temperature, Flow) are updated via industrial IoT gateways. High-integrity data is visualized using the proprietary telemetry engine.' 
  },
  { 
    id: '3', 
    category: 'Safety', 
    title: 'HAZOP Integration Methodology', 
    level: 'Advanced', 
    readTime: '12 min', 
    lastUpdated: '2024-03-01',
    abstract: 'How to link Hazard and Operability Studies directly to MOC risk assessments.',
    content: 'A Hazard and Operability (HAZOP) study is a structured and systematic examination of a planned or existing process or operation. In MOC Studio, HAZOP nodes can be linked to specific MOC requests to provide quantitative risk grounding. Deviations such as "No Flow" or "High Pressure" are evaluated against existing safeguards.' 
  },
  { 
    id: '4', 
    category: 'Compliance', 
    title: 'Role-Based Access Control (RBAC)', 
    level: 'Advanced', 
    readTime: '4 min', 
    lastUpdated: '2024-03-10',
    abstract: 'Understanding the hierarchy of sign-off authority for industrial compliance.',
    content: 'Safety and technical governance require strict adherence to sign-off hierarchies. Engineers initiate, Managers review/approve, and Auditors verify the chain of custody. No technical change can bypass the mandatory dual-signature protocol except via emergency bypass.' 
  },
  { 
    id: '5', 
    category: 'Safety', 
    title: 'PSSR: Pre-Startup Safety Review', 
    level: 'Expert', 
    readTime: '15 min', 
    lastUpdated: '2024-03-12',
    abstract: 'Comprehensive checklist requirements before bringing a modified asset back online.',
    content: 'PSSR is a final check of new or modified facilities to confirm that they are ready for startup. Requirements include: 1. Construction and equipment meet design specs. 2. Safety/operating/maintenance procedures are in place. 3. Training is completed. 4. PHA/MOC recommendations are resolved.' 
  },
  { 
    id: '6', 
    category: 'Technical', 
    title: 'LOPA: Layer of Protection Analysis', 
    level: 'Advanced', 
    readTime: '10 min', 
    lastUpdated: '2024-02-28',
    abstract: 'Semi-quantitative risk assessment method for evaluating safeguard effectiveness.',
    content: 'LOPA is used to determine if there are sufficient independent protection layers (IPLs) to reduce the risk of an accident to an acceptable level. Common IPLs include Relief Valves, SIS (Safety Instrumented Systems), and procedural controls.' 
  },
  { 
    id: '7', 
    category: 'Compliance', 
    title: 'API RP 754 Metrics Guide', 
    level: 'Expert', 
    readTime: '8 min', 
    lastUpdated: '2024-03-05',
    abstract: 'Understanding Tier 1 and Tier 2 process safety indicators for reporting.',
    content: 'API Recommended Practice 754 provides process safety performance indicators for the refining and petrochemical industries. Tracking MOC compliance is a key part of Tier 3 (Leading) indicators, helping predict and prevent Tier 1 loss of primary containment (LOPC) events.' 
  }
];

const HelpCenter: React.FC = () => {
  const { language, startEmergencyMOC, addNotification, standards, saveStandard, deleteStandard, usefulLinks, saveUsefulLink, deleteUsefulLink, user } = useApp();
  const t = TRANSLATIONS[language];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | Article['category']>('All');
  const [activeTab, setActiveTab] = useState<'docs' | 'methodology' | 'standards' | 'workflow' | 'tutorials' | 'links'>('docs');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const categories: ('All' | Article['category'])[] = ['All', 'Safety', 'Technical', 'Compliance', 'Operations'];

  const handleDownloadSOP = async () => {
    setIsDownloading(true);
    // Simulate technical rendering and security clearance
    await new Promise(r => setTimeout(r, 1500));
    
    try {
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();
      const primaryColor = [30, 58, 138]; // Dark Blue

      // Header Box
      doc.setFillColor(30, 58, 138);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text("MOC STUDIO | TECHNICAL GOVERNANCE", 15, 20);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text("STANDARD OPERATING PROCEDURE: MOC-001-REV3", 15, 30);
      doc.text(`DATE: ${timestamp}`, 150, 30);

      // Section 1: Document Control
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text("1. DOCUMENT CONTROL & AUTHORIZATION", 15, 55);
      doc.setDrawColor(200, 200, 200);
      doc.line(15, 57, 195, 57);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const authInfo = [
        `Document Status: CONTROLLED COPY`,
        `Authorization: Chief Technology Officer / HSE Director`,
        `Authorized User: ${user?.name || 'Authorized Engineer'}`,
        `Clearance Role: ${user?.role || 'ENGINEER'}`,
        `Digital ID: ${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      ];
      authInfo.forEach((line, i) => doc.text(line, 20, 65 + (i * 6)));

      // Section 2: Lifecycle
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text("2. THE 5-STAGE LIFECYCLE PROTOCOL", 15, 105);
      doc.line(15, 107, 195, 107);

      const stages = [
        { s: "STAGE 01: INITIATION", d: "Technical boundaries defined via P&ID redlines or Asset Tags. Change category is mandatory." },
        { s: "STAGE 02: REVIEW", d: "Cross-functional assessment by Process, Mech, and Elec leads. Probability x Severity calculation." },
        { s: "STAGE 03: SIGN-OFF", d: "Risk Score 15+ requires HSE Director and Chief Engineer dual authorization." },
        { s: "STAGE 04: EXECUTION", d: "Physical implementation with real-time telemetry boundary monitoring." },
        { s: "STAGE 05: PSSR", d: "Pre-Startup Safety Review. Verification of safety critical elements (SCE)." }
      ];

      stages.forEach((stage, i) => {
        doc.setFont('helvetica', 'bold');
        doc.text(stage.s, 20, 115 + (i * 15));
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(stage.d, 20, 120 + (i * 15));
        doc.setFontSize(10);
      });

      // Section 3: Emergency
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text("3. EMERGENCY BYPASS PROTOCOLS", 15, 195);
      doc.line(15, 197, 195, 197);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const emergencyText = doc.splitTextToSize(
        "Emergency bypass is reserved strictly for 'Imminent Loss of Containment' or 'Life Safety' scenarios. " +
        "Bypassing triggers a mandatory 24-hour audit. Full retrospective review is required within 48 hours of intervention.",
        175
      );
      doc.text(emergencyText, 20, 205);

      // Section 4: Compliance
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text("4. COMPLIANCE ALIGNMENT", 15, 230);
      doc.line(15, 232, 195, 232);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text("- API RP 754: Process Safety Performance Indicators", 20, 240);
      doc.text("- ISO 31000: Risk Management Framework", 20, 246);
      doc.text("- NR-13: Pressurized Systems Standard", 20, 252);
      doc.text("- OSHA 1910.119: Process Safety Management", 20, 258);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("GENERATE BY MOC STUDIO GOVERNANCE ENGINE | SECURE DOCUMENT", 105, 285, { align: 'center' });

      doc.save(`MOC_Governance_SOP_v3.1_${Date.now()}.pdf`);
      
      addNotification({
        title: 'Governance PDF Exported',
        message: 'The technical lifecycle manual has been compiled and downloaded.',
        type: 'success'
      });
    } catch (err) {
      console.error(err);
      addNotification({
        title: 'Export Failed',
        message: 'Unable to compile PDF. Check system console.',
        type: 'error'
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Enhanced search and filtering
  const filteredArticles = useMemo(() => {
    return KNOWLEDGE_BASE.filter(article => {
      const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
      const matchesSearch = !searchTerm.trim() || 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  const filteredStandards = useMemo(() => {
    if (!searchTerm.trim()) return standards;
    const lowerQuery = searchTerm.toLowerCase();
    return standards.filter(s => 
      s.code.toLowerCase().includes(lowerQuery) || 
      s.title.toLowerCase().includes(lowerQuery) || 
      s.desc.toLowerCase().includes(lowerQuery)
    );
  }, [searchTerm, standards]);

  const filteredLinks = useMemo(() => {
    if (!searchTerm.trim()) return usefulLinks;
    const lowerQuery = searchTerm.toLowerCase();
    return usefulLinks.filter(l => 
      l.label.toLowerCase().includes(lowerQuery) || 
      l.url.toLowerCase().includes(lowerQuery)
    );
  }, [searchTerm, usefulLinks]);

  const helpTabs = useMemo(() => [
    { id: 'docs', label: t.knowledgeBase, icon: <BookMarked size={18} /> },
    { id: 'methodology', label: t.methodology, icon: <Scale size={18} /> },
    { id: 'standards', label: t.standards, icon: <Globe size={18} /> },
    { id: 'workflow', label: t.workflow, icon: <Milestone size={18} /> },
    { id: 'tutorials', label: t.tutorials, icon: <Video size={18} /> },
    { id: 'links', label: language === 'pt-BR' ? 'Links Úteis' : 'Useful Links', icon: <Globe2 size={18} /> }
  ], [t, language]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">
      {/* Hero Section */}
      <header className="relative p-12 lg:p-20 rounded-[4rem] overflow-hidden group border border-black/5 dark:border-white/5 bg-slate-100/50 dark:bg-slate-900/60 shadow-2xl transition-colors duration-500 text-center">
        <div className="absolute top-0 right-0 p-20 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000 dark:text-white text-slate-900">
           <Terminal size={300} />
        </div>
        <div className="relative z-10 flex flex-col items-center space-y-8">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">
            {language === 'pt-BR' ? 'Enciclopédia de Engenharia Industrial' : 'Industrial Engineering Encyclopedia'}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none max-w-4xl">
            {language === 'pt-BR' ? 'Nexo de Conhecimento Técnico' : 'Technical Knowledge Nexus'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-2xl leading-relaxed uppercase tracking-tight opacity-70">
            {language === 'pt-BR' ? 'Documentação técnica rigorosa, normas API/NR e diretrizes de governança.' : 'Rigorous technical documentation, API/NR standards, and governance guidelines.'}
          </p>
          
          <div className="relative mt-4 w-full max-w-3xl group">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={24} />
            <input 
              type="text" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder={language === 'pt-BR' ? 'Pesquisar documentação técnica...' : 'Search technical repository (e.g. HAZOP, PSSR)...'} 
              className="w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-[3rem] py-8 pl-20 pr-12 text-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all shadow-2xl" 
            />
          </div>
        </div>
      </header>

      {/* Navigation Tab Bar */}
      <div className="flex justify-center py-4 px-4 sticky top-0 z-40 bg-transparent">
        <div className="inline-flex p-1.5 bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-2xl overflow-x-auto no-scrollbar max-w-full">
          {helpTabs.map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => { 
                setActiveTab(tab.id as any); 
                setSelectedArticle(null); 
              }} 
              className={`relative px-8 py-5 rounded-[3rem] text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all duration-300 shrink-0 ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-xl scale-105 z-10' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/5 active:scale-95'
              }`}
            >
              {tab.icon} 
              <span className="hidden md:inline">{tab.label}</span>
              {activeTab === tab.id && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          {activeTab === 'docs' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {selectedArticle ? (
                <div className="glass-panel p-10 lg:p-14 rounded-[3.5rem] border-slate-200 dark:border-white/10 animate-in slide-in-from-right-4">
                  <button 
                    onClick={() => setSelectedArticle(null)}
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-500 font-black text-[10px] uppercase tracking-widest mb-10 hover:translate-x-[-4px] transition-transform"
                  >
                    <ArrowLeft size={16} /> {language === 'pt-BR' ? 'Voltar para Biblioteca' : 'Back to Library'}
                  </button>
                  <div className="space-y-10">
                     <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex gap-3">
                           <span className="px-4 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-500/20">{selectedArticle.category}</span>
                           <span className="px-4 py-1.5 bg-slate-500/10 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-500/20">{selectedArticle.level} GRADE</span>
                        </div>
                        <div className="flex gap-6 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                           <span className="flex items-center gap-2"><Calendar size={14} /> Updated {selectedArticle.lastUpdated}</span>
                        </div>
                     </div>
                     <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-tight">{selectedArticle.title}</h2>
                     <div className="p-10 lg:p-14 bg-slate-50 dark:bg-slate-950 rounded-[3rem] border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 leading-relaxed text-lg shadow-inner font-medium">
                        {selectedArticle.content}
                        <div className="mt-12 pt-10 border-t border-slate-200 dark:border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-4">
                              <h4 className="text-xs font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest flex items-center gap-2"><FileCheck size={16} /> Compliance Note</h4>
                              <p className="text-xs text-slate-500">This documentation adheres to the industrial governance framework and has been verified by the Safety Engineering Department.</p>
                           </div>
                           <div className="space-y-4">
                              <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest flex items-center gap-2"><ArrowUpRight size={16} /> Related Standards</h4>
                              <p className="text-xs text-slate-500 font-mono">ISO 31000, API RP 754, NR-13 Annex A</p>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Category Filter */}
                  <div className="flex flex-wrap gap-2 px-2">
                    {categories.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                          selectedCategory === cat 
                            ? 'bg-blue-600 text-white shadow-lg' 
                            : 'bg-white dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredArticles.length > 0 ? filteredArticles.map((article) => (
                      <div 
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className="glass-panel p-8 rounded-[3rem] border-slate-200 dark:border-white/5 hover:border-blue-500/30 transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-6">
                            <span className="text-[9px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest px-3 py-1 bg-blue-500/10 rounded-lg border border-blue-500/20">
                              {article.category}
                            </span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{article.readTime}</span>
                          </div>
                          <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tight leading-tight mb-4">
                            {article.title}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed font-medium mb-6">
                            {article.abstract}
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-white/5">
                           <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                              <Microscope size={12} /> {article.level}
                           </div>
                           <ArrowRight size={18} className="text-blue-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-30 grayscale border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[3rem]">
                        <FileSearch size={64} className="mb-4 text-slate-400" />
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">No documentation found matching your criteria</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'methodology' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
               <div className="glass-panel p-10 lg:p-14 rounded-[4rem] border-slate-200 dark:border-white/10">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-12 flex items-center gap-4">
                    <Scale size={32} className="text-blue-600 dark:text-blue-500" /> {language === 'pt-BR' ? 'Framework de Risco MOC Studio' : 'Risk Management Framework'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                     <div className="space-y-8">
                        <div className="space-y-4">
                          <h4 className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2"><Activity size={18} /> Quantitative Scoring ($P \times S$)</h4>
                          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                            Our proprietary engine calculates composite risk based on the intersection of Probability of occurrence and Severity of impact across four dimensions: Safety, Environment, Operation, and Reputation.
                          </p>
                        </div>
                        
                        <div className="space-y-6">
                           {[
                             { threshold: '15+', label: 'Extreme Risk', desc: 'Requires HSE Director & Technical Manager dual sign-off. Immediate safeguards must be verified.', color: 'red' },
                             { threshold: '8-14', label: 'High Risk', desc: 'Requires department head sign-off and multidisciplinary peer review.', color: 'orange' },
                             { threshold: '4-7', label: 'Medium Risk', desc: 'Managed at operational level with standard technical lead clearance.', color: 'yellow' }
                           ].map((item, i) => (
                             <div key={i} className="flex items-start gap-6 p-5 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-sm bg-${item.color}-600/20 text-${item.color}-500 border border-${item.color}-500/20`}>
                                  {item.threshold}
                                </div>
                                <div className="space-y-1">
                                   <span className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">{item.label}</span>
                                   <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed block">{item.desc}</span>
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>

                     <div className="flex flex-col gap-6">
                        <div className="bg-slate-100 dark:bg-slate-950/50 p-8 rounded-[3rem] border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center space-y-6 text-center">
                           <div className="w-16 h-16 rounded-3xl bg-blue-600/10 flex items-center justify-center text-blue-500"><ShieldCheck size={32} /></div>
                           <div>
                              <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mb-2 text-center">Governance Reliability</div>
                              <div className="text-6xl font-black text-slate-900 dark:text-white">99.9%</div>
                           </div>
                           <div className="w-full h-1.5 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 w-[99.9%]"></div>
                           </div>
                           <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest max-w-xs mx-auto">Deterministic algorithm compliant with ISO 31000 technical standards.</p>
                        </div>

                        <div className="p-8 rounded-[3rem] bg-emerald-600/5 border border-emerald-500/20 space-y-4">
                           <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest flex items-center gap-2"><CheckSquare size={16} /> Safe Operating Envelope</h4>
                           <p className="text-[11px] text-slate-500 leading-relaxed font-medium">All MOC Studio risk assessments are benchmarked against the facility's Safe Operating Envelope (SOE) to ensure technical boundary integrity.</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'workflow' && (
             <div className="glass-panel p-10 lg:p-14 rounded-[4rem] border-emerald-500/20 bg-emerald-950/5 relative overflow-hidden animate-in slide-in-from-bottom-8">
                <div className="absolute top-0 right-0 p-20 opacity-5 -rotate-12 dark:text-emerald-500 text-emerald-900">
                   <Milestone size={300} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-12 flex items-center gap-4 relative z-10">
                   <Milestone size={32} className="text-emerald-600 dark:text-emerald-500" /> 
                   {language === 'pt-BR' ? 'Ciclo de Vida MOC Studio' : 'MOC Lifecycle Blueprint'}
                </h3>
                <div className="relative pl-14 space-y-12 before:absolute before:left-6 before:top-2 before:bottom-2 before:w-[3px] before:bg-gradient-to-b before:from-emerald-500 before:to-emerald-500/5 relative z-10">
                  {[
                    { step: '01', title: 'Initiation & Scoping', desc: 'Define change technical boundaries, discipline impact, and regulatory requirements (e.g. NR-13/API). Stakeholders identified.', icon: <Plus size={16} /> },
                    { step: '02', title: 'Multidisciplinary Review', desc: 'Technical assessment by specialized disciplines (Process, Mech, Elec). Preliminary risk matrix calculation.', icon: <Microscope size={16} /> },
                    { step: '03', title: 'Management Approval', desc: 'Formal sign-off by authorized leads. High-risk requests escalated to HSE Director. Digital signature logged.', icon: <CheckCircle2 size={16} /> },
                    { step: '04', title: 'Execution & P&ID Redlining', desc: 'Physical implementation of change. Real-time telemetry monitoring. Documentation updates in digital twin.', icon: <Zap size={16} /> },
                    { step: '05', title: 'PSSR & Final Close-out', desc: 'Pre-Startup Safety Review completed. Verification of safeguards and training. Dossier archived in governance registry.', icon: <ClipboardCheck size={16} /> }
                  ].map((s, idx) => (
                    <div key={s.step} className="relative group animate-in slide-in-from-left-6" style={{ animationDelay: `${idx * 150}ms` }}>
                       <div className="absolute -left-[54px] top-0 w-10 h-10 rounded-2xl bg-white dark:bg-slate-950 border-4 border-emerald-500 flex items-center justify-center z-10 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all">
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500">{s.step}</span>
                       </div>
                       <div className="bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/5 group-hover:border-emerald-500/30 p-8 rounded-[2.5rem] transition-all">
                          <h4 className="text-base font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-[0.2em] mb-3 flex items-center justify-between">
                            <span className="flex items-center gap-3">{s.icon} {s.title}</span>
                            <span className="text-[8px] font-black bg-emerald-500/10 px-2 py-1 rounded text-emerald-600 dark:text-emerald-500 border border-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity">GOVERNANCE STAGE</span>
                          </h4>
                          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium max-w-xl">{s.desc}</p>
                       </div>
                    </div>
                  ))}
                </div>
                <div className="mt-12 pt-10 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row gap-6 relative z-10">
                   <button 
                    onClick={handleDownloadSOP}
                    disabled={isDownloading}
                    className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:opacity-50 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-2xl transition-all active:scale-95 group/btn"
                   >
                      {isDownloading ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <ScrollText size={18} className="group-hover/btn:scale-110 transition-transform" />
                      )}
                      {isDownloading ? 'Compiling Manual...' : 'Download Governance SOP (PDF)'}
                   </button>
                   <button onClick={() => setActiveTab('tutorials')} className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-white dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-white/10 text-emerald-600 dark:text-emerald-500 rounded-[2rem] font-black uppercase text-[10px] tracking-widest border border-emerald-600/20 dark:border-emerald-500/20 transition-all active:scale-95">
                      <PlayCircle size={18} /> Training Masterclass
                   </button>
                </div>
             </div>
          )}

          {activeTab === 'standards' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex justify-end">
                  <button 
                    onClick={() => {}} // Handle addition via context if needed
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
                  >
                    <Plus size={16} /> Registry New Standard
                  </button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredStandards.length > 0 ? filteredStandards.map((s, idx) => (
                    <div key={idx} className="glass-panel p-8 rounded-[3rem] border-slate-200 dark:border-white/5 group hover:border-emerald-500/30 transition-all relative bg-white dark:bg-slate-900/40">
                       <div className="flex justify-between items-start mb-6">
                          <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-500 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                             <ClipboardCheck size={20} />
                          </div>
                          <div className="flex items-center gap-2">
                             <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest px-3 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">{s.status}</span>
                          </div>
                       </div>
                       <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{s.code}</h3>
                       <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">{s.title}</h4>
                       <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-8 h-20 line-clamp-4">
                         {s.desc}
                       </p>
                       <button className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 font-black text-[10px] uppercase tracking-widest hover:translate-x-2 transition-all">
                          Access Registry <ExternalLink size={14} />
                       </button>
                    </div>
                  )) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-30 grayscale">
                      <Globe size={64} className="mb-4 text-slate-400" />
                      <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">No matching standards</p>
                    </div>
                  )}
               </div>
            </div>
          )}

          {activeTab === 'links' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredLinks.length > 0 ? filteredLinks.map((link) => (
                    <button 
                      key={link.id}
                      onClick={() => window.open(link.url, '_blank')}
                      className="glass-panel p-8 rounded-[3rem] border-slate-200 dark:border-white/5 hover:border-blue-500/30 transition-all text-left flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <LinkIcon size={20} />
                        </div>
                        <div>
                          <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-widest group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{link.label}</h4>
                          <p className="text-[10px] text-slate-400 font-bold truncate max-w-[200px]">{link.url}</p>
                        </div>
                      </div>
                      <ArrowUpRight size={16} className="text-slate-400 group-hover:text-blue-500 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </button>
                  )) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-30 grayscale">
                      <LinkIcon size={64} className="mb-4 text-slate-400" />
                      <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">No matching directory links</p>
                    </div>
                  )}
               </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="glass-panel p-10 rounded-[3.5rem] bg-rose-600/10 border-rose-500/20 group hover:border-rose-500/40 transition-all shadow-xl">
            <div className="w-16 h-16 bg-rose-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-rose-600/20 mb-8 group-hover:scale-110 group-hover:rotate-12 transition-all">
               <ShieldAlert size={32} />
            </div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">{t.emergencyProtocol}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-10 font-bold uppercase tracking-tight">
              {language === 'pt-BR' ? 'Protocolos de desvio acelerados para situações de risco crítico imediato. Ignore as filas de revisão padrão com supervisão de auditoria.' : 'Accelerated bypass protocols for immediate critical risk situations. Bypass standard review queues with mandatory audit oversight.'}
            </p>
            <button 
              onClick={startEmergencyMOC} 
              className="w-full bg-rose-600 hover:bg-rose-500 text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <Terminal size={18} />
              {t.initiateBypass}
            </button>
          </div>

          <div className="glass-panel p-10 rounded-[3.5rem] border-slate-200 dark:border-white/5 space-y-8 shadow-xl">
             <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-4">
                    <span className="w-8 h-px bg-slate-200 dark:bg-white/10"></span> {language === 'pt-BR' ? 'Atalhos' : 'Shortcuts'}
                </h4>
                <button className="text-blue-500 hover:text-blue-600 transition-colors"><Settings2 size={16} /></button>
             </div>
             <div className="space-y-4">
                {usefulLinks.length > 0 ? usefulLinks.slice(0, 6).map((link) => (
                  <button 
                    key={link.id}
                    onClick={() => window.open(link.url, '_blank')}
                    className="w-full flex items-center justify-between p-5 bg-white dark:bg-white/5 hover:bg-blue-600/10 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-blue-500/30 transition-all group/btn"
                  >
                    <span className="flex items-center gap-4 text-xs font-black text-slate-500 dark:text-slate-400 group-hover/btn:text-blue-600 dark:group-hover/btn:text-blue-400 uppercase tracking-widest">
                       <LinkIcon size={14} /> {link.label}
                    </span>
                    <ArrowUpRight size={16} className="text-slate-300 dark:text-slate-600 group-hover/btn:text-blue-600 dark:group-hover/btn:text-blue-400 transition-all" />
                  </button>
                )) : (
                  <div className="py-10 text-center opacity-20 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
                    <LinkIcon size={32} className="mx-auto mb-2 text-slate-400" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">No links defined</p>
                  </div>
                )}
             </div>
             <button onClick={() => setActiveTab('links')} className="w-full text-center text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-500 hover:underline">View Global Directory</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;

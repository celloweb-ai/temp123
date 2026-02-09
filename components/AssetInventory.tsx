
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS, FACILITIES } from '../constants';
import { 
  Search, Thermometer, Droplets, Wind, Activity, History, ChevronRight, 
  Box, Plus, Edit2, Trash2, X, Save, AlertCircle, Cpu, Gauge,
  Paperclip, Upload, FileText, Image as ImageIcon, Maximize2, Download,
  CheckCircle2, Info, Tag, Layers, Calendar, HardDrive, ShieldCheck,
  Zap, Settings2, BarChart3, Clock, ArrowUpRight, Factory, AlertTriangle,
  Stethoscope, Microscope, Settings, Ruler, Hammer, FileCheck, ClipboardList,
  Waves, Radio, Binary, Loader2
} from 'lucide-react';
import { ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Asset, Attachment } from '../types';

const AssetInventory: React.FC = () => {
  const { language, assets, mocs, saveAsset, deleteAsset, addNotification } = useApp();
  const t = TRANSLATIONS[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [healthIndex, setHealthIndex] = useState(98.4);
  const [isSaving, setIsSaving] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [formAsset, setFormAsset] = useState<Partial<Asset>>({
    tag: '',
    name: '',
    facility: FACILITIES[0].name,
    type: 'Valve',
    category: 'Instrumentation',
    material: 'Carbon Steel',
    lastMaint: new Date().toISOString().split('T')[0],
    parameters: { temperature: 0, pressure: 0, flow: 0 },
    attachments: []
  });
  
  const [assetToPurge, setAssetToPurge] = useState<string | null>(null);

  useEffect(() => {
    if (assets.length > 0 && !selectedAsset) {
      setSelectedAsset(assets[0]);
    }
  }, [assets]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!selectedAsset) return;
      const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setTelemetry(prev => [...prev, { time, temp: (selectedAsset.parameters.temperature || 0) + (Math.random() - 0.5) * 5, press: (selectedAsset.parameters.pressure || 0) + (Math.random() - 0.5) * 10 }].slice(-20));
      setHealthIndex(prev => parseFloat(Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 0.2)).toFixed(1)));
    }, 2000);
    return () => clearInterval(interval);
  }, [selectedAsset?.tag]);

  const filteredAssets = assets.filter(a => 
    a.tag.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenEdit = (asset: Asset) => {
    setModalMode('edit');
    setFormAsset({ ...asset });
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setFormAsset({
      tag: '',
      name: '',
      facility: FACILITIES[0].name,
      type: 'Valve',
      category: 'Instrumentation',
      material: 'Carbon Steel',
      lastMaint: new Date().toISOString().split('T')[0],
      parameters: { temperature: 0, pressure: 0, flow: 0 },
      attachments: []
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAsset.tag || !formAsset.name) return;
    
    setIsSaving(true);
    try {
      await saveAsset(formAsset as Asset);
      setIsModalOpen(false);
      addNotification({ 
        title: language === 'pt-BR' ? 'Sincronização de Registro' : 'Registry Sync Success', 
        message: `Asset ${formAsset.tag} digitized successfully.`, 
        type: 'success' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePurge = async (tag: string) => {
    await deleteAsset(tag);
    setAssetToPurge(null);
    if (selectedAsset?.tag === tag) {
        setSelectedAsset(assets.length > 1 ? assets.find(a => a.tag !== tag) || null : null);
    }
    addNotification({ 
      title: language === 'pt-BR' ? 'Ativo Expurgado' : 'Asset Purged', 
      message: `${tag} has been removed from the digital twin repository.`, 
      type: 'warning' 
    });
  };

  const currentTemp = telemetry.length > 0 ? telemetry[telemetry.length - 1].temp : selectedAsset?.parameters.temperature || 0;
  const currentPress = telemetry.length > 0 ? telemetry[telemetry.length - 1].press : selectedAsset?.parameters.pressure || 0;
  const currentFlow = selectedAsset?.parameters.flow || 0;

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight leading-none">{language === 'pt-BR' ? 'Repositório de Gêmeos Digitais' : 'Digital Twin Repository'}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">{language === 'pt-BR' ? 'Monitoramento de Ativos em Tempo Real' : 'Real-Time Lifecycle Asset Monitoring'}</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={t.tagSearch} 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm"
            />
          </div>
          <button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black uppercase tracking-widest text-[10px] transition-all shadow-xl active:scale-95">
            <Plus size={18} strokeWidth={3} /> <span className="hidden md:inline">{t.commissionAsset}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-3 flex flex-col min-h-0">
          <div className="glass-panel rounded-[2.5rem] flex-1 flex flex-col overflow-hidden">
            <div className="p-5 border-b border-white/5 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <Layers size={14} /> {language === 'pt-BR' ? 'Registro Total' : 'Total Registry'}: {assets.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
              {filteredAssets.map(asset => (
                <button
                  key={asset.tag} 
                  onClick={() => setSelectedAsset(asset)}
                  className={`w-full p-4 rounded-3xl transition-all text-left flex items-start gap-4 group ${selectedAsset?.tag === asset.tag ? 'bg-blue-600 text-white shadow-xl' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300'}`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${selectedAsset?.tag === asset.tag ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}><Box size={18} /></div>
                  <div className="min-w-0">
                    <div className="text-[9px] font-black uppercase tracking-widest mb-0.5 opacity-70 font-mono">{asset.tag}</div>
                    <div className="text-sm font-black truncate">{asset.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-9 flex flex-col min-h-0 overflow-y-auto custom-scrollbar space-y-6">
          {selectedAsset ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4 glass-panel p-6 rounded-[2.5rem] flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center relative bg-slate-100 dark:bg-black/20 p-1 shrink-0">
                    <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(${healthIndex > 90 ? '#10b981' : '#f59e0b'} ${healthIndex}%, rgba(0,0,0,0.1) 0)` }}></div>
                    <div className="absolute inset-[4px] rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center shadow-lg"><span className="text-xl font-black text-slate-900 dark:text-white">{healthIndex}%</span></div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{t.healthIndex}</h4>
                    <p className="text-xs font-black" style={{ color: healthIndex > 90 ? '#10b981' : '#f59e0b' }}>{healthIndex > 90 ? (language === 'pt-BR' ? 'ÓTIMO' : 'OPTIMAL') : (language === 'pt-BR' ? 'ESTÁVEL' : 'STABLE')}</p>
                    <span className="text-[8px] font-black text-slate-400 uppercase mt-2 block">{t.liveSync}</span>
                  </div>
                </div>

                <div className="md:col-span-8 glass-panel p-6 rounded-[2.5rem] flex flex-col justify-center gap-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><Gauge size={14} className="text-blue-500" /> {t.processParams}</h4>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-tight"><span className="text-slate-500">{t.temperature}</span> <span className="text-slate-900 dark:text-white font-mono">{currentTemp.toFixed(1)}°C</span></div>
                      <div className="h-1 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${Math.min(100, (currentTemp/150)*100)}%` }}></div></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-tight"><span className="text-slate-500">{t.pressure}</span> <span className="text-slate-900 dark:text-white font-mono">{currentPress.toFixed(1)} Bar</span></div>
                      <div className="h-1 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${Math.min(100, (currentPress/250)*100)}%` }}></div></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-tight"><span className="text-slate-500">{t.flow}</span> <span className="text-slate-900 dark:text-white font-mono">{currentFlow.toFixed(0)} m³/h</span></div>
                      <div className="h-1 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${Math.min(100, (currentFlow/2000)*100)}%` }}></div></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-4 glass-panel p-8 rounded-[3.5rem] space-y-6">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-3"><Microscope size={18} className="text-blue-500" /> {t.technicalDossier}</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-black/5 dark:border-white/5 py-3"><span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{t.tag}</span> <span className="text-xs font-mono font-black text-blue-500 dark:text-blue-400">{selectedAsset.tag}</span></div>
                    <div className="flex justify-between border-b border-black/5 dark:border-white/5 py-3"><span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{language === 'pt-BR' ? 'Categoria' : 'Category'}</span> <span className="text-xs font-black text-slate-900 dark:text-white uppercase">{selectedAsset.category}</span></div>
                    <div className="flex justify-between border-b border-black/5 dark:border-white/5 py-3"><span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{language === 'pt-BR' ? 'Material' : 'Material'}</span> <span className="text-xs font-black text-slate-900 dark:text-white uppercase">{selectedAsset.material}</span></div>
                    <div className="flex justify-between border-b border-black/5 dark:border-white/5 py-3"><span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{language === 'pt-BR' ? 'Tipo' : 'Type'}</span> <span className="text-xs font-black text-slate-900 dark:text-white uppercase">{selectedAsset.type}</span></div>
                  </div>
                  <div className="space-y-3 pt-6">
                    <button onClick={() => handleOpenEdit(selectedAsset)} className="w-full flex items-center justify-center gap-2 py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 transition-all active:scale-95"><Edit2 size={14} /> {language === 'pt-BR' ? 'Atualizar Dossier' : 'Update Dossier'}</button>
                    <button onClick={() => setAssetToPurge(selectedAsset.tag)} className="w-full flex items-center justify-center gap-2 py-4 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 transition-all active:scale-95"><Trash2 size={14} /> {t.purgeAsset}</button>
                  </div>
                </div>

                <div className="md:col-span-8 glass-panel p-8 rounded-[3.5rem]">
                   <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-3 mb-8"><Activity size={18} className="text-emerald-500" /> {language === 'pt-BR' ? 'Fluxo Telemétrico' : 'Parametric Stream'}</h3>
                   <div className="h-60 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={telemetry}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke={language === 'pt-BR' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'} /><XAxis dataKey="time" hide={true} /><YAxis hide={true} /><Tooltip /><Area type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={3} fillOpacity={0.1} fill="#f97316" /><Area type="monotone" dataKey="press" stroke="#3b82f6" strokeWidth={3} fillOpacity={0.1} fill="#3b82f6" /></AreaChart></ResponsiveContainer></div>
                   <div className="flex justify-center gap-8 mt-4">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.temperature}</span></div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.pressure}</span></div>
                   </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-30 grayscale"><Box size={100} className="mb-4 text-blue-500" /><p className="text-xs font-black uppercase tracking-widest">{t.adjustFilters}</p></div>
          )}
        </div>
      </div>

      {/* Asset Commissioning Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="glass-panel w-full max-w-2xl rounded-[3.5rem] overflow-hidden flex flex-col relative z-10 shadow-2xl border-white/10">
             <header className="px-10 py-8 border-b border-white/10 flex justify-between items-center bg-blue-600/5">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl">
                      <Box size={28} />
                   </div>
                   <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {modalMode === 'add' ? t.commissionAsset : language === 'pt-BR' ? 'Modificar Gêmeo Digital' : 'Modify Digital Twin'}
                    </h3>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mt-1">Industrial Asset Lifecycle Management</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"><X size={28} /></button>
             </header>

             <form onSubmit={handleSave} className="p-12 space-y-6 overflow-y-auto custom-scrollbar max-h-[70vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Asset Tag</label>
                      <input 
                        required
                        disabled={modalMode === 'edit'}
                        value={formAsset.tag}
                        onChange={(e) => setFormAsset({...formAsset, tag: e.target.value.toUpperCase()})}
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-6 text-sm font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all uppercase disabled:opacity-50"
                        placeholder="e.g. VAL-101-XV"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Asset Nomenclature</label>
                      <input 
                        required
                        value={formAsset.name}
                        onChange={(e) => setFormAsset({...formAsset, name: e.target.value})}
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-6 text-sm font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        placeholder="e.g. Export Isolation Valve"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">{language === 'pt-BR' ? 'Categoria' : 'Category'}</label>
                      <select 
                        value={formAsset.category}
                        onChange={(e) => setFormAsset({...formAsset, category: e.target.value})}
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-6 text-sm font-black text-slate-900 dark:text-white outline-none"
                      >
                         <option value="Instrumentation">Instrumentation</option>
                         <option value="Rotating">Rotating Equipment</option>
                         <option value="Static">Static Equipment</option>
                         <option value="Safety">Safety Systems</option>
                         <option value="Specialty">Specialty</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">{language === 'pt-BR' ? 'Material' : 'Material'}</label>
                      <input 
                        required
                        value={formAsset.material}
                        onChange={(e) => setFormAsset({...formAsset, material: e.target.value})}
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-6 text-sm font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        placeholder="e.g. Duplex F51"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">{language === 'pt-BR' ? 'Instalação' : 'Facility'}</label>
                      <select 
                        value={formAsset.facility}
                        onChange={(e) => setFormAsset({...formAsset, facility: e.target.value})}
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-6 text-sm font-black text-slate-900 dark:text-white outline-none"
                      >
                         {FACILITIES.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                      </select>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Asset Type</label>
                      <input 
                        required
                        value={formAsset.type}
                        onChange={(e) => setFormAsset({...formAsset, type: e.target.value})}
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-6 text-sm font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        placeholder="e.g. Centrifugal Pump"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Last Maintenance</label>
                      <input 
                        type="date"
                        required
                        value={formAsset.lastMaint}
                        onChange={(e) => setFormAsset({...formAsset, lastMaint: e.target.value})}
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-6 text-sm font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      />
                   </div>
                </div>

                <footer className="pt-6 border-t border-black/5 dark:border-white/10 flex justify-end gap-6">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="px-8 py-4 rounded-2xl font-black text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-[11px] uppercase tracking-widest"
                  >
                    Abort
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 shadow-xl transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {modalMode === 'add' ? 'Commission Asset' : 'Commit Registry'}
                  </button>
                </footer>
             </form>
          </div>
        </div>
      )}

      {/* Purge Confirmation */}
      {assetToPurge && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setAssetToPurge(null)}></div>
          <div className="glass-panel w-full max-w-md rounded-[3.5rem] p-12 relative z-10 shadow-2xl border-white/10 text-center animate-in zoom-in">
             <AlertTriangle size={48} className="mx-auto text-red-500 mb-8" />
             <h3 className="text-3xl font-black mb-4 text-slate-900 dark:text-white uppercase">{t.purgeAsset}?</h3>
             <p className="text-slate-500 dark:text-slate-400 text-xs mb-10 leading-relaxed font-bold uppercase tracking-widest">
               {language === 'pt-BR' 
                ? 'Atenção: Esta ação é irreversível. Todos os dados telemétricos e registros do gêmeo digital serão apagados.' 
                : 'Warning: This action is irreversible. All telemetry data and digital twin registry entries will be erased.'}
             </p>
             <div className="flex gap-4">
                <button onClick={() => setAssetToPurge(null)} className="flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 border border-slate-200 dark:border-white/5">Abort</button>
                <button onClick={() => handlePurge(assetToPurge)} className="flex-1 py-5 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:bg-red-500 transition-all">Confirm Purge</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetInventory;

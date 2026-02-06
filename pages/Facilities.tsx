
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Search, MapPin, Anchor, X, Map as MapIcon, Layout, Edit2, Cpu, Trash2, AlertCircle, ExternalLink, Globe, Loader2, Navigation, Copy, CheckCircle2, Info } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../App';
import { Facility, UserRole, Asset } from '../types';
import L from 'leaflet';

// Componente Interno para o Mapa Interativo
const InteractiveMap = ({ lat, lng, name, locationName }: { lat: number, lng: number, name: string, locationName: string }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && !leafletMap.current) {
      leafletMap.current = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 12,
        zoomControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(leafletMap.current);

      // Marcador customizado com efeito pulsar (CSS no index.html)
      const customIcon = L.divIcon({
        html: `<div class="relative flex items-center justify-center">
                 <div class="absolute w-12 h-12 bg-blue-600/30 rounded-full animate-ping"></div>
                 <div class="relative p-2.5 bg-blue-600 rounded-full border-2 border-white shadow-2xl text-white">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 7.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
                 </div>
               </div>`,
        className: '',
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      });

      L.marker([lat, lng], { icon: customIcon })
        .addTo(leafletMap.current)
        .bindPopup(`<div class="p-2 font-black text-gray-900">${name}</div>`)
        .openPopup();
      
      L.control.zoom({ position: 'bottomright' }).addTo(leafletMap.current);
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [lat, lng, name, locationName]);

  return <div ref={mapRef} className="w-full h-full rounded-none lg:rounded-l-[3rem] z-0 overflow-hidden" />;
};

const Facilities = () => {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map Modal State
  const [geoData, setGeoData] = useState<{ lat: number, lng: number, address?: string, mapUrl?: string, snippet?: string } | null>(null);
  const [selectedFacilityForMap, setSelectedFacilityForMap] = useState<Facility | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [copied, setCopied] = useState(false);

  // CRUD Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [facilityToDelete, setFacilityToDelete] = useState<Facility | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    type: 'FPSO',
    status: 'Ativo' as 'Ativo' | 'Inativo' | 'Manutenção'
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fData, aData] = await Promise.all([
        api.getFacilities(),
        api.getAssets()
      ]);
      setFacilities(fData);
      setAssets(aData);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (facility?: Facility) => {
    if (facility) {
      setEditingFacility(facility);
      setFormData({
        name: facility.name,
        location: facility.location,
        type: facility.type,
        status: facility.status
      });
    } else {
      setEditingFacility(null);
      setFormData({ name: '', location: '', type: 'FPSO', status: 'Ativo' });
    }
    setIsCreateModalOpen(true);
  };

  const handleOpenMap = async (facility: Facility) => {
    setSelectedFacilityForMap(facility);
    setIsLocating(true);
    try {
      const data = await api.geocodeFacilityLocation(facility.location);
      setGeoData(data);
    } catch (e) {
      alert("Não foi possível carregar a localização geográfica.");
    } finally {
      setIsLocating(false);
    }
  };

  const handleCopyCoords = () => {
    if (geoData) {
      const text = `${geoData.lat.toFixed(6)}, ${geoData.lng.toFixed(6)}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (editingFacility) {
        const updated: Facility = {
          ...editingFacility,
          name: formData.name,
          location: formData.location,
          type: formData.type,
          status: formData.status
        };
        await api.updateFacility(updated);
      } else {
        const newFacility: Facility = {
          id: `FAC-${Date.now()}`,
          name: formData.name,
          location: formData.location,
          type: formData.type,
          status: formData.status
        };
        await api.createFacility(newFacility);
      }
      
      await fetchData();
      setIsCreateModalOpen(false);
      setEditingFacility(null);
      setFormData({ name: '', location: '', type: 'FPSO', status: 'Ativo' });
    } catch (err: any) {
      alert("Erro ao salvar unidade: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFacility = async () => {
    if (!facilityToDelete || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.deleteFacility(facilityToDelete.id);
      await fetchData();
      setIsDeleteConfirmOpen(false);
      setFacilityToDelete(null);
    } catch (err: any) {
      alert("Erro ao excluir unidade: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = facilities.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canWrite = user?.role === UserRole.ADMIN || user?.role === UserRole.GERENTE_INSTALACAO;

  const getAssetCount = (facilityId: string) => {
    return assets.filter(a => a.facilityId === facilityId).length;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Unidades Operacionais</h1>
          <p className="text-gray-500 dark:text-slate-400">Gestão centralizada de ativos e geolocalização de infraestrutura.</p>
        </div>
        {canWrite && (
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none font-bold"
          >
            <Plus size={20} />
            Nova Unidade
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou localização..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          <div className="col-span-full py-20 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">
            Consultando Instalações...
          </div>
        ) : filtered.length > 0 ? filtered.map(facility => (
          <div 
            key={facility.id} 
            className="group relative bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-slate-700 transition-all hover:shadow-2xl"
          >
            <div className="flex items-start justify-between mb-8">
              <div className="p-4 bg-blue-50 dark:bg-slate-700 rounded-2xl text-blue-600 dark:text-blue-400 shadow-inner">
                <Anchor size={28} />
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm ${
                  facility.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 
                  facility.status === 'Manutenção' ? 'bg-amber-100 text-amber-700' : 
                  'bg-gray-100 text-gray-700'
                }`}>
                  {facility.status}
                </span>
              </div>
            </div>
            
            <h3 className="text-2xl font-black mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{facility.name}</h3>
            
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 mb-8 font-medium">
              <MapPin size={16} className="text-red-400" />
              {facility.location}
            </div>

            <div className="flex items-center gap-4 mb-8">
               <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-100 dark:border-slate-700">
                  <Cpu size={14} className="text-blue-500" />
                  <span className="text-xs font-black text-gray-700 dark:text-slate-300">{getAssetCount(facility.id)} Ativos</span>
               </div>
               <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-100 dark:border-slate-700">
                  <Layout size={14} className="text-indigo-500" />
                  <span className="text-xs font-black text-gray-700 dark:text-slate-300">{facility.type}</span>
               </div>
            </div>

            <div className="pt-6 border-t border-gray-50 dark:border-slate-700 flex items-center justify-between gap-2">
              <div className="flex gap-1 no-print">
                <button 
                  onClick={() => handleOpenMap(facility)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl font-black text-[10px] uppercase hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                >
                  <Globe size={14} /> Ver Mapa
                </button>
                {canWrite && (
                  <>
                    <button 
                      onClick={() => handleOpenModal(facility)}
                      className="p-2 hover:bg-blue-50 dark:hover:bg-slate-600 text-gray-400 hover:text-blue-600 rounded-xl transition-all"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => { setFacilityToDelete(facility); setIsDeleteConfirmOpen(true); }}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1">ID</p>
                <p className="text-xs font-mono font-bold text-gray-400">{facility.id}</p>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-32 text-center bg-white dark:bg-slate-800 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-slate-700">
             <Anchor size={64} className="text-gray-200 mx-auto mb-6" />
             <p className="text-gray-400 font-black uppercase tracking-widest">Nenhuma Unidade Operacional Registrada</p>
          </div>
        )}
      </div>

      {/* NOVO Modal de Mapa Geográfico Premium */}
      {(selectedFacilityForMap || isLocating) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-[3rem] w-full max-w-6xl shadow-2xl border border-gray-100 dark:border-slate-700 flex flex-col lg:flex-row h-[90vh] lg:h-[80vh] overflow-hidden animate-slideUp">
            
            {/* Esquerda: Mapa Interativo */}
            <div className="flex-[3] relative bg-gray-100 dark:bg-slate-900 order-2 lg:order-1">
              {isLocating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                   <Loader2 className="animate-spin text-blue-600" size={48} />
                   <p className="text-gray-400 font-black uppercase tracking-widest animate-pulse">Calculando Vetores via Gemini...</p>
                </div>
              ) : geoData && selectedFacilityForMap ? (
                <InteractiveMap 
                  lat={geoData.lat} 
                  lng={geoData.lng} 
                  name={selectedFacilityForMap.name} 
                  locationName={selectedFacilityForMap.location} 
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-12">
                   <AlertCircle className="text-red-500 mb-4" size={48} />
                   <h4 className="text-xl font-black mb-2">Erro de Geocodificação</h4>
                   <p className="text-gray-500 max-w-sm">O modelo Gemini não conseguiu extrair coordenadas precisas para esta localização estratégica.</p>
                </div>
              )}
            </div>

            {/* Direita: Painel de Metadados e Controle */}
            <div className="flex-[1.2] flex flex-col bg-white dark:bg-slate-800 border-l border-gray-100 dark:border-slate-700 order-1 lg:order-2">
              <div className="p-8 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                    <Navigation size={20} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Geo-Dossier</h3>
                </div>
                <button onClick={() => { setSelectedFacilityForMap(null); setGeoData(null); }} className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-2xl transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {geoData && (
                  <>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Unidade Selecionada</p>
                      <h4 className="text-2xl font-black text-gray-900 dark:text-white">{selectedFacilityForMap?.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-blue-600 font-bold">
                        <MapPin size={14} /> {selectedFacilityForMap?.location}
                      </div>
                    </div>

                    <div className="p-6 bg-gray-50 dark:bg-slate-900/50 rounded-[2rem] border border-gray-100 dark:border-slate-700 space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Coordenadas Digitais</p>
                        <button 
                          onClick={handleCopyCoords}
                          className={`flex items-center gap-1.5 text-[9px] font-black uppercase px-2 py-1 rounded-lg transition-all ${copied ? 'bg-emerald-100 text-emerald-600' : 'bg-white dark:bg-slate-800 text-gray-400 hover:text-blue-600'}`}
                        >
                          {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                          {copied ? 'Copiado' : 'Copiar'}
                        </button>
                      </div>
                      <p className="font-mono text-lg font-black text-gray-900 dark:text-white tracking-tighter">
                        {geoData.lat.toFixed(6)} <br/> {geoData.lng.toFixed(6)}
                      </p>
                    </div>

                    {geoData.address && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <Globe size={12} className="text-blue-500" /> Endereço Verificado (Grounding)
                        </p>
                        <p className="text-sm font-bold text-gray-700 dark:text-slate-300 leading-relaxed">
                          {geoData.address}
                        </p>
                      </div>
                    )}

                    {geoData.snippet && (
                      <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] border border-blue-100 dark:border-blue-900/30">
                        <div className="flex items-center gap-2 mb-3">
                          <Info size={16} className="text-blue-600" />
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Insight Estratégico</p>
                        </div>
                        <p className="text-xs font-medium text-blue-800 dark:text-blue-300 leading-relaxed italic">
                          "{geoData.snippet}"
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="p-8 border-t border-gray-100 dark:border-slate-700">
                {geoData?.mapUrl ? (
                  <a 
                    href={geoData.mapUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-xs uppercase hover:scale-[1.02] transition-all shadow-xl"
                  >
                    <ExternalLink size={16} /> Ver no Google Maps
                  </a>
                ) : (
                  <button disabled className="w-full py-4 bg-gray-100 dark:bg-slate-700 text-gray-400 rounded-2xl font-black text-xs uppercase cursor-not-allowed">
                    Maps Grounding Indisponível
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação / Edição de Unidade */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-[3rem] w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-slate-700 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-10 border-b border-gray-100 dark:border-slate-700">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                       {editingFacility ? <Edit2 size={24} /> : <Plus size={24} />}
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                         {editingFacility ? 'Alterar Unidade' : 'Cadastrar Unidade'}
                       </h3>
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                         {editingFacility ? 'Atualizar especificações da instalação técnica' : 'Adicionar instalação offshore ou onshore ao sistema'}
                       </p>
                    </div>
                  </div>
                  <button onClick={() => setIsCreateModalOpen(false)} className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-2xl transition-all">
                    <X size={24} />
                  </button>
               </div>
            </div>

            <form id="facilitySaveForm" onSubmit={handleSaveFacility} className="flex-1 overflow-y-auto p-10 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Layout size={12} className="text-blue-500" /> Nome da Unidade / Plataforma
                  </label>
                  <input 
                    required 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    placeholder="Ex: P-70 Itapu" 
                    className="w-full p-5 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-lg shadow-inner" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <MapIcon size={12} className="text-blue-500" /> Localização / Bacia
                  </label>
                  <input 
                    required 
                    type="text" 
                    value={formData.location} 
                    onChange={(e) => setFormData({...formData, location: e.target.value})} 
                    placeholder="Ex: Bacia de Santos - Bloco 4" 
                    className="w-full p-5 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-medium shadow-inner" 
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tipo de Ativo</label>
                    <select 
                      required 
                      value={formData.type} 
                      onChange={(e) => setFormData({...formData, type: e.target.value})} 
                      className="w-full p-5 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-medium appearance-none shadow-inner"
                    >
                      <option value="FPSO">FPSO (Floating Production)</option>
                      <option value="Fixa">Plataforma Fixa</option>
                      <option value="SS (Semi-sub)">SS (Semi-submersível)</option>
                      <option value="TLP">TLP (Tension Leg)</option>
                      <option value="Onshore">Planta Onshore</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Status Operacional</label>
                    <select 
                      required 
                      value={formData.status} 
                      onChange={(e) => setFormData({...formData, status: e.target.value as any})} 
                      className="w-full p-5 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-medium appearance-none shadow-inner"
                    >
                      <option value="Ativo">Ativo / Operação</option>
                      <option value="Inativo">Inativo / Hibernação</option>
                      <option value="Manutenção">Parada de Manutenção</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] border border-blue-100 dark:border-blue-800 flex items-start gap-4">
                 <AlertCircle className="text-blue-600 shrink-0 mt-1" size={20} />
                 <div>
                    <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Impacto na Conformidade</h4>
                    <p className="text-xs text-blue-700/70 dark:text-blue-300 font-medium leading-relaxed">
                      Alterações em unidades operacionais são registradas na trilha de auditoria para fins de conformidade com os padrões da ANP e NR-13.
                    </p>
                 </div>
              </div>
            </form>

            <div className="p-10 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/30 flex items-center justify-end gap-4">
               <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-8 py-4 bg-white dark:bg-slate-800 text-gray-500 border border-gray-100 dark:border-slate-700 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all">Cancelar</button>
               <button type="submit" form="facilitySaveForm" disabled={isSubmitting} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50">
                 {isSubmitting ? 'Salvando...' : (editingFacility ? 'Salvar Alterações' : 'Confirmar Cadastro')}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-12 max-w-lg w-full shadow-2xl animate-slideUp border border-red-50 dark:border-red-900/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-red-100 text-red-600 rounded-2xl shadow-inner"><Trash2 size={32} /></div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Remover Unidade?</h3>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-10 leading-relaxed">
              Você está prestes a remover a unidade <strong>{facilityToDelete?.name}</strong>. Esta ação não poderá ser desfeita e será registrada na trilha de auditoria de segurança.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setIsDeleteConfirmOpen(false)} className="flex-1 py-5 bg-gray-100 dark:bg-slate-700 rounded-[1.5rem] font-black text-sm hover:bg-gray-200 transition-all text-gray-700 dark:text-slate-300">Cancelar</button>
              <button onClick={handleDeleteFacility} disabled={isSubmitting} className="flex-1 py-5 bg-red-600 text-white rounded-[1.5rem] font-black text-sm hover:bg-red-700 shadow-xl shadow-red-100 dark:shadow-none transition-all active:scale-95">
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Facilities;

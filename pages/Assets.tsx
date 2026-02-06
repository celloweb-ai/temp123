
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Plus, Cpu, Activity, History, X, Factory, Tag as TagIcon, Layers, Edit2 } from 'lucide-react';
import { api } from '../services/api';
import { Asset, Facility, UserRole } from '../types';
import { useAuth } from '../App';

const Assets = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [formData, setFormData] = useState({
    tag: '',
    name: '',
    type: '',
    facilityId: '',
    status: 'Operacional'
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [assetData, facilityData] = await Promise.all([
        api.getAssets(),
        api.getFacilities()
      ]);
      setAssets(assetData);
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

  const handleOpenModal = (asset?: Asset) => {
    if (asset) {
      setEditingAsset(asset);
      setFormData({
        tag: asset.tag,
        name: asset.name,
        type: asset.type,
        facilityId: asset.facilityId,
        status: asset.status
      });
    } else {
      setEditingAsset(null);
      setFormData({ tag: '', name: '', type: '', facilityId: '', status: 'Operacional' });
    }
    setIsCreateModalOpen(true);
  };

  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (editingAsset) {
        const updated: Asset = {
          ...editingAsset,
          tag: formData.tag,
          name: formData.name,
          type: formData.type,
          facilityId: formData.facilityId,
          status: formData.status
        };
        await api.updateAsset(updated);
      } else {
        const newAsset: Asset = {
          id: `ASSET-${Date.now()}`,
          tag: formData.tag,
          name: formData.name,
          type: formData.type,
          facilityId: formData.facilityId,
          status: formData.status,
          lastMaintenance: new Date().toLocaleDateString()
        };
        await api.createAsset(newAsset);
      }
      
      await fetchData();
      setIsCreateModalOpen(false);
      setEditingAsset(null);
      setFormData({ tag: '', name: '', type: '', facilityId: '', status: 'Operacional' });
    } catch (err: any) {
      alert("Erro ao salvar equipamento: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = assets.filter(a => 
    a.tag.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canCreate = [UserRole.ADMIN, UserRole.GERENTE_INSTALACAO, UserRole.TECNICO_MANUTENCAO].includes(user?.role || UserRole.TECNICO_MANUTENCAO);

  const getFacilityName = (id: string) => {
    return facilities.find(f => f.id === id)?.name || 'Unidade Desconhecida';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Equipamentos & Ativos</h1>
          <p className="text-gray-500 dark:text-slate-400">Catálogo técnico de equipamentos críticos e telemetria.</p>
        </div>
        {canCreate && (
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none font-bold"
          >
            <Plus size={20} />
            Adicionar Equipamento
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por TAG, Nome ou Tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">
            Sincronizando Ativos...
          </div>
        ) : filtered.length > 0 ? filtered.map(asset => (
          <div key={asset.id} className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden group hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="p-5 border-b border-gray-50 dark:border-slate-700 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/20">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">TAG: {asset.tag}</span>
                {canCreate && (
                  <button 
                    onClick={() => handleOpenModal(asset)}
                    className="p-1 hover:bg-blue-100 dark:hover:bg-slate-700 text-gray-400 hover:text-blue-600 rounded-lg transition-all"
                    title="Editar Equipamento"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </div>
              <div className={`w-2.5 h-2.5 rounded-full ${asset.status === 'Operacional' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gray-100 dark:bg-slate-700 rounded-2xl text-gray-600 dark:text-slate-300">
                  <Cpu size={24} />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 dark:text-white leading-tight">{asset.name}</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{asset.type}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-bold uppercase">Unidade</span>
                  <span className="font-black text-gray-700 dark:text-slate-200">{getFacilityName(asset.facilityId)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-bold uppercase">Status</span>
                  <span className={`font-black uppercase ${asset.status === 'Operacional' ? 'text-emerald-600' : 'text-amber-500'}`}>{asset.status}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-bold uppercase">Últ. Manut.</span>
                  <span className="font-mono font-bold text-gray-500">{asset.lastMaintenance}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 dark:border-slate-700 flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-black uppercase rounded-xl border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  <History size={14} /> Histórico
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-black uppercase rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors">
                  <Activity size={14} /> Telemetria
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-32 text-center bg-white dark:bg-slate-800 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-slate-700">
             <Cpu size={64} className="text-gray-200 mx-auto mb-6" />
             <p className="text-gray-400 font-black uppercase tracking-widest">Nenhum Ativo Localizado</p>
          </div>
        )}
      </div>

      {/* Modal de Criação / Edição de Equipamento */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-[3rem] w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-slate-700 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-10 border-b border-gray-100 dark:border-slate-700">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                       {editingAsset ? <Edit2 size={24} /> : <Plus size={24} />}
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                         {editingAsset ? 'Editar Equipamento' : 'Novo Equipamento'}
                       </h3>
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                         {editingAsset ? 'Atualizar especificações técnicas do ativo' : 'Cadastrar ativo crítico no sistema'}
                       </p>
                    </div>
                  </div>
                  <button onClick={() => setIsCreateModalOpen(false)} className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-2xl transition-all">
                    <X size={24} />
                  </button>
               </div>
            </div>

            <form id="assetSaveForm" onSubmit={handleSaveAsset} className="flex-1 overflow-y-auto p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <TagIcon size={12} className="text-blue-500" /> TAG do Equipamento
                  </label>
                  <input 
                    required 
                    type="text" 
                    value={formData.tag} 
                    onChange={(e) => setFormData({...formData, tag: e.target.value})} 
                    placeholder="Ex: VAL-200-01" 
                    className="w-full p-5 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-medium" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Factory size={12} className="text-blue-500" /> Unidade Vinculada
                  </label>
                  <select 
                    required 
                    value={formData.facilityId} 
                    onChange={(e) => setFormData({...formData, facilityId: e.target.value})} 
                    className="w-full p-5 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-medium appearance-none"
                  >
                    <option value="">Selecione a Unidade...</option>
                    {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome / Descrição Técnica</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    placeholder="Ex: Válvula de Alívio de Pressão (PSV)" 
                    className="w-full p-5 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-medium" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Layers size={12} className="text-blue-500" /> Tipo de Equipamento
                  </label>
                  <input 
                    required 
                    type="text" 
                    value={formData.type} 
                    onChange={(e) => setFormData({...formData, type: e.target.value})} 
                    placeholder="Ex: Válvula, Bomba, Sensor..." 
                    className="w-full p-5 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-medium" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Status Operacional</label>
                  <select 
                    required 
                    value={formData.status} 
                    onChange={(e) => setFormData({...formData, status: e.target.value})} 
                    className="w-full p-5 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-medium appearance-none"
                  >
                    <option value="Operacional">Operacional</option>
                    <option value="Manutenção">Em Manutenção</option>
                    <option value="Inativo">Inativo / Reserva</option>
                  </select>
                </div>
              </div>
            </form>

            <div className="p-10 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/30 flex items-center justify-end gap-4">
               <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-8 py-4 bg-white dark:bg-slate-800 text-gray-500 border border-gray-100 dark:border-slate-700 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all">Cancelar</button>
               <button type="submit" form="assetSaveForm" disabled={isSubmitting} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50">
                 {isSubmitting ? 'Salvando...' : (editingAsset ? 'Salvar Alterações' : 'Cadastrar Ativo')}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;

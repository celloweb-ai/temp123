
import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, User, Clock, CheckCircle2, AlertTriangle, Plus, Search, Hammer, X, Clipboard, Briefcase, Mail } from 'lucide-react';
import { api } from '../services/api';
import { WorkOrder, UserRole } from '../types';
import { useAuth } from '../App';

const WorkOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    assignedTo: '',
    dueDate: '',
    notificationEmail: '',
    status: 'Pendente' as 'Pendente' | 'Em Andamento' | 'Concluída' | 'Atrasada'
  });

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getWorkOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCreateWO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newWO: WorkOrder = {
        id: `WO-${Date.now().toString().slice(-4)}`,
        mocId: '', // OS órfã criada manualmente
        title: formData.title,
        assignedTo: formData.assignedTo,
        dueDate: formData.dueDate,
        notificationEmail: formData.notificationEmail,
        status: formData.status,
        createdAt: new Date().toLocaleString()
      };

      await api.createWorkOrder(newWO);
      await fetchOrders();
      setIsCreateModalOpen(false);
      setFormData({ title: '', assignedTo: '', dueDate: '', notificationEmail: '', status: 'Pendente' });
    } catch (err: any) {
      alert("Erro ao criar Ordem de Serviço: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = orders.filter(o => 
    o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canCreate = [UserRole.ADMIN, UserRole.TECNICO_MANUTENCAO].includes(user?.role || UserRole.TECNICO_MANUTENCAO);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Ordens de Serviço</h1>
          <p className="text-gray-500 dark:text-slate-400">Fluxo técnico de manutenção e implementação.</p>
        </div>
        {canCreate && (
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none font-bold"
          >
            <Plus size={20} />
            Nova OS
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por ID, título ou responsável..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">
            Sincronizando Ordens Técnicas...
          </div>
        ) : filtered.length > 0 ? filtered.map((order) => (
          <div key={order.id} className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center gap-8 group hover:shadow-xl transition-all">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <span className="text-[10px] font-mono font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full uppercase tracking-tighter shadow-inner">#{order.id}</span>
                {order.mocId ? (
                  <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black flex items-center gap-1.5">
                    <Clipboard size={12} className="text-blue-400" /> Ref: {order.mocId}
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-500 uppercase tracking-[0.2em] font-black bg-amber-50 dark:bg-amber-900/10 px-3 py-1 rounded-full border border-amber-100 dark:border-amber-900/20 flex items-center gap-1.5">
                    <AlertTriangle size={12} /> Órfã (Sem MOC)
                  </span>
                )}
                {order.notificationEmail && (
                  <span className="text-[10px] text-blue-500 uppercase tracking-[0.2em] font-black flex items-center gap-1.5">
                    <Mail size={12} /> {order.notificationEmail}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors leading-tight">{order.title}</h3>
            </div>

            <div className="flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-slate-300">
                <User size={16} className="text-blue-500" />
                <span>{order.assignedTo}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                <Calendar size={16} className="text-blue-300" />
                <span>{order.dueDate}</span>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                order.status === 'Em Andamento' ? 'bg-blue-100 text-blue-700' :
                order.status === 'Atrasada' ? 'bg-red-100 text-red-700' : 
                order.status === 'Concluída' ? 'bg-emerald-100 text-emerald-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {order.status === 'Atrasada' ? <AlertTriangle size={14} /> : order.status === 'Concluída' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                {order.status}
              </div>
              <button className="p-4 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl hover:bg-emerald-100 transition-all shadow-sm group-hover:scale-110 active:scale-95">
                <CheckCircle2 size={24} />
              </button>
            </div>
          </div>
        )) : (
          <div className="py-32 text-center bg-white dark:bg-slate-800 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-slate-700">
             <Hammer size={64} className="text-gray-200 mx-auto mb-6" />
             <p className="text-gray-400 font-black uppercase tracking-widest">Nenhuma Atividade Técnica Pendente</p>
          </div>
        )}
      </div>

      {/* Modal de Criação de OS */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-[3rem] w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-slate-700 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-10 border-b border-gray-100 dark:border-slate-700">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                       <Plus size={24} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Nova Ordem de Serviço</h3>
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Gerar atividade técnica independente</p>
                    </div>
                  </div>
                  <button onClick={() => setIsCreateModalOpen(false)} className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-2xl transition-all">
                    <X size={24} />
                  </button>
               </div>
            </div>

            <form id="woMainCreateForm" onSubmit={handleCreateWO} className="flex-1 overflow-y-auto p-10 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Clipboard size={12} className="text-blue-500" /> Título da Atividade
                  </label>
                  <input 
                    required 
                    type="text" 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                    placeholder="Ex: Inspeção de integridade do flange F-102" 
                    className="w-full p-5 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-medium text-lg" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <User size={12} className="text-blue-500" /> Técnico Responsável
                    </label>
                    <input 
                      required 
                      type="text" 
                      value={formData.assignedTo} 
                      onChange={(e) => setFormData({...formData, assignedTo: e.target.value})} 
                      placeholder="Nome do técnico..." 
                      className="w-full p-5 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-medium" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Calendar size={12} className="text-blue-500" /> Data Limite
                    </label>
                    <input 
                      required 
                      type="date" 
                      value={formData.dueDate} 
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})} 
                      className="w-full p-5 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-medium" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Mail size={12} className="text-blue-500" /> E-mail para Notificações (Opcional)
                  </label>
                  <input 
                    type="email" 
                    value={formData.notificationEmail} 
                    onChange={(e) => setFormData({...formData, notificationEmail: e.target.value})} 
                    placeholder="tecnico@empresa.com" 
                    className="w-full p-5 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-medium" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Briefcase size={12} className="text-blue-500" /> Status Inicial
                  </label>
                  <select 
                    required 
                    value={formData.status} 
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})} 
                    className="w-full p-5 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-medium appearance-none"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Concluída">Concluída</option>
                  </select>
                </div>
              </div>
            </form>

            <div className="p-10 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/30 flex items-center justify-end gap-4">
               <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-8 py-4 bg-white dark:bg-slate-800 text-gray-500 border border-gray-100 dark:border-slate-700 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all">Cancelar</button>
               <button type="submit" form="woMainCreateForm" disabled={isSubmitting} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50">
                 {isSubmitting ? 'Gerando OS...' : 'Gerar Ordem de Serviço'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrders;

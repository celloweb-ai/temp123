
import React, { useState, useEffect } from 'react';
import { UserPlus, Search, UserCheck, UserX, Mail, Shield, X, User as UserIcon } from 'lucide-react';
import { storage } from '../services/storage';
import { User, UserRole } from '../types';
import { api } from '../services/api';

const UserAdmin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: UserRole.TECNICO_MANUTENCAO
  });

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserStatus = (id: string) => {
    const updated = users.map(u => u.id === id ? { ...u, active: !u.active } : u);
    setUsers(updated);
    storage.set('moc_users', updated);
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        active: true
      };
      await api.createUser(newUser);
      await fetchUsers();
      setIsInviteModalOpen(false);
      setFormData({ name: '', email: '', role: UserRole.TECNICO_MANUTENCAO });
    } catch (err: any) {
      alert("Erro ao convidar usuário: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Administração de Usuários</h1>
          <p className="text-gray-500 dark:text-slate-400">Controle de acesso e permissões baseadas em perfis (RBAC).</p>
        </div>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none font-bold"
        >
          <UserPlus size={20} />
          Convidar Usuário
        </button>
      </div>

      <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
              <th className="px-8 py-5">Usuário</th>
              <th className="px-8 py-5">Perfil / Role</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
              <tr key={user.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black shadow-sm group-hover:scale-105 transition-transform">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-slate-100">{user.name}</p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                        <Mail size={12} className="text-blue-400" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-blue-500" />
                    <span className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-slate-300">{user.role.replace('_', ' ')}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                    user.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {user.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <button 
                    onClick={() => toggleUserStatus(user.id)}
                    className={`p-3 rounded-2xl transition-all shadow-sm ${
                      user.active 
                        ? 'text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100' 
                        : 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100'
                    }`}
                  >
                    {user.active ? <UserX size={22} /> : <UserCheck size={22} />}
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-gray-400 font-bold uppercase tracking-widest">Nenhum usuário localizado</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Convite de Usuário */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-[3rem] w-full max-w-xl shadow-2xl border border-gray-100 dark:border-slate-700 flex flex-col overflow-hidden animate-slideUp">
            <div className="p-10 border-b border-gray-100 dark:border-slate-700">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                       <UserPlus size={24} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Convidar Usuário</h3>
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Defina o nível de acesso e credenciais</p>
                    </div>
                  </div>
                  <button onClick={() => setIsInviteModalOpen(false)} className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-2xl transition-all">
                    <X size={24} />
                  </button>
               </div>
            </div>

            <form id="inviteUserForm" onSubmit={handleInviteUser} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <UserIcon size={12} className="text-blue-500" /> Nome Completo
                </label>
                <input 
                  required 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="Ex: João da Silva" 
                  className="w-full p-5 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-medium" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Mail size={12} className="text-blue-500" /> E-mail Corporativo
                </label>
                <input 
                  required 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  placeholder="exemplo@moctudio.com" 
                  className="w-full p-5 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-medium" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Shield size={12} className="text-blue-500" /> Perfil de Acesso (RBAC)
                </label>
                <select 
                  required 
                  value={formData.role} 
                  onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})} 
                  className="w-full p-5 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-medium appearance-none"
                >
                  <option value={UserRole.ADMIN}>Administrador (Controle Total)</option>
                  <option value={UserRole.GERENTE_INSTALACAO}>Gerente de Instalação</option>
                  <option value={UserRole.ENG_PROCESSO}>Engenheiro de Processo</option>
                  <option value={UserRole.TECNICO_MANUTENCAO}>Técnico de Manutenção</option>
                  <option value={UserRole.COORD_HSE}>Coordenador HSE</option>
                  <option value={UserRole.COMITE_APROVACAO}>Comitê de Aprovação</option>
                </select>
              </div>
            </form>

            <div className="p-10 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/30 flex items-center justify-end gap-4">
               <button type="button" onClick={() => setIsInviteModalOpen(false)} className="px-8 py-4 bg-white dark:bg-slate-800 text-gray-500 border border-gray-100 dark:border-slate-700 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all">Cancelar</button>
               <button type="submit" form="inviteUserForm" disabled={isSubmitting} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2">
                 {isSubmitting ? 'Convidando...' : 'Enviar Convite'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAdmin;

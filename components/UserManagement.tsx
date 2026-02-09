
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
// Added History to the import list from lucide-react
import { 
  Users, Search, Shield, Mail, Edit3, Save, X, 
  UserCheck, UserMinus, MoreVertical, ShieldAlert,
  Loader2, CheckCircle, Fingerprint, History
} from 'lucide-react';
import { User } from '../types';

const UserManagement: React.FC = () => {
  const { language, users, saveUser, addNotification, user: currentUser } = useApp();
  const t = TRANSLATIONS[language];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempRole, setTempRole] = useState<User['role']>('Engineer');
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartEdit = (user: User) => {
    setEditingId(user.id);
    setTempRole(user.role);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveRole = async (user: User) => {
    if (tempRole === user.role) {
      setEditingId(null);
      return;
    }

    setIsUpdating(true);
    try {
      const updatedUser: User = { ...user, role: tempRole };
      await saveUser(updatedUser);
      addNotification({
        title: 'Clearance Updated',
        message: `Industrial role for ${user.name} has been synchronized to ${tempRole}.`,
        type: 'success'
      });
      setEditingId(null);
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Manager': return <Shield className="text-orange-500" size={14} />;
      case 'Auditor': return <ShieldAlert className="text-purple-500" size={14} />;
      default: return <Fingerprint className="text-blue-500" size={14} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight leading-none mb-2 glow-title">
            {t.userManagement}
          </h2>
          <p className="text-slate-500 dark:text-slate-300 text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-2">
            <Users size={14} className="text-blue-500" />
            {t.manageUsers} • {users.length} Authorized Entities
          </p>
        </div>
        
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass-panel bg-white/5 border-white/10 rounded-2xl py-4 pl-14 pr-4 text-slate-900 dark:text-white placeholder-slate-500 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-bold"
            placeholder="Search by Identity or Mail..."
          />
        </div>
      </div>

      <div className="glass-panel rounded-[3rem] overflow-hidden border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-white/5">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">{t.name}</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">{t.email}</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">{t.userRole}</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="group hover:bg-blue-500/5 transition-colors">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-white/5 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-sm border border-blue-500/20">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{u.name}</div>
                        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">UID: {u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs font-bold">
                      <Mail size={14} className="opacity-50" />
                      {u.email}
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    {editingId === u.id ? (
                      <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-200">
                        <select 
                          value={tempRole} 
                          onChange={(e) => setTempRole(e.target.value as any)}
                          className="bg-slate-900 border border-blue-500/50 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest text-blue-400 outline-none focus:ring-4 focus:ring-blue-500/20"
                        >
                          <option value="Engineer">Engineer</option>
                          <option value="Manager">Manager</option>
                          <option value="Auditor">Auditor</option>
                        </select>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5">
                          {getRoleIcon(u.role)}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          u.role === 'Manager' ? 'text-orange-500' : u.role === 'Auditor' ? 'text-purple-500' : 'text-blue-500'
                        }`}>
                          {u.role}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center justify-center gap-3">
                      {editingId === u.id ? (
                        <>
                          <button 
                            onClick={() => handleSaveRole(u)}
                            disabled={isUpdating}
                            className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                            title="Commit Role Change"
                          >
                            {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            className="p-2.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-red-500 rounded-xl transition-all"
                            title="Abort Change"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => handleStartEdit(u)}
                          className="p-2.5 bg-black/5 dark:bg-white/5 text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all border border-transparent hover:border-blue-500/30"
                          title="Modify Clearance"
                        >
                          <Edit3 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center opacity-30 grayscale">
            <Users size={64} className="mb-4 text-slate-500" />
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">No personnel matches found</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600/10 to-transparent border-blue-500/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-600/10 text-blue-500 rounded-2xl">
              <Shield size={20} />
            </div>
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">RBAC Governance</h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-bold uppercase tracking-tight">
            Role-Based Access Control ensures high-integrity change management. Managers and Auditors have bypass and final sign-off authority.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-[2.5rem] bg-gradient-to-br from-emerald-600/10 to-transparent border-emerald-500/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-emerald-600/10 text-emerald-500 rounded-2xl">
              <UserCheck size={20} />
            </div>
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Active Clearance</h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-bold uppercase tracking-tight">
            {users.filter(u => u.status === 'Active').length} users are currently holding active industrial clearance within the MOC ecosystem.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-[2.5rem] bg-gradient-to-br from-purple-600/10 to-transparent border-purple-500/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-purple-600/10 text-purple-500 rounded-2xl">
              <History size={20} />
            </div>
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Compliance Audit</h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-bold uppercase tracking-tight">
            All role changes are logged in the master compliance audit trail. Changes take effect across all facility networks immediately.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;

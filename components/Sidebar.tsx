
import React from 'react';
import { useApp } from '../context/AppContext';
import { NAV_ITEMS, TRANSLATIONS } from '../constants';
import { LogOut, Hexagon, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) => {
  const { user, logout, language } = useApp();
  const t = TRANSLATIONS[language];

  return (
    <div 
      className={`h-full flex flex-col p-4 space-y-8 glass-panel border-r border-black/5 dark:border-white/10 relative z-30 transition-all duration-500 ease-in-out ${
        isCollapsed ? 'w-24' : 'w-72'
      }`}
    >
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/40 hover:scale-110 transition-transform z-40"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className={`flex items-center px-2 transition-all duration-300 ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
        <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20 shrink-0">
          <Hexagon className="text-white" size={24} />
        </div>
        {!isCollapsed && (
          <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-blue-400 whitespace-nowrap overflow-hidden animate-in fade-in zoom-in duration-500">
            MOC STUDIO
          </span>
        )}
      </div>

      <nav className="flex-1 space-y-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            title={isCollapsed ? (t as any)[item.id] || item.label : undefined}
            className={`w-full flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 relative group ${
              activeTab === item.id 
                ? 'bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10' 
                : 'text-slate-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
            } ${isCollapsed ? 'justify-center' : 'space-x-4'}`}
          >
            <div className="shrink-0">{item.icon}</div>
            {!isCollapsed && (
              <span className="font-semibold whitespace-nowrap overflow-hidden animate-in fade-in slide-in-from-left-2 duration-300">
                {(t as any)[item.id] || item.label}
              </span>
            )}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-white/10">
                {(t as any)[item.id] || item.label}
              </div>
            )}
          </button>
        ))}
      </nav>

      <div className="pt-6 border-t border-black/5 dark:border-white/10">
        <div className={`flex items-center px-2 mb-6 transition-all duration-300 ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold shadow-md shrink-0">
            {user?.name.charAt(0)}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden animate-in fade-in duration-500">
              <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</span>
              <span className="text-[10px] text-slate-500 dark:text-gray-500 uppercase font-black tracking-tighter">{user?.role}</span>
            </div>
          )}
        </div>
        <button 
          onClick={logout}
          title={isCollapsed ? t.signOut : undefined}
          className={`w-full flex items-center px-4 py-3 text-red-500 dark:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all ${isCollapsed ? 'justify-center' : 'space-x-4'}`}
        >
          <LogOut size={20} className="shrink-0" />
          {!isCollapsed && <span className="font-bold animate-in fade-in duration-300">{t.signOut}</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

import React from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { 
  Bell, Info, AlertTriangle, CheckCircle, XCircle, 
  Clock, Trash2, CheckSquare, X
} from 'lucide-react';

interface NotificationPanelProps {
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const { 
    language, 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    clearNotifications 
  } = useApp();
  const t = TRANSLATIONS[language];

  const getIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info size={16} className="text-blue-500" />;
      case 'warning': return <AlertTriangle size={16} className="text-orange-500" />;
      case 'success': return <CheckCircle size={16} className="text-emerald-500" />;
      case 'error': return <XCircle size={16} className="text-red-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="absolute top-full right-0 mt-4 w-96 glass-panel rounded-[2rem] border-white/10 shadow-2xl z-[100] animate-in slide-in-from-top-4 duration-300 flex flex-col max-h-[600px] overflow-hidden">
      <header className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <Bell size={20} className="text-blue-500" />
          <h3 className="text-sm font-black text-white uppercase tracking-widest">{t.notifications}</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
          <X size={18} className="text-slate-400" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {notifications.length > 0 ? (
          <div className="divide-y divide-white/5">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                onClick={() => markNotificationAsRead(n.id)}
                className={`p-5 hover:bg-white/5 transition-all cursor-pointer relative group ${!n.read ? 'bg-blue-500/5' : ''}`}
              >
                {!n.read && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"></div>
                )}
                <div className="flex gap-4">
                  <div className="mt-1 shrink-0 p-2 rounded-xl bg-slate-800 border border-white/5">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-xs font-black truncate ${!n.read ? 'text-white' : 'text-slate-400'}`}>
                        {n.title}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <Clock size={10} /> {formatTime(n.timestamp)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-4 opacity-30 grayscale">
            <Bell size={48} />
            <p className="text-xs font-black uppercase tracking-widest">{t.noNotifications}</p>
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <footer className="p-4 border-t border-white/5 bg-white/5 flex gap-2">
          <button 
            onClick={markAllNotificationsAsRead}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-300 rounded-xl transition-all"
          >
            <CheckSquare size={14} /> {t.markAllRead}
          </button>
          <button 
            onClick={clearNotifications}
            className="px-4 flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-red-500/20 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-red-500 rounded-xl transition-all"
          >
            <Trash2 size={14} /> {t.clearAll}
          </button>
        </footer>
      )}
    </div>
  );
};

export default NotificationPanel;
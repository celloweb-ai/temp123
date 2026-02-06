
import React from 'react';
import { Book, ExternalLink, Search, Tag, Filter } from 'lucide-react';

const Standards = () => {
  const links = [
    { title: 'NR-13 - Caldeiras e Vasos de Pressão', category: 'Norma Regulamentadora', url: '#' },
    { title: 'API RP 521 - Pressure-relieving and Depressuring Systems', category: 'Standards Internacionais', url: '#' },
    { title: 'Manual de Gestão de Mudanças (Corporate)', category: 'Manual Interno', url: '#' },
    { title: 'Matriz de Responsabilidades MOC', category: 'Governança', url: '#' },
    { title: 'Portal de Documentação Técnica P-50', category: 'Links Úteis', url: '#' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Normas & Procedimentos</h1>
          <p className="text-gray-500 dark:text-slate-400">Repositório centralizado de legislação e diretrizes técnicas.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar norma ou procedimento..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-700 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <button className="p-2 bg-gray-50 dark:bg-slate-700 rounded-xl hover:bg-gray-100 transition-colors">
          <Filter size={20} className="text-gray-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {links.map((link, i) => (
          <a 
            key={i} 
            href={link.url}
            className="group block p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900 transition-all"
          >
            <div className="p-3 w-fit bg-blue-50 dark:bg-slate-700 rounded-xl text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform">
              <Book size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2 pr-6 relative">
              {link.title}
              <ExternalLink size={16} className="absolute top-1 right-0 text-gray-300 group-hover:text-blue-500 transition-colors" />
            </h3>
            <div className="flex items-center gap-2 mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <Tag size={12} />
              {link.category}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Standards;

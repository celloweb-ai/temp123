
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { 
  Send, Bot, User, Loader2, Sparkles, BookOpen, 
  Plus, MessageSquare, Trash2, History, Clock, 
  ChevronRight, Search, Hash
} from 'lucide-react';
import { ChatSession, ChatMessage } from '../types';

const STORAGE_KEY = 'moc_studio_ai_chats';

const AIChatAssistant: React.FC = () => {
  const { language } = useApp();
  const t = TRANSLATIONS[language];

  const initialGreeting = language === 'pt-BR' 
    ? "Olá Engenheiro. Sou seu assistente técnico MOC. Como posso ajudá-lo com segurança de processo, normas regulatórias ou avaliação de risco hoje?"
    : "Hello Engineer. I am your MOC technical assistant. How can I help you with process safety, regulatory standards, or risk assessment today?";

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed);
      if (parsed.length > 0) {
        setActiveSessionId(parsed[0].id);
      } else {
        createNewChat();
      }
    } else {
      createNewChat();
    }
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sessions, activeSessionId, isTyping]);

  const saveSessions = (updated: ChatSession[]) => {
    setSessions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: `chat-${Date.now()}`,
      title: language === 'pt-BR' ? 'Nova Consulta' : 'New Technical Query',
      messages: [{ role: 'ai', content: initialGreeting, timestamp: Date.now() }],
      updatedAt: Date.now()
    };
    const updated = [newSession, ...sessions];
    saveSessions(updated);
    setActiveSessionId(newSession.id);
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    saveSessions(updated);
    if (activeSessionId === id) {
      setActiveSessionId(updated.length > 0 ? updated[0].id : null);
      if (updated.length === 0) createNewChat();
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !activeSessionId) return;
    
    const userMsg = input.trim();
    setInput('');
    setIsTyping(true);

    const activeSession = sessions.find(s => s.id === activeSessionId);
    if (!activeSession) return;

    const userMessage: ChatMessage = { role: 'user', content: userMsg, timestamp: Date.now() };
    
    // Optimistic update of UI
    let updatedSessions = sessions.map(s => {
      if (s.id === activeSessionId) {
        const isFirstUserMsg = s.messages.filter(m => m.role === 'user').length === 0;
        return {
          ...s,
          title: isFirstUserMsg ? userMsg.slice(0, 30) + (userMsg.length > 30 ? '...' : '') : s.title,
          messages: [...s.messages, userMessage],
          updatedAt: Date.now()
        };
      }
      return s;
    });
    
    setSessions(updatedSessions);

    try {
      const context = language === 'pt-BR' ? 'Responda em Português do Brasil.' : 'Respond in English.';
      // Provide previous messages as context for Gemini
      const conversationHistory = activeSession.messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
      const fullPrompt = `Previous Conversation:\n${conversationHistory}\n\nNew Engineering Query: ${userMsg}`;
      
      const aiResponse = await geminiService.getTechnicalAdvice(fullPrompt, context);
      
      const aiMessage: ChatMessage = { role: 'ai', content: aiResponse, timestamp: Date.now() };
      
      updatedSessions = updatedSessions.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...s.messages, aiMessage],
            updatedAt: Date.now()
          };
        }
        return s;
      });
      saveSessions(updatedSessions);
    } catch (error) {
      console.error("AI Assistant Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500 overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight leading-none mb-1 flex items-center gap-3">
             <Sparkles className="text-blue-500 dark:text-blue-400 shrink-0" size={28} />
             {/* Use t.ai instead of t.aiAdvisor as per constants.tsx */}
             {t.ai}
          </h2>
          <p className="text-slate-500 dark:text-blue-300 text-[10px] font-black uppercase tracking-[0.2em]">
            {t.aiAdvisorDesc}
          </p>
        </div>
        <button 
          onClick={createNewChat}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Plus size={18} strokeWidth={3} />
          <span>{language === 'pt-BR' ? 'Novo Chat' : 'New Chat'}</span>
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* History Sidebar */}
        <div className="lg:col-span-3 glass-panel rounded-[2.5rem] p-6 flex flex-col min-h-0 border-white/5">
          <div className="flex items-center gap-2 mb-6 px-2 text-slate-500 dark:text-slate-400">
            <History size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">{language === 'pt-BR' ? 'Histórico Técnico' : 'Technical History'}</span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {sessions.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSessionId(s.id)}
                className={`w-full group p-4 rounded-2xl border transition-all text-left flex items-start gap-3 relative ${
                  activeSessionId === s.id
                    ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-500/30'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:border-blue-500/40'
                }`}
              >
                <div className={`mt-1 p-1.5 rounded-lg ${activeSessionId === s.id ? 'bg-blue-500' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  <MessageSquare size={14} className={activeSessionId === s.id ? 'text-white' : 'text-slate-400'} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black truncate mb-1 pr-6">{s.title}</div>
                  <div className={`text-[9px] font-bold flex items-center gap-1.5 ${activeSessionId === s.id ? 'text-blue-100' : 'text-slate-500'}`}>
                    <Clock size={10} />
                    {new Date(s.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <button 
                  onClick={(e) => deleteSession(e, s.id)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
                    activeSessionId === s.id ? 'hover:bg-blue-500 text-blue-200 hover:text-white' : 'hover:bg-red-500/10 text-slate-400 hover:text-red-500'
                  }`}
                >
                  <Trash2 size={14} />
                </button>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-9 flex flex-col glass-panel rounded-[3rem] border-white/5 overflow-hidden">
          <header className="px-8 py-5 border-b border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Hash size={18} />
                </div>
                <div>
                   <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">{activeSession?.title}</h4>
                   <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{activeSession?.messages.length} Engineering Cycles</p>
                </div>
             </div>
             <button className="p-2.5 bg-white dark:bg-slate-800 border border-black/5 dark:border-white/5 rounded-xl text-slate-500 hover:text-blue-500 transition-all shadow-sm">
                <BookOpen size={18} />
             </button>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-8 scroll-smooth custom-scrollbar">
            {activeSession?.messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                <div className={`flex gap-4 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                    m.role === 'user' ? 'bg-blue-600' : 'bg-emerald-600'
                  }`}>
                    {m.role === 'user' ? <User size={20} className="text-white" /> : <Bot size={20} className="text-white" />}
                  </div>
                  <div className={`p-6 rounded-[2.5rem] text-sm leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-blue-600 text-white border border-blue-500/20 rounded-tr-none shadow-xl shadow-blue-600/10' 
                      : 'bg-black/5 dark:bg-white/10 text-slate-800 dark:text-gray-200 border border-black/10 dark:border-white/10 rounded-tl-none'
                  }`}>
                    <div className="whitespace-pre-wrap">{m.content}</div>
                    <div className={`text-[9px] mt-3 font-black uppercase tracking-widest opacity-40 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                       {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start animate-pulse">
                 <div className="bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 p-6 rounded-[2.5rem] flex items-center gap-3">
                   <Loader2 className="animate-spin text-blue-400" size={16} />
                   <span className="text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase tracking-widest">{t.generatingResponse}</span>
                 </div>
              </div>
            )}
          </div>

          <div className="p-8 lg:p-10 border-t border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="relative max-w-4xl mx-auto">
              <textarea 
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={t.typeQuery}
                className="w-full bg-white dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-3xl py-5 pl-8 pr-16 text-slate-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all shadow-xl resize-none min-h-[64px] max-h-32"
              />
              <button 
                onClick={handleSend}
                disabled={isTyping || !input.trim()}
                className="absolute right-3 bottom-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-3 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.95]"
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-[9px] text-center mt-4 text-slate-400 font-bold uppercase tracking-[0.2em]">
               Industrial AI Safety Guardrails Active • Powered by Gemini Technical Engine
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatAssistant;

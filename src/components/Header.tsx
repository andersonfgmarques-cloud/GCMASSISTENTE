import React from 'react';
import { Shield, Bot, LayoutDashboard, Code, Cpu, Terminal, Phone } from 'lucide-react';

interface HeaderProps {
  activeTab: 'bot' | 'admin' | 'python' | 'triage' | 'logs';
  setActiveTab: (tab: 'bot' | 'admin' | 'python' | 'triage' | 'logs') => void;
  occurrenceCount: number;
  criticalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  occurrenceCount,
  criticalCount,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          
          {/* Brand Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-amber-500 p-0.5 shadow-lg shadow-blue-900/30">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  GCM DIGITAL <span className="text-amber-400">153</span>
                </h1>
                <span className="bg-blue-950 text-blue-400 text-xs font-semibold px-2 py-0.5 rounded border border-blue-800">
                  v1.0.0 Aiogram 3
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Assistente Virtual & Central de Operações da Guarda Civil Municipal
              </p>
            </div>
          </div>

          {/* Emergency & Status Badges */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="hidden sm:flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Gemini 3.6 Flash IA Ativa</span>
            </div>

            {criticalCount > 0 && (
              <div className="flex items-center space-x-1.5 bg-rose-950/80 text-rose-300 px-3 py-1.5 rounded-lg border border-rose-800 font-semibold animate-bounce">
                <span>🔴 {criticalCount} Alerta{criticalCount > 1 ? 's' : ''} Crítico{criticalCount > 1 ? 's' : ''}</span>
              </div>
            )}

            <a
              href="tel:153"
              className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg transition shadow-md"
            >
              <Phone className="w-3.5 h-3.5 fill-current" />
              <span>EMERGÊNCIA 153</span>
            </a>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 pt-1 border-t border-slate-800/60 no-scrollbar text-sm font-medium">
          <button
            onClick={() => setActiveTab('bot')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'bot'
                ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Simulador Telegram Bot</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'admin'
                ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Painel CECOM 153</span>
            {occurrenceCount > 0 && (
              <span className="bg-slate-900 text-blue-300 text-xs px-1.5 py-0.5 rounded-full font-bold">
                {occurrenceCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('python')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'python'
                ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Code className="w-4 h-4 text-emerald-400" />
            <span>Código Python (MVC)</span>
          </button>

          <button
            onClick={() => setActiveTab('triage')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'triage'
                ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4 text-amber-400" />
            <span>Testador de IA</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4 text-purple-400" />
            <span>Logs do Servidor</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

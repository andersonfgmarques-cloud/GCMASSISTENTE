import React from 'react';
import { Terminal, Trash2 } from 'lucide-react';

interface LogConsoleProps {
  logs: string[];
  onClearLogs: () => void;
}

export const LogConsole: React.FC<LogConsoleProps> = ({ logs, onClearLogs }) => {
  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Logs do Servidor em Tempo Real</span>
              <span className="bg-purple-950 text-purple-300 text-xs px-2 py-0.5 rounded border border-purple-800 font-mono">
                Aiogram 3 + FastAPI Log Stream
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Monitoramento de eventos, chamadas de Webhook, polling do Telegram Bot e requisições da Gemini AI.
            </p>
          </div>
        </div>

        <button
          onClick={onClearLogs}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2.5 rounded-xl transition border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
          title="Limpar Histórico de Logs"
        >
          <Trash2 className="w-4 h-4 text-rose-400" />
          <span>Limpar</span>
        </button>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 h-[500px] overflow-y-auto space-y-2 shadow-2xl">
        {logs.length === 0 ? (
          <div className="text-center text-slate-600 py-20">
            Aguardando eventos do sistema...
          </div>
        ) : (
          logs.map((log, idx) => (
            <div
              key={idx}
              className={`p-2 rounded border border-slate-900 font-mono flex items-start space-x-2 ${
                log.includes('CRÍTICA') || log.includes('ALTA')
                  ? 'bg-rose-950/30 text-rose-300 border-rose-900/50'
                  : log.includes('FastAPI') || log.includes('Aiogram')
                  ? 'bg-blue-950/20 text-blue-300 border-blue-900/40'
                  : 'bg-slate-900/50 text-slate-300'
              }`}
            >
              <span className="text-slate-600 select-none text-[10px]">[{idx + 1}]</span>
              <span className="leading-relaxed whitespace-pre-wrap">{log}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

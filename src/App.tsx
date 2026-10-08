import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BotSimulator } from './components/BotSimulator';
import { AdminDashboard } from './components/AdminDashboard';
import { PythonExplorer } from './components/PythonExplorer';
import { AITriageTester } from './components/AITriageTester';
import { LogConsole } from './components/LogConsole';
import { Occurrence, OccurrenceStatus } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'bot' | 'admin' | 'python' | 'triage' | 'logs'>('bot');
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] 🚀 Servidor GCM Digital 153 iniciado com sucesso.`,
    `[${new Date().toLocaleTimeString()}] 🤖 Aiogram 3 Dispatcher conectado. Polling ativado.`,
    `[${new Date().toLocaleTimeString()}] 🧠 Módulo de Triagem por IA (Gemini 3.6 Flash) pronto.`
  ]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${msg}`, ...prev]);
  };

  const fetchOccurrences = async () => {
    try {
      const res = await fetch('/api/occurrences');
      if (res.ok) {
        const data: Occurrence[] = await res.json();
        setOccurrences(data);
      }
    } catch (err) {
      console.error('Erro ao carregar ocorrências:', err);
    }
  };

  useEffect(() => {
    fetchOccurrences();
    const interval = setInterval(fetchOccurrences, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleOccurrenceCreated = (newOcc: Occurrence) => {
    setOccurrences((prev) => [newOcc, ...prev]);
    addLog(`🚨 Ocorrência ${newOcc.protocol} registrada via Telegram Bot!`);
  };

  const handleUpdateStatus = async (protocol: string, status: OccurrenceStatus, unit?: string, notes?: string) => {
    try {
      const res = await fetch(`/api/occurrences/${encodeURIComponent(protocol)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, dispatched_unit: unit, notes })
      });

      if (res.ok) {
        const updated: Occurrence = await res.json();
        setOccurrences((prev) => prev.map((o) => (o.protocol === protocol ? updated : o)));
        addLog(`🔄 Status do chamado ${protocol} atualizado para ${status}.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const criticalCount = occurrences.filter((o) => o.ai_priority === 'ALTA' && o.status !== 'FINALIZADA').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        occurrenceCount={occurrences.length}
        criticalCount={criticalCount}
      />

      <main className="flex-1">
        {activeTab === 'bot' && (
          <BotSimulator onOccurrenceCreated={handleOccurrenceCreated} addLog={addLog} />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            occurrences={occurrences}
            onUpdateStatus={handleUpdateStatus}
            addLog={addLog}
          />
        )}

        {activeTab === 'python' && <PythonExplorer />}

        {activeTab === 'triage' && <AITriageTester />}

        {activeTab === 'logs' && (
          <LogConsole logs={logs} onClearLogs={() => setLogs([])} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>GCM DIGITAL 153 — Guarda Civil Municipal</span>
          <span>Arquitetura Python Aiogram 3 + FastAPI + Gemini 3.6 Flash</span>
        </div>
      </footer>
    </div>
  );
}

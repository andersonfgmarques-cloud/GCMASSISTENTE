import React, { useState } from 'react';
import { Folder, FileCode, Copy, Check, Download, Layers, Server, Database, Bot, Shield } from 'lucide-react';
import { pythonFiles } from '../data/pythonCode';

export const PythonExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState(pythonFiles[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
      
      {/* Intro Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Arquitetura Modular Python — GCM DIGITAL 153</span>
              <span className="bg-emerald-950 text-emerald-400 text-xs px-2 py-0.5 rounded border border-emerald-800 font-mono">
                Aiogram 3 + FastAPI + SQLite/PostgreSQL
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Padrão MVC completo com tipagem estática (Pydantic & SQLAlchemy async), tratamento de erros e triagem por IA.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={handleCopy}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 border border-slate-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado!' : 'Copiar Código'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-md font-semibold"
          >
            <Download className="w-4 h-4" />
            <span>Baixar {selectedFile.filename}</span>
          </button>
        </div>
      </div>

      {/* Main Code Viewer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar: Folder Tree */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-2">
            <Folder className="w-4 h-4 text-amber-400" />
            <span>Estrutura do Projeto</span>
          </h3>

          <div className="space-y-1 font-mono text-xs">
            {pythonFiles.map((file) => {
              const isSelected = selectedFile.path === file.path;

              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/30'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <FileCode
                      className={`w-4 h-4 flex-shrink-0 ${
                        isSelected ? 'text-white' : 'text-emerald-400'
                      }`}
                    />
                    <span className="truncate">{file.path}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Code Panel */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          
          {/* File Header */}
          <div className="bg-slate-900 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {selectedFile.path}
              </span>
              <p className="text-xs text-slate-400 mt-0.5">{selectedFile.description}</p>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
              {selectedFile.language}
            </span>
          </div>

          {/* Syntax Highlighted Code Viewer */}
          <div className="p-4 overflow-x-auto font-mono text-xs leading-relaxed text-slate-200 bg-slate-950 max-h-[600px] overflow-y-auto">
            <pre>
              {selectedFile.content.split('\n').map((line, idx) => (
                <div key={idx} className="flex hover:bg-slate-900/50 px-2 rounded">
                  <span className="w-10 text-slate-600 select-none text-right pr-4 flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="whitespace-pre">{line}</span>
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

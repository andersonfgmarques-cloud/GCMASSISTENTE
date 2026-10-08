import React, { useState } from 'react';
import { Cpu, Sparkles, Send, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AITriageResponse } from '../types';

export const AITriageTester: React.FC = () => {
  const [category, setCategory] = useState<string>('Violência Doméstica / Patrulha Maria da Penha');
  const [description, setDescription] = useState<string>(
    'Cidadã relata que ex-marido está forçando a entrada na residência com agressões verbais e ameaça explícita. Existe medida protetiva expedida.'
  );
  const [address, setAddress] = useState<string>('Rua das Palmeiras, 340, Jardim Aquarius');
  const [hasPhotos, setHasPhotos] = useState<boolean>(true);
  const [hasVideos, setHasVideos] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AITriageResponse | null>(null);

  const handleRunTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          description,
          address,
          has_photos: hasPhotos,
          has_videos: hasVideos
        })
      });

      const data: AITriageResponse = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Testador de Triagem Inteligente GCM (Gemini 3.6 Flash)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Simule o motor de Inteligência Artificial que calcula a prioridade, urgência, score de risco e viatura recomendada.
            </p>
          </div>
        </div>

        <form onSubmit={handleRunTriage} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Categoria do Chamado:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-amber-500"
            >
              <option value="Patrimonial / Pichação / Vandalismo">Patrimonial / Pichação / Vandalismo</option>
              <option value="Agressão / Violência / Perturbação">Agressão / Violência / Perturbação</option>
              <option value="Violência Doméstica / Patrulha Maria da Penha">Violência Doméstica / Patrulha Maria da Penha</option>
              <option value="Ronda Escolar / Segurança nas Escolas">Ronda Escolar / Segurança nas Escolas</option>
              <option value="Trânsito / Acidente / Estacionamento Irregular">Trânsito / Acidente / Estacionamento Irregular</option>
              <option value="Meio Ambiente / Animais / Descarte Irregular">Meio Ambiente / Animais / Descarte Irregular</option>
              <option value="Atitude Suspeita / Averiguação">Atitude Suspeita / Averiguação</option>
            </select>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Relato / Descrição da Ocorrência:</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Local / Endereço:</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center space-x-6 pt-6">
              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasPhotos}
                  onChange={(e) => setHasPhotos(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0"
                />
                <span>Contém Fotos</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasVideos}
                  onChange={(e) => setHasVideos(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0"
                />
                <span>Contém Vídeo</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg"
          >
            {loading ? (
              <Sparkles className="w-5 h-5 animate-spin text-slate-950" />
            ) : (
              <Cpu className="w-5 h-5 text-slate-950" />
            )}
            <span>{loading ? 'Analisando com Gemini 3.6 Flash...' : 'Executar Triagem com IA'}</span>
          </button>
        </form>

        {/* Results Panel */}
        {result && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 animate-fadeIn text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                RESULTADO DA TRIAGEM OPERACIONAL 153
              </span>

              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                  result.priority === 'ALTA'
                    ? 'bg-rose-950 text-rose-300 border-rose-800'
                    : result.priority === 'MÉDIA'
                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                }`}
              >
                {result.priority === 'ALTA'
                  ? '🔴 ALTA PRIORIDADE'
                  : result.priority === 'MÉDIA'
                  ? '🟡 MÉDIA PRIORIDADE'
                  : '🟢 BAIXA PRIORIDADE'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <p className="text-slate-400 font-semibold">Unidade Recomendada:</p>
                <p className="text-emerald-400 font-bold text-sm mt-0.5">{result.recommended_unit}</p>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <p className="text-slate-400 font-semibold">Score de Risco:</p>
                <p className="text-amber-400 font-bold text-sm mt-0.5">{result.risk_score} / 10</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <p className="text-slate-400 font-semibold">Resumo Transmissão Rádio:</p>
                <p className="text-slate-200 bg-slate-900 p-3 rounded-xl border border-slate-800 mt-1">
                  {result.summary}
                </p>
              </div>

              <div>
                <p className="text-slate-400 font-semibold">Ação Imediata Recomendada:</p>
                <p className="text-rose-300 bg-rose-950/40 p-3 rounded-xl border border-rose-900 mt-1 font-semibold">
                  {result.immediate_action}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

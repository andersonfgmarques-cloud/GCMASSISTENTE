import React, { useState } from 'react';
import {
  Shield,
  AlertCircle,
  Clock,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  Radio,
  Sparkles,
  FileText,
  Filter,
  Eye,
  Car,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Occurrence, OccurrencePriority, OccurrenceStatus } from '../types';

interface AdminDashboardProps {
  occurrences: Occurrence[];
  onUpdateStatus: (protocol: string, status: OccurrenceStatus, unit?: string, notes?: string) => void;
  addLog: (log: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ occurrences, onUpdateStatus, addLog }) => {
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(null);
  const [unitInput, setUnitInput] = useState<string>('');
  const [notesInput, setNotesInput] = useState<string>('');

  const criticalCount = occurrences.filter((o) => o.ai_priority === 'ALTA').length;
  const inProgressCount = occurrences.filter((o) => o.status === 'EM_ATENDIMENTO' || o.status === 'VIATURA_A_CAMINHO').length;
  const resolvedCount = occurrences.filter((o) => o.status === 'FINALIZADA').length;

  const filtered = occurrences.filter((occ) => {
    if (filterPriority !== 'ALL' && occ.ai_priority !== filterPriority) return false;
    if (filterStatus !== 'ALL' && occ.status !== filterStatus) return false;
    return true;
  });

  const handleOpenDetail = (occ: Occurrence) => {
    setSelectedOccurrence(occ);
    setUnitInput(occ.dispatched_unit || '');
    setNotesInput(occ.dispatcher_notes || '');
  };

  const handleSaveDispatch = () => {
    if (!selectedOccurrence) return;
    onUpdateStatus(
      selectedOccurrence.protocol,
      selectedOccurrence.status,
      unitInput,
      notesInput
    );
    addLog(`[CECOM 153] Viatura ${unitInput || 'N/A'} atribuída ao protocolo ${selectedOccurrence.protocol}`);
    setSelectedOccurrence((prev) =>
      prev
        ? {
            ...prev,
            dispatched_unit: unitInput,
            dispatcher_notes: notesInput
          }
        : null
    );
  };

  const handleStatusChange = (newStatus: OccurrenceStatus) => {
    if (!selectedOccurrence) return;
    onUpdateStatus(selectedOccurrence.protocol, newStatus, unitInput, notesInput);
    setSelectedOccurrence((prev) => (prev ? { ...prev, status: newStatus } : null));
    addLog(`[CECOM 153] Status do protocolo ${selectedOccurrence.protocol} alterado para: ${newStatus}`);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Alertas Críticos / Alta</p>
            <p className="text-2xl font-extrabold text-rose-400 mt-1">{criticalCount}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Prioridade triada por IA</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-950/80 border border-rose-800 flex items-center justify-center text-rose-400">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Em Atendimento / Viaturas</p>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">{inProgressCount}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Equipes em deslocamento</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400">
            <Radio className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Finalizadas Hoje</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">{resolvedCount}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Atendimentos concluídos</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Tempo Médio de Resposta</p>
            <p className="text-2xl font-extrabold text-blue-400 mt-1">8m 45s</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Desde a denúncia no Telegram</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-800 flex items-center justify-center text-blue-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-slate-300 text-sm font-semibold">
          <Filter className="w-4 h-4 text-blue-400" />
          <span>Filtros do Centro de Operações:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Priority filter */}
          <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setFilterPriority('ALL')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterPriority === 'ALL' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todas Prioridades
            </button>
            <button
              onClick={() => setFilterPriority('ALTA')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterPriority === 'ALTA' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              🔴 ALTA
            </button>
            <button
              onClick={() => setFilterPriority('MÉDIA')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterPriority === 'MÉDIA' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              🟡 MÉDIA
            </button>
            <button
              onClick={() => setFilterPriority('BAIXA')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterPriority === 'BAIXA' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              🟢 BAIXA
            </button>
          </div>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 text-slate-200 border border-slate-800 text-xs rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="ALL">Todos os Status</option>
            <option value="PENDENTE">PENDENTE</option>
            <option value="VIATURA_A_CAMINHO">VIATURA A CAMINHO</option>
            <option value="EM_ATENDIMENTO">EM ATENDIMENTO</option>
            <option value="FINALIZADA">FINALIZADA</option>
          </select>
        </div>
      </div>

      {/* Occurrences List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-white text-base flex items-center gap-2">
            <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
            <span>Fila de Chamados e Ocorrências Ativas ({filtered.length})</span>
          </h2>
          <span className="text-xs text-slate-400">Atualização em tempo real</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileText className="w-12 h-12 mx-auto text-slate-700 mb-3" />
            <p>Nenhuma ocorrência encontrada para os filtros selecionados.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filtered.map((occ) => {
              const isCritical = occ.ai_priority === 'ALTA';
              const isMedium = occ.ai_priority === 'MÉDIA';

              return (
                <div
                  key={occ.id}
                  className="p-5 hover:bg-slate-800/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-extrabold text-amber-400 bg-amber-950/60 border border-amber-800 px-2.5 py-0.5 rounded-md">
                        {occ.protocol}
                      </span>

                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${
                          isCritical
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : isMedium
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        {isCritical ? '🔴 ALTA PRIORIDADE' : isMedium ? '🟡 MÉDIA PRIORIDADE' : '🟢 BAIXA PRIORIDADE'}
                      </span>

                      <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-md border border-slate-700">
                        Status: {occ.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-base">{occ.category}</h3>
                    <p className="text-xs text-slate-300 line-clamp-2">{occ.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        <span>{occ.address}</span>
                      </span>

                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-blue-400" />
                        <span>
                          {occ.citizen_name || 'Anônimo'} (@{occ.telegram_username || 'telegram'})
                        </span>
                      </span>

                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{new Date(occ.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                    </div>

                    {/* AI Summary Box */}
                    {occ.ai_summary && (
                      <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 text-xs flex items-start space-x-2 mt-2">
                        <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-amber-300">
                            Triagem IA: {occ.ai_recommended_unit || 'Viatura Operacional'} (Score Risco: {occ.ai_risk_score}/10)
                          </p>
                          <p className="text-slate-300 mt-0.5">{occ.ai_summary}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Action Column */}
                  <div className="flex flex-col md:items-end justify-between space-y-2 flex-shrink-0">
                    <button
                      onClick={() => handleOpenDetail(occ)}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center space-x-2 shadow-md"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Gerenciar & Despachar</span>
                    </button>

                    {occ.dispatched_unit && (
                      <div className="text-xs text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 flex items-center space-x-1">
                        <Car className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{occ.dispatched_unit}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail / Dispatch Modal */}
      {selectedOccurrence && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl text-white">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="font-mono font-extrabold text-amber-400 text-lg">
                  {selectedOccurrence.protocol}
                </span>
                <h3 className="font-bold text-lg text-white">{selectedOccurrence.category}</h3>
              </div>

              <button
                onClick={() => setSelectedOccurrence(null)}
                className="text-slate-400 hover:text-white text-xl font-bold bg-slate-800 rounded-full w-8 h-8 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* AI Triage Section */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  AVALIAÇÃO DE TRIAGEM POR INTELIGÊNCIA ARTIFICIAL
                </span>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  Risco: {selectedOccurrence.ai_risk_score}/10
                </span>
              </div>
              <p className="text-sm text-slate-200">{selectedOccurrence.ai_summary}</p>
              <div className="text-xs text-slate-400 font-semibold pt-1">
                Unidade Recomendada: <span className="text-emerald-400">{selectedOccurrence.ai_recommended_unit}</span>
              </div>
            </div>

            {/* Description & Citizen Details */}
            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Descrição do Cidadão</label>
                <p className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200 mt-1">
                  {selectedOccurrence.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Localização & Endereço</label>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200 mt-1 flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{selectedOccurrence.address}</span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Cidadão do Telegram</label>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200 mt-1 flex items-center space-x-2">
                    <User className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span>
                      {selectedOccurrence.citizen_name} (@{selectedOccurrence.telegram_username})
                    </span>
                  </div>
                </div>
              </div>

              {/* Photos & Videos attached */}
              {selectedOccurrence.photo_urls && selectedOccurrence.photo_urls.length > 0 && (
                <div>
                  <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Fotos Anexadas</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                    {selectedOccurrence.photo_urls.map((p, idx) => (
                      <img
                        key={idx}
                        src={p}
                        alt="Anexo GCM"
                        className="rounded-xl border border-slate-800 h-28 w-full object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dispatch Operations Form */}
            <div className="border-t border-slate-800 pt-4 space-y-4">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Car className="w-4 h-4 text-blue-400" />
                <span>Despacho Operacional GCM 153</span>
              </h4>

              {/* Status Selector Buttons */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold">Atualizar Status do Atendimento:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <button
                    onClick={() => handleStatusChange('PENDENTE')}
                    className={`p-2.5 rounded-xl border font-bold transition ${
                      selectedOccurrence.status === 'PENDENTE'
                        ? 'bg-rose-600 text-white border-rose-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    PENDENTE
                  </button>
                  <button
                    onClick={() => handleStatusChange('VIATURA_A_CAMINHO')}
                    className={`p-2.5 rounded-xl border font-bold transition ${
                      selectedOccurrence.status === 'VIATURA_A_CAMINHO'
                        ? 'bg-amber-600 text-white border-amber-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    A CAMINHO
                  </button>
                  <button
                    onClick={() => handleStatusChange('EM_ATENDIMENTO')}
                    className={`p-2.5 rounded-xl border font-bold transition ${
                      selectedOccurrence.status === 'EM_ATENDIMENTO'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    EM ATENDIMENTO
                  </button>
                  <button
                    onClick={() => handleStatusChange('FINALIZADA')}
                    className={`p-2.5 rounded-xl border font-bold transition ${
                      selectedOccurrence.status === 'FINALIZADA'
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    FINALIZADA
                  </button>
                </div>
              </div>

              {/* Unit assignment & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Viatura / Equipe Atribuída:</label>
                  <input
                    type="text"
                    value={unitInput}
                    onChange={(e) => setUnitInput(e.target.value)}
                    placeholder="Ex: ROMU-01, Patrulha Maria da Penha MP-01..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Notas do Despachante CECOM:</label>
                  <input
                    type="text"
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="Observações do atendimento por rádio..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={handleSaveDispatch}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-lg"
                >
                  Salvar Atualizações do Chamado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

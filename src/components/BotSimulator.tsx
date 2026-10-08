import React, { useState, useRef, useEffect } from 'react';
import { Shield, Send, Image, Video, MapPin, CheckCheck, Loader2, Sparkles, RefreshCw, AlertTriangle, Phone } from 'lucide-react';
import { Occurrence, AITriageResponse } from '../types';

interface BotSimulatorProps {
  onOccurrenceCreated: (occ: Occurrence) => void;
  addLog: (log: string) => void;
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text?: string;
  photoUrl?: string;
  videoUrl?: string;
  location?: { lat: number; lng: number; address: string };
  inlineButtons?: { text: string; action: string }[];
  timestamp: string;
}

export const BotSimulator: React.FC<BotSimulatorProps> = ({ onOccurrenceCreated, addLog }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: `🛡️ *GUARDA CIVIL MUNICIPAL - GCM DIGITAL 153*\n\nOlá, Cidadão! Seja bem-vindo(a) ao atendimento virtual oficial.\n\nEste assistente conta com *Triagem por Inteligência Artificial* para priorizar emergências e encaminhar viaturas com máxima agilidade.\n\n⚠️ *Em caso de risco iminente à vida, ligue 153.*`,
      inlineButtons: [
        { text: '🚨 REGISTRAR OCORRÊNCIA', action: 'menu_register_occurrence' },
        { text: '🔍 CONSULTAR PROTOCOLO', action: 'menu_check_protocol' },
        { text: '📞 TELEFONES ÚTEIS (153)', action: 'menu_useful_phones' },
        { text: '🛡️ CONHEÇA A GCM', action: 'menu_about_gcm' }
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [step, setStep] = useState<'idle' | 'category' | 'description' | 'photo' | 'video' | 'location' | 'submitting'>('idle');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [descriptionInput, setDescriptionInput] = useState<string>('');
  const [attachedPhotos, setAttachedPhotos] = useState<string[]>([]);
  const [attachedVideos, setAttachedVideos] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, step, isAiLoading]);

  const addBotMessage = (text: string, inlineButtons?: { text: string; action: string }[]) => {
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'bot',
      text,
      inlineButtons,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const addUserMessage = (text: string, photoUrl?: string, location?: { lat: number; lng: number; address: string }) => {
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      photoUrl,
      location,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const handleButtonClick = (action: string, buttonText: string) => {
    addUserMessage(buttonText);
    addLog(`[Aiogram 3 FSM] CallbackQuery recebido: ${action}`);

    if (action === 'menu_register_occurrence') {
      setStep('category');
      addBotMessage(
        `🚨 *REGISTRO DE OCORRÊNCIA GCM 153*\n\nSelecione abaixo a *categoria* que melhor descreve o incidente:`,
        [
          { text: '🏢 Patrimonial / Pichação', action: 'cat_Patrimonial' },
          { text: '🔊 Perturbação / Agressão', action: 'cat_Agressao' },
          { text: '🛡️ Patrulha Maria da Penha', action: 'cat_MariaDaPenha' },
          { text: '🏫 Ronda Escolar', action: 'cat_Escolar' },
          { text: '🚗 Trânsito / Acidente', action: 'cat_Transito' },
          { text: '🌲 Meio Ambiente / Animais', action: 'cat_Ambiente' },
          { text: '👁️ Atitude Suspeita', action: 'cat_Suspeita' }
        ]
      );
    } else if (action.startsWith('cat_')) {
      const categoryNames: Record<string, string> = {
        cat_Patrimonial: 'Patrimonial / Pichação / Vandalismo',
        cat_Agressao: 'Agressão / Violência / Perturbação',
        cat_MariaDaPenha: 'Violência Doméstica / Patrulha Maria da Penha',
        cat_Escolar: 'Ronda Escolar / Segurança nas Escolas',
        cat_Transito: 'Trânsito / Acidente / Estacionamento Irregular',
        cat_Ambiente: 'Meio Ambiente / Animais / Descarte Irregular',
        cat_Suspeita: 'Atitude Suspeita / Averiguação'
      };
      const cat = categoryNames[action] || 'Outros Atendimentos GCM';
      setSelectedCategory(cat);
      setStep('description');
      addBotMessage(
        `✅ Categoria Selecionada: *${cat}*\n\n✍️ Por favor, digite uma *descrição detalhada* do ocorrido.\n_(Ex: Pessoas envolvidas, o que aconteceu, suspeitos com armas, veículos, etc.)_`
      );
    } else if (action === 'menu_useful_phones') {
      addBotMessage(
        `📞 *TELEFONES ÚTEIS DE EMERGÊNCIA*\n\n• *153* - Guarda Civil Municipal (GCM)\n• *190* - Polícia Militar (PM)\n• *193* - Corpo de Bombeiros\n• *192* - SAMU\n• *180* - Central da Mulher`
      );
    } else if (action === 'menu_about_gcm') {
      addBotMessage(
        `🛡️ *GUARDA CIVIL MUNICIPAL*\nA GCM atua 24h por dia no patrulhamento ostensivo comunitário, segurança de escolas, combate ao crime e proteção à família.`
      );
    } else if (action === 'menu_check_protocol') {
      addBotMessage(
        `🔍 Para consultar um protocolo existente, digite o número no formato *#GCM-2026-XXXXX*.`
      );
    }
  };

  const handleSendDescription = () => {
    if (!descriptionInput.trim()) return;
    const text = descriptionInput;
    setDescriptionInput('');
    addUserMessage(text);
    addLog(`[Aiogram 3 FSM] Estado: OccurrenceFSM.waiting_photos | Descrição: "${text.substring(0, 40)}..."`);
    setStep('photo');

    addBotMessage(
      `📸 *RECEBIMENTO DE FOTOS*\n\nEnvie fotos do local para orientar as equipes da GCM ou escolha uma das amostras abaixo:`,
      [
        { text: '📷 Anexar Foto de Exemplo 1', action: 'attach_photo_1' },
        { text: '📷 Anexar Foto de Exemplo 2', action: 'attach_photo_2' },
        { text: '➡️ Avançar sem Fotos', action: 'skip_photos' }
      ]
    );
  };

  const handlePhotoAction = (action: string) => {
    let photoUrl = '';
    if (action === 'attach_photo_1') {
      photoUrl = 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80';
      setAttachedPhotos((prev) => [...prev, photoUrl]);
      addUserMessage('📷 Foto Anexada: Local da Ocorrência', photoUrl);
      addLog('[Aiogram 3 FSM] Foto recebida e salva no banco de mídias.');
    } else if (action === 'attach_photo_2') {
      photoUrl = 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80';
      setAttachedPhotos((prev) => [...prev, photoUrl]);
      addUserMessage('📷 Foto Anexada: Suspeitos', photoUrl);
      addLog('[Aiogram 3 FSM] Foto de suspeito anexada.');
    } else {
      addUserMessage('➡️ Avançar sem fotos');
    }

    setStep('video');
    addBotMessage(
      `🎥 *RECEBIMENTO DE VÍDEOS*\n\nDeseja anexar algum vídeo da ocorrência?`,
      [
        { text: '📹 Anexar Vídeo Curto', action: 'attach_video_sample' },
        { text: '➡️ Avançar para Localização', action: 'skip_videos' }
      ]
    );
  };

  const handleVideoAction = (action: string) => {
    if (action === 'attach_video_sample') {
      const vUrl = 'https://assets.mixkit.co/videos/preview/mixkit-police-car-driving-at-night-42861-large.mp4';
      setAttachedVideos([vUrl]);
      addUserMessage('📹 Vídeo Anexado: Gravação do local');
    } else {
      addUserMessage('➡️ Avançar sem vídeo');
    }

    setStep('location');
    addBotMessage(
      `📍 *LOCALIZAÇÃO DA OCORRÊNCIA*\n\nClique em um dos locais abaixo para enviar a localização exata do chamado para o mapa do CECOM 153:`,
      [
        { text: '📍 Jardim Aquarius (Rua das Palmeiras)', action: 'loc_aquarius' },
        { text: '📍 Vila Adyana (Escola Prof. José Maria)', action: 'loc_adyana' },
        { text: '📍 Centro (Rua Nelson D\'Ávila)', action: 'loc_centro' },
        { text: '📍 Parque Santos Dumont', action: 'loc_santosdumont' }
      ]
    );
  };

  const handleLocationAction = async (action: string) => {
    let loc = {
      lat: -23.2185,
      lng: -45.9082,
      address: 'Rua das Palmeiras, Bairro Jardim Aquarius, São José dos Campos'
    };

    if (action === 'loc_adyana') {
      loc = { lat: -23.2042, lng: -45.8915, address: 'Av. São João, 1200, Vila Adyana, São José dos Campos' };
    } else if (action === 'loc_centro') {
      loc = { lat: -23.1950, lng: -45.8820, address: 'Rua Nelson D\'Ávila, 450, Centro, São José dos Campos' };
    } else if (action === 'loc_santosdumont') {
      loc = { lat: -23.2001, lng: -45.8850, address: 'Praça do Esporte, Parque Santos Dumont' };
    }

    setSelectedLocation(loc);
    addUserMessage(`📍 Localização Enviada: ${loc.address}`, undefined, loc);
    addLog(`[Aiogram 3 FSM] Localização GPS recebida: (${loc.lat}, ${loc.lng})`);

    // Submit occurrence & run AI Triage
    setIsAiLoading(true);
    setStep('submitting');
    addLog('[FastAPI + Gemini 3.6 Flash] Executando triagem inteligente de prioridade e viatura...');

    try {
      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          description: descriptionInput || 'Ocorrência registrada via Telegram Bot 153',
          address: loc.address,
          has_photos: attachedPhotos.length > 0,
          has_videos: attachedVideos.length > 0
        })
      });

      const triage: AITriageResponse = await response.json();

      // Create occurrence on backend
      const createRes = await fetch('/api/occurrences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_user_id: 98765432,
          telegram_username: 'cidadao_sjc',
          citizen_name: 'Cidadão Usuário',
          category: selectedCategory,
          description: messages.find((m) => m.sender === 'user' && !m.text?.includes('➡️') && !m.text?.includes('📍'))?.text || selectedCategory,
          address: loc.address,
          latitude: loc.lat,
          longitude: loc.lng,
          photo_urls: attachedPhotos,
          video_urls: attachedVideos,
          ai_priority: triage.priority,
          ai_summary: triage.summary,
          ai_recommended_unit: triage.recommended_unit,
          ai_risk_score: triage.risk_score
        })
      });

      const newOcc: Occurrence = await createRes.json();
      onOccurrenceCreated(newOcc);
      addLog(`[GCM 153 Backend] Ocorrência salva com Protocolo: ${newOcc.protocol} | Prioridade IA: ${triage.priority}`);

      setIsAiLoading(false);
      setStep('idle');

      const priorityBadge = triage.priority === 'ALTA' ? '🔴 ALTA PRIORIDADE' : triage.priority === 'MÉDIA' ? '🟡 MÉDIA PRIORIDADE' : '🟢 BAIXA PRIORIDADE';

      addBotMessage(
        `🚨 *OCORRÊNCIA REGISTRADA COM SUCESSO!*\n\n📌 *Protocolo:* \`${newOcc.protocol}\` \n🏷️ *Categoria:* ${selectedCategory}\n📍 *Local:* ${loc.address}\n\n🧠 *TRIAGEM AUTOMÁTICA GCM (IA):*\n• *Gravidade:* ${priorityBadge}\n• *Score de Risco:* ${triage.risk_score}/10\n• *Unidade Sugerida:* ${triage.recommended_unit}\n• *Ação Imediata:* ${triage.immediate_action}\n\n_Os operadores do CECOM 153 foram notificados no painel em tempo real e a viatura mais próxima está sendo direcionada._`,
        [{ text: '🚨 REGISTRAR NOVA OCORRÊNCIA', action: 'menu_register_occurrence' }]
      );
    } catch (err) {
      console.error(err);
      setIsAiLoading(false);
      setStep('idle');
      addBotMessage('❌ Ocorreu um erro ao processar seu chamado. Por favor, tente novamente ou ligue 153.');
    }
  };

  const restartBot = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'bot',
        text: `🛡️ *GUARDA CIVIL MUNICIPAL - GCM DIGITAL 153*\n\nOlá, Cidadão! Seja bem-vindo(a) ao atendimento virtual oficial.\n\nEste assistente conta com *Triagem por Inteligência Artificial* para priorizar emergências e encaminhar viaturas com máxima agilidade.\n\n⚠️ *Em caso de risco iminente à vida, ligue 153.*`,
        inlineButtons: [
          { text: '🚨 REGISTRAR OCORRÊNCIA', action: 'menu_register_occurrence' },
          { text: '🔍 CONSULTAR PROTOCOLO', action: 'menu_check_protocol' },
          { text: '📞 TELEFONES ÚTEIS (153)', action: 'menu_useful_phones' },
          { text: '🛡️ CONHEÇA A GCM', action: 'menu_about_gcm' }
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setStep('idle');
    setSelectedCategory('');
    setDescriptionInput('');
    setAttachedPhotos([]);
    setAttachedVideos([]);
    setSelectedLocation(null);
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Telegram Phone Simulator Frame */}
      <div className="bg-slate-900 rounded-3xl border-4 border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[740px]">
        
        {/* Telegram Header */}
        <div className="bg-slate-800 px-4 py-3 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md relative">
              <Shield className="w-5 h-5" />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-800"></span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h2 className="font-bold text-white text-sm">GCM Digital 153 Bot</h2>
                <span className="bg-blue-500 text-white text-[10px] font-bold px-1 rounded-full">✓</span>
              </div>
              <p className="text-xs text-blue-400">bot oficial da Guarda Municipal</p>
            </div>
          </div>

          <button
            onClick={restartBot}
            className="text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 p-2 rounded-lg transition"
            title="Reiniciar conversa /start"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Message Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/60 font-sans text-sm">
          
          <div className="text-center my-2">
            <span className="bg-slate-800/80 text-slate-400 text-xs px-3 py-1 rounded-full border border-slate-700/50">
              Hoje • Criptografia de ponta a ponta
            </span>
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/80'
                }`}
              >
                {msg.text && (
                  <div className="whitespace-pre-line leading-relaxed text-xs sm:text-sm">
                    {msg.text.split('\n').map((line, i) => {
                      if (line.startsWith('•') || line.startsWith('🚨') || line.startsWith('🛡️') || line.startsWith('📌')) {
                        return (
                          <div key={i} className="font-semibold text-slate-100 my-0.5">
                            {line}
                          </div>
                        );
                      }
                      return <div key={i}>{line}</div>;
                    })}
                  </div>
                )}

                {msg.photoUrl && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-slate-700">
                    <img src={msg.photoUrl} alt="Anexo" className="max-h-48 w-full object-cover" />
                  </div>
                )}

                {msg.location && (
                  <div className="mt-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-700 text-xs flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-rose-400 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-slate-200">GPS Recebido</p>
                      <p className="text-slate-400">{msg.location.address}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end space-x-1 mt-1.5 text-[10px] text-slate-400">
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'user' && <CheckCheck className="w-3.5 h-3.5 text-blue-300" />}
                </div>
              </div>

              {/* Inline Keyboard Buttons from Aiogram 3 */}
              {msg.inlineButtons && (
                <div className="mt-2 w-full max-w-[85%] grid grid-cols-1 gap-1.5">
                  {msg.inlineButtons.map((btn, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (btn.action.startsWith('attach_photo')) {
                          handlePhotoAction(btn.action);
                        } else if (btn.action.startsWith('attach_video') || btn.action === 'skip_videos') {
                          handleVideoAction(btn.action);
                        } else if (btn.action.startsWith('loc_')) {
                          handleLocationAction(btn.action);
                        } else if (btn.action === 'skip_photos') {
                          handlePhotoAction(btn.action);
                        } else {
                          handleButtonClick(btn.action, btn.text);
                        }
                      }}
                      className="bg-slate-800 hover:bg-blue-600 hover:text-white text-blue-400 border border-slate-700/80 text-xs font-semibold py-2.5 px-3 rounded-xl transition text-left flex items-center justify-between group shadow-sm active:scale-98"
                    >
                      <span>{btn.text}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition text-blue-200">➔</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* AI Loading State */}
          {isAiLoading && (
            <div className="flex items-start space-x-2">
              <div className="bg-slate-800 p-3.5 rounded-2xl rounded-bl-none border border-slate-700 text-slate-300 text-xs flex items-center space-x-2 shadow-lg">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                <span>O agente de IA (Gemini 3.6 Flash) está analisando a gravidade e gerando o protocolo...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-900 border-t border-slate-800">
          {step === 'description' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendDescription();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
                placeholder="Digite a descrição da ocorrência..."
                className="flex-1 bg-slate-950 text-white text-sm rounded-xl px-4 py-2.5 border border-slate-700 focus:outline-none focus:border-blue-500"
                autoFocus
              />
              <button
                type="submit"
                disabled={!descriptionInput.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between text-xs text-slate-400 px-2 py-1">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Aiogram 3 FSM Ativo: selecione as opções acima</span>
              </div>
              <button
                onClick={restartBot}
                className="text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>/start</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

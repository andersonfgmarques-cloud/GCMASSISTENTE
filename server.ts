import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Initial mock occurrences for GCM 153
let occurrences = [
  {
    id: 101,
    protocol: "#GCM-2026-00101",
    telegram_user_id: 98765432,
    telegram_username: "carlos_silva",
    citizen_name: "Carlos Eduardo Silva",
    citizen_phone: "(12) 99123-4567",
    category: "Violência Doméstica / Patrulha Maria da Penha",
    description: "Mulher sendo ameaçada por ex-companheiro na porta da residência. Ele recusa-se a sair e grita com a vítima. Medida protetiva ativa.",
    address: "Rua das Palmeiras, 340, Bairro Jardim Aquarius",
    latitude: -23.2185,
    longitude: -45.9082,
    photo_urls: [
      "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80"
    ],
    video_urls: [],
    ai_priority: "ALTA",
    ai_summary: "AMEAÇA COM MEDIDA PROTETIVA ATIVA. RISCO ELEVADO DE AGRESSÃO.",
    ai_recommended_unit: "Patrulha Maria da Penha - Viatura MP-01",
    ai_risk_score: 9,
    status: "VIATURA_A_CAMINHO",
    dispatched_unit: "Patrulha Maria da Penha MP-01",
    dispatcher_notes: "Viatura MP-01 deslocando-se com giroflex. Apoio da ROMU informado.",
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60000).toISOString()
  },
  {
    id: 102,
    protocol: "#GCM-2026-00102",
    telegram_user_id: 87654321,
    telegram_username: "ana_paula",
    citizen_name: "Ana Paula Mendes",
    citizen_phone: "(12) 98877-6655",
    category: "Ronda Escolar / Segurança nas Escolas",
    description: "Indivíduo em atitude suspeita oferecendo objetos a alunos no portão da Escola Municipal Prof. José Maria.",
    address: "Av. São João, 1200, Vila Adyana",
    latitude: -23.2042,
    longitude: -45.8915,
    photo_urls: [
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80"
    ],
    video_urls: [],
    ai_priority: "ALTA",
    ai_summary: "ATITUDE SUSPEITA EM AMBIENTE ESCOLAR. NECESSITA AVERIGUAÇÃO RÁPIDA DA RONDA ESCOLAR.",
    ai_recommended_unit: "Ronda Escolar - Viatura RE-03",
    ai_risk_score: 8,
    status: "PENDENTE",
    dispatched_unit: null,
    dispatcher_notes: null,
    created_at: new Date(Date.now() - 32 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 32 * 60000).toISOString()
  },
  {
    id: 103,
    protocol: "#GCM-2026-00103",
    telegram_user_id: 76543210,
    telegram_username: "marcos_viana",
    citizen_name: "Marcos Viana",
    citizen_phone: "(12) 97766-5544",
    category: "Patrimonial / Pichação / Vandalismo",
    description: "Dois indivíduos pichando o muro da biblioteca municipal no Parque Santos Dumont.",
    address: "Praça do Esporte, Parque Santos Dumont",
    latitude: -23.2001,
    longitude: -45.8850,
    photo_urls: [
      "https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?auto=format&fit=crop&w=800&q=80"
    ],
    video_urls: [],
    ai_priority: "MÉDIA",
    ai_summary: "DANO AO PATRIMÔNIO PÚBLICO EM ANDAMENTO. ENVIAR MOTOCICLETAS DA GTAM.",
    ai_recommended_unit: "GTAM - Grupo Tático em Motocicletas",
    ai_risk_score: 5,
    status: "EM_ATENDIMENTO",
    dispatched_unit: "GTAM-01",
    dispatcher_notes: "Equipe GTAM-01 no local fazendo abordagem aos suspeitos.",
    created_at: new Date(Date.now() - 50 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 60000).toISOString()
  },
  {
    id: 104,
    protocol: "#GCM-2026-00104",
    telegram_user_id: 65432109,
    telegram_username: "roberto_alves",
    citizen_name: "Roberto Alves",
    citizen_phone: "(12) 98111-2233",
    category: "Trânsito / Acidente / Estacionamento Irregular",
    description: "Veículo estacionado na rampa de acessibilidade impedindo passagem de cadeirante.",
    address: "Rua Nelson D'Ávila, 450, Centro",
    latitude: -23.1950,
    longitude: -45.8820,
    photo_urls: [],
    video_urls: [],
    ai_priority: "BAIXA",
    ai_summary: "INFRAÇÃO DE TRÂNSITO COM BLOQUEIO DE ACESSIBILIDADE.",
    ai_recommended_unit: "GCM Trânsito / Fiscalização",
    ai_risk_score: 3,
    status: "FINALIZADA",
    dispatched_unit: "Trânsito-02",
    dispatcher_notes: "Condutor notificado e veículo removido.",
    created_at: new Date(Date.now() - 120 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 40 * 60000).toISOString()
  }
];

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});

// API Route: AI Triage endpoint
app.post("/api/triage", async (req, res) => {
  const { category, description, address, has_photos, has_videos } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Return heuristic fallback
    let priority = "MÉDIA";
    let unit = "Patrulha Operacional de Área";
    let risk = 5;
    let action = "Despachar viatura do setor para averiguação.";

    const d = (description || "").toLowerCase();
    const c = (category || "").toLowerCase();

    if (d.includes("arma") || d.includes("agressão") || d.includes("bater") || d.includes("maria da penha") || d.includes("socorro") || c.includes("violência")) {
      priority = "ALTA";
      unit = c.includes("maria da penha") ? "Patrulha Maria da Penha" : "ROMU - Rondas Ostensivas";
      risk = 9;
      action = "DESPACHO IMEDIATO: Enviar viatura com prioridade total.";
    } else if (d.includes("som alto") || d.includes("pichação") || d.includes("trânsito")) {
      priority = "MÉDIA";
      unit = "GTAM - Grupo de Motocicletas";
      risk = 5;
      action = "Despachar equipe para verificação no local.";
    } else {
      priority = "BAIXA";
      unit = "Patrulha Comunitária";
      risk = 3;
      action = "Inspecionar durante a ronda de rotina.";
    }

    return res.json({
      priority,
      category: category || "Outros",
      recommended_unit: unit,
      risk_score: risk,
      summary: `Triagem Heurística GCM 153: Chamado de ${category} classificado como ${priority}.`,
      immediate_action: action
    });
  }

  try {
    const prompt = `
Você é o Analista Inteligente de Triagem do Centro de Operações da Guarda Civil Municipal (GCM 153).
Classifique a seguinte ocorrência recebida via Telegram Bot:

CATEGORIA: ${category}
DESCRIÇÃO: "${description}"
ENDEREÇO/LOCAL: ${address || "Coordenadas GPS enviadas"}
MÍDIAS: Fotos: ${has_photos ? "Sim" : "Não"}, Vídeos: ${has_videos ? "Sim" : "Não"}

INSTRUÇÕES DE CLASSIFICAÇÃO:
1. Prioridade (ALTA, MÉDIA, BAIXA):
   - ALTA: Risco iminente de violência, arma de fogo/branca, violência doméstica (Maria da Penha), invasão a escolas/patrimônio com suspeitos presentes, roubo recente.
   - MÉDIA: Perturbação de sossego com tumulto, pichação ativa, acidente sem vítima bloqueando trânsito, atitude suspeita.
   - BAIXA: Dano patrimonial antigo, descarte irregular de lixo, solicitações de orientação.
2. Unidade Recomendada (ex: ROMU, Patrulha Maria da Penha, Ronda Escolar, GTAM Motos, Patrulha Comunitária).
3. Risk Score: 1 (mínimo) a 10 (múltiplas vítimas ou armas).
4. Summary: Resumo direto de 1-2 frases para transmissão por rádio.
5. Immediate Action: Recomendação para o operador despachante do 153.

Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "priority": "ALTA" | "MÉDIA" | "BAIXA",
  "category": "${category}",
  "recommended_unit": "String",
  "risk_score": Number,
  "summary": "String",
  "immediate_action": "String"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      priority: parsed.priority || "MÉDIA",
      category: parsed.category || category,
      recommended_unit: parsed.recommended_unit || "Patrulha Operacional de Área",
      risk_score: parsed.risk_score || 5,
      summary: parsed.summary || "Ocorrência registrada via Telegram Bot 153.",
      immediate_action: parsed.immediate_action || "Despachar viatura para verificação no local."
    });
  } catch (err: any) {
    console.error("Erro na API da Gemini:", err);
    return res.status(500).json({ error: "Erro na triagem de IA", details: err.message });
  }
});

// API Route: Get all occurrences
app.get("/api/occurrences", (req, res) => {
  res.json(occurrences);
});

// API Route: Create new occurrence
app.post("/api/occurrences", (req, res) => {
  const {
    telegram_user_id,
    telegram_username,
    citizen_name,
    citizen_phone,
    category,
    description,
    address,
    latitude,
    longitude,
    photo_urls,
    video_urls,
    ai_priority,
    ai_summary,
    ai_recommended_unit,
    ai_risk_score
  } = req.body;

  const seq = occurrences.length + 105;
  const protocol = `#GCM-2026-${String(seq).padStart(5, "0")}`;

  const newOcc = {
    id: Date.now(),
    protocol,
    telegram_user_id: telegram_user_id || 123456,
    telegram_username: telegram_username || "cidadao_telegram",
    citizen_name: citizen_name || "Cidadão Anônimo",
    citizen_phone: citizen_phone || null,
    category: category || "Outros",
    description: description || "Sem descrição",
    address: address || "São José dos Campos - SP",
    latitude: latitude || -23.1791,
    longitude: longitude || -45.8872,
    photo_urls: photo_urls || [],
    video_urls: video_urls || [],
    ai_priority: ai_priority || "MÉDIA",
    ai_summary: ai_summary || "Ocorrência registrada via Bot Telegram.",
    ai_recommended_unit: ai_recommended_unit || "Patrulha Operacional de Área",
    ai_risk_score: ai_risk_score || 5,
    status: "PENDENTE",
    dispatched_unit: null,
    dispatcher_notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  occurrences.unshift(newOcc);
  res.status(201).json(newOcc);
});

// API Route: Update status
app.patch("/api/occurrences/:protocol/status", (req, res) => {
  const { protocol } = req.params;
  const { status, dispatched_unit, notes } = req.body;

  const occ = occurrences.find((o) => o.protocol === protocol);
  if (!occ) {
    return res.status(404).json({ error: "Ocorrência não encontrada." });
  }

  if (status) occ.status = status;
  if (dispatched_unit !== undefined) occ.dispatched_unit = dispatched_unit;
  if (notes !== undefined) occ.dispatcher_notes = notes;
  occ.updated_at = new Date().toISOString();

  res.json(occ);
});

// Serve Vite in development / production static fallback
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🛡️ Servidor GCM Digital 153 rodando em http://0.0.0.0:${PORT}`);
  });
}

startServer();

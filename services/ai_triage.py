"""
GCM DIGITAL 153 - Serviço de Triagem de Ocorrências com Inteligência Artificial
Analisa descrição, categoria, imagens/mídias e localização para classificar prioridade e indicar despacho imediato da Guarda Civil Municipal.
"""

import os
import json
from typing import Optional
from models.occurrence import AITriageResult, OccurrencePriority, OccurrenceCategory
from config.settings import settings
from utils.logger import logger


class AITriageService:
    """Classifica automaticamente ocorrências policiais/municipais para o CECOM (Centro de Operações 153)."""

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")

    async def analyze_occurrence(
        self,
        category: str,
        description: str,
        address: Optional[str] = None,
        has_photos: bool = False,
        has_videos: bool = False
    ) -> AITriageResult:
        """
        Executa a triagem inteligente da ocorrência.
        Usa o modelo Gemini (ou regras analíticas de fallback se a chave for offline).
        """
        if not self.api_key:
            logger.warning("⚠️ GEMINI_API_KEY não configurada. Utilizando módulo heurístico de triagem.")
            return self._heuristic_fallback(category, description)

        prompt = f"""
Você é um Analista do Centro de Operações e Inteligência da Guarda Civil Municipal (GCM 153).
Sua missão é realizar a triagem rápida e crítica de um chamado recebido pelo Telegram Bot.

DADOS DA OCORRÊNCIA:
- Categoria Selecionada pelo Cidadão: {category}
- Descrição do Relato: "{description}"
- Endereço / Local: {address or 'Localização GPS enviada'}
- Mídias Anexadas: Fotos: {'Sim' if has_photos else 'Não'}, Vídeos: {'Sim' if has_videos else 'Não'}

INSTRUÇÕES DE CLASSIFICAÇÃO:
1. Prioridade (ALTA, MÉDIA, BAIXA):
   - ALTA: Violência ativa, agressão física, Lei Maria da Penha em andamento, porte de arma, furto/roubo recente, invasão de escola/patrimônio com suspeitos no local.
   - MÉDIA: Perturbação do sossego com aglomeração, pichação ativa, trânsito bloqueado, atitude suspeita sem armas explícitas.
   - BAIXA: Dano patrimonial antigo, veículos abandonados, descarte de entulho, consulta ou solicitação administrativa.
2. Unidade Recomendada:
   - ROMU (Rondas Ostensivas Municipais) - Ocorrências táticas ou de maior gravidade.
   - Patrulha Maria da Penha - Violência doméstica ou descumprimento de medida protetiva.
   - Ronda Escolar - Ambientes escolares e entorno.
   - GTAM (Grupo de Tático em Motocicletas) - Trânsito rápido / perseguição / apoio veloz.
   - Patrulha Comunitária / Viatura Operacional de Área.
3. Nota de Risco: Escala de 1 a 10.
4. Resumo Executivo: Máximo 2 frases objetivas para o rádio/painel da GCM.
5. Ação Imediata: Recomendação técnica para o despachante 153.

Responda ESTRITAMENTE em formato JSON com as chaves:
{{
  "priority": "ALTA" | "MÉDIA" | "BAIXA",
  "category": "{category}",
  "recommended_unit": "Nome da Unidade Especializada",
  "risk_score": 1 a 10,
  "summary": "Resumo sintético para a central de rádio",
  "immediate_action": "Orientação para envio de viatura"
}}
"""

        try:
            from google import genai
            client = genai.Client(api_key=self.api_key)
            response = client.models.generate_content(
                model="gemini-3.6-flash",
                contents=prompt,
                config={"response_mime_type": "application/json"}
            )
            
            data = json.loads(response.text)
            p_val = data.get("priority", "MÉDIA").upper()
            priority_enum = OccurrencePriority.MEDIUM
            if "ALTA" in p_val:
                priority_enum = OccurrencePriority.CRITICAL
            elif "BAIXA" in p_val:
                priority_enum = OccurrencePriority.LOW

            return AITriageResult(
                priority=priority_enum,
                category=data.get("category", category),
                recommended_unit=data.get("recommended_unit", "Viatura Operacional de Área"),
                risk_score=int(data.get("risk_score", 5)),
                summary=data.get("summary", "Ocorrência registrada via Telegram Bot 153."),
                immediate_action=data.get("immediate_action", "Despachar viatura do setor para averiguação.")
            )

        except Exception as err:
            logger.error(f"❌ Erro ao chamar a API da Gemini para triagem IA: {err}")
            return self._heuristic_fallback(category, description)

    def _heuristic_fallback(self, category: str, description: str) -> AITriageResult:
        """Fallback heurístico determinístico para casos sem chave de API."""
        desc_lower = description.lower()
        cat_lower = category.lower()

        if any(word in desc_lower or word in cat_lower for word in ["arma", "agressão", "bater", "sangue", "maria da penha", "socorro", "assalto", "escola"]):
            priority = OccurrencePriority.CRITICAL
            unit = "Patrulha Maria da Penha" if "maria da penha" in desc_lower or "violência doméstica" in cat_lower else ("Ronda Escolar" if "escola" in desc_lower else "ROMU - Rondas Ostensivas")
            risk = 9
            action = "DESPACHO IMEDIATO: Enviar viatura com prioridade total de sirene e giroflex."
        elif any(word in desc_lower or word in cat_lower for word in ["som alto", "pichação", "briga", "trânsito", "suspeito", "vandalismo"]):
            priority = OccurrencePriority.MEDIUM
            unit = "GTAM - Grupo de Motocicletas" if "trânsito" in desc_lower else "Patrulha Operacional de Área"
            risk = 5
            action = "Despachar viatura do setor para averiguação no local."
        else:
            priority = OccurrencePriority.LOW
            unit = "Patrulha Comunitária de Área"
            risk = 3
            action = "Inspecionar durante a ronda preventiva de rotina."

        return AITriageResult(
            priority=priority,
            category=category,
            recommended_unit=unit,
            risk_score=risk,
            summary=f"Triagem Heurística: Chamado de {category} com prioridade {priority.value}.",
            immediate_action=action
        )


ai_triage_service = AITriageService()

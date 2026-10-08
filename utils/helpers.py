"""
GCM DIGITAL 153 - Utilitários e Formatação
"""

from datetime import datetime
import random
import string


def format_protocol(seq_id: int) -> str:
    """Gera um número de protocolo padrão GCM: #GCM-2026-XXXXX"""
    year = datetime.now().year
    return f"#GCM-{year}-{seq_id:05d}"


def generate_random_code(length: int = 6) -> str:
    """Gera um código alfa-numérico aleatório para verificação rápida."""
    chars = string.ascii_uppercase + string.digits
    return "".join(random.choice(chars) for _ in range(length))


def calculate_urgency_badge(urgency: str) -> str:
    """Retorna badge visual com emoji para níveis de gravidade da ocorrência."""
    urgency_lower = urgency.lower()
    if "crític" in urgency_lower or "alta" in urgency_lower or "emergência" in urgency_lower:
        return "🔴 CRÍTICA / ALTA PRIORIDADE"
    elif "méd" in urgency_lower or "atenção" in urgency_lower:
        return "🟡 MÉDIA PRIORIDADE"
    else:
        return "🟢 BAIXA PRIORIDADE / ROTINA"

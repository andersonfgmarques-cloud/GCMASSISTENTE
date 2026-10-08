"""
GCM DIGITAL 153 - Serviço Gerador de Protocolos Únicos
"""

import time
import random
from utils.helpers import format_protocol


class ProtocolService:
    """Gera números de protocolo sequenciais e únicos para o atendimento 153."""

    def __init__(self):
        self._counter = int(time.time()) % 100000

    def generate_next_protocol(self) -> str:
        """Retorna o próximo número de protocolo formatado."""
        self._counter += 1
        return format_protocol(self._counter)


protocol_service = ProtocolService()

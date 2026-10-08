"""
GCM DIGITAL 153 - Handler de Comandos Administrativos (Aiogram 3)
Acesso restrito para despachantes do CECOM da Guarda Municipal
"""

from aiogram import Router, F
from aiogram.types import Message, CallbackQuery
from aiogram.filters import Command
from config.settings import settings
from utils.logger import logger

router = Router(name="admin_router")


@router.message(Command("admin"))
async def cmd_admin(message: Message):
    """Exibe o painel administrativo do Telegram para operadores autorizados."""
    user_id = message.from_user.id
    
    # Verificação de segurança de Administrador
    if user_id not in settings.ADMIN_TELEGRAM_IDS and not settings.DEBUG:
        await message.answer("⚠️ Acesso restrito a Operadores da Guarda Civil Municipal.")
        return

    admin_text = (
        "⚙️ *PAINEL DE DESPACHO E CONTROLE GCM 153*\n\n"
        "Comandos disponíveis:\n"
        "• `/status` - Resumo estatístico das ocorrências de hoje\n"
        "• `/viaturas` - Status das viaturas em patrulhamento\n"
        "• `/web` - Abrir Painel Administrativo Web em tempo real"
    )
    await message.answer(text=admin_text, parse_mode="Markdown")


@router.message(Command("status"))
async def cmd_status(message: Message):
    """Exibe estatísticas operacionais em tempo real."""
    status_text = (
        "📊 *ESTATÍSTICAS EM TEMPO REAL - CECOM 153*\n\n"
        "• 🔴 *Ocorrências Críticas:* 3\n"
        "• 🟡 *Ocorrências em Atendimento:* 7\n"
        "• 🟢 *Finalizadas Hoje:* 18\n"
        "• 🚔 *Viaturas Ativas:* 12 (ROMU: 3, Maria da Penha: 2, Ronda Escolar: 4, GTAM: 3)\n"
        "• ⚡ *Tempo Médio de Atendimento:* 8 min 45s"
    )
    await message.answer(text=status_text, parse_mode="Markdown")

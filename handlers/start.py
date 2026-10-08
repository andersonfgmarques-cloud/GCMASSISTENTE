"""
GCM DIGITAL 153 - Handler de Boas-Vindas e Menu Principal (Aiogram 3)
"""

from aiogram import Router, F
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.filters import CommandStart, Command
from utils.logger import logger

router = Router(name="start_router")


def get_main_menu_keyboard() -> InlineKeyboardMarkup:
    """Retorna o teclado inline com os botões interativos do Menu Principal."""
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🚨 REGISTRAR OCORRÊNCIA",
                    callback_query_data="menu_register_occurrence"
                )
            ],
            [
                InlineKeyboardButton(
                    text="🔍 CONSULTAR PROTOCOLO",
                    callback_query_data="menu_check_protocol"
                ),
                InlineKeyboardButton(
                    text="📞 TELEFONES ÚTEIS (153)",
                    callback_query_data="menu_useful_phones"
                )
            ],
            [
                InlineKeyboardButton(
                    text="🛡️ CONHEÇA A GCM",
                    callback_query_data="menu_about_gcm"
                )
            ]
        ]
    )
    return keyboard


@router.message(CommandStart())
async def cmd_start(message: Message):
    """Mensagem de Boas-Vindas ativada com /start."""
    user = message.from_user
    logger.info(f"👤 Usuário iniciou o bot GCM 153: {user.full_name} (@{user.username} | ID: {user.id})")

    welcome_text = (
        f"🛡️ *GUARDA CIVIL MUNICIPAL - GCM DIGITAL 153*\n"
        f"Olá, *{user.first_name}*! Seja bem-vindo(a) ao atendimento virtual.\n\n"
        f"Este assistente permite registrar denúncias, enviar fotos, vídeos e localização "
        f"GPS diretamente para a Central de Operações da Guarda Municipal com triagem por IA.\n\n"
        f"⚠️ *Em caso de risco iminente à vida, ligue imediatamente para o 153.*"
    )

    await message.answer(
        text=welcome_text,
        parse_mode="Markdown",
        reply_markup=get_main_menu_keyboard()
    )


@router.callback_query(F.data == "menu_useful_phones")
async def cb_useful_phones(callback: CallbackQuery):
    """Exibe os números de telefone de emergência."""
    phones_text = (
        "📞 *TELEFONES ÚTEIS DE EMERGÊNCIA*\n\n"
        "• *153* - Guarda Civil Municipal (GCM)\n"
        "• *190* - Polícia Militar (PMESP)\n"
        "• *193* - Corpo de Bombeiros\n"
        "• *192* - SAMU\n"
        "• *180* - Central de Atendimento à Mulher\n"
        "• *156* - Central da Prefeitura Municipal"
    )
    await callback.message.edit_text(
        text=phones_text,
        parse_mode="Markdown",
        reply_markup=get_main_menu_keyboard()
    )
    await callback.answer()


@router.callback_query(F.data == "menu_about_gcm")
async def cb_about_gcm(callback: CallbackQuery):
    """Informa dados institucionais sobre a GCM."""
    about_text = (
        "🛡️ *SOBRE A GUARDA CIVIL MUNICIPAL (GCM 153)*\n\n"
        "A Guarda Civil Municipal atua 24h na proteção da população, segurança patrimonial, "
        "patrulhamento ostensivo comunitário, patrulhamento Maria da Penha, proteção escolar "
        "e fiscalização ambiental e de trânsito."
    )
    await callback.message.edit_text(
        text=about_text,
        parse_mode="Markdown",
        reply_markup=get_main_menu_keyboard()
    )
    await callback.answer()

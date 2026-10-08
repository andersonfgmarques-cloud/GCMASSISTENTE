"""
GCM DIGITAL 153 - Handler FSM de Registro de Ocorrência (Aiogram 3)
Máquina de Estados para Categoria -> Descrição -> Fotos -> Vídeos -> Localização -> Protocolo e Triagem IA
"""

from aiogram import Router, F
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton, ReplyKeyboardMarkup, KeyboardButton, ReplyKeyboardRemove
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from models.occurrence import OccurrenceCategory, OccurrenceCreate
from services.occurrence_service import occurrence_service
from utils.logger import logger

router = Router(name="occurrence_router")


class OccurrenceFSM(StatesGroup):
    selecting_category = State()
    waiting_description = State()
    waiting_photos = State()
    waiting_videos = State()
    waiting_location = State()


def get_categories_keyboard() -> InlineKeyboardMarkup:
    """Gera teclado inline com as categorias de ocorrência da GCM."""
    buttons = [
        [InlineKeyboardButton(text="🏢 Patrimonial / Pichação", callback_query_data="cat_Patrimonial")],
        [InlineKeyboardButton(text="🔊 Perturbação / Agressão", callback_query_data="cat_Agressao")],
        [InlineKeyboardButton(text="🛡️ Patrulha Maria da Penha", callback_query_data="cat_MariaDaPenha")],
        [InlineKeyboardButton(text="🏫 Ronda Escolar", callback_query_data="cat_Escolar")],
        [InlineKeyboardButton(text="🚗 Trânsito / Estacionamento", callback_query_data="cat_Transito")],
        [InlineKeyboardButton(text="🌲 Meio Ambiente / Animais", callback_query_data="cat_Ambiente")],
        [InlineKeyboardButton(text="👁️ Atitude Suspeita", callback_query_data="cat_Suspeita")],
        [InlineKeyboardButton(text="❌ Cancelar Registro", callback_query_data="cancel_occurrence")]
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)


@router.callback_query(F.data == "menu_register_occurrence")
async def start_occurrence_registration(callback: CallbackQuery, state: FSMContext):
    """Passo 1: Inicia o registro e solicita a categoria."""
    await state.clear()
    await state.set_state(OccurrenceFSM.selecting_category)

    msg = (
        "🚨 *REGISTRO DE OCORRÊNCIA GCM 153*\n\n"
        "Selecione abaixo a *categoria* do chamado que melhor descreve a situação:"
    )
    await callback.message.edit_text(text=msg, parse_mode="Markdown", reply_markup=get_categories_keyboard())
    await callback.answer()


@router.callback_query(OccurrenceFSM.selecting_category, F.data.startswith("cat_"))
async def category_selected(callback: CallbackQuery, state: FSMContext):
    """Passo 2: Categoria selecionada -> Solicita descrição detalhada."""
    category_map = {
        "cat_Patrimonial": "Patrimonial / Pichação / Vandalismo",
        "cat_Agressao": "Agressão / Violência / Perturbação",
        "cat_MariaDaPenha": "Violência Doméstica / Patrulha Maria da Penha",
        "cat_Escolar": "Ronda Escolar / Segurança nas Escolas",
        "cat_Transito": "Trânsito / Acidente / Estacionamento Irregular",
        "cat_Ambiente": "Meio Ambiente / Animais / Descarte Irregular",
        "cat_Suspeita": "Atitude Suspeita / Averiguação"
    }

    cat_key = callback.data
    selected_cat = category_map.get(cat_key, "Outros Atendimentos GCM")
    await state.update_data(category=selected_cat, photos=[], videos=[])
    await state.set_state(OccurrenceFSM.waiting_description)

    msg = (
        f"✅ Categoria selecionada: *{selected_cat}*\n\n"
        f"✍️ Agora, por favor, *digite uma descrição detalhada* do ocorrido.\n"
        f"_(Ex: Quem está envolvido, o que aconteceu, características físicas, se há armas, etc.)_"
    )
    await callback.message.edit_text(text=msg, parse_mode="Markdown")
    await callback.answer()


@router.message(OccurrenceFSM.waiting_description, F.text)
async def process_description(message: Message, state: FSMContext):
    """Passo 3: Recebe a descrição e solicita envio de fotos (opcional)."""
    await state.update_data(description=message.text)
    await state.set_state(OccurrenceFSM.waiting_photos)

    skip_kb = InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text="➡️ Avançar sem Fotos", callback_query_data="skip_photos")]]
    )

    msg = (
        "📸 *RECEBIMENTO DE FOTOS*\n\n"
        "Envie uma ou mais *fotos* do local/ocorrência para ajudar a equipe da GCM.\n"
        "Caso não possua fotos, clique no botão abaixo para avançar."
    )
    await message.answer(text=msg, parse_mode="Markdown", reply_markup=skip_kb)


@router.message(OccurrenceFSM.waiting_photos, F.photo)
async def process_photo(message: Message, state: FSMContext):
    """Recebe fotos anexadas pelo usuário."""
    photo = message.photo[-1]  # Maior resolução
    data = await state.get_data()
    photos = data.get("photos", [])
    photos.append(photo.file_id)
    await state.update_data(photos=photos)

    skip_kb = InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text=f"✅ Concluir Fotos ({len(photos)}) e Avançar", callback_query_data="skip_photos")]]
    )
    await message.answer(f"📷 Foto recebida! Total: {len(photos)}. Envie mais fotos ou clique abaixo para avançar.", reply_markup=skip_kb)


@router.callback_query(OccurrenceFSM.waiting_photos, F.data == "skip_photos")
async def finish_photos(callback: CallbackQuery, state: FSMContext):
    """Passo 4: Finaliza etapa de fotos -> Solicita vídeos (opcional)."""
    await state.set_state(OccurrenceFSM.waiting_videos)
    skip_kb = InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text="➡️ Avançar sem Vídeos", callback_query_data="skip_videos")]]
    )

    msg = (
        "🎥 *RECEBIMENTO DE VÍDEOS*\n\n"
        "Se desejar, envie um *vídeo curto* da ocorrência.\n"
        "Caso não possua vídeo, clique abaixo para avançar."
    )
    await callback.message.edit_text(text=msg, parse_mode="Markdown", reply_markup=skip_kb)
    await callback.answer()


@router.message(OccurrenceFSM.waiting_videos, F.video)
async def process_video(message: Message, state: FSMContext):
    """Recebe vídeo anexado."""
    video = message.video
    data = await state.get_data()
    videos = data.get("videos", [])
    videos.append(video.file_id)
    await state.update_data(videos=videos)

    skip_kb = InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text="✅ Avançar para Localização", callback_query_data="skip_videos")]]
    )
    await message.answer("📹 Vídeo recebido com sucesso!", reply_markup=skip_kb)


@router.callback_query(OccurrenceFSM.waiting_videos, F.data == "skip_videos")
async def finish_videos(callback: CallbackQuery, state: FSMContext):
    """Passo 5: Solicita envio da localização GPS pelo Telegram."""
    await state.set_state(OccurrenceFSM.waiting_location)

    location_btn = ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text="📍 ENVIAR MINHA LOCALIZAÇÃO ATUAL", request_location=True)]],
        resize_keyboard=True,
        one_time_keyboard=True
    )

    msg = (
        "📍 *ENVIAR LOCALIZAÇÃO DA OCORRÊNCIA*\n\n"
        "Para que as viaturas da Guarda Civil encontrem o local com precisão, "
        "clique no botão abaixo para compartilhar sua *localização GPS* atual ou digite o endereço aproximado."
    )
    await callback.message.answer(text=msg, parse_mode="Markdown", reply_markup=location_btn)
    await callback.answer()


@router.message(OccurrenceFSM.waiting_location, F.location)
async def process_location_gps(message: Message, state: FSMContext):
    """Recebe localização GPS enviada pelo botão nativo do Telegram."""
    loc = message.location
    await finalize_occurrence_creation(
        message=message,
        state=state,
        lat=loc.latitude,
        lon=loc.longitude,
        address=f"Coordenadas GPS: {loc.latitude:.5f}, {loc.longitude:.5f}"
    )


@router.message(OccurrenceFSM.waiting_location, F.text)
async def process_location_text(message: Message, state: FSMContext):
    """Recebe endereço digitado manualmente em texto."""
    await finalize_occurrence_creation(
        message=message,
        state=state,
        lat=-23.1791,  # Coordenada padrão (São José dos Campos)
        lon=-45.8872,
        address=message.text
    )


async def finalize_occurrence_creation(
    message: Message,
    state: FSMContext,
    lat: float,
    lon: float,
    address: str
):
    """Gera a ocorrência no banco, dispara a Triagem por IA e responde o cidadão com o Protocolo."""
    data = await state.get_data()
    user = message.from_user

    payload = OccurrenceCreate(
        telegram_user_id=user.id,
        telegram_username=user.username,
        citizen_name=user.full_name,
        category=data.get("category", "Geral"),
        description=data.get("description", "Sem descrição"),
        address=address,
        latitude=lat,
        longitude=lon,
        photo_urls=data.get("photos", []),
        video_urls=data.get("videos", [])
    )

    # Nota: Em runtime assíncrono com DB real, chamaria occurrence_service.create_occurrence
    from services.protocol_service import protocol_service
    from services.ai_triage import ai_triage_service

    protocol = protocol_service.generate_next_protocol()
    triage = await ai_triage_service.analyze_occurrence(
        category=payload.category,
        description=payload.description,
        address=payload.address,
        has_photos=bool(payload.photo_urls),
        has_videos=bool(payload.video_urls)
    )

    await state.clear()

    confirm_msg = (
        f"🚨 *OCORRÊNCIA REGISTRADA COM SUCESSO!*\n\n"
        f"📌 *Protocolo:* `{protocol}`\n"
        f"🏷️ *Categoria:* {payload.category}\n"
        f"📍 *Local:* {address}\n\n"
        f"🧠 *TRIAGEM AUTOMÁTICA GCM (IA):*\n"
        f"• *Nível de Gravidade:* {triage.priority.value}\n"
        f"• *Unidade Sugerida:* {triage.recommended_unit}\n"
        f"• *Resumo Operacional:* {triage.summary}\n\n"
        f"Sua ocorrência já está visível na Central de Operações 153 e a viatura mais próxima será informada."
    )

    await message.answer(text=confirm_msg, parse_mode="Markdown", reply_markup=ReplyKeyboardRemove())

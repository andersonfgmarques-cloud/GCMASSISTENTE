import { PythonFile } from '../types';

export const pythonFiles: PythonFile[] = [
  {
    path: 'main.py',
    folder: 'root',
    filename: 'main.py',
    language: 'python',
    description: 'Ponto de entrada FastAPI + Inicialização do Polling do Bot Aiogram 3.',
    content: `"""
GCM DIGITAL 153 - Ponto de Entrada Principal (FastAPI + Aiogram 3 Bot)
"""

import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from aiogram import Bot, Dispatcher
from config.settings import settings
from database.db import init_db
from handlers import start_router, occurrence_router, admin_router
from routers import occurrence_api_router, admin_api_router
from utils.logger import logger

bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)
dp = Dispatcher()

dp.include_router(start_router)
dp.include_router(occurrence_router)
dp.include_router(admin_router)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Inicializando GCM DIGITAL 153...")
    await init_db()
    
    polling_task = None
    if settings.TELEGRAM_BOT_TOKEN and not settings.TELEGRAM_BOT_TOKEN.startswith("123456789"):
        logger.info("🤖 Iniciando polling do Telegram Bot Aiogram 3...")
        polling_task = asyncio.create_task(dp.start_polling(bot))
    
    yield

    logger.info("🛑 Encerrando GCM DIGITAL 153...")
    if polling_task:
        polling_task.cancel()
    await bot.session.close()

app = FastAPI(
    title=settings.APP_NAME,
    description="Sistema de Atendimento e Triagem com IA da Guarda Civil Municipal (153)",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(occurrence_api_router)
app.include_router(admin_api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)`
  },
  {
    path: 'config/settings.py',
    folder: 'config',
    filename: 'settings.py',
    language: 'python',
    description: 'Configurações de ambiente centralizadas com Pydantic BaseSettings.',
    content: `"""
GCM DIGITAL 153 - Configurações do Sistema
Gerenciamento centralizado de variáveis de ambiente usando Pydantic Settings.
"""

from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "GCM DIGITAL 153"
    APP_ENV: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    TELEGRAM_BOT_TOKEN: str = "123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
    ADMIN_TELEGRAM_IDS: list[int] = [12345678, 87654321]

    DATABASE_URL: str = "sqlite+aiosqlite:///./gcm_153.db"

    GEMINI_API_KEY: Optional[str] = None
    AI_PROVIDER: str = "gemini"

    CITY_NAME: str = "São José dos Campos"
    EMERGENCY_PHONE: str = "153"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()`
  },
  {
    path: 'database/db.py',
    folder: 'database',
    filename: 'db.py',
    language: 'python',
    description: 'Motor SQLAlchemy Assíncrono para SQLite e PostgreSQL (asyncpg).',
    content: `"""
GCM DIGITAL 153 - Módulo de Conexão e Sessão Assíncrona do Banco de Dados
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from config.settings import settings

class Base(DeclarativeBase):
    pass

is_sqlite = settings.DATABASE_URL.startswith("sqlite")

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
    connect_args={"check_same_thread": False} if is_sqlite else {}
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session`
  },
  {
    path: 'models/occurrence.py',
    folder: 'models',
    filename: 'occurrence.py',
    language: 'python',
    description: 'Modelos SQLAlchemy ORM e Schemas Pydantic das Ocorrências.',
    content: `"""
GCM DIGITAL 153 - Modelos de Dados (SQLAlchemy ORM + Pydantic Schemas)
"""

from datetime import datetime
import enum
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import String, Integer, DateTime, Text, Float, JSON
from sqlalchemy.orm import Mapped, mapped_column
from database.db import Base

class OccurrenceStatus(str, enum.Enum):
    PENDING = "PENDENTE"
    DISPATCHED = "VIATURA_A_CAMINHO"
    IN_PROGRESS = "EM_ATENDIMENTO"
    RESOLVED = "FINALIZADA"
    CANCELLED = "CANCELADA"

class OccurrencePriority(str, enum.Enum):
    CRITICAL = "ALTA"
    MEDIUM = "MÉDIA"
    LOW = "BAIXA"

class Occurrence(Base):
    __tablename__ = "occurrences"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    protocol: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    telegram_user_id: Mapped[int] = mapped_column(Integer, nullable=False)
    telegram_username: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    citizen_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    address: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    photo_urls: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list)
    video_urls: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list)
    ai_priority: Mapped[str] = mapped_column(String(20), default=OccurrencePriority.MEDIUM.value)
    ai_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ai_recommended_unit: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    ai_risk_score: Mapped[Optional[int]] = mapped_column(Integer, default=5)
    status: Mapped[str] = mapped_column(String(30), default=OccurrenceStatus.PENDING.value)
    dispatched_unit: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)`
  },
  {
    path: 'services/ai_triage.py',
    folder: 'services',
    filename: 'ai_triage.py',
    language: 'python',
    description: 'Serviço de Triagem com Inteligência Artificial (Gemini 3.6 Flash).',
    content: `"""
GCM DIGITAL 153 - Serviço de Triagem de Ocorrências com Inteligência Artificial
"""

import json
from google import genai
from models.occurrence import AITriageResult, OccurrencePriority
from config.settings import settings

class AITriageService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY

    async def analyze_occurrence(self, category: str, description: str, address: str = None) -> AITriageResult:
        client = genai.Client(api_key=self.api_key)
        prompt = f"Analise esta ocorrência da GCM: Categoria: {category}, Descrição: {description}, Local: {address}"
        
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt,
            config={"response_mime_type": "application/json"}
        )
        data = json.loads(response.text)
        return AITriageResult(**data)`
  },
  {
    path: 'handlers/start.py',
    folder: 'handlers',
    filename: 'start.py',
    language: 'python',
    description: 'Handler Aiogram 3 para comando /start e botões do Menu Principal.',
    content: `"""
GCM DIGITAL 153 - Handler de Boas-Vindas e Menu Principal (Aiogram 3)
"""

from aiogram import Router, F
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.filters import CommandStart

router = Router(name="start_router")

def get_main_menu_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="🚨 REGISTRAR OCORRÊNCIA", callback_query_data="menu_register_occurrence")],
            [InlineKeyboardButton(text="🔍 CONSULTAR PROTOCOLO", callback_query_data="menu_check_protocol")],
            [InlineKeyboardButton(text="📞 TELEFONES ÚTEIS (153)", callback_query_data="menu_useful_phones")]
        ]
    )

@router.message(CommandStart())
async def cmd_start(message: Message):
    welcome_text = f"🛡️ *GCM DIGITAL 153*\\nOlá, *{message.from_user.first_name}*!"
    await message.answer(welcome_text, parse_mode="Markdown", reply_markup=get_main_menu_keyboard())`
  },
  {
    path: 'handlers/occurrence.py',
    folder: 'handlers',
    filename: 'occurrence.py',
    language: 'python',
    description: 'Handler FSM da máquina de estados do Aiogram 3 para registro de ocorrência.',
    content: `"""
GCM DIGITAL 153 - Handler FSM de Registro de Ocorrência (Aiogram 3)
"""

from aiogram import Router, F
from aiogram.types import Message, CallbackQuery
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup

router = Router(name="occurrence_router")

class OccurrenceFSM(StatesGroup):
    selecting_category = State()
    waiting_description = State()
    waiting_photos = State()
    waiting_videos = State()
    waiting_location = State()`
  },
  {
    path: 'routers/admin_router.py',
    folder: 'routers',
    filename: 'admin_router.py',
    language: 'python',
    description: 'Endpoints REST FastAPI do Painel Administrativo do Despachante.',
    content: `"""
GCM DIGITAL 153 - Router REST API do Painel Administrativo (FastAPI)
"""

from fastapi import APIRouter
from services.occurrence_service import occurrence_service

router = APIRouter(prefix="/api/admin", tags=["Painel Administrativo GCM 153"])`
  },
  {
    path: 'requirements.txt',
    folder: 'root',
    filename: 'requirements.txt',
    language: 'text',
    description: 'Lista de pacotes e dependências Python.',
    content: `aiogram>=3.4.1
fastapi>=0.110.0
uvicorn[standard]>=0.28.0
pydantic>=2.6.4
pydantic-settings>=2.2.1
sqlalchemy>=2.0.28
aiosqlite>=0.20.0
asyncpg>=0.29.0
google-genai>=0.1.1
python-dotenv>=1.0.1`
  }
];

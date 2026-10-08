"""
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

# Instância do Telegram Bot e Dispatcher Aiogram 3
bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)
dp = Dispatcher()

# Registro de Handlers do Aiogram
dp.include_router(start_router)
dp.include_router(occurrence_router)
dp.include_router(admin_router)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerenciamento de Ciclo de Vida da Aplicação FastAPI."""
    logger.info("🚀 Inicializando GCM DIGITAL 153...")
    
    # 1. Inicializa Banco de Dados
    await init_db()

    # 2. Inicia Polling do Bot Telegram em background (se habilitado)
    polling_task = None
    if settings.TELEGRAM_BOT_TOKEN and not settings.TELEGRAM_BOT_TOKEN.startswith("123456789"):
        logger.info("🤖 Iniciando polling do Telegram Bot Aiogram 3...")
        polling_task = asyncio.create_task(dp.start_polling(bot))
    else:
        logger.info("ℹ️ Telegram Bot Token não fornecido ou padrão. Modo simulação web ativo.")

    yield

    # Cleanup no encerramento
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

# Habilita CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registro de Routers da API FastAPI
app.include_router(occurrence_api_router)
app.include_router(admin_api_router)


@app.get("/")
async def root():
    return {
        "system": settings.APP_NAME,
        "status": "online",
        "city": settings.CITY_NAME,
        "emergency": settings.EMERGENCY_PHONE,
        "version": "1.0.0",
        "bot_framework": "Aiogram 3",
        "ai_engine": "Gemini 3.6 Flash"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)

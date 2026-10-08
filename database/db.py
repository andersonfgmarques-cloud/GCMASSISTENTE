"""
GCM DIGITAL 153 - Módulo de Conexão e Sessão Assíncrona do Banco de Dados
Compatível com SQLite (dev) e PostgreSQL (prod/asyncpg).
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from config.settings import settings
from utils.logger import logger


# Base ORM para todos os modelos SQLAlchemy
class Base(DeclarativeBase):
    pass


# Configuração do Engine (SQLite aiosqlite ou PostgreSQL asyncpg)
is_sqlite = settings.DATABASE_URL.startswith("sqlite")

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
    # SQLite não suporta pool_size ou max_overflow da mesma forma que Postgres
    connect_args={"check_same_thread": False} if is_sqlite else {}
)

# Fábrica de sessões assíncronas
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)


async def init_db() -> None:
    """Inicializa as tabelas do banco de dados na inicialização da aplicação."""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info(f"✅ Banco de dados inicializado com sucesso ({'SQLite' if is_sqlite else 'PostgreSQL'}).")
    except Exception as e:
        logger.error(f"❌ Erro ao inicializar tabelas do banco de dados: {e}")
        raise e


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency injection para FastAPI e Handlers do Bot obterem a sessão do DB."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

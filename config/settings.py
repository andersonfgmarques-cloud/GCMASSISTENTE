"""
GCM DIGITAL 153 - Configurações do Sistema
Gerenciamento centralizado de variáveis de ambiente usando Pydantic Settings.
"""

from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configurações da aplicação Guarda Civil Municipal Digital 153."""

    # Aplicação
    APP_NAME: str = "GCM DIGITAL 153"
    APP_ENV: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # Telegram Bot
    TELEGRAM_BOT_TOKEN: str = "123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
    WEBHOOK_URL: Optional[str] = None
    ADMIN_TELEGRAM_IDS: list[int] = [12345678, 87654321]

    # Banco de Dados (SQLite inicial com suporte a PostgreSQL asyncpg)
    DATABASE_URL: str = "sqlite+aiosqlite:///./gcm_153.db"

    # Inteligência Artificial (Triagem de Ocorrências GCM)
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    AI_PROVIDER: str = "gemini"  # 'gemini' ou 'openai'

    # Município & Unidades de Despacho
    CITY_NAME: str = "São José dos Campos"
    EMERGENCY_PHONE: str = "153"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

"""
GCM DIGITAL 153 - Modelos de Dados (SQLAlchemy ORM + Pydantic Schemas)
Representação das Ocorrências registradas via Telegram Bot ou Web Admin.
"""

from datetime import datetime
import enum
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import String, Integer, DateTime, Text, Float, Enum as SQLEnum, JSON
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


class OccurrenceCategory(str, enum.Enum):
    PATRIMONIAL = "Patrimonial / Pichação / Vandalismo"
    VIOLENCE = "Agressão / Violência / Perturbação"
    MARIA_DA_PENHA = "Violência Doméstica / Patrulha Maria da Penha"
    SCHOOL = "Ronda Escolar / Segurança nas Escolas"
    TRAFFIC = "Trânsito / Acidente / Estacionamento Irregular"
    ENVIRONMENT = "Meio Ambiente / Animais / Descarte Irregular"
    SUSPICIOUS = "Atitude Suspeita / Averiguação"
    OTHER = "Outros Atendimentos GCM"


# ----------------------------------------------------
# TABELA SQLALCHEMY (ORM)
# ----------------------------------------------------
class Occurrence(Base):
    __tablename__ = "occurrences"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    protocol: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    
    # Informações do Usuário (Telegram)
    telegram_user_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    telegram_username: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    citizen_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    citizen_phone: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)

    # Detalhes da Ocorrência
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    address: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Mídias Anexadas
    photo_urls: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list, nullable=True)
    video_urls: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list, nullable=True)

    # Triagem por Inteligência Artificial
    ai_priority: Mapped[str] = mapped_column(String(20), default=OccurrencePriority.MEDIUM.value)
    ai_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ai_recommended_unit: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    ai_risk_score: Mapped[Optional[int]] = mapped_column(Integer, default=5)

    # Estado Operacional GCM
    status: Mapped[str] = mapped_column(String(30), default=OccurrenceStatus.PENDING.value)
    dispatched_unit: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    dispatcher_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ----------------------------------------------------
# PYDANTIC SCHEMAS (TIPAGEM & API)
# ----------------------------------------------------
class AITriageResult(BaseModel):
    priority: OccurrencePriority = Field(..., description="Prioridade calculada pela IA (ALTA, MÉDIA, BAIXA)")
    category: str = Field(..., description="Categoria recomendada")
    recommended_unit: str = Field(..., description="Unidade especializada recomendada (ROMU, GTAM, Maria da Penha, etc)")
    risk_score: int = Field(..., ge=1, le=10, description="Escala de risco de 1 a 10")
    summary: str = Field(..., description="Resumo executivo para o despachante do 153")
    immediate_action: str = Field(..., description="Ação imediata recomendada")


class OccurrenceCreate(BaseModel):
    telegram_user_id: int
    telegram_username: Optional[str] = None
    citizen_name: Optional[str] = None
    citizen_phone: Optional[str] = None
    category: str
    description: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    photo_urls: Optional[list[str]] = []
    video_urls: Optional[list[str]] = []


class OccurrenceRead(BaseModel):
    id: int
    protocol: str
    telegram_user_id: int
    telegram_username: Optional[str]
    citizen_name: Optional[str]
    citizen_phone: Optional[str]
    category: str
    description: str
    address: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    photo_urls: Optional[list[str]]
    video_urls: Optional[list[str]]
    ai_priority: str
    ai_summary: Optional[str]
    ai_recommended_unit: Optional[str]
    ai_risk_score: Optional[int]
    status: str
    dispatched_unit: Optional[str]
    dispatcher_notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

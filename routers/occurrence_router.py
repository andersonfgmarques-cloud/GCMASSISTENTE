"""
GCM DIGITAL 153 - Router REST API de Ocorrências (FastAPI)
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from database.db import get_db
from models.occurrence import OccurrenceCreate, OccurrenceRead
from services.occurrence_service import occurrence_service

router = APIRouter(prefix="/api/occurrences", tags=["Ocorrências GCM 153"])


@router.post("/", response_model=OccurrenceRead, status_code=status.HTTP_201_CREATED)
async def create_new_occurrence(data: OccurrenceCreate, db: AsyncSession = Depends(get_db)):
    """Cria uma nova ocorrência via API e roda a Triagem IA."""
    return await occurrence_service.create_occurrence(db, data)


@router.get("/", response_model=List[OccurrenceRead])
async def list_occurrences(limit: int = 50, db: AsyncSession = Depends(get_db)):
    """Lista as últimas ocorrências recebidas."""
    return await occurrence_service.get_all_occurrences(db, limit)


@router.get("/{protocol}", response_model=OccurrenceRead)
async def get_occurrence_by_protocol(protocol: str, db: AsyncSession = Depends(get_db)):
    """Busca os detalhes da ocorrência pelo protocolo."""
    occ = await occurrence_service.get_by_protocol(db, protocol)
    if not occ:
        raise HTTPException(status_code=404, detail="Ocorrência não encontrada com este protocolo.")
    return occ

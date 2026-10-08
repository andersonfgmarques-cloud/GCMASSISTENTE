"""
GCM DIGITAL 153 - Router REST API do Painel Administrativo (FastAPI)
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from database.db import get_db
from services.occurrence_service import occurrence_service
from services.ai_triage import ai_triage_service

router = APIRouter(prefix="/api/admin", tags=["Painel Administrativo GCM 153"])


class UpdateStatusSchema(BaseModel):
    protocol: str
    status: str
    dispatched_unit: Optional[str] = None
    notes: Optional[str] = None


class TriageRequestSchema(BaseModel):
    category: str
    description: str
    address: Optional[str] = None
    has_photos: bool = False
    has_videos: bool = False


@router.patch("/status")
async def update_occurrence_status(data: UpdateStatusSchema, db: AsyncSession = Depends(get_db)):
    """Atualiza o estado da ocorrência e atribui viatura responsável."""
    updated = await occurrence_service.update_status(
        db,
        protocol=data.protocol,
        new_status=data.status,
        dispatched_unit=data.dispatched_unit,
        notes=data.notes
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Protocolo não localizado.")
    return {"status": "success", "message": f"Protocolo {data.protocol} atualizado com sucesso.", "occurrence": updated}


@router.post("/triage")
async def request_ai_triage(data: TriageRequestSchema):
    """Endpoint para executar triagem direta de IA em qualquer relato de ocorrência."""
    return await ai_triage_service.analyze_occurrence(
        category=data.category,
        description=data.description,
        address=data.address,
        has_photos=data.has_photos,
        has_videos=data.has_videos
    )


@router.get("/metrics")
async def get_dashboard_metrics():
    """Retorna métricas da central de operações."""
    return {
        "active_units": 12,
        "critical_cases": 3,
        "in_progress": 7,
        "resolved_today": 18,
        "avg_response_time_min": 8.7,
        "gcm_units": [
            {"id": "ROMU-01", "name": "Viatura ROMU 01 - Tático", "status": "LIVRE"},
            {"id": "ROMU-02", "name": "Viatura ROMU 02 - Tático", "status": "EM_ATENDIMENTO"},
            {"id": "MP-01", "name": "Patrulha Maria da Penha 01", "status": "LIVRE"},
            {"id": "RE-03", "name": "Ronda Escolar 03", "status": "PATRULHANDO"},
            {"id": "GTAM-01", "name": "Grupo Tático Motos GTAM 01", "status": "LIVRE"}
        ]
    }

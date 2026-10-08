"""
GCM DIGITAL 153 - Serviço de Operações de Ocorrências no Banco de Dados
"""

from typing import List, Optional
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.occurrence import Occurrence, OccurrenceCreate, OccurrenceStatus
from services.protocol_service import protocol_service
from services.ai_triage import ai_triage_service
from utils.logger import logger


class OccurrenceService:
    """Regras de negócio para criação, listagem e atualização das ocorrências 153."""

    async def create_occurrence(self, db: AsyncSession, data: OccurrenceCreate) -> Occurrence:
        """Cria uma nova ocorrência, processa a triagem de IA e gera protocolo."""
        protocol = protocol_service.generate_next_protocol()

        # Triagem Automática com IA
        ai_res = await ai_triage_service.analyze_occurrence(
            category=data.category,
            description=data.description,
            address=data.address,
            has_photos=bool(data.photo_urls),
            has_videos=bool(data.video_urls)
        )

        occurrence = Occurrence(
            protocol=protocol,
            telegram_user_id=data.telegram_user_id,
            telegram_username=data.telegram_username,
            citizen_name=data.citizen_name or "Cidadão Anônimo",
            citizen_phone=data.citizen_phone,
            category=data.category,
            description=data.description,
            address=data.address or "Localização enviada via GPS",
            latitude=data.latitude,
            longitude=data.longitude,
            photo_urls=data.photo_urls or [],
            video_urls=data.video_urls or [],
            ai_priority=ai_res.priority.value,
            ai_summary=ai_res.summary,
            ai_recommended_unit=ai_res.recommended_unit,
            ai_risk_score=ai_res.risk_score,
            status=OccurrenceStatus.PENDING.value
        )

        db.add(occurrence)
        await db.commit()
        await db.refresh(occurrence)

        logger.info(f"🚨 Nova Ocorrência Registrada! Protocolo: {protocol} | Prioridade IA: {ai_res.priority.value}")
        return occurrence

    async def get_all_occurrences(self, db: AsyncSession, limit: int = 50) -> List[Occurrence]:
        """Retorna lista de ocorrências ordenadas por data descrescente."""
        result = await db.execute(
            select(Occurrence).order_by(Occurrence.created_at.desc()).limit(limit)
        )
        return list(result.scalars().all())

    async def get_by_protocol(self, db: AsyncSession, protocol: str) -> Optional[Occurrence]:
        """Busca ocorrência pelo número do protocolo."""
        result = await db.execute(select(Occurrence).where(Occurrence.protocol == protocol))
        return result.scalars().first()

    async def update_status(
        self,
        db: AsyncSession,
        protocol: str,
        new_status: str,
        dispatched_unit: Optional[str] = None,
        notes: Optional[str] = None
    ) -> Optional[Occurrence]:
        """Atualiza o estado operacional da ocorrência no Painel Administrativo."""
        occ = await self.get_by_protocol(db, protocol)
        if not occ:
            return None

        occ.status = new_status
        if dispatched_unit:
            occ.dispatched_unit = dispatched_unit
        if notes:
            occ.dispatcher_notes = notes

        await db.commit()
        await db.refresh(occ)
        logger.info(f"🔄 Protocolo {protocol} atualizado para status: {new_status}")
        return occ


occurrence_service = OccurrenceService()

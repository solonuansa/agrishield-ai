"""Celery task untuk deteksi wabah penyakit secara periodik."""

import asyncio
import logging

from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="tasks.check_outbreaks")
def check_outbreaks() -> dict:
    """
    Task periodik: jalankan deteksi wabah dari scan terbaru.
    Dijadwalkan setiap 1 jam via Celery beat.
    """
    return asyncio.run(_check_outbreaks_async())


async def _check_outbreaks_async() -> dict:
    from app.core.database import AsyncSessionLocal
    from app.services.alert_service import run_outbreak_detection

    logger.info("Mulai deteksi wabah periodik")
    async with AsyncSessionLocal() as db:
        new_count = await run_outbreak_detection(db)

    logger.info(f"Deteksi wabah selesai: {new_count} alert baru dibuat")
    return {"new_alerts": new_count}


@celery_app.task(name="tasks.check_outbreak_for_scan")
def check_outbreak_for_scan(scan_id: str) -> dict:
    """
    Trigger deteksi wabah setelah satu scan selesai dianalisis.
    Dipanggil dari scan_tasks.py setelah analisis berhasil.
    """
    return asyncio.run(_check_outbreaks_async())

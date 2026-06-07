"""Celery task untuk deteksi wabah penyakit secara periodik."""

import asyncio
import logging
import uuid

from sqlalchemy import select

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
    try:
        async with AsyncSessionLocal() as db:
            new_count = await run_outbreak_detection(db)
        logger.info(f"Deteksi wabah selesai: {new_count} alert baru dibuat")
        return {"new_alerts": new_count}
    except Exception as exc:
        logger.error("Gagal menjalankan deteksi wabah: %s", exc, exc_info=True)
        return {"new_alerts": 0, "error": str(exc)}


@celery_app.task(
    name="tasks.check_outbreak_for_scan",
    max_retries=2,
    default_retry_delay=60,
    acks_late=True,
)
def check_outbreak_for_scan(scan_id: str) -> dict:
    """
    Trigger deteksi wabah setelah satu scan selesai dianalisis.
    Dipanggil dari scan_tasks.py setelah analisis berhasil.
    """
    try:
        return asyncio.run(_check_outbreaks_for_scan_async(scan_id))
    except Exception as exc:
        logger.error("Gagal check outbreak for scan %s: %s", scan_id, exc, exc_info=True)
        raise check_outbreak_for_scan.retry(exc=exc)  # type: ignore[attr-defined]


async def _check_outbreaks_for_scan_async(scan_id: str) -> dict:
    from app.core.database import AsyncSessionLocal
    from app.models.scan import Scan
    from app.services.alert_service import run_outbreak_detection

    logger.info(f"Mulai deteksi wabah untuk scan {scan_id}")
    try:
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(Scan).where(Scan.id == uuid.UUID(scan_id))
            )
            scan = result.scalar_one_or_none()
            if not scan or not scan.latitude or not scan.longitude:
                logger.info(f"Scan {scan_id} tidak memiliki koordinat, skip outbreak check")
                return {"new_alerts": 0}

            new_count = await run_outbreak_detection(db)
        logger.info(f"Deteksi wabah untuk scan {scan_id} selesai: {new_count} alert baru")
        return {"new_alerts": new_count}
    except Exception as exc:
        logger.error("Gagal menjalankan deteksi wabah untuk scan %s: %s", scan_id, exc, exc_info=True)
        return {"new_alerts": 0, "error": str(exc)}

"""Endpoint health check dengan komponen status."""

import logging

from fastapi import APIRouter
from redis.asyncio import Redis

from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)


async def _check_db() -> str:
    """Cek koneksi database dengan SELECT 1."""
    try:
        from app.core.database import AsyncSessionLocal
        async with AsyncSessionLocal() as session:
            from sqlalchemy import text
            await session.execute(text("SELECT 1"))
        return "ok"
    except Exception as exc:
        logger.warning("Health check — DB tidak reachable: %s", exc)
        return "down"


async def _check_redis() -> str:
    """Cek koneksi Redis dengan PING."""
    try:
        r = Redis.from_url(settings.redis_url, socket_connect_timeout=3)
        await r.ping()
        await r.aclose()
        return "ok"
    except Exception as exc:
        logger.warning("Health check — Redis tidak reachable: %s", exc)
        return "down"


async def _check_ml_service() -> str:
    """Cek koneksi ML service."""
    try:
        import httpx
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get(f"{settings.ml_service_url}/health")
            if resp.status_code == 200:
                return "ok"
            return "degraded"
    except Exception:
        return "down"


@router.get("")
async def health_check():
    """Cek apakah API berjalan normal dengan status tiap komponen."""
    db_status = await _check_db()
    redis_status = await _check_redis()
    ml_status = await _check_ml_service()

    overall = "ok" if all(s == "ok" for s in [db_status, redis_status, ml_status]) else "degraded"

    return {
        "status": overall,
        "service": "agrishield-api",
        "version": "0.1.0",
        "components": {
            "database": db_status,
            "redis": redis_status,
            "ml_service": ml_status,
        },
    }

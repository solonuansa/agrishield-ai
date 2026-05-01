"""Redis caching helpers untuk FastAPI services."""

import json
import logging
from typing import TypeVar

import redis.asyncio as redis

from app.core.config import settings

logger = logging.getLogger(__name__)

T = TypeVar("T")

_redis_pool: redis.Redis | None = None


def get_redis() -> redis.Redis:
    """Lazy singleton untuk Redis client."""
    global _redis_pool
    if _redis_pool is None:
        _redis_pool = redis.from_url(
            settings.redis_url,
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5,
        )
    return _redis_pool


async def get_cache(key: str) -> str | None:
    """Ambil value dari cache. Return None jika miss atau error."""
    try:
        r = get_redis()
        return await r.get(key)
    except Exception as exc:
        logger.warning(f"Redis get error for key {key}: {exc}")
        return None


async def set_cache(key: str, value: str, ttl_seconds: int = 300) -> None:
    """Simpan value ke cache dengan TTL. Silent fail jika Redis down."""
    try:
        r = get_redis()
        await r.setex(key, ttl_seconds, value)
    except Exception as exc:
        logger.warning(f"Redis set error for key {key}: {exc}")


async def delete_cache(key: str) -> None:
    """Hapus key dari cache."""
    try:
        r = get_redis()
        await r.delete(key)
    except Exception as exc:
        logger.warning(f"Redis delete error for key {key}: {exc}")


async def get_or_set(
    key: str,
    factory,
    ttl_seconds: int = 300,
    serializer=json.dumps,
    deserializer=json.loads,
):
    """Pattern cache-aside: coba ambil dari cache, jika miss jalankan factory."""
    cached = await get_cache(key)
    if cached is not None:
        try:
            return deserializer(cached)
        except Exception as exc:
            logger.warning(f"Cache deserialization error for key {key}: {exc}")

    result = await factory()

    try:
        await set_cache(key, serializer(result), ttl_seconds)
    except Exception as exc:
        logger.warning(f"Cache serialization error for key {key}: {exc}")

    return result

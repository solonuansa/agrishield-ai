"""Redis caching helpers untuk FastAPI services."""

import asyncio
import json
import logging
from typing import TypeVar

import redis.asyncio as redis

from app.core.config import settings

logger = logging.getLogger(__name__)

T = TypeVar("T")

_redis_pool: redis.Redis | None = None
_redis_lock: asyncio.Lock = asyncio.Lock()


def get_redis() -> redis.Redis:
    """Lazy singleton untuk Redis client."""
    global _redis_pool
    if _redis_pool is None:
        raise RuntimeError("Redis belum diinisialisasi. Panggil init_redis() terlebih dahulu.")
    return _redis_pool


async def init_redis() -> redis.Redis:
    """Inisialisasi Redis client dengan thread-safe lock."""
    global _redis_pool
    if _redis_pool is None:
        async with _redis_lock:
            if _redis_pool is None:
                _redis_pool = redis.from_url(
                    settings.redis_url,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5,
                )
    return _redis_pool


async def get_cache(key: str) -> str | None:
    try:
        r = get_redis()
        return await r.get(key)
    except Exception as exc:
        logger.warning(f"Redis get error for key {key}: {exc}")
        return None


async def set_cache(key: str, value: str, ttl_seconds: int = 300) -> None:
    try:
        r = get_redis()
        await r.setex(key, ttl_seconds, value)
    except Exception as exc:
        logger.warning(f"Redis set error for key {key}: {exc}")


async def delete_cache(key: str) -> None:
    try:
        r = get_redis()
        await r.delete(key)
    except Exception as exc:
        logger.warning(f"Redis delete error for key {key}: {exc}")


async def delete_cache_pattern(pattern: str) -> None:
    """Hapus semua cache key yang cocok dengan glob pattern."""
    try:
        r = get_redis()
        cursor = 0
        keys_to_delete = []
        while True:
            cursor, keys = await r.scan(cursor=cursor, match=pattern, count=100)
            keys_to_delete.extend(keys)
            if cursor == 0:
                break
        if keys_to_delete:
            await r.delete(*keys_to_delete)
            logger.info(f"Cache deleted {len(keys_to_delete)} key(s) matching {pattern}")
    except Exception as exc:
        logger.warning(f"Redis pattern delete error for {pattern}: {exc}")


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

import asyncio
import logging
import uuid
from datetime import datetime, timezone

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import UploadFile

from app.core.config import settings

logger = logging.getLogger(__name__)

_r2_client = None
_r2_lock: asyncio.Lock = asyncio.Lock()

_CONTENT_TYPE_TO_EXT = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}


async def _get_client():
    global _r2_client
    if _r2_client is None:
        async with _r2_lock:
            if _r2_client is None:
                _r2_client = boto3.client(
                    "s3",
                    endpoint_url=settings.r2_endpoint,
                    aws_access_key_id=settings.r2_access_key_id,
                    aws_secret_access_key=settings.r2_secret_access_key,
                    region_name="auto",
                )
    return _r2_client


def _build_key(scan_id: uuid.UUID, content_type: str) -> str:
    now = datetime.now(timezone.utc)
    ext = _CONTENT_TYPE_TO_EXT.get(content_type, "jpg")
    return f"scans/{now.year}/{now.month:02d}/{scan_id}.{ext}"


async def upload_scan_image(file: UploadFile, scan_id: uuid.UUID, content: bytes) -> str:
    content_type = file.content_type or "image/jpeg"
    key = _build_key(scan_id, content_type)

    try:
        client = await _get_client()
        await asyncio.to_thread(
            client.put_object,
            Bucket=settings.r2_bucket_name,
            Key=key,
            Body=content,
            ContentType=content_type,
        )
        logger.info(f"Upload berhasil: {key} ({len(content)} bytes)")
        return key
    except (BotoCoreError, ClientError) as exc:
        logger.error(f"Gagal upload ke R2: {exc}")
        raise


def get_public_url(image_key: str) -> str | None:
    if not settings.r2_public_url or not image_key:
        return None
    return f"{settings.r2_public_url.rstrip('/')}/{image_key}"


async def delete_scan_image(image_key: str) -> None:
    try:
        client = await _get_client()
        await asyncio.to_thread(
            client.delete_object,
            Bucket=settings.r2_bucket_name,
            Key=image_key,
        )
        logger.info(f"Gambar dihapus dari R2: {image_key}")
    except (BotoCoreError, ClientError) as exc:
        logger.warning(f"Gagal hapus gambar R2 {image_key}: {exc}")

"""
Service untuk upload dan manajemen file di Cloudflare R2.
Menggunakan boto3 dengan S3-compatible API.
"""

import logging
import uuid
from datetime import datetime, timezone

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import UploadFile

from app.core.config import settings

logger = logging.getLogger(__name__)

_r2_client = None


def _get_client():
    """Lazy-init boto3 client untuk R2 (singleton)."""
    global _r2_client
    if _r2_client is None:
        _r2_client = boto3.client(
            "s3",
            endpoint_url=settings.r2_endpoint,
            aws_access_key_id=settings.r2_access_key_id,
            aws_secret_access_key=settings.r2_secret_access_key,
            region_name="auto",
        )
    return _r2_client


def _build_key(scan_id: uuid.UUID, original_filename: str) -> str:
    """Buat path object di R2: scans/{year}/{month}/{scan_id}.{ext}"""
    now = datetime.now(timezone.utc)
    ext = original_filename.rsplit(".", 1)[-1].lower() if "." in original_filename else "jpg"
    return f"scans/{now.year}/{now.month:02d}/{scan_id}.{ext}"


async def upload_scan_image(file: UploadFile, scan_id: uuid.UUID) -> str:
    """
    Upload gambar scan ke Cloudflare R2.
    Return: object key (path relatif di bucket)
    """
    key = _build_key(scan_id, file.filename or "image.jpg")
    content = await file.read()
    content_type = file.content_type or "image/jpeg"

    try:
        client = _get_client()
        client.put_object(
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
    """Buat URL publik dari image_key menggunakan R2_PUBLIC_URL."""
    if not settings.r2_public_url or not image_key:
        return None
    return f"{settings.r2_public_url.rstrip('/')}/{image_key}"


def delete_scan_image(image_key: str) -> None:
    """Hapus gambar dari R2. Digunakan jika scan dibatalkan/dihapus."""
    try:
        client = _get_client()
        client.delete_object(Bucket=settings.r2_bucket_name, Key=image_key)
        logger.info(f"Gambar dihapus dari R2: {image_key}")
    except (BotoCoreError, ClientError) as exc:
        # Jangan raise — penghapusan gagal tidak boleh break alur utama
        logger.warning(f"Gagal hapus gambar R2 {image_key}: {exc}")

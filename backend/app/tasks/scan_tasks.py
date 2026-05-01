"""Celery task untuk analisis gambar scan secara async."""

import logging
import uuid

import httpx

from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=3, name="tasks.analyze_scan")
def analyze_scan(self, scan_id: str) -> dict:
    """
    Analisis gambar scan secara async:
    1. Ambil data scan dari database
    2. Download gambar dari R2
    3. Kirim ke ML service untuk prediksi
    4. Simpan hasil ke database
    5. Update status scan menjadi 'completed'

    Task ini idempoten — aman dijalankan ulang.
    """
    import asyncio

    # Celery berjalan sync, jalankan coroutine async di event loop baru
    return asyncio.run(_analyze_scan_async(self, scan_id))


async def _analyze_scan_async(task, scan_id: str) -> dict:
    """Implementasi async dari analyze_scan task."""
    from sqlalchemy.ext.asyncio import AsyncSession

    from app.core.config import settings
    from app.core.database import AsyncSessionLocal
    from app.models.scan import Scan
    from app.services.scan_service import save_scan_result

    logger.info(f"Mulai analisis scan {scan_id}")

    async with AsyncSessionLocal() as db:
        scan = await db.get(Scan, uuid.UUID(scan_id))
        if not scan:
            logger.error(f"Scan {scan_id} tidak ditemukan di database")
            return {"error": "scan_not_found"}

        if scan.status == "completed":
            # Idempoten: sudah selesai, skip
            logger.info(f"Scan {scan_id} sudah completed, skip")
            return {"scan_id": scan_id, "status": "already_completed"}

        try:
            # Download gambar dari R2
            image_bytes = await _download_image_from_r2(scan.image_key)

            # Kirim ke ML service
            prediction = await _call_ml_service(
                image_bytes=image_bytes,
                filename=scan.image_key.rsplit("/", 1)[-1],
                crop_type=scan.crop_type,
                ml_service_url=settings.ml_service_url,
            )

            # Generate rekomendasi penanganan via Gemini
            from app.services.recommendation_service import get_recommendation
            recommendation = await get_recommendation(
                disease=prediction["disease"],
                crop_type=scan.crop_type,
                confidence=prediction["confidence"],
            )

            # Simpan hasil
            await save_scan_result(
                scan_id=scan.id,
                detected_disease=prediction["disease"],
                confidence=prediction["confidence"],
                alternatives=prediction["alternatives"],
                model_version=prediction["model_version"],
                is_mock=prediction.get("is_mock", False),
                recommendation=recommendation,
                db=db,
            )
            await db.commit()

            # Invalidate caches
            from app.core.cache import delete_cache
            await delete_cache(f"dashboard:{scan.user_id}")
            await delete_cache("heatmap:*")

            logger.info(
                f"Scan {scan_id} selesai: {prediction['disease']} "
                f"(confidence={prediction['confidence']:.2%})"
            )

            # Trigger cek wabah jika scan memiliki koordinat (bukan healthy)
            if scan.latitude and scan.longitude and "healthy" not in prediction["disease"]:
                from app.tasks.alert_tasks import check_outbreak_for_scan
                check_outbreak_for_scan.apply_async(args=[scan_id], countdown=5)

            return {"scan_id": scan_id, "status": "completed", "disease": prediction["disease"]}

        except Exception as exc:
            logger.error(f"Error analisis scan {scan_id}: {exc}")
            try:
                raise task.retry(exc=exc, countdown=2 ** task.request.retries * 30)
            except task.MaxRetriesExceededError:
                scan.status = "failed"
                scan.error_message = str(exc)
                await db.commit()
                logger.error(f"Scan {scan_id} gagal setelah {task.max_retries}x retry")
                return {"scan_id": scan_id, "status": "failed", "error": str(exc)}


async def _download_image_from_r2(image_key: str) -> bytes:
    """Download gambar dari Cloudflare R2 menggunakan signed URL atau public URL."""
    from app.core.config import settings
    from app.services.storage_service import get_public_url

    public_url = get_public_url(image_key)
    if not public_url:
        # Fallback: ambil langsung via boto3 jika public URL tidak tersedia
        return await _download_via_boto3(image_key)

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(public_url)
        response.raise_for_status()
        return response.content


async def _download_via_boto3(image_key: str) -> bytes:
    """Download gambar dari R2 menggunakan boto3 (untuk bucket private)."""
    import asyncio

    import boto3

    from app.core.config import settings

    def _sync_download():
        client = boto3.client(
            "s3",
            endpoint_url=settings.r2_endpoint,
            aws_access_key_id=settings.r2_access_key_id,
            aws_secret_access_key=settings.r2_secret_access_key,
            region_name="auto",
        )
        response = client.get_object(Bucket=settings.r2_bucket_name, Key=image_key)
        return response["Body"].read()

    return await asyncio.to_thread(_sync_download)


async def _call_ml_service(
    image_bytes: bytes,
    filename: str,
    crop_type: str,
    ml_service_url: str,
) -> dict:
    """Kirim gambar ke ML service dan kembalikan hasil prediksi."""
    from app.core.exceptions import MLServiceUnavailableException

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                f"{ml_service_url}/predict",
                files={"file": (filename, image_bytes, "image/jpeg")},
                data={"crop_type": crop_type},
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as exc:
        raise MLServiceUnavailableException(
            f"ML service error: {exc.response.status_code}"
        ) from exc
    except httpx.RequestError as exc:
        raise MLServiceUnavailableException(
            f"Tidak bisa menghubungi ML service: {exc}"
        ) from exc

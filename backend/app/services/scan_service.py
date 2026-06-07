"""Business logic untuk modul Scan."""

import logging
import uuid
from io import BytesIO

from fastapi import UploadFile
from PIL import Image
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestException, NotFoundException
from app.models.scan import Scan, ScanResult
from app.services.storage_service import get_public_url, upload_scan_image

logger = logging.getLogger(__name__)

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
MIN_IMAGE_DIMENSION = 256
MAX_IMAGE_DIMENSION = 4096


async def create_scan(
    file: UploadFile,
    crop_type: str,
    latitude: float | None,
    longitude: float | None,
    user_id: uuid.UUID | None,
    db: AsyncSession,
) -> Scan:
    """
    Validasi file, upload ke R2, buat record Scan di database,
    dan antrekan Celery task untuk analisis.
    """
    # Validasi tipe file
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise BadRequestException(
            f"Format gambar tidak didukung: {file.content_type}. "
            "Gunakan JPEG, PNG, atau WebP."
        )

    # Baca file ke memory untuk validasi size & dimension
    content = await file.read()

    # Validasi file size
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise BadRequestException(
            f"Ukuran file melebihi batas maksimal 10 MB ({len(content) / (1024 * 1024):.1f} MB)."
        )

    # Validasi dimensi gambar & cek decompression bomb
    try:
        img = Image.open(BytesIO(content))
        img.verify()  # Verifikasi tanpa decode penuh
        img = Image.open(BytesIO(content))  # Re-open setelah verify
        width, height = img.size

        if width < MIN_IMAGE_DIMENSION or height < MIN_IMAGE_DIMENSION:
            raise BadRequestException(
                f"Dimensi gambar terlalu kecil ({width}x{height}). "
                f"Minimal {MIN_IMAGE_DIMENSION}x{MIN_IMAGE_DIMENSION} piksel."
            )
        if width > MAX_IMAGE_DIMENSION or height > MAX_IMAGE_DIMENSION:
            raise BadRequestException(
                f"Dimensi gambar terlalu besar ({width}x{height}). "
                f"Maksimal {MAX_IMAGE_DIMENSION}x{MAX_IMAGE_DIMENSION} piksel."
            )
    except BadRequestException:
        raise
    except Exception as exc:
        logger.warning(f"Gagal memvalidasi gambar: {exc}")
        raise BadRequestException(
            "File tidak dapat dibaca sebagai gambar. Pastikan file tidak rusak."
        )

    scan_id = uuid.uuid4()

    # Simpan record Scan terlebih dahulu (status pending)
    scan = Scan(
        id=scan_id,
        user_id=user_id,
        crop_type=crop_type,
        status="pending",
        latitude=latitude,
        longitude=longitude,
    )
    db.add(scan)
    await db.flush()

    # Upload ke R2
    try:
        image_key = await upload_scan_image(file, scan_id, content)
        scan.image_key = image_key
    except Exception as exc:
        logger.error(f"Gagal upload gambar untuk scan {scan_id}: {exc}")
        scan.status = "failed"
        scan.error_message = "Gagal mengunggah gambar ke storage."
        await db.flush()
        raise BadRequestException("Gagal mengunggah gambar. Silakan coba lagi.")

    # Antrekan analisis async
    from app.tasks.scan_tasks import analyze_scan
    task = analyze_scan.delay(str(scan_id))
    scan.celery_task_id = task.id
    scan.status = "processing"

    # Invalidate user dashboard cache so next load reflects new scan
    if user_id:
        from app.core.cache import delete_cache
        await delete_cache(f"dashboard:{user_id}")

    logger.info(f"Scan {scan_id} dibuat, task={task.id}")
    return scan


async def get_scan(scan_id: str, db: AsyncSession) -> Scan:
    """Ambil scan beserta result-nya. Raise 404 jika tidak ditemukan."""
    try:
        uid = uuid.UUID(scan_id)
    except ValueError:
        raise NotFoundException("Scan tidak ditemukan")

    result = await db.execute(
        select(Scan).where(Scan.id == uid)
    )
    scan = result.scalar_one_or_none()
    if not scan:
        raise NotFoundException("Scan tidak ditemukan")
    return scan


async def save_scan_result(
    scan_id: uuid.UUID,
    detected_disease: str,
    confidence: float,
    alternatives: list[dict],
    model_version: str,
    is_mock: bool,
    recommendation: str | None,
    db: AsyncSession,
) -> ScanResult:
    """
    Simpan hasil prediksi ML dan update status Scan menjadi 'completed'.
    Dipanggil dari dalam Celery task setelah analisis selesai.
    """
    result_obj = ScanResult(
        scan_id=scan_id,
        detected_disease=detected_disease,
        confidence=confidence,
        alternatives=alternatives,
        model_version=model_version,
        is_mock=is_mock,
        recommendation=recommendation,
    )
    db.add(result_obj)

    scan_row = await db.get(Scan, scan_id)
    if scan_row:
        scan_row.status = "completed"

    return result_obj


async def get_user_scans(
    user_id: uuid.UUID,
    db: AsyncSession,
    page: int = 1,
    per_page: int = 20,
) -> tuple[list[Scan], int]:
    """
    Ambil daftar scan milik user tertentu, diurutkan dari yang terbaru.
    Return (scans, total_count) untuk pagination.
    """
    from sqlalchemy import func

    offset = (page - 1) * per_page

    # Query total count
    count_result = await db.execute(
        select(func.count()).select_from(Scan).where(Scan.user_id == user_id)
    )
    total = count_result.scalar_one()

    # Query data dengan pagination
    scans_result = await db.execute(
        select(Scan)
        .where(Scan.user_id == user_id)
        .order_by(Scan.created_at.desc())
        .offset(offset)
        .limit(per_page)
    )
    scans = list(scans_result.scalars().all())
    return scans, total


def build_scan_response_dict(scan: Scan) -> dict:
    """
    Bantu serialisasi Scan ke dict yang bisa diterima ScanResponse schema.
    Menyertakan image_url yang di-build dari image_key.
    """
    return {
        "id": scan.id,
        "user_id": scan.user_id,
        "crop_type": scan.crop_type,
        "image_key": scan.image_key,
        "status": scan.status,
        "latitude": scan.latitude,
        "longitude": scan.longitude,
        "province": scan.province,
        "city": scan.city,
        "celery_task_id": scan.celery_task_id,
        "error_message": scan.error_message,
        "created_at": scan.created_at,
        "updated_at": scan.updated_at,
        "image_url": get_public_url(scan.image_key),
        "result": scan.result,
    }

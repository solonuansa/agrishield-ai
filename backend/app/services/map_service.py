"""
Service untuk query data peta/heatmap persebaran penyakit.
Hanya file ini yang boleh menjalankan query geospatial.
Hasil di-cache di Redis selama 120 detik karena bersifat publik dan jarang berubah.
"""

import logging

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import get_or_set
from app.models.scan import Scan, ScanResult
from app.schemas.map import DiseasePoint, HeatmapResponse

logger = logging.getLogger(__name__)

# Jumlah titik maksimum yang dikembalikan — cukup untuk Leaflet tanpa lag
MAX_POINTS = 500

CACHE_TTL_SECONDS = 120


async def _fetch_heatmap_data(
    db: AsyncSession,
    crop_type: str | None = None,
    disease: str | None = None,
    months: int = 3,
) -> HeatmapResponse:
    """
    Ambil titik-titik penyakit untuk ditampilkan di peta.
    Hanya scan yang punya koordinat dan status 'completed' yang diambil.

    Args:
        crop_type: filter 'rice' atau 'corn', None = semua
        disease: filter nama penyakit spesifik, None = semua (kecuali healthy)
        months: ambil data N bulan terakhir (default 3)
    """
    # Query join Scan + ScanResult dengan filter
    # Gunakan raw SQL untuk memanfaatkan PostGIS jika nanti diperlukan
    # Untuk sekarang pakai ORM biasa karena hanya butuh lat/lng numerik
    stmt = (
        select(
            Scan.id,
            Scan.latitude,
            Scan.longitude,
            Scan.crop_type,
            Scan.created_at,
            ScanResult.detected_disease,
            ScanResult.confidence,
        )
        .join(ScanResult, ScanResult.scan_id == Scan.id)
        .where(Scan.status == "completed")
        .where(Scan.latitude.is_not(None))
        .where(Scan.longitude.is_not(None))
        # Jangan tampilkan tanaman sehat — heatmap fokus ke penyakit
        .where(~ScanResult.detected_disease.contains("healthy"))
        # Filter N bulan terakhir menggunakan interval PostgreSQL
        .where(
            Scan.created_at
            >= func.now() - text(":months MONTH").bindparams(months=months)
        )
        .order_by(Scan.created_at.desc())
        .limit(MAX_POINTS)
    )

    if crop_type:
        stmt = stmt.where(Scan.crop_type == crop_type)

    if disease:
        stmt = stmt.where(ScanResult.detected_disease == disease)

    result = await db.execute(stmt)
    rows = result.all()

    points = [
        DiseasePoint(
            scan_id=str(row.id),
            lat=row.latitude,
            lng=row.longitude,
            disease=row.detected_disease,
            crop_type=row.crop_type,
            confidence=round(row.confidence, 3),
            month=row.created_at.strftime("%Y-%m"),
        )
        for row in rows
    ]

    logger.info(f"Heatmap: {len(points)} titik penyakit (filter: crop={crop_type}, bulan={months})")
    return HeatmapResponse(points=points, total=len(points))


async def get_heatmap_data(
    db: AsyncSession,
    crop_type: str | None = None,
    disease: str | None = None,
    months: int = 3,
) -> HeatmapResponse:
    """Ambil heatmap data dengan caching Redis 120 detik."""
    cache_key = f"heatmap:{crop_type or 'all'}:{disease or 'all'}:{months}"

    result = await get_or_set(
        key=cache_key,
        factory=lambda: _fetch_heatmap_data(db, crop_type, disease, months),
        ttl_seconds=CACHE_TTL_SECONDS,
        serializer=lambda obj: obj.model_dump_json(),
        deserializer=lambda raw: HeatmapResponse.model_validate_json(raw),
    )
    return result

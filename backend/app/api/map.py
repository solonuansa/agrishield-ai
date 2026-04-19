"""Endpoint publik untuk data peta persebaran penyakit."""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.common import SuccessResponse
from app.schemas.map import HeatmapResponse
from app.services.map_service import get_heatmap_data

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/heatmap", response_model=SuccessResponse[HeatmapResponse])
async def get_heatmap(
    crop_type: Optional[str] = Query(None, description="Filter: 'rice' atau 'corn'"),
    disease: Optional[str] = Query(None, description="Filter nama penyakit spesifik"),
    months: int = Query(3, ge=1, le=12, description="Rentang waktu data dalam bulan"),
    db: AsyncSession = Depends(get_db),
) -> SuccessResponse[HeatmapResponse]:
    """
    Ambil titik-titik penyakit tanaman untuk ditampilkan di peta.
    Endpoint publik — tidak memerlukan autentikasi.
    Hanya scan yang punya koordinat GPS dan sudah selesai dianalisis.
    """
    if crop_type and crop_type not in ("rice", "corn"):
        from app.core.exceptions import BadRequestException
        raise BadRequestException("crop_type harus 'rice' atau 'corn'")

    data = await get_heatmap_data(
        db=db,
        crop_type=crop_type,
        disease=disease,
        months=months,
    )
    return SuccessResponse(data=data)

"""Endpoint untuk modul Scan."""

import logging
import math
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.common import SuccessResponse
from app.schemas.scan import ScanCreateRequest, ScanListMeta, ScanResponse
from app.services.scan_service import (
    build_scan_response_dict,
    create_scan,
    get_scan,
    get_user_scans,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("", response_model=SuccessResponse[ScanResponse], status_code=201)
async def create_scan_endpoint(
    file: UploadFile = File(..., description="Foto daun tanaman (JPEG/PNG/WebP, maks 10MB)"),
    crop_type: str = Form(..., description="Jenis tanaman: 'rice' atau 'corn'"),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    db: AsyncSession = Depends(get_db),
    # Scan bisa dilakukan tanpa login — current_user opsional
    # Gunakan try/except karena HTTPBearer raise 403 jika header tidak ada
) -> SuccessResponse[ScanResponse]:
    """
    Upload gambar tanaman dan mulai proses analisis penyakit.
    Tidak memerlukan autentikasi (guest scan didukung).
    Return scan_id untuk polling status via GET /scans/{id}.
    """
    if crop_type not in ("rice", "corn"):
        from app.core.exceptions import BadRequestException
        raise BadRequestException("crop_type harus 'rice' atau 'corn'")

    scan = await create_scan(
        file=file,
        crop_type=crop_type,
        latitude=latitude,
        longitude=longitude,
        user_id=None,  # TODO: inject user_id jika token tersedia (opsional auth)
        db=db,
    )
    return SuccessResponse(data=ScanResponse.model_validate(build_scan_response_dict(scan)))


@router.post("/auth", response_model=SuccessResponse[ScanResponse], status_code=201)
async def create_scan_authenticated(
    file: UploadFile = File(...),
    crop_type: str = Form(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SuccessResponse[ScanResponse]:
    """
    Sama dengan POST /scans tapi memerlukan autentikasi.
    Scan akan dikaitkan ke akun pengguna dan masuk ke riwayat.
    """
    if crop_type not in ("rice", "corn"):
        from app.core.exceptions import BadRequestException
        raise BadRequestException("crop_type harus 'rice' atau 'corn'")

    scan = await create_scan(
        file=file,
        crop_type=crop_type,
        latitude=latitude,
        longitude=longitude,
        user_id=current_user.id,
        db=db,
    )
    return SuccessResponse(data=ScanResponse.model_validate(build_scan_response_dict(scan)))


@router.get("", response_model=SuccessResponse[list[ScanResponse]])
async def list_user_scans(
    page: int = 1,
    per_page: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SuccessResponse[list[ScanResponse]]:
    """
    Ambil riwayat scan milik user yang sedang login.
    Memerlukan autentikasi. Diurutkan dari yang terbaru.
    """
    if per_page > 50:
        per_page = 50  # batasi agar tidak terlalu berat

    scans, total = await get_user_scans(
        user_id=current_user.id,
        db=db,
        page=page,
        per_page=per_page,
    )
    data = [ScanResponse.model_validate(build_scan_response_dict(s)) for s in scans]
    meta = ScanListMeta(
        page=page,
        per_page=per_page,
        total=total,
        total_pages=math.ceil(total / per_page) if total > 0 else 1,
    )
    return SuccessResponse(data=data, meta=meta.model_dump())


@router.get("/{scan_id}", response_model=SuccessResponse[ScanResponse])
async def get_scan_endpoint(
    scan_id: str,
    db: AsyncSession = Depends(get_db),
) -> SuccessResponse[ScanResponse]:
    """
    Ambil status dan hasil scan berdasarkan ID.
    Digunakan untuk polling saat status masih 'processing'.
    """
    scan = await get_scan(scan_id, db)
    return SuccessResponse(data=ScanResponse.model_validate(build_scan_response_dict(scan)))

"""Endpoint untuk modul Scan."""

import logging
import math
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.security import decode_access_token
from app.models.user import User
from app.schemas.common import SuccessResponse
from app.schemas.scan import ScanListMeta, ScanResponse
from app.services.scan_service import (
    build_scan_response_dict,
    create_scan,
    get_scan,
    get_user_scans,
)

logger = logging.getLogger(__name__)

router = APIRouter()

_optional_bearer = HTTPBearer(auto_error=False)


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_optional_bearer),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    if not credentials:
        return None
    user_id = decode_access_token(credentials.credentials)
    if not user_id:
        return None
    from app.services.user_service import get_user_by_id
    return await get_user_by_id(user_id, db)


@router.post("", response_model=SuccessResponse[ScanResponse], status_code=201)
async def create_scan_endpoint(
    file: UploadFile = File(..., description="Foto daun tanaman (JPEG/PNG/WebP, maks 10MB)"),
    crop_type: str = Form(..., description="Jenis tanaman: 'rice' atau 'corn'"),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
) -> SuccessResponse[ScanResponse]:
    """
    Upload gambar tanaman dan mulai proses analisis penyakit.
    Mendukung guest scan (tanpa login) maupun authenticated scan.
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
        user_id=current_user.id if current_user else None,
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
        total_pages=math.ceil(total / per_page) if total > 0 else 0,
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

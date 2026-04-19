"""Endpoint untuk sistem peringatan wabah penyakit."""

import uuid

from fastapi import APIRouter, Depends, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.schemas.alert import AlertListResponse, AlertResponse
from app.schemas.common import SuccessResponse
from app.services import alert_service
from app.core.dependencies import get_current_user

router = APIRouter()

# Scheme opsional — tidak raise 403 jika header tidak ada
_optional_bearer = HTTPBearer(auto_error=False)


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_optional_bearer),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    """Dependency autentikasi opsional — kembalikan User atau None."""
    if not credentials:
        return None
    user_id = decode_access_token(credentials.credentials)
    if not user_id:
        return None
    from app.services.user_service import get_user_by_id
    return await get_user_by_id(user_id, db)


@router.get("", response_model=SuccessResponse[AlertListResponse])
async def list_alerts(
    lat: float | None = Query(default=None, ge=-90, le=90),
    lng: float | None = Query(default=None, ge=-180, le=180),
    radius_km: float = Query(default=200.0, ge=10, le=1000),
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
) -> SuccessResponse[AlertListResponse]:
    """
    Ambil daftar peringatan wabah aktif.
    Endpoint publik — jika lat/lng diberikan, filter alert dalam radius tertentu.
    User login mendapat info is_read per alert.
    """
    user_id = current_user.id if current_user else None
    alerts, read_ids = await alert_service.get_alerts_for_user(db, user_id, lat, lng, radius_km)

    read_set = set(read_ids)
    alert_responses = [
        AlertResponse.model_validate({**a.__dict__, "is_read": a.id in read_set})
        for a in alerts
    ]
    unread_count = sum(1 for r in alert_responses if not r.is_read)

    return SuccessResponse(
        data=AlertListResponse(alerts=alert_responses, unread_count=unread_count)
    )


@router.post("/read", response_model=SuccessResponse[dict])
async def mark_read(
    alert_ids: list[uuid.UUID],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SuccessResponse[dict]:
    """Tandai satu atau beberapa alert sebagai sudah dibaca. Memerlukan login."""
    await alert_service.mark_alerts_read(alert_ids, current_user.id, db)
    return SuccessResponse(data={"marked": len(alert_ids)})

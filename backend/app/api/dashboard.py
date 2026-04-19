"""Endpoint dashboard — statistik scan milik user yang login."""

import logging

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.common import SuccessResponse
from app.schemas.dashboard import DashboardStats
from app.services.dashboard_service import get_dashboard_stats

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/stats", response_model=SuccessResponse[DashboardStats])
async def get_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SuccessResponse[DashboardStats]:
    """
    Ambil statistik scan milik user yang sedang login.
    Memerlukan autentikasi.
    """
    stats = await get_dashboard_stats(user_id=current_user.id, db=db)
    return SuccessResponse(data=stats)

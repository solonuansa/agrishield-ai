"""Endpoint Admin/Government analytics — hanya untuk role admin atau government."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.exceptions import ForbiddenException
from app.models.user import User
from app.schemas.admin import AdminStats
from app.schemas.common import SuccessResponse
from app.services import admin_service

router = APIRouter()

ALLOWED_ROLES = {"admin", "government"}


def require_admin_or_gov(current_user: User = Depends(get_current_user)) -> User:
    """Dependency — hanya admin dan government yang bisa akses."""
    if current_user.role not in ALLOWED_ROLES:
        raise ForbiddenException("Halaman ini hanya untuk admin dan pemerintah")
    return current_user


@router.get("/stats", response_model=SuccessResponse[AdminStats])
async def get_admin_stats(
    _: User = Depends(require_admin_or_gov),
    db: AsyncSession = Depends(get_db),
) -> SuccessResponse[AdminStats]:
    """Statistik nasional agregat untuk admin dan pemerintah."""
    stats = await admin_service.get_admin_stats(db)
    return SuccessResponse(data=stats)

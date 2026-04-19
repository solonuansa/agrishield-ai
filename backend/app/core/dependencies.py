"""FastAPI dependencies: current user, dll."""

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import UnauthorizedException
from app.core.security import decode_access_token

bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
):
    """
    Dependency untuk endpoint yang memerlukan autentikasi.
    Validasi JWT token dan kembalikan user dari database.
    """
    # Import di sini untuk menghindari circular import
    from app.models.user import User
    from app.services.user_service import get_user_by_id

    token = credentials.credentials
    user_id = decode_access_token(token)

    if not user_id:
        raise UnauthorizedException("Token tidak valid atau sudah expired")

    user = await get_user_by_id(user_id, db)
    if not user:
        raise UnauthorizedException("User tidak ditemukan")

    if not user.is_active:
        raise UnauthorizedException("Akun tidak aktif")

    return user

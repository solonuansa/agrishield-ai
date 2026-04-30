"""Endpoint autentikasi: register, login, dan refresh token."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import UnauthorizedException
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
)
from app.schemas.common import SuccessResponse
from app.schemas.user import (
    RefreshTokenRequest,
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.services.user_service import authenticate_user, get_user_by_id, register_user

router = APIRouter()


def _build_token_response(user) -> TokenResponse:
    """Helper untuk membuat TokenResponse dengan access + refresh token."""
    return TokenResponse(
        access_token=create_access_token(subject=str(user.id)),
        refresh_token=create_refresh_token(subject=str(user.id)),
        user=UserResponse.model_validate(user),
    )


@router.post("/register", response_model=SuccessResponse[TokenResponse], status_code=201)
async def register(
    data: UserRegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> SuccessResponse[TokenResponse]:
    """Daftarkan akun baru dan langsung kembalikan access + refresh token."""
    user = await register_user(data, db)
    return SuccessResponse(data=_build_token_response(user))


@router.post("/login", response_model=SuccessResponse[TokenResponse])
async def login(
    data: UserLoginRequest,
    db: AsyncSession = Depends(get_db),
) -> SuccessResponse[TokenResponse]:
    """Login dengan email dan password, kembalikan access + refresh token."""
    user = await authenticate_user(data.email, data.password, db)
    return SuccessResponse(data=_build_token_response(user))


@router.post("/refresh", response_model=SuccessResponse[TokenResponse])
async def refresh_token(
    data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
) -> SuccessResponse[TokenResponse]:
    """
    Generate access token baru menggunakan refresh token.
    Refresh token yang valid akan menghasilkan pasangan token baru.
    """
    user_id = decode_refresh_token(data.refresh_token)
    if not user_id:
        raise UnauthorizedException("Refresh token tidak valid atau sudah expired")

    user = await get_user_by_id(user_id, db)
    if not user:
        raise UnauthorizedException("User tidak ditemukan")

    if not user.is_active:
        raise UnauthorizedException("Akun tidak aktif")

    return SuccessResponse(data=_build_token_response(user))

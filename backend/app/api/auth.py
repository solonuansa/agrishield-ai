"""Endpoint autentikasi: register, login, dan refresh token."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import get_redis
from app.core.config import settings
from app.core.database import get_db
from app.core.exceptions import BadRequestException, UnauthorizedException
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    get_token_jti,
)
from app.main import limiter
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
    return TokenResponse(
        access_token=create_access_token(subject=str(user.id)),
        refresh_token=create_refresh_token(subject=str(user.id)),
        user=UserResponse.model_validate(user),
    )


@router.post("/register", response_model=SuccessResponse[TokenResponse], status_code=201)
@limiter.limit("5/minute")
async def register(
    request,
    data: UserRegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> SuccessResponse[TokenResponse]:
    if not settings.registration_open:
        raise BadRequestException("Pendaftaran sedang ditutup. Silakan hubungi administrator.")
    user = await register_user(data, db)
    return SuccessResponse(data=_build_token_response(user))


@router.post("/login", response_model=SuccessResponse[TokenResponse])
@limiter.limit("10/minute")
async def login(
    request,
    data: UserLoginRequest,
    db: AsyncSession = Depends(get_db),
) -> SuccessResponse[TokenResponse]:
    user = await authenticate_user(data.email, data.password, db)
    return SuccessResponse(data=_build_token_response(user))


@router.post("/refresh", response_model=SuccessResponse[TokenResponse])
@limiter.limit("10/minute")
async def refresh_token(
    request,
    data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
) -> SuccessResponse[TokenResponse]:
    user_id = decode_refresh_token(data.refresh_token)
    if not user_id:
        raise UnauthorizedException("Refresh token tidak valid atau sudah expired")

    # Token rotation: cek apakah refresh token sudah pernah dipakai
    token_jti = get_token_jti(data.refresh_token)
    if token_jti:
        r = get_redis()
        if await r.get(f"refresh_token_used:{token_jti}"):
            raise UnauthorizedException("Refresh token sudah tidak berlaku")
        # Tandai token ini sebagai sudah dipakai (expire sesuai refresh token lifetime)
        expire_seconds = settings.refresh_token_expire_days * 86400
        await r.setex(f"refresh_token_used:{token_jti}", expire_seconds, "1")

    user = await get_user_by_id(user_id, db)
    if not user:
        raise UnauthorizedException("User tidak ditemukan")

    if not user.is_active:
        raise UnauthorizedException("Akun tidak aktif")

    return SuccessResponse(data=_build_token_response(user))

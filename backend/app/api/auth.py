"""Endpoint autentikasi: register dan login."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import create_access_token
from app.schemas.common import SuccessResponse
from app.schemas.user import TokenResponse, UserLoginRequest, UserRegisterRequest, UserResponse
from app.services.user_service import authenticate_user, register_user

router = APIRouter()


@router.post("/register", response_model=SuccessResponse[TokenResponse], status_code=201)
async def register(
    data: UserRegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> SuccessResponse[TokenResponse]:
    """Daftarkan akun baru dan langsung kembalikan access token."""
    user = await register_user(data, db)
    token = create_access_token(subject=str(user.id))
    return SuccessResponse(
        data=TokenResponse(
            access_token=token,
            user=UserResponse.model_validate(user),
        )
    )


@router.post("/login", response_model=SuccessResponse[TokenResponse])
async def login(
    data: UserLoginRequest,
    db: AsyncSession = Depends(get_db),
) -> SuccessResponse[TokenResponse]:
    """Login dengan email dan password, kembalikan access token."""
    user = await authenticate_user(data.email, data.password, db)
    token = create_access_token(subject=str(user.id))
    return SuccessResponse(
        data=TokenResponse(
            access_token=token,
            user=UserResponse.model_validate(user),
        )
    )

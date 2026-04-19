"""Business logic untuk manajemen user."""

import logging
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestException, ConflictException, UnauthorizedException
from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.user import UserRegisterRequest

logger = logging.getLogger(__name__)


async def get_user_by_id(user_id: str, db: AsyncSession) -> User | None:
    """Ambil user berdasarkan ID."""
    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        return None
    result = await db.execute(select(User).where(User.id == uid))
    return result.scalar_one_or_none()


async def get_user_by_email(email: str, db: AsyncSession) -> User | None:
    """Ambil user berdasarkan email."""
    result = await db.execute(select(User).where(User.email == email.lower()))
    return result.scalar_one_or_none()


async def register_user(data: UserRegisterRequest, db: AsyncSession) -> User:
    """
    Daftarkan user baru.
    Raise ConflictException jika email sudah terdaftar.
    """
    existing = await get_user_by_email(data.email, db)
    if existing:
        raise ConflictException("Email sudah terdaftar")

    user = User(
        email=data.email.lower(),
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        phone_number=data.phone_number,
        province=data.province,
        city=data.city,
    )
    db.add(user)
    await db.flush()  # agar id ter-assign sebelum commit

    logger.info(f"User baru terdaftar: {user.email} (id={user.id})")
    return user


async def authenticate_user(email: str, password: str, db: AsyncSession) -> User:
    """
    Autentikasi user dengan email dan password.
    Raise UnauthorizedException jika gagal.
    """
    user = await get_user_by_email(email, db)
    if not user or not verify_password(password, user.hashed_password):
        raise UnauthorizedException("Email atau password salah")

    if not user.is_active:
        raise UnauthorizedException("Akun tidak aktif")

    return user

"""Business logic untuk manajemen lahan (fields)."""

import logging
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ForbiddenException, NotFoundException
from app.models.field import Field
from app.schemas.field import FieldCreate, FieldUpdate

logger = logging.getLogger(__name__)


async def list_user_fields(user_id: uuid.UUID, db: AsyncSession) -> list[Field]:
    """Kembalikan semua lahan milik user, diurutkan dari terbaru."""
    result = await db.execute(
        select(Field)
        .where(Field.user_id == user_id)
        .order_by(Field.created_at.desc())
    )
    return list(result.scalars().all())


async def create_field(
    payload: FieldCreate, user_id: uuid.UUID, db: AsyncSession
) -> Field:
    """Buat lahan baru untuk user."""
    field = Field(
        user_id=user_id,
        name=payload.name,
        location_name=payload.location_name,
        latitude=payload.latitude,
        longitude=payload.longitude,
        area_hectares=payload.area_hectares,
        crop_type=payload.crop_type,
    )
    db.add(field)
    await db.commit()
    await db.refresh(field)
    logger.info(f"Lahan baru dibuat: {field.id} oleh user {user_id}")
    return field


async def update_field(
    field_id: uuid.UUID,
    payload: FieldUpdate,
    user_id: uuid.UUID,
    db: AsyncSession,
) -> Field:
    """Update lahan. Hanya pemilik yang boleh mengubah."""
    field = await _get_owned_field(field_id, user_id, db)

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(field, key, value)

    await db.commit()
    await db.refresh(field)
    logger.info(f"Lahan {field_id} diperbarui oleh user {user_id}")
    return field


async def delete_field(
    field_id: uuid.UUID, user_id: uuid.UUID, db: AsyncSession
) -> None:
    """Hapus lahan. Hanya pemilik yang boleh menghapus."""
    field = await _get_owned_field(field_id, user_id, db)
    await db.delete(field)
    await db.commit()
    logger.info(f"Lahan {field_id} dihapus oleh user {user_id}")


async def _get_owned_field(
    field_id: uuid.UUID, user_id: uuid.UUID, db: AsyncSession
) -> Field:
    """Ambil lahan dan validasi kepemilikan. Raise 404/403 jika tidak valid."""
    result = await db.execute(select(Field).where(Field.id == field_id))
    field = result.scalar_one_or_none()

    if not field:
        raise NotFoundException("Lahan tidak ditemukan")
    if field.user_id != user_id:
        raise ForbiddenException("Anda tidak memiliki akses ke lahan ini")

    return field

"""Endpoint untuk manajemen lahan (fields). Semua endpoint memerlukan autentikasi."""

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.common import SuccessResponse
from app.schemas.field import FieldCreate, FieldResponse, FieldUpdate
from app.services import field_service

router = APIRouter()


@router.get("", response_model=SuccessResponse[list[FieldResponse]])
async def list_fields(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SuccessResponse[list[FieldResponse]]:
    """Ambil semua lahan milik user yang sedang login."""
    fields = await field_service.list_user_fields(current_user.id, db)
    return SuccessResponse(data=[FieldResponse.model_validate(f) for f in fields])


@router.post("", response_model=SuccessResponse[FieldResponse], status_code=status.HTTP_201_CREATED)
async def create_field(
    payload: FieldCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SuccessResponse[FieldResponse]:
    """Buat lahan baru."""
    field = await field_service.create_field(payload, current_user.id, db)
    return SuccessResponse(data=FieldResponse.model_validate(field))


@router.put("/{field_id}", response_model=SuccessResponse[FieldResponse])
async def update_field(
    field_id: uuid.UUID,
    payload: FieldUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SuccessResponse[FieldResponse]:
    """Update data lahan. Hanya pemilik yang bisa mengubah."""
    field = await field_service.update_field(field_id, payload, current_user.id, db)
    return SuccessResponse(data=FieldResponse.model_validate(field))


@router.delete("/{field_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_field(
    field_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Hapus lahan. Hanya pemilik yang bisa menghapus."""
    await field_service.delete_field(field_id, current_user.id, db)

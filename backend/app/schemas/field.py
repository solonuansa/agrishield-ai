"""Pydantic schemas untuk modul Field (lahan)."""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class FieldCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    location_name: str | None = Field(default=None, max_length=255)
    latitude: float | None = Field(default=None, ge=-90.0, le=90.0)
    longitude: float | None = Field(default=None, ge=-180.0, le=180.0)
    area_hectares: float | None = Field(default=None, gt=0)
    crop_type: str | None = None

    @field_validator("crop_type")
    @classmethod
    def validate_crop_type(cls, v: str | None) -> str | None:
        if v is not None and v not in ("rice", "corn"):
            raise ValueError("crop_type harus 'rice' atau 'corn'")
        return v

    @field_validator("name")
    @classmethod
    def strip_name(cls, v: str) -> str:
        return v.strip()


class FieldUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    location_name: str | None = Field(default=None, max_length=255)
    latitude: float | None = Field(default=None, ge=-90.0, le=90.0)
    longitude: float | None = Field(default=None, ge=-180.0, le=180.0)
    area_hectares: float | None = Field(default=None, gt=0)
    crop_type: str | None = None

    @field_validator("crop_type")
    @classmethod
    def validate_crop_type(cls, v: str | None) -> str | None:
        if v is not None and v not in ("rice", "corn"):
            raise ValueError("crop_type harus 'rice' atau 'corn'")
        return v

    @field_validator("name")
    @classmethod
    def strip_name(cls, v: str | None) -> str | None:
        return v.strip() if v is not None else v


class FieldResponse(BaseModel):
    id: uuid.UUID
    name: str
    location_name: str | None
    latitude: float | None
    longitude: float | None
    area_hectares: float | None
    crop_type: str | None
    created_at: datetime

    model_config = {"from_attributes": True}

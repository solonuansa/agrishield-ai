"""Pydantic schemas untuk User — request dan response."""

import re
import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, field_validator


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone_number: str | None = None
    province: str | None = None
    city: str | None = None

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password minimal 8 karakter")
        if not re.search(r"[A-Za-z]", v):
            raise ValueError("Password harus mengandung setidaknya 1 huruf")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password harus mengandung setidaknya 1 angka")
        return v

    @field_validator("phone_number")
    @classmethod
    def phone_format(cls, v: str | None) -> str | None:
        if v is None:
            return v
        cleaned = re.sub(r"[\s\-\(\)]", "", v)
        if not re.match(r"^(\+62|0)[0-9]{9,13}$", cleaned):
            raise ValueError(
                "Nomor telepon tidak valid. Gunakan format Indonesia (+62xxx atau 08xxx)"
            )
        return cleaned

    @field_validator("full_name")
    @classmethod
    def full_name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Nama lengkap tidak boleh kosong")
        return v.strip()


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    phone_number: str | None
    role: str
    is_active: bool
    province: str | None
    city: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

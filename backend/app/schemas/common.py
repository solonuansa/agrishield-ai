"""Schema respons standar untuk semua endpoint AgriShield."""

from typing import Any, Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class SuccessResponse(BaseModel, Generic[T]):
    """Format respons sukses standar: {success, data, meta}."""

    success: bool = True
    data: T
    meta: dict[str, Any] | None = None


class ErrorResponse(BaseModel):
    """Format respons error standar."""

    success: bool = False
    detail: str

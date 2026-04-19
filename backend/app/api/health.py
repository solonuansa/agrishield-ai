"""Endpoint health check."""

from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def health_check():
    """Cek apakah API berjalan normal."""
    return {"status": "ok", "service": "agrishield-api"}

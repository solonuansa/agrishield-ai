"""Unit test untuk endpoint Scan."""

from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_create_scan_invalid_crop_type():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/scans",
            data={"crop_type": "wheat"},  # tidak didukung
            files={"file": ("test.jpg", b"fakeimagebytes", "image/jpeg")},
        )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_create_scan_invalid_file_type():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/scans",
            data={"crop_type": "rice"},
            files={"file": ("test.pdf", b"fakepdfbytes", "application/pdf")},
        )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_get_scan_not_found():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/scans/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404

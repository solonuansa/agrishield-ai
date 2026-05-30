"""Unit test untuk endpoint Scan."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_scan_invalid_crop_type(async_client: AsyncClient):
    response = await async_client.post(
        "/api/scans",
        data={"crop_type": "wheat"},  # tidak didukung
        files={"file": ("test.jpg", b"fakeimagebytes", "image/jpeg")},
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_create_scan_invalid_file_type(async_client: AsyncClient):
    response = await async_client.post(
        "/api/scans",
        data={"crop_type": "rice"},
        files={"file": ("test.pdf", b"fakepdfbytes", "application/pdf")},
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_get_scan_not_found(async_client: AsyncClient):
    response = await async_client.get(
        "/api/scans/00000000-0000-0000-0000-000000000000"
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_create_scan_success(
    async_client: AsyncClient,
    mock_storage,
    mock_celery_delay,
):
    """Happy path: upload gambar valid -> 201 + scan_id."""
    # Buat file gambar valid minimal (256x256 pixel JPEG)
    from io import BytesIO
    from PIL import Image

    img = Image.new("RGB", (256, 256), color="green")
    buf = BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    response = await async_client.post(
        "/api/scans",
        data={"crop_type": "rice"},
        files={"file": ("leaf.jpg", buf.read(), "image/jpeg")},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["crop_type"] == "rice"
    assert data["data"]["status"] in ("pending", "processing")
    assert "id" in data["data"]

    # Upload ke storage dipanggil
    mock_storage.assert_awaited_once()
    # Celery task diantrekan
    mock_celery_delay.assert_called_once()

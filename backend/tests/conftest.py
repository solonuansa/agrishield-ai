"""Shared fixtures dan mock untuk integration test."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app


@pytest.fixture
def mock_storage(monkeypatch: pytest.MonkeyPatch) -> MagicMock:
    """Mock upload_scan_image agar tidak benar-benar upload ke R2."""
    mock = AsyncMock(return_value="scans/2025/01/test-scan-id.jpg")
    monkeypatch.setattr("app.services.scan_service.upload_scan_image", mock)
    return mock


@pytest.fixture
def mock_celery_delay(monkeypatch: pytest.MonkeyPatch) -> MagicMock:
    """Mock Celery delay agar task tidak benar-benar diantrekan."""
    mock_task = MagicMock()
    mock_task.id = "mock-celery-task-id"
    mock_delay = MagicMock(return_value=mock_task)
    monkeypatch.setattr("app.tasks.scan_tasks.analyze_scan.delay", mock_delay)
    return mock_delay


@pytest.fixture
async def async_client() -> AsyncClient:
    """AsyncClient yang menempel langsung ke FastAPI app (tanpa network)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

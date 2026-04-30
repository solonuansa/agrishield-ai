"""Unit test untuk endpoint autentikasi."""

import pytest
from httpx import AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_register_success():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/auth/register",
            json={
                "email": "petani@test.com",
                "password": "password123",
                "full_name": "Budi Santoso",
            },
        )
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert "refresh_token" in data["data"]
    assert data["data"]["user"]["email"] == "petani@test.com"


@pytest.mark.asyncio
async def test_register_duplicate_email():
    async with AsyncClient(app=app, base_url="http://test") as client:
        payload = {
            "email": "duplikat@test.com",
            "password": "password123",
            "full_name": "Test User",
        }
        await client.post("/api/auth/register", json=payload)
        response = await client.post("/api/auth/register", json=payload)
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_login_wrong_password():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/auth/login",
            json={"email": "tidakada@test.com", "password": "salah"},
        )
    assert response.status_code == 401

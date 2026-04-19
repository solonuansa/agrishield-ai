"""Daftarkan semua router API di sini."""

from fastapi import APIRouter

from app.api.admin import router as admin_router
from app.api.alerts import router as alerts_router
from app.api.auth import router as auth_router
from app.api.community import router as community_router
from app.api.dashboard import router as dashboard_router
from app.api.fields import router as fields_router
from app.api.health import router as health_router
from app.api.map import router as map_router
from app.api.scans import router as scans_router

api_router = APIRouter()

api_router.include_router(health_router, prefix="/health", tags=["Health"])
api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(scans_router, prefix="/scans", tags=["Scans"])
api_router.include_router(fields_router, prefix="/fields", tags=["Fields"])
api_router.include_router(alerts_router, prefix="/alerts", tags=["Alerts"])
api_router.include_router(community_router, prefix="/community", tags=["Community"])
api_router.include_router(map_router, prefix="/map", tags=["Map"])
api_router.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(admin_router, prefix="/admin", tags=["Admin"])

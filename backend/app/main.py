"""Entry point aplikasi FastAPI AgriShield."""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import api_router
from app.core.config import settings

logging.basicConfig(
    level=logging.DEBUG if settings.is_development else logging.INFO,
    format="%(asctime)s — %(name)s — %(levelname)s — %(message)s",
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="AgriShield AI API",
    description="Platform deteksi penyakit tanaman berbasis AI untuk petani Indonesia.",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Daftarkan semua router dengan prefix /api
app.include_router(api_router, prefix="/api")


@app.on_event("startup")
async def on_startup():
    logger.info(f"AgriShield API started — environment: {settings.environment}")
    logger.info(f"ML service URL: {settings.ml_service_url}")
    logger.info(f"Mock model: {settings.use_mock_model}")

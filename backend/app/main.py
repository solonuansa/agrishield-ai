"""Entry point aplikasi FastAPI AgriShield."""

import logging

from botocore.exceptions import BotoCoreError, ClientError
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.api import api_router
from app.core.config import settings
from app.core.logging import setup_logging

logger = logging.getLogger(__name__)

# Sentry error tracking — inisialisasi paling awal (hanya di production)
if settings.environment == "production":
    import sentry_sdk
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        environment=settings.environment,
        traces_sample_rate=0.1,
    )
    logger.info("Sentry SDK initialized for production error tracking.")

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="AgriShield AI API",
    description="Platform deteksi penyakit tanaman berbasis AI untuk petani Indonesia.",
    version="0.1.0",
    docs_url=None if settings.environment == "production" else "/docs",
    redoc_url=None if settings.environment == "production" else "/redoc",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Setup logging terstruktur — pasang middleware request ID paling awal
setup_logging(app, log_level=settings.log_level)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
)

# Daftarkan semua router dengan prefix /api
app.include_router(api_router, prefix="/api")


@app.exception_handler(BotoCoreError)
@app.exception_handler(ClientError)
async def storage_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Tangkap error boto3 (R2/S3) dan kembalikan response yang informatif."""
    logger.error(f"Storage error pada {request.url.path}: {exc}")
    return JSONResponse(
        status_code=502,
        content={
            "success": False,
            "detail": "Layanan penyimpanan gambar tidak tersedia sementara. Silakan coba lagi.",
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Tangkap 422 validation errors dan kembalikan format konsisten."""
    errors = []
    for err in exc.errors():
        field = ".".join(str(loc) for loc in err.get("loc", []))
        msg = err.get("msg", "Input tidak valid")
        errors.append({"field": field, "msg": msg})
    logger.warning("Validation error pada %s: %s", request.url.path, errors)
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "detail": "Validasi gagal",
            "errors": errors,
        },
    )


@app.on_event("startup")
async def on_startup():
    logger.info(f"AgriShield API started — environment: {settings.environment}")
    logger.info(f"ML service URL: {settings.ml_service_url}")
    logger.info(f"Mock model: {settings.use_mock_model}")
    from app.core.cache import init_redis
    try:
        await init_redis()
        logger.info("Koneksi Redis berhasil dibuat.")
    except Exception as exc:
        logger.warning(f"Redis gagal diinisialisasi: {exc}")

    # Prometheus metrics
    from prometheus_fastapi_instrumentator import Instrumentator
    Instrumentator().instrument(app).expose(app, endpoint="/api/metrics")


@app.on_event("shutdown")
async def on_shutdown():
    """Graceful shutdown — tutup koneksi yang masih terbuka."""
    logger.info("AgriShield API shutting down — membersihkan koneksi...")
    from app.core.database import engine
    engine.dispose()
    from app.core.cache import get_redis
    try:
        r = get_redis()
        await r.aclose()
        logger.info("Koneksi Redis ditutup.")
    except Exception as exc:
        logger.warning(f"Redis client belum dibuat: {exc}")
    logger.info("Koneksi database ditutup.")

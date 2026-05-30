"""Inisialisasi Celery application."""

from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

celery_app = Celery(
    "agrishield",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.tasks.scan_tasks", "app.tasks.alert_tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="Asia/Jakarta",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_soft_time_limit=300,   # 5 menit — warning sebelum kill
    task_time_limit=360,         # 6 menit — maks eksekusi
    worker_prefetch_multiplier=1,
    beat_schedule={
        # Jalankan deteksi wabah setiap jam
        "check-outbreaks-hourly": {
            "task": "tasks.check_outbreaks",
            "schedule": crontab(minute=0),  # setiap jam tepat
        },
    },
)

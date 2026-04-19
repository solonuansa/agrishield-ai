"""
Service untuk query statistik dashboard user.
Semua agregasi dilakukan di sisi database untuk efisiensi.
"""

import logging
import uuid
from collections import defaultdict

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.scan import Scan, ScanResult
from app.schemas.dashboard import (
    CropBreakdown,
    DashboardStats,
    DiseaseBreakdown,
    TimelinePoint,
)

logger = logging.getLogger(__name__)


async def get_dashboard_stats(user_id: uuid.UUID, db: AsyncSession) -> DashboardStats:
    """
    Hitung statistik scan milik user: total, breakdown per tanaman,
    penyakit terbanyak, dan timeline 8 minggu terakhir.
    """
    # ── 1. Total semua scan ─────────────────────────────────────────────────
    total_result = await db.execute(
        select(func.count()).select_from(Scan).where(Scan.user_id == user_id)
    )
    total_scans: int = total_result.scalar_one()

    # ── 2. Scan completed + join ke ScanResult ──────────────────────────────
    completed_stmt = (
        select(
            Scan.crop_type,
            Scan.created_at,
            ScanResult.detected_disease,
        )
        .join(ScanResult, ScanResult.scan_id == Scan.id)
        .where(Scan.user_id == user_id)
        .where(Scan.status == "completed")
        .order_by(Scan.created_at.desc())
    )
    completed_result = await db.execute(completed_stmt)
    rows = completed_result.all()

    completed_scans = len(rows)

    # ── 3. Hitung dari rows (menghindari banyak round-trip ke DB) ──────────
    disease_detected = 0
    healthy_detected = 0
    crop_counter: dict[str, int] = defaultdict(int)
    disease_counter: dict[str, int] = defaultdict(int)
    # timeline: dict[week_str, {total, disease}]
    week_counter: dict[str, dict[str, int]] = defaultdict(lambda: {"total": 0, "disease": 0})

    for row in rows:
        is_healthy = "healthy" in row.detected_disease
        if is_healthy:
            healthy_detected += 1
        else:
            disease_detected += 1
            disease_counter[row.detected_disease] += 1

        crop_counter[row.crop_type] += 1

        # ISO week: format "YYYY-WW"
        week_str = row.created_at.strftime("%G-%V")
        week_counter[week_str]["total"] += 1
        if not is_healthy:
            week_counter[week_str]["disease"] += 1

    # ── 4. Susun output ──────────────────────────────────────────────────────
    by_crop = [
        CropBreakdown(crop_type=ct, count=cnt)
        for ct, cnt in sorted(crop_counter.items(), key=lambda x: -x[1])
    ]

    top_diseases = [
        DiseaseBreakdown(disease=d, count=c)
        for d, c in sorted(disease_counter.items(), key=lambda x: -x[1])[:5]
    ]

    # 8 minggu terakhir, diurutkan ascending untuk grafik
    sorted_weeks = sorted(week_counter.keys())[-8:]
    timeline = [
        TimelinePoint(
            week=w,
            total=week_counter[w]["total"],
            disease_count=week_counter[w]["disease"],
        )
        for w in sorted_weeks
    ]

    logger.info(f"Dashboard stats untuk user {user_id}: {total_scans} scan total")
    return DashboardStats(
        total_scans=total_scans,
        completed_scans=completed_scans,
        disease_detected=disease_detected,
        healthy_detected=healthy_detected,
        by_crop=by_crop,
        top_diseases=top_diseases,
        timeline=timeline,
    )

"""Business logic untuk Admin/Government analytics dashboard."""

import logging
from collections import defaultdict

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alert import Alert
from app.models.scan import Scan, ScanResult
from app.models.user import User
from app.schemas.admin import (
    AdminStats,
    NationalDiseaseBreakdown,
    NationalTimelinePoint,
    ProvinceStats,
)

logger = logging.getLogger(__name__)


async def get_admin_stats(db: AsyncSession) -> AdminStats:
    """
    Agregat statistik nasional untuk admin/pemerintah.
    Query dilakukan sekali, agregasi di Python untuk menghindari banyak round-trip.
    """
    # ── Total user ──────────────────────────────────────────────────────────
    user_count_result = await db.execute(select(func.count()).select_from(User))
    total_users: int = user_count_result.scalar_one()

    # ── Total scan ──────────────────────────────────────────────────────────
    scan_count_result = await db.execute(select(func.count()).select_from(Scan))
    total_scans: int = scan_count_result.scalar_one()

    # ── Alert aktif ─────────────────────────────────────────────────────────
    alert_count_result = await db.execute(
        select(func.count()).select_from(Alert).where(Alert.status == "active")
    )
    active_alerts: int = alert_count_result.scalar_one()

    # ── Semua scan completed + join ScanResult ──────────────────────────────
    rows_result = await db.execute(
        select(
            Scan.crop_type,
            Scan.province,
            Scan.created_at,
            ScanResult.detected_disease,
        )
        .join(ScanResult, ScanResult.scan_id == Scan.id)
        .where(Scan.status == "completed")
        .order_by(Scan.created_at.desc())
        # Batasi 10.000 baris terbaru untuk mencegah query berat saat data besar
        .limit(10_000)
    )
    rows = rows_result.all()

    # ── Agregasi di Python ───────────────────────────────────────────────────
    disease_detected = 0
    healthy_detected = 0

    # province -> {total, disease_count, disease_counter}
    province_data: dict[str, dict] = defaultdict(
        lambda: {"total": 0, "disease_count": 0, "disease_counter": defaultdict(int)}
    )

    # (disease, crop_type) -> count
    disease_counter: dict[tuple[str, str], int] = defaultdict(int)

    # week -> {total, disease}
    week_counter: dict[str, dict[str, int]] = defaultdict(lambda: {"total": 0, "disease": 0})

    for row in rows:
        is_healthy = "healthy" in row.detected_disease

        if is_healthy:
            healthy_detected += 1
        else:
            disease_detected += 1
            disease_counter[(row.detected_disease, row.crop_type)] += 1

        province_key = row.province or "Tidak Diketahui"
        province_data[province_key]["total"] += 1
        if not is_healthy:
            province_data[province_key]["disease_count"] += 1
            province_data[province_key]["disease_counter"][row.detected_disease] += 1

        week_str = row.created_at.strftime("%G-%V")
        week_counter[week_str]["total"] += 1
        if not is_healthy:
            week_counter[week_str]["disease"] += 1

    # ── Susun output ─────────────────────────────────────────────────────────
    by_province = []
    for province, pdata in sorted(
        province_data.items(), key=lambda x: -x[1]["total"]
    )[:10]:
        top_disease = None
        if pdata["disease_counter"]:
            top_disease = max(pdata["disease_counter"], key=pdata["disease_counter"].get)
        by_province.append(
            ProvinceStats(
                province=province,
                total_scans=pdata["total"],
                disease_count=pdata["disease_count"],
                top_disease=top_disease,
            )
        )

    top_diseases = [
        NationalDiseaseBreakdown(disease=d, crop_type=ct, count=c)
        for (d, ct), c in sorted(disease_counter.items(), key=lambda x: -x[1])[:10]
    ]

    sorted_weeks = sorted(week_counter.keys())[-12:]
    timeline = [
        NationalTimelinePoint(
            week=w,
            total=week_counter[w]["total"],
            disease_count=week_counter[w]["disease"],
        )
        for w in sorted_weeks
    ]

    logger.info(f"Admin stats: {total_scans} scan, {total_users} user, {active_alerts} alert aktif")
    return AdminStats(
        total_scans=total_scans,
        total_users=total_users,
        disease_detected=disease_detected,
        healthy_detected=healthy_detected,
        active_alerts=active_alerts,
        by_province=by_province,
        top_diseases=top_diseases,
        timeline=timeline,
    )

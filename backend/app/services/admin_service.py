import logging

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alert import Alert
from app.models.scan import Scan, ScanResult
from app.models.user import User
from app.schemas.admin import AdminStats, NationalDiseaseBreakdown, ProvinceStats

logger = logging.getLogger(__name__)


async def get_admin_stats(db: AsyncSession) -> AdminStats:
    total_users: int = (await db.execute(select(func.count()).select_from(User))).scalar_one()
    total_scans: int = (await db.execute(select(func.count()).select_from(Scan))).scalar_one()
    active_alerts: int = (await db.execute(
        select(func.count()).select_from(Alert).where(Alert.status == "active")
    )).scalar_one()

    # Agregasi provinsi via SQL GROUP BY
    province_rows = await db.execute(
        select(
            func.coalesce(Scan.province, "Tidak Diketahui").label("province"),
            func.count().label("total"),
            func.sum(case((~ScanResult.detected_disease.contains("healthy"), 1), else_=0)).label("disease_count"),
        )
        .join(ScanResult, ScanResult.scan_id == Scan.id)
        .where(Scan.status == "completed")
        .group_by(Scan.province)
        .order_by(func.count().desc())
        .limit(10)
    )

    by_province = [
        ProvinceStats(
            province=row.province,
            total_scans=row.total,
            disease_count=row.disease_count,
            top_disease=None,
        )
        for row in province_rows
    ]

    # Top 10 penyakit via SQL
    disease_rows = await db.execute(
        select(
            ScanResult.detected_disease,
            Scan.crop_type,
            func.count().label("count"),
        )
        .join(ScanResult, ScanResult.scan_id == Scan.id)
        .where(
            Scan.status == "completed",
            ~ScanResult.detected_disease.contains("healthy"),
        )
        .group_by(ScanResult.detected_disease, Scan.crop_type)
        .order_by(func.count().desc())
        .limit(10)
    )

    top_diseases = [
        NationalDiseaseBreakdown(disease=d, crop_type=ct, count=c)
        for d, ct, c in disease_rows
    ]

    total_disease_and_healthy_results = await db.execute(
        select(
            func.sum(case((~ScanResult.detected_disease.contains("healthy"), 1), else_=0)),
            func.sum(case((ScanResult.detected_disease.contains("healthy"), 1), else_=0)),
        )
        .join(ScanResult, ScanResult.scan_id == Scan.id)
        .where(Scan.status == "completed")
    )
    disease_detected, healthy_detected = total_disease_and_healthy_results.one()

    logger.info(f"Admin stats: {total_scans} scan, {total_users} user, {active_alerts} alert aktif")
    return AdminStats(
        total_scans=total_scans,
        total_users=total_users,
        disease_detected=disease_detected or 0,
        healthy_detected=healthy_detected or 0,
        active_alerts=active_alerts,
        by_province=by_province,
        top_diseases=top_diseases,
        timeline=[],
    )

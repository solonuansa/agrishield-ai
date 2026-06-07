"""
Business logic untuk sistem peringatan wabah penyakit.

Logika deteksi:
- Ambil semua scan completed dalam 7 hari terakhir yang memiliki koordinat
- Kelompokkan per (disease, crop_type)
- Untuk setiap kelompok, cek apakah ada kluster >= CLUSTER_THRESHOLD kasus
  dalam radius CLUSTER_RADIUS_KM
- Jika ada dan belum ada alert aktif untuk kluster tersebut, buat alert baru
"""

import logging
import math
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alert import Alert, AlertRead
from app.models.scan import Scan, ScanResult

logger = logging.getLogger(__name__)

# Minimum jumlah kasus dalam radius untuk memicu alert
CLUSTER_THRESHOLD = 3

# Radius kluster dalam km — dua scan dianggap satu kluster jika jaraknya < ini
CLUSTER_RADIUS_KM = 50.0

# Periode lookback untuk deteksi wabah
LOOKBACK_DAYS = 7


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Hitung jarak dua koordinat dalam km menggunakan formula Haversine."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _severity_from_count(count: int) -> str:
    """Tentukan tingkat keparahan berdasarkan jumlah kasus."""
    if count >= 10:
        return "high"
    if count >= 5:
        return "medium"
    return "low"


def _build_message(disease: str, crop_type: str, count: int, area_name: str | None) -> str:
    """Buat pesan peringatan yang mudah dipahami petani."""
    crop_label = "padi" if crop_type == "rice" else "jagung"
    disease_label = disease.replace("_", " ").replace("rice ", "").replace("corn ", "")
    area_suffix = f" di area {area_name}" if area_name else ""
    return (
        f"Terdeteksi {count} laporan {disease_label} pada tanaman {crop_label}"
        f"{area_suffix} dalam 7 hari terakhir. Segera periksa lahan Anda."
    )


async def run_outbreak_detection(db: AsyncSession) -> int:
    """
    Jalankan deteksi wabah dari data scan terbaru.
    Kembalikan jumlah alert baru yang dibuat.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(days=LOOKBACK_DAYS)

    # Ambil semua scan completed dengan koordinat dan bukan 'healthy'
    rows = await db.execute(
        select(Scan, ScanResult)
        .join(ScanResult, ScanResult.scan_id == Scan.id)
        .where(
            and_(
                Scan.status == "completed",
                Scan.latitude.isnot(None),
                Scan.longitude.isnot(None),
                Scan.created_at >= cutoff,
                ScanResult.detected_disease.not_like("%healthy%"),
            )
        )
    )
    scan_pairs = rows.all()

    if not scan_pairs:
        return 0

    # Kelompokkan per (disease, crop_type)
    groups: dict[tuple[str, str], list[tuple[float, float, str | None]]] = {}
    for scan, result in scan_pairs:
        key = (result.detected_disease, scan.crop_type)
        groups.setdefault(key, []).append(
            (scan.latitude, scan.longitude, scan.city or scan.province)
        )

    # Deduplikasi: titik koordinat yang sama (dibulatkan 3 desimal ~100m)
    # dihitung sekali saja agar tidak bias
    groups = {
        key: _dedup_points(points)
        for key, points in groups.items()
    }

    # Batch-fetch semua alert aktif yang relevan sebelum loop
    disease_crop_pairs = [k for k, pts in groups.items() if len(pts) >= CLUSTER_THRESHOLD]
    existing_alerts_map: dict[tuple[str, str], Alert] = {}
    if disease_crop_pairs:
        from sqlalchemy import or_
        conditions = [and_(Alert.disease == d, Alert.crop_type == ct) for d, ct in disease_crop_pairs]
        existing_result = await db.execute(
            select(Alert).where(
                and_(
                    or_(*conditions),
                    Alert.status == "active",
                    Alert.detected_until >= cutoff,
                )
            )
        )
        for alert in existing_result.scalars().all():
            existing_alerts_map[(alert.disease, alert.crop_type)] = alert

    new_alerts = 0
    for (disease, crop_type), points in groups.items():
        if len(points) < CLUSTER_THRESHOLD:
            continue

        clusters = _find_clusters(points)

        for cluster_points in clusters:
            if len(cluster_points) < CLUSTER_THRESHOLD:
                continue

            lats = [p[0] for p in cluster_points]
            lngs = [p[1] for p in cluster_points]
            center_lat = sum(lats) / len(lats)
            center_lng = sum(lngs) / len(lngs)
            area_names = [p[2] for p in cluster_points if p[2]]
            area_name = area_names[0] if area_names else None

            existing_alert = existing_alerts_map.get((disease, crop_type))

            if existing_alert:
                # Update jumlah kasus jika ada kasus baru
                if existing_alert.case_count != len(cluster_points):
                    existing_alert.case_count = len(cluster_points)
                    existing_alert.severity = _severity_from_count(len(cluster_points))
                    existing_alert.message = _build_message(
                        disease, crop_type, len(cluster_points), area_name
                    )
                    existing_alert.detected_until = datetime.now(timezone.utc)
            else:
                alert = Alert(
                    disease=disease,
                    crop_type=crop_type,
                    center_latitude=center_lat,
                    center_longitude=center_lng,
                    area_name=area_name,
                    case_count=len(cluster_points),
                    radius_km=CLUSTER_RADIUS_KM,
                    severity=_severity_from_count(len(cluster_points)),
                    message=_build_message(disease, crop_type, len(cluster_points), area_name),
                    status="active",
                    detected_from=cutoff,
                    detected_until=datetime.now(timezone.utc),
                )
                db.add(alert)
                new_alerts += 1
                logger.info(
                    f"Alert baru: {disease} ({crop_type}), {len(cluster_points)} kasus, "
                    f"area={area_name}"
                )

    await db.commit()
    return new_alerts


def _dedup_points(
    points: list[tuple[float, float, str | None]],
) -> list[tuple[float, float, str | None]]:
    """
    Hapus duplikasi koordinat yang sama (dibulatkan 3 desimal ≈ 100m).
    Mempertahankan urutan pertama ditemukan.
    """
    seen: set[tuple[float, float]] = set()
    result: list[tuple[float, float, str | None]] = []
    for lat, lng, area in points:
        key = (round(lat, 3), round(lng, 3))
        if key not in seen:
            seen.add(key)
            result.append((lat, lng, area))
    return result


def _find_clusters(
    points: list[tuple[float, float, str | None]],
) -> list[list[tuple[float, float, str | None]]]:
    """
    Cluster sederhana: greedy — mulai dari titik pertama, masukkan semua titik
    yang berjarak < CLUSTER_RADIUS_KM ke kluster yang sama.
    Bukan algoritma optimal, tapi cukup untuk data volume kecil-menengah.
    """
    if not points:
        return []

    used = [False] * len(points)
    clusters = []

    for i, point in enumerate(points):
        if used[i]:
            continue
        cluster = [point]
        used[i] = True
        for j, other in enumerate(points):
            if used[j]:
                continue
            dist = _haversine_km(point[0], point[1], other[0], other[1])
            if dist <= CLUSTER_RADIUS_KM:
                cluster.append(other)
                used[j] = True
        clusters.append(cluster)

    return clusters


async def get_alerts_for_user(
    db: AsyncSession,
    user_id: uuid.UUID | None = None,
    lat: float | None = None,
    lng: float | None = None,
    radius_km: float = 200.0,
) -> tuple[list[Alert], list[uuid.UUID]]:
    """
    Ambil alert aktif.
    - Jika lat/lng diberikan, filter hanya alert dalam radius_km dari posisi user.
    - Kembalikan (list[Alert], list[alert_id yang sudah dibaca user]).
    """
    result = await db.execute(
        select(Alert)
        .where(Alert.status == "active")
        .order_by(Alert.created_at.desc())
        .limit(50)
    )
    all_alerts = list(result.scalars().all())

    # Filter berdasarkan jarak jika koordinat tersedia
    if lat is not None and lng is not None:
        all_alerts = [
            a for a in all_alerts
            if _haversine_km(lat, lng, a.center_latitude, a.center_longitude) <= radius_km
        ]

    # Ambil daftar alert yang sudah dibaca user
    read_ids: list[uuid.UUID] = []
    if user_id and all_alerts:
        alert_ids = [a.id for a in all_alerts]
        read_result = await db.execute(
            select(AlertRead.alert_id).where(
                and_(
                    AlertRead.user_id == user_id,
                    AlertRead.alert_id.in_(alert_ids),
                )
            )
        )
        read_ids = list(read_result.scalars().all())

    return all_alerts, read_ids


async def mark_alerts_read(
    alert_ids: list[uuid.UUID], user_id: uuid.UUID, db: AsyncSession
) -> None:
    """Tandai alert sebagai sudah dibaca oleh user. Idempoten."""
    # Cek mana yang belum dibaca
    existing = await db.execute(
        select(AlertRead.alert_id).where(
            and_(
                AlertRead.user_id == user_id,
                AlertRead.alert_id.in_(alert_ids),
            )
        )
    )
    already_read = set(existing.scalars().all())

    for alert_id in alert_ids:
        if alert_id not in already_read:
            db.add(AlertRead(user_id=user_id, alert_id=alert_id))

    await db.commit()

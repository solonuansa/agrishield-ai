"""Model SQLAlchemy untuk tabel alerts (peringatan wabah penyakit)."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    __table_args__ = (
        UniqueConstraint("disease", "crop_type", name="uq_alert_disease_crop"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # Penyakit yang memicu alert
    disease: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    crop_type: Mapped[str] = mapped_column(String(20), nullable=False)

    # Pusat kluster wabah (rata-rata koordinat scan yang memicu)
    center_latitude: Mapped[float] = mapped_column(Float, nullable=False)
    center_longitude: Mapped[float] = mapped_column(Float, nullable=False)

    # Nama area (kota/provinsi terdekat — diisi dari scan yang memicu)
    area_name: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Jumlah kasus scan yang terdeteksi dalam kluster ini
    case_count: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    # Radius kluster dalam km
    radius_km: Mapped[float] = mapped_column(Float, nullable=False, default=50.0)

    # Tingkat keparahan: "low" | "medium" | "high"
    severity: Mapped[str] = mapped_column(String(20), nullable=False, default="medium")

    # Pesan singkat yang tampil ke user
    message: Mapped[str] = mapped_column(Text, nullable=False)

    # "active" | "resolved"
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active", index=True)

    # Periode deteksi
    detected_from: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    detected_until: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<Alert id={self.id} disease={self.disease} cases={self.case_count}>"


class AlertRead(Base):
    """Tracking alert mana saja yang sudah dibaca oleh user."""

    __tablename__ = "alert_reads"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    alert_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("alerts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    read_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

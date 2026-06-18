"""Model SQLAlchemy untuk tabel scans dan scan_results."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Scan(Base):
    __tablename__ = "scans"

    __table_args__ = (
        Index("ix_scan_outbreak_lookup", "status", "created_at", "latitude", "longitude"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # Nullable: scan bisa dilakukan tanpa login (guest)
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # "rice" | "corn"
    crop_type: Mapped[str] = mapped_column(String(20), nullable=False)

    # Path relatif di R2: "scans/{year}/{month}/{uuid}.webp"
    # Nullable: record Scan dibuat dulu sebelum upload ke R2
    image_key: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # "pending" | "processing" | "completed" | "failed"
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending", index=True)

    # Lokasi opsional (jika user mengizinkan akses lokasi)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    province: Mapped[str | None] = mapped_column(String(100), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)

    celery_task_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

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

    result: Mapped["ScanResult | None"] = relationship(
        "ScanResult", back_populates="scan", uselist=False, lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<Scan id={self.id} crop={self.crop_type} status={self.status}>"


class ScanResult(Base):
    __tablename__ = "scan_results"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    scan_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("scans.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    detected_disease: Mapped[str] = mapped_column(String(100), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)  # 0.0 – 1.0

    # [{"disease": "...", "confidence": 0.xx}, ...]
    alternatives: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)

    model_version: Mapped[str] = mapped_column(String(50), nullable=False)
    is_mock: Mapped[bool] = mapped_column(nullable=False, default=False)

    # Rekomendasi dari Google Gemini (disimpan sebagai teks markdown)
    recommendation: Mapped[str | None] = mapped_column(Text, nullable=True)

    processed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    scan: Mapped["Scan"] = relationship("Scan", back_populates="result")

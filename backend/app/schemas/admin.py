"""Pydantic schemas untuk Admin/Government dashboard."""

from pydantic import BaseModel


class ProvinceStats(BaseModel):
    province: str
    total_scans: int
    disease_count: int
    top_disease: str | None


class NationalDiseaseBreakdown(BaseModel):
    disease: str
    count: int
    crop_type: str


class NationalTimelinePoint(BaseModel):
    week: str
    total: int
    disease_count: int


class AdminStats(BaseModel):
    # Ringkasan nasional
    total_scans: int
    total_users: int
    disease_detected: int
    healthy_detected: int
    active_alerts: int

    # Breakdown per provinsi (top 10)
    by_province: list[ProvinceStats]

    # Top 10 penyakit nasional
    top_diseases: list[NationalDiseaseBreakdown]

    # Timeline 12 minggu terakhir
    timeline: list[NationalTimelinePoint]

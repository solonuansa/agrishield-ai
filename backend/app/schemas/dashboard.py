"""Pydantic schemas untuk modul Dashboard."""

from pydantic import BaseModel


class CropBreakdown(BaseModel):
    crop_type: str
    count: int


class DiseaseBreakdown(BaseModel):
    disease: str
    count: int


class TimelinePoint(BaseModel):
    """Jumlah scan per minggu — untuk grafik bar."""
    week: str  # format "YYYY-WW"
    total: int
    disease_count: int  # scan yang mendeteksi penyakit (bukan healthy)


class DashboardStats(BaseModel):
    total_scans: int
    completed_scans: int
    disease_detected: int       # scan completed yang mendeteksi penyakit (bukan healthy)
    healthy_detected: int       # scan completed yang hasilnya sehat
    by_crop: list[CropBreakdown]
    top_diseases: list[DiseaseBreakdown]  # 5 penyakit terbanyak
    timeline: list[TimelinePoint]         # 8 minggu terakhir

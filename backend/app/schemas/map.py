"""Pydantic schemas untuk modul Map/Heatmap."""

from pydantic import BaseModel


class DiseasePoint(BaseModel):
    """Satu titik penyakit — scan yang sudah selesai dan punya koordinat."""
    scan_id: str
    lat: float
    lng: float
    disease: str
    crop_type: str
    confidence: float
    # Format "YYYY-MM" untuk grouping timeline
    month: str


class HeatmapResponse(BaseModel):
    points: list[DiseasePoint]
    total: int

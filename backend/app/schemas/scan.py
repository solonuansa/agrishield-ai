"""
Pydantic schemas untuk modul Scan.

CATATAN: `AlternativeDiagnosisSchema` di sini harus diselaraskan dengan
`AlternativeDiagnosis` di ml-service/app/schemas.py (SOURCE OF TRUTH).
"""

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class ScanListMeta(BaseModel):
    """Metadata pagination untuk daftar scan."""
    page: int
    per_page: int
    total: int
    total_pages: int


class ScanCreateRequest(BaseModel):
    crop_type: Literal["rice", "corn"]
    latitude: float | None = Field(None, ge=-90, le=90)
    longitude: float | None = Field(None, ge=-180, le=180)


# Harus sinkron dengan ml-service/app/schemas.py:AlternativeDiagnosis
class AlternativeDiagnosisSchema(BaseModel):
    disease: str
    confidence: float


class ScanResultResponse(BaseModel):
    detected_disease: str
    confidence: float
    alternatives: list[AlternativeDiagnosisSchema]
    recommendation: str | None
    model_version: str
    is_mock: bool
    processed_at: datetime

    model_config = {"from_attributes": True}


class ScanResponse(BaseModel):
    id: uuid.UUID
    crop_type: str
    status: str
    image_url: str | None  # URL publik gambar di R2
    latitude: float | None
    longitude: float | None
    created_at: datetime
    result: ScanResultResponse | None

    model_config = {"from_attributes": True}

"""Pydantic schemas untuk modul Alert (peringatan wabah)."""

import uuid
from datetime import datetime

from pydantic import BaseModel


class AlertResponse(BaseModel):
    id: uuid.UUID
    disease: str
    crop_type: str
    center_latitude: float
    center_longitude: float
    area_name: str | None
    case_count: int
    radius_km: float
    severity: str
    message: str
    status: str
    detected_from: datetime
    detected_until: datetime
    created_at: datetime
    # Apakah alert ini sudah dibaca oleh user yang request (None jika guest)
    is_read: bool = False

    model_config = {"from_attributes": True}


class AlertListResponse(BaseModel):
    alerts: list[AlertResponse]
    unread_count: int

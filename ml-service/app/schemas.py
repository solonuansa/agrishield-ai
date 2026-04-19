"""Pydantic schemas untuk request/response ML service."""

from pydantic import BaseModel


class AlternativeDiagnosis(BaseModel):
    disease: str
    confidence: float


class PredictionResponse(BaseModel):
    disease: str
    confidence: float          # 0.0 – 1.0
    alternatives: list[AlternativeDiagnosis]
    model_version: str
    is_mock: bool = False

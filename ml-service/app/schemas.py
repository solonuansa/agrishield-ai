"""
Pydantic schemas untuk request/response ML service.

CATATAN: Schema ini adalah SOURCE OF TRUTH untuk struktur prediksi ML.
Backend (backend/app/schemas/scan.py) memiliki `AlternativeDiagnosisSchema`
yang harus selalu diselaraskan dengan `AlternativeDiagnosis` di sini.
"""

from pydantic import BaseModel


# Source of Truth — jika mengubah, sesuaikan juga backend/app/schemas/scan.py:AlternativeDiagnosisSchema
class AlternativeDiagnosis(BaseModel):
    disease: str
    confidence: float


class PredictionResponse(BaseModel):
    disease: str
    confidence: float          # 0.0 – 1.0
    alternatives: list[AlternativeDiagnosis]
    model_version: str
    is_mock: bool = False

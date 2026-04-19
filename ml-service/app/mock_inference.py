"""
Mock inference untuk development — digunakan saat USE_MOCK_MODEL=true.
Mensimulasikan latency realistis dan mengembalikan prediksi yang masuk akal.
"""

import asyncio
import random

from app.config import CLASS_NAMES, CROP_TYPE_MAP, settings
from app.schemas import AlternativeDiagnosis, PredictionResponse


async def mock_predict(crop_type: str) -> PredictionResponse:
    """
    Simulasi prediksi model.
    Pilih penyakit acak dari kelas yang sesuai dengan crop_type,
    dengan distribusi confidence yang realistis.
    """
    # Simulasi latency inferensi: 0.5 – 2 detik
    await asyncio.sleep(random.uniform(0.5, 2.0))

    valid_indices = CROP_TYPE_MAP.get(crop_type, list(range(len(CLASS_NAMES))))

    # Buat distribusi probabilitas acak untuk kelas yang valid
    raw_scores = [random.random() for _ in valid_indices]
    total = sum(raw_scores)
    probabilities = [s / total for s in raw_scores]

    # Urutkan dari confidence tertinggi
    ranked = sorted(
        zip(valid_indices, probabilities),
        key=lambda x: x[1],
        reverse=True,
    )

    top_idx, top_conf = ranked[0]
    top_disease = CLASS_NAMES[top_idx]

    # Alternatif diagnosis (maksimal 2)
    alternatives = [
        AlternativeDiagnosis(
            disease=CLASS_NAMES[idx],
            confidence=round(conf, 4),
        )
        for idx, conf in ranked[1:3]
    ]

    return PredictionResponse(
        disease=top_disease,
        confidence=round(top_conf, 4),
        alternatives=alternatives,
        model_version=f"mock-{settings.model_version}",
        is_mock=True,
    )

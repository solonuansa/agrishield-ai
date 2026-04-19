"""
ONNX inference runner.
Digunakan saat USE_MOCK_MODEL=false dan file .onnx sudah tersedia.
"""

import logging

import numpy as np

from app.config import CLASS_NAMES, CROP_TYPE_MAP, settings
from app.schemas import AlternativeDiagnosis, PredictionResponse

logger = logging.getLogger(__name__)

_session = None


def _get_session():
    """Lazy-load ONNX session (singleton)."""
    global _session
    if _session is None:
        import onnxruntime as ort

        logger.info(f"Memuat model ONNX dari {settings.model_path}")
        _session = ort.InferenceSession(
            settings.model_path,
            providers=["CPUExecutionProvider"],
        )
        logger.info("Model ONNX berhasil dimuat")
    return _session


def predict_onnx(image_array: np.ndarray, crop_type: str) -> PredictionResponse:
    """
    Jalankan inferensi ONNX.
    image_array harus sudah di-preprocess: shape [1, 3, 300, 300]
    """
    session = _get_session()
    input_name = session.get_inputs()[0].name

    outputs = session.run(None, {input_name: image_array})
    logits = outputs[0][0]  # shape: [9]

    # Softmax
    exp_logits = np.exp(logits - np.max(logits))
    probabilities = exp_logits / exp_logits.sum()

    # Filter hanya kelas yang sesuai crop_type
    valid_indices = CROP_TYPE_MAP.get(crop_type, list(range(len(CLASS_NAMES))))
    valid_probs = [(i, float(probabilities[i])) for i in valid_indices]
    valid_probs.sort(key=lambda x: x[1], reverse=True)

    top_idx, top_conf = valid_probs[0]

    # Jika confidence di bawah threshold, kembalikan "healthy" sebagai fallback
    if top_conf < settings.confidence_threshold:
        healthy_key = f"{crop_type}_healthy"
        top_idx = CLASS_NAMES.index(healthy_key)
        top_conf = float(probabilities[top_idx])

    alternatives = [
        AlternativeDiagnosis(
            disease=CLASS_NAMES[idx],
            confidence=round(conf, 4),
        )
        for idx, conf in valid_probs[1:3]
    ]

    return PredictionResponse(
        disease=CLASS_NAMES[top_idx],
        confidence=round(top_conf, 4),
        alternatives=alternatives,
        model_version=settings.model_version,
        is_mock=False,
    )

"""
ONNX inference runner.
Digunakan saat USE_MOCK_MODEL=false dan file .onnx sudah tersedia.
Mendukung dua model terpisah: padi & jagung.
"""

import logging
from typing import Any

import numpy as np

from app.config import CLASS_NAMES_CORN, CLASS_NAMES_RICE, settings
from app.schemas import AlternativeDiagnosis, PredictionResponse

logger = logging.getLogger(__name__)

# Dictionary untuk menyimpan session per model (lazy-load)
_sessions: dict[str, Any] = {}


def _get_session(crop_type: str):
    """Lazy-load ONNX session berdasarkan crop_type."""
    global _sessions

    if crop_type not in _sessions:
        import onnxruntime as ort

        model_path = (
            settings.rice_model_path
            if crop_type == "rice"
            else settings.corn_model_path
        )
        logger.info(f"Memuat model ONNX untuk {crop_type} dari {model_path}")
        _sessions[crop_type] = ort.InferenceSession(
            model_path,
            providers=["CPUExecutionProvider"],
        )
        logger.info(f"Model ONNX untuk {crop_type} berhasil dimuat")

    return _sessions[crop_type]


def predict_onnx(image_array: np.ndarray, crop_type: str) -> PredictionResponse:
    """
    Jalankan inferensi ONNX.
    image_array harus sudah di-preprocess: shape [1, 3, 300, 300]
    """
    session = _get_session(crop_type)
    input_name = session.get_inputs()[0].name

    outputs = session.run(None, {input_name: image_array})
    logits = outputs[0][0]

    # Softmax
    exp_logits = np.exp(logits - np.max(logits))
    probabilities = exp_logits / exp_logits.sum()

    # Pilih class names yang sesuai crop_type
    class_names = CLASS_NAMES_RICE if crop_type == "rice" else CLASS_NAMES_CORN
    valid_probs = [(i, float(probabilities[i])) for i in range(len(class_names))]
    valid_probs.sort(key=lambda x: x[1], reverse=True)

    top_idx, top_conf = valid_probs[0]

    # Jika confidence di bawah threshold, kembalikan "healthy" sebagai fallback
    if top_conf < settings.confidence_threshold:
        healthy_key = f"{crop_type}_healthy"
        if healthy_key in class_names:
            top_idx = class_names.index(healthy_key)
            top_conf = float(probabilities[top_idx])

    alternatives = [
        AlternativeDiagnosis(
            disease=class_names[idx],
            confidence=round(conf, 4),
        )
        for idx, conf in valid_probs[1:3]
    ]

    return PredictionResponse(
        disease=class_names[top_idx],
        confidence=round(top_conf, 4),
        alternatives=alternatives,
        model_version=settings.model_version,
        is_mock=False,
    )

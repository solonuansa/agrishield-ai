"""Entry point FastAPI ML Service."""

import logging

from fastapi import FastAPI, File, Form, UploadFile

from app.config import settings
from app.schemas import PredictionResponse

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s — %(name)s — %(levelname)s — %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AgriShield ML Service",
    description="Inferensi model deteksi penyakit tanaman (EfficientNet-B3 / ONNX).",
    version="0.1.0",
)


@app.get("/health")
async def health():
    """Health check ML service."""
    return {
        "status": "ok",
        "service": "agrishield-ml",
        "mock_mode": settings.use_mock_model,
        "model_version": settings.model_version,
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict(
    file: UploadFile = File(...),
    crop_type: str = Form(...),
) -> PredictionResponse:
    """
    Terima gambar tanaman dan kembalikan prediksi penyakit.
    crop_type: "rice" atau "corn"
    """
    if settings.use_mock_model:
        from app.mock_inference import mock_predict
        logger.debug(f"Mock predict untuk crop_type={crop_type}")
        return await mock_predict(crop_type)

    # Mode ONNX nyata
    from io import BytesIO

    from PIL import Image

    from app.inference.onnx_runner import predict_onnx
    from app.preprocessing.image_transform import preprocess_image

    image_bytes = await file.read()
    image = Image.open(BytesIO(image_bytes))
    image_array = preprocess_image(image)

    logger.debug(f"ONNX predict untuk crop_type={crop_type}")
    return predict_onnx(image_array, crop_type)


@app.on_event("startup")
async def on_startup():
    mode = "MOCK" if settings.use_mock_model else f"ONNX ({settings.model_path})"
    logger.info(f"ML Service started — mode: {mode}")

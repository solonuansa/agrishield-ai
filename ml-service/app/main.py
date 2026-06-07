import logging

from fastapi import FastAPI, File, Form, UploadFile

from app.config import settings
from app.schemas import PredictionResponse

logging.basicConfig(
    level=getattr(logging, settings.log_level, logging.INFO),
    format="%(asctime)s \u2014 %(name)s \u2014 %(levelname)s \u2014 %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AgriShield ML Service",
    description="Inferensi model deteksi penyakit tanaman (EfficientNet-B3 / ONNX).",
    version="0.1.0",
    docs_url=None if not settings.debug else "/docs",
    redoc_url=None if not settings.debug else "/redoc",
)


@app.get("/health")
async def health():
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
    if crop_type not in ("rice", "corn"):
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="crop_type harus 'rice' atau 'corn'")

    if settings.use_mock_model:
        from app.mock_inference import mock_predict
        logger.info(f"Mock predict untuk crop_type={crop_type}")
        return await mock_predict(crop_type)

    from io import BytesIO

    from PIL import Image

    from app.inference.onnx_runner import predict_onnx
    from app.preprocessing.image_transform import preprocess_image

    try:
        image_bytes = await file.read()
        image = Image.open(BytesIO(image_bytes))
        image_array = preprocess_image(image)

        logger.info(f"ONNX predict untuk crop_type={crop_type}")
        result = await predict_onnx(image_array, crop_type)
        return result
    except Exception as exc:
        logger.error(f"Prediksi gagal: {exc}", exc_info=True)
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=f"Gagal memproses gambar: {exc}")


@app.on_event("startup")
async def on_startup():
    if settings.use_mock_model:
        logger.info("ML Service started \u2014 mode: MOCK")
    else:
        logger.info("ML Service started \u2014 mode: ONNX")
        logger.info(f"  Rice model: {settings.rice_model_path}")
        logger.info(f"  Corn model: {settings.corn_model_path}")

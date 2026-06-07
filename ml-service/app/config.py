"""Konfigurasi ML Service."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)

    debug: bool = False
    log_level: str = "INFO"
    use_mock_model: bool = True
    model_version: str = "v1"

    # Dua model terpisah: padi & jagung
    rice_model_path: str = "app/models/rice_disease_v1.onnx"
    corn_model_path: str = "app/models/corn_disease_v1.onnx"

    # Confidence threshold — di bawah ini dianggap "tidak terdeteksi"
    confidence_threshold: float = 0.40


settings = Settings()

# ── Kelas Padi (5 kelas) — SOURCE OF TRUTH ────────────────────
# Urutan HARUS konsisten dengan training model padi
# Key disease names HARUS sinkron dengan DISEASE_DISPLAY_NAMES
# di backend/app/services/recommendation_service.py
CLASS_NAMES_RICE = [
    "rice_leaf_blast",             # 0
    "rice_bacterial_leaf_blight",  # 1
    "rice_brown_spot",             # 2
    "rice_hispa",                  # 3
    "rice_healthy",                # 4
]

# ── Kelas Jagung (4 kelas) ───────────────────────────────────
# Urutan HARUS konsisten dengan training model jagung
CLASS_NAMES_CORN = [
    "corn_northern_leaf_blight",   # 0
    "corn_common_rust",            # 1
    "corn_gray_leaf_spot",         # 2
    "corn_healthy",                # 3
]

# Helper mapping untuk memilih class names berdasarkan crop_type
CROP_TYPE_MAP = {
    "rice": CLASS_NAMES_RICE,
    "corn": CLASS_NAMES_CORN,
}

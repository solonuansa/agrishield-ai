"""Konfigurasi ML Service."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)

    use_mock_model: bool = True
    model_version: str = "v1"
    model_path: str = "app/models/agridisease_v1.onnx"

    # Confidence threshold — di bawah ini dianggap "tidak terdeteksi"
    confidence_threshold: float = 0.40


settings = Settings()

# Nama kelas — urutan HARUS konsisten dengan training
# Source of truth: class_names.json
CLASS_NAMES = [
    "rice_leaf_blast",             # 0
    "rice_bacterial_leaf_blight",  # 1
    "rice_brown_spot",             # 2
    "rice_hispa",                  # 3
    "rice_healthy",                # 4
    "corn_northern_leaf_blight",   # 5
    "corn_common_rust",            # 6
    "corn_gray_leaf_spot",         # 7
    "corn_healthy",                # 8
]

CROP_TYPE_MAP = {
    "rice": [0, 1, 2, 3, 4],
    "corn": [5, 6, 7, 8],
}

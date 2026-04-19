"""
Preprocessing gambar untuk inferensi ONNX.
Input: gambar PIL Image
Output: numpy array siap masuk model (shape: [1, 3, 300, 300])
"""

import numpy as np
from PIL import Image

# ImageNet mean/std — sesuai preprocessing saat training
IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGENET_STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)

TARGET_SIZE = (300, 300)


def preprocess_image(image: Image.Image) -> np.ndarray:
    """
    Transformasi gambar ke format input model ONNX.
    1. Resize ke 300x300
    2. Convert ke RGB
    3. Normalize dengan ImageNet mean/std
    4. Transpose ke [C, H, W] dan tambah batch dimension
    """
    # Pastikan RGB
    image = image.convert("RGB")

    # Resize
    image = image.resize(TARGET_SIZE, Image.BILINEAR)

    # Ke numpy, normalisasi ke [0, 1]
    arr = np.array(image, dtype=np.float32) / 255.0

    # Normalize dengan ImageNet stats
    arr = (arr - IMAGENET_MEAN) / IMAGENET_STD

    # [H, W, C] → [C, H, W] → [1, C, H, W]
    arr = arr.transpose(2, 0, 1)
    arr = np.expand_dims(arr, axis=0)

    return arr

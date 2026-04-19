# AgriShield AI — Model Development Plan
**Versi:** 1.0.0  
**Tanggal:** Maret 2026  
**Fokus:** Fine-tuning model klasifikasi penyakit tanaman (Padi & Jagung)  
**Repositori terpisah:** `agrishield-model`

---

## Filosofi Penting

Model ini adalah **proyek independen** dari aplikasi AgriShield AI utama.

- Aplikasi web berjalan dengan **mock response** atau **stub API** sampai model siap
- Model di-expose via endpoint standar `POST /predict` — aplikasi tidak peduli bagaimana model dibuat di dalamnya
- Tim aplikasi dan tim model bisa bekerja paralel tanpa saling menunggu
- Versi model di-tag secara semantik: `v1.0.0`, `v1.1.0`, dst

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Dataset yang Direkomendasikan](#2-dataset-yang-direkomendasikan)
3. [Analisis Kelas & Label](#3-analisis-kelas--label)
4. [Arsitektur Model](#4-arsitektur-model)
5. [Pipeline Preprocessing](#5-pipeline-preprocessing)
6. [Training Strategy](#6-training-strategy)
7. [Evaluasi Model](#7-evaluasi-model)
8. [Export & Deployment Model](#8-export--deployment-model)
9. [Struktur Repositori](#9-struktur-repositori)
10. [Jadwal & Milestone](#10-jadwal--milestone)
11. [Risiko & Mitigasi](#11-risiko--mitigasi)

---

## 1. Ringkasan Eksekutif

### Tujuan
Membangun model klasifikasi penyakit daun tanaman (padi dan jagung) yang:
- Akurasi keseluruhan ≥ 85% pada test set
- Per-class recall ≥ 80% untuk setiap kelas penyakit
- Waktu inferensi < 500ms pada CPU (tanpa GPU)
- Ukuran model < 50MB setelah dikonversi ke ONNX

### Pendekatan
Transfer learning dari pretrained ImageNet → fine-tuning pada dataset penyakit tanaman publik yang sudah memiliki label baku → export ke ONNX → deploy sebagai microservice FastAPI.

### Constraint Penting
- **Label/kelas MENGIKUTI dataset yang tersedia**, bukan dirancang dari nol
- Tidak mengumpulkan data lapangan di tahap awal (gunakan dataset publik dulu)
- Hardware training: dapat berjalan di Google Colab (GPU T4) atau lokal

---

## 2. Dataset yang Direkomendasikan

### 2.1 Dataset Utama: PlantVillage

**Sumber:** [https://www.kaggle.com/datasets/emmarex/plantdisease](https://www.kaggle.com/datasets/emmarex/plantdisease)  
**Alternatif sumber:** [https://github.com/spMohanty/PlantVillage-Dataset](https://github.com/spMohanty/PlantVillage-Dataset)

| Properti | Detail |
|---|---|
| Total gambar | ~54.000 gambar |
| Kondisi gambar | Controlled (background putih/hijau seragam) |
| Format | JPEG, RGB |
| Lisensi | CC BY 4.0 (bebas digunakan untuk research & komersial) |
| Kelas padi tersedia | 3 kelas |
| Kelas jagung tersedia | 4 kelas |

**Kelas Padi (Rice) di PlantVillage:**
```
Rice___Leaf_scald          → 1.6k gambar
Rice___Brown_spot          → 1.6k gambar
Rice___Hispa               → 1.6k gambar
Rice___Healthy             → 1.2k gambar
```
> Catatan: PlantVillage memiliki cakupan padi yang terbatas. Perlu dilengkapi dengan dataset khusus padi.

**Kelas Jagung (Corn/Maize) di PlantVillage:**
```
Corn_(maize)___Cercospora_leaf_spot_Gray_leaf_spot  → 1.0k gambar
Corn_(maize)___Common_rust                          → 1.2k gambar
Corn_(maize)___Northern_Leaf_Blight                 → 1.0k gambar
Corn_(maize)___healthy                              → 1.2k gambar
```

---

### 2.2 Dataset Tambahan: Rice Disease Dataset (Kaggle)

**Sumber:** [https://www.kaggle.com/datasets/minhhuy2810/rice-diseases-image-dataset](https://www.kaggle.com/datasets/minhhuy2810/rice-diseases-image-dataset)

| Properti | Detail |
|---|---|
| Total gambar | ~3.355 gambar |
| Kondisi gambar | Field conditions (lebih realistis) |
| Format | JPEG |
| Lisensi | GPL 2.0 |

**Kelas yang tersedia:**
```
Leaf_Blast         → 779 gambar
Brown_Spot         → 523 gambar
Hispa              → 565 gambar
Healthy            → 1.488 gambar
```

---

### 2.3 Dataset Tambahan: Rice Leaf Disease Dataset (Kaggle)

**Sumber:** [https://www.kaggle.com/datasets/shayanriyaz/riceleafdisease](https://www.kaggle.com/datasets/shayanriyaz/riceleafdisease)

| Properti | Detail |
|---|---|
| Total gambar | ~3.000 gambar |
| Kelas | Bacterial Leaf Blight, Brown Spot, Leaf Blast |
| Kondisi | Campuran lab & lapangan |
| Lisensi | CC0: Public Domain |

**Kelas yang tersedia:**
```
Bacterial_leaf_blight  → ~1.000 gambar
Brown_spot             → ~1.000 gambar
Leaf_blast             → ~1.000 gambar
```

---

### 2.4 Dataset Tambahan: Corn Leaf Disease Dataset

**Sumber:** [https://www.kaggle.com/datasets/smaranjitghose/corn-or-maize-leaf-disease-dataset](https://www.kaggle.com/datasets/smaranjitghose/corn-or-maize-leaf-disease-dataset)

| Properti | Detail |
|---|---|
| Total gambar | ~4.000 gambar |
| Kondisi | Field conditions |
| Lisensi | CC0: Public Domain |

**Kelas yang tersedia:**
```
Blight       → ~1.000 gambar
Common_Rust  → ~1.000 gambar
Gray_Leaf_Spot → ~500 gambar
Healthy      → ~1.000 gambar
```

---

### 2.5 Dataset Tambahan: Rice Disease Image Dataset (Roboflow)

**Sumber:** [https://universe.roboflow.com/rice-xpjkl/rice-disease-8pilz](https://universe.roboflow.com/rice-xpjkl/rice-disease-8pilz)

| Properti | Detail |
|---|---|
| Total gambar | ~2.000+ gambar |
| Anotasi | Tersedia bounding box (bisa digunakan sebagai klasifikasi juga) |
| Lisensi | CC BY 4.0 |
| Keunggulan | Gambar lapangan Indonesia / Asia Tenggara |

---

### 2.6 Ringkasan Dataset & Prioritas Download

| Prioritas | Dataset | Gambar | Keterangan |
|---|---|---|---|
| 🔴 Wajib | PlantVillage (Corn) | ~4.400 | Baseline jagung, kualitas baik |
| 🔴 Wajib | Rice Leaf Disease (Kaggle - shayanriyaz) | ~3.000 | Padi: 3 kelas penting |
| 🟡 Penting | Rice Disease (minhhuy2810) | ~3.355 | Tambah variasi padi |
| 🟡 Penting | Corn Leaf Disease (smaranjitghose) | ~4.000 | Tambah variasi jagung |
| 🟢 Opsional | Roboflow Rice Disease | ~2.000 | Gambar kondisi lapangan Asia |

**Total estimasi setelah gabung & deduplikasi: ~14.000–16.000 gambar**

---

## 3. Analisis Kelas & Label

### 3.1 Prinsip Pemilihan Kelas

Label yang digunakan di model **mengikuti label yang sudah ada di dataset**, bukan dibuat dari nol. Ini penting karena:
- Menghindari relabeling manual yang memakan waktu dan rawan error
- Label dataset publik sudah divalidasi oleh peneliti pertanian
- Memungkinkan penggunaan pretrained model dari paper riset sebagai referensi

### 3.2 Kelas Final Setelah Konsolidasi Dataset

Setelah menganalisis overlap antar dataset, kelas final yang digunakan adalah:

#### Padi (Rice) — 5 Kelas

| ID | Label Standar Model | Label Asli di Dataset | Sumber Dataset |
|---|---|---|---|
| 0 | `rice_leaf_blast` | `Leaf_Blast`, `Rice___Leaf_scald`* | minhhuy2810, shayanriyaz |
| 1 | `rice_bacterial_leaf_blight` | `Bacterial_leaf_blight` | shayanriyaz |
| 2 | `rice_brown_spot` | `Brown_Spot`, `Rice___Brown_spot` | minhhuy2810, PlantVillage |
| 3 | `rice_hispa` | `Hispa`, `Rice___Hispa` | minhhuy2810, PlantVillage |
| 4 | `rice_healthy` | `Healthy`, `Rice___Healthy` | minhhuy2810, PlantVillage |

> *Leaf Scald dan Leaf Blast adalah penyakit berbeda. Cek visual gambar PlantVillage `Leaf_scald` — jika gambarnya mirip blast, bisa digabung. Jika berbeda signifikan, buat kelas terpisah dan jadikan 6 kelas padi.

#### Jagung (Corn/Maize) — 4 Kelas

| ID | Label Standar Model | Label Asli di Dataset | Sumber Dataset |
|---|---|---|---|
| 5 | `corn_northern_leaf_blight` | `Northern_Leaf_Blight`, `Corn_(maize)___Northern_Leaf_Blight`, `Blight` | PlantVillage, smaranjitghose |
| 6 | `corn_common_rust` | `Common_Rust`, `Corn_(maize)___Common_rust` | PlantVillage, smaranjitghose |
| 7 | `corn_gray_leaf_spot` | `Corn_(maize)___Cercospora_leaf_spot_Gray_leaf_spot`, `Gray_Leaf_Spot` | PlantVillage, smaranjitghose |
| 8 | `corn_healthy` | `healthy`, `Corn_(maize)___healthy` | PlantVillage, smaranjitghose |

### 3.3 Total: 9 Kelas

```python
CLASS_NAMES = [
    "rice_leaf_blast",           # 0
    "rice_bacterial_leaf_blight", # 1
    "rice_brown_spot",            # 2
    "rice_hispa",                 # 3
    "rice_healthy",               # 4
    "corn_northern_leaf_blight",  # 5
    "corn_common_rust",           # 6
    "corn_gray_leaf_spot",        # 7
    "corn_healthy",               # 8
]

CROP_TYPE_MAP = {
    "rice": [0, 1, 2, 3, 4],
    "corn": [5, 6, 7, 8],
}
```

> **Penting:** Urutan kelas ini harus identik antara training script, ONNX model, dan ML service. Simpan sebagai `class_names.json` di repositori.

### 3.4 Pemetaan Label Dataset ke Label Standar

Buat skrip konversi untuk menyeragamkan label:

```python
# ml-training/scripts/label_mapping.py

LABEL_MAPPING = {
    # === PADI ===
    # Leaf Blast
    "Leaf_Blast": "rice_leaf_blast",
    "leaf_blast": "rice_leaf_blast",
    "Rice___Leaf_scald": "rice_leaf_blast",  # Verifikasi dulu secara visual

    # Bacterial Leaf Blight
    "Bacterial_leaf_blight": "rice_bacterial_leaf_blight",
    "bacterial_leaf_blight": "rice_bacterial_leaf_blight",

    # Brown Spot
    "Brown_Spot": "rice_brown_spot",
    "Brown_spot": "rice_brown_spot",
    "Rice___Brown_spot": "rice_brown_spot",

    # Hispa
    "Hispa": "rice_hispa",
    "Rice___Hispa": "rice_hispa",

    # Healthy Rice
    "Healthy": "rice_healthy",          # Konteks: folder padi
    "Rice___Healthy": "rice_healthy",

    # === JAGUNG ===
    # Northern Leaf Blight
    "Northern_Leaf_Blight": "corn_northern_leaf_blight",
    "Corn_(maize)___Northern_Leaf_Blight": "corn_northern_leaf_blight",
    "Blight": "corn_northern_leaf_blight",

    # Common Rust
    "Common_Rust": "corn_common_rust",
    "Common_rust": "corn_common_rust",
    "Corn_(maize)___Common_rust": "corn_common_rust",

    # Gray Leaf Spot
    "Gray_Leaf_Spot": "corn_gray_leaf_spot",
    "Corn_(maize)___Cercospora_leaf_spot_Gray_leaf_spot": "corn_gray_leaf_spot",

    # Healthy Corn
    "healthy": "corn_healthy",          # Konteks: folder jagung
    "Corn_(maize)___healthy": "corn_healthy",
}
```

### 3.5 Distribusi Gambar per Kelas (Estimasi)

| Kelas | Estimasi Gambar | Status |
|---|---|---|
| rice_leaf_blast | ~2.500 | ✅ Cukup |
| rice_bacterial_leaf_blight | ~1.000 | ⚠️ Sedikit |
| rice_brown_spot | ~2.500 | ✅ Cukup |
| rice_hispa | ~2.100 | ✅ Cukup |
| rice_healthy | ~2.700 | ✅ Cukup |
| corn_northern_leaf_blight | ~2.000 | ✅ Cukup |
| corn_common_rust | ~2.200 | ✅ Cukup |
| corn_gray_leaf_spot | ~1.500 | ⚠️ Sedikit |
| corn_healthy | ~2.200 | ✅ Cukup |

**Strategi untuk kelas yang sedikit:**
- Augmentasi lebih agresif pada kelas minoritas
- Gunakan weighted random sampler saat training
- Pertimbangkan class weights di loss function

---

## 4. Arsitektur Model

### 4.1 Backbone yang Dipilih: EfficientNet-B3

**Alasan pemilihan:**

| Kriteria | EfficientNet-B3 | ResNet-50 | MobileNetV3 | ViT-B/16 |
|---|---|---|---|---|
| Akurasi ImageNet Top-1 | 81.6% | 76.1% | 75.2% | 81.7% |
| Parameter | 12M | 25M | 5.4M | 86M |
| Ukuran model | ~48MB | ~98MB | ~22MB | ~330MB |
| Inferensi CPU (ms) | ~180ms | ~220ms | ~80ms | ~800ms |
| Cocok plant disease | ✅ Sangat baik | ✅ Baik | ⚠️ Kurang | ✅ Baik tapi berat |

EfficientNet-B3 dipilih karena keseimbangan optimal antara akurasi, ukuran, dan kecepatan inferensi di CPU.

### 4.2 Modifikasi Classifier Head

```python
import torch
import torch.nn as nn
from torchvision import models

def build_model(num_classes: int = 9, dropout: float = 0.3) -> nn.Module:
    # Load pretrained EfficientNet-B3
    model = models.efficientnet_b3(weights=models.EfficientNet_B3_Weights.IMAGENET1K_V1)
    
    # Ganti classifier head
    in_features = model.classifier[1].in_features  # 1536 untuk B3
    model.classifier = nn.Sequential(
        nn.Dropout(p=dropout, inplace=True),
        nn.Linear(in_features, 512),
        nn.SiLU(),
        nn.Dropout(p=dropout / 2),
        nn.Linear(512, num_classes),
    )
    
    return model
```

### 4.3 Input Specification

```python
INPUT_SIZE = (300, 300)       # EfficientNet-B3 native size
MEAN = [0.485, 0.456, 0.406]  # ImageNet mean
STD  = [0.229, 0.224, 0.225]  # ImageNet std
```

---

## 5. Pipeline Preprocessing

### 5.1 Augmentasi Training (Albumentations)

```python
import albumentations as A
from albumentations.pytorch import ToTensorV2

def get_train_transforms(image_size: int = 300) -> A.Compose:
    return A.Compose([
        A.RandomResizedCrop(
            height=image_size,
            width=image_size,
            scale=(0.7, 1.0),
            ratio=(0.75, 1.33),
        ),
        A.HorizontalFlip(p=0.5),
        A.VerticalFlip(p=0.3),
        A.Rotate(limit=30, p=0.5),
        A.OneOf([
            A.GaussianBlur(blur_limit=3),
            A.MedianBlur(blur_limit=3),
            A.MotionBlur(blur_limit=3),
        ], p=0.3),
        A.ColorJitter(
            brightness=0.3,
            contrast=0.3,
            saturation=0.3,
            hue=0.1,
            p=0.5,
        ),
        A.OneOf([
            A.GridDistortion(p=0.5),
            A.ElasticTransform(p=0.5),
            A.OpticalDistortion(p=0.5),
        ], p=0.3),
        A.CoarseDropout(
            max_holes=8,
            max_height=image_size // 10,
            max_width=image_size // 10,
            p=0.3,
        ),
        A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ToTensorV2(),
    ])

def get_val_transforms(image_size: int = 300) -> A.Compose:
    return A.Compose([
        A.Resize(height=image_size, width=image_size),
        A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ToTensorV2(),
    ])
```

### 5.2 Strategi Handling Class Imbalance

```python
from torch.utils.data import WeightedRandomSampler

def get_weighted_sampler(dataset) -> WeightedRandomSampler:
    class_counts = [len([x for x in dataset.targets if x == c]) 
                    for c in range(len(dataset.classes))]
    class_weights = 1.0 / torch.tensor(class_counts, dtype=torch.float)
    sample_weights = class_weights[dataset.targets]
    
    return WeightedRandomSampler(
        weights=sample_weights,
        num_samples=len(sample_weights),
        replacement=True,
    )
```

---

## 6. Training Strategy

### 6.1 Fase Training (3 Fase)

#### Fase 1: Warm-up Classifier Head (5 epoch)

Freeze semua layer backbone, hanya train classifier head yang baru.

```python
# Freeze semua parameter backbone
for param in model.features.parameters():
    param.requires_grad = False

optimizer = torch.optim.AdamW(
    model.classifier.parameters(),
    lr=1e-3,
    weight_decay=1e-4,
)
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=5)
```

#### Fase 2: Fine-tune Top Layers (15 epoch)

Unfreeze 30% layer terakhir backbone.

```python
# Unfreeze 2 block terakhir dari features
trainable_layers = list(model.features.children())[-3:]
for layer in trainable_layers:
    for param in layer.parameters():
        param.requires_grad = True

optimizer = torch.optim.AdamW([
    {"params": model.classifier.parameters(), "lr": 1e-3},
    {"params": trainable_layers[0].parameters(), "lr": 1e-4},
    {"params": trainable_layers[1].parameters(), "lr": 5e-5},
    {"params": trainable_layers[2].parameters(), "lr": 1e-5},
], weight_decay=1e-4)
```

#### Fase 3: Full Fine-tune (10 epoch, opsional)

Unfreeze semua layer dengan LR sangat kecil. Jalankan hanya jika Fase 2 belum mencapai target.

```python
for param in model.parameters():
    param.requires_grad = True

optimizer = torch.optim.AdamW(model.parameters(), lr=5e-6, weight_decay=1e-4)
```

### 6.2 Loss Function

Gunakan `CrossEntropyLoss` dengan class weights untuk menangani imbalance:

```python
class_weights = torch.tensor([
    1.0,  # rice_leaf_blast
    2.5,  # rice_bacterial_leaf_blight  ← kelas kecil, weight lebih tinggi
    1.0,  # rice_brown_spot
    1.2,  # rice_hispa
    0.8,  # rice_healthy               ← sedikit lebih banyak, weight lebih rendah
    1.2,  # corn_northern_leaf_blight
    1.0,  # corn_common_rust
    1.8,  # corn_gray_leaf_spot        ← kelas kecil
    0.9,  # corn_healthy
], dtype=torch.float).to(device)

criterion = nn.CrossEntropyLoss(weight=class_weights, label_smoothing=0.1)
```

### 6.3 Hyperparameter

| Parameter | Fase 1 | Fase 2 | Fase 3 |
|---|---|---|---|
| Epochs | 5 | 15 | 10 |
| Batch size | 32 | 32 | 16 |
| LR (classifier) | 1e-3 | 1e-3 | 5e-6 |
| LR (backbone) | frozen | 1e-5 – 1e-4 | 5e-6 |
| Optimizer | AdamW | AdamW | AdamW |
| Scheduler | CosineAnnealing | CosineAnnealingWarmRestarts | CosineAnnealing |
| Weight decay | 1e-4 | 1e-4 | 1e-4 |
| Label smoothing | 0.1 | 0.1 | 0.05 |

### 6.4 Early Stopping & Model Checkpoint

```python
# Simpan model terbaik berdasarkan validation accuracy
# Hentikan training jika val_loss tidak membaik dalam 5 epoch
patience = 5
best_val_acc = 0.0
epochs_no_improve = 0

for epoch in range(num_epochs):
    train_loss, train_acc = train_one_epoch(...)
    val_loss, val_acc = validate(...)

    if val_acc > best_val_acc:
        best_val_acc = val_acc
        epochs_no_improve = 0
        torch.save({
            "epoch": epoch,
            "model_state_dict": model.state_dict(),
            "val_acc": val_acc,
            "class_names": CLASS_NAMES,
        }, "checkpoints/best_model.pth")
    else:
        epochs_no_improve += 1
        if epochs_no_improve >= patience:
            print(f"Early stopping pada epoch {epoch}")
            break
```

### 6.5 Experiment Tracking (Weights & Biases)

```python
import wandb

wandb.init(
    project="agrishield-model",
    config={
        "backbone": "efficientnet_b3",
        "num_classes": 9,
        "dataset": "plantvillage+rice_kaggle+corn_kaggle",
        "total_images": 16000,
        "augmentation": "albumentations_heavy",
    }
)

# Log setiap epoch
wandb.log({
    "train/loss": train_loss,
    "train/accuracy": train_acc,
    "val/loss": val_loss,
    "val/accuracy": val_acc,
    "learning_rate": optimizer.param_groups[0]["lr"],
})
```

---

## 7. Evaluasi Model

### 7.1 Metrik yang Dihitung

```python
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    top_k_accuracy_score,
)

def evaluate(model, test_loader, class_names):
    all_preds, all_labels, all_probs = [], [], []

    model.eval()
    with torch.no_grad():
        for images, labels in test_loader:
            outputs = model(images.to(device))
            probs = torch.softmax(outputs, dim=1)
            preds = torch.argmax(probs, dim=1)

            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.numpy())
            all_probs.extend(probs.cpu().numpy())

    # Metrik utama
    acc = accuracy_score(all_labels, all_preds)
    top3_acc = top_k_accuracy_score(all_labels, all_probs, k=3)
    report = classification_report(all_labels, all_preds, target_names=class_names)
    cm = confusion_matrix(all_labels, all_preds)

    print(f"Overall Accuracy : {acc:.4f}")
    print(f"Top-3 Accuracy   : {top3_acc:.4f}")
    print(f"\n{report}")

    return acc, top3_acc, cm
```

### 7.2 Target Minimum Sebelum Deploy

| Metrik | Target Minimum | Keterangan |
|---|---|---|
| Overall Accuracy | ≥ 85% | Di test set |
| Per-class Recall | ≥ 78% | Semua kelas |
| Top-3 Accuracy | ≥ 96% | Penyakit benar masuk top-3 |
| False Negative Rate (penyakit kritis) | ≤ 15% | Untuk rice_blast & corn_nlb |
| Inferensi CPU (ms) | ≤ 500ms | Ukur dengan ONNX Runtime |

### 7.3 Test Robustness

Selain test set standar, lakukan pengujian tambahan:

**Test dengan gambar "sulit":**
- Gambar dengan kualitas rendah (simulasi foto HP petani, blur, gelap)
- Gambar tanaman sehat yang mirip sakit (false positive test)
- Gambar bukan tanaman (batu, tanah, manusia) → harus return "tidak dikenali"
- Gambar multi-penyakit dalam satu frame

**Test confidence threshold:**
- Tentukan threshold confidence di mana model masih reliable
- Jika max confidence < 40% → return `{"disease": null, "message": "Gambar tidak dapat dikenali sebagai penyakit tanaman"}`

### 7.4 Confusion Matrix Analysis

Identifikasi pasangan kelas yang sering salah prediksi (confusion pair) dan tangani:
- Tambah data augmentasi khusus untuk kelas tersebut
- Pertimbangkan hierarchical classification jika ada overlap signifikan

---

## 8. Export & Deployment Model

### 8.1 Export ke ONNX

```python
import torch.onnx

def export_to_onnx(model, output_path: str, input_size: int = 300):
    model.eval()
    dummy_input = torch.randn(1, 3, input_size, input_size)

    torch.onnx.export(
        model,
        dummy_input,
        output_path,
        export_params=True,
        opset_version=17,
        do_constant_folding=True,
        input_names=["image"],
        output_names=["logits"],
        dynamic_axes={
            "image": {0: "batch_size"},
            "logits": {0: "batch_size"},
        },
    )
    print(f"Model diekspor ke: {output_path}")
```

### 8.2 Validasi ONNX

```python
import onnx
import onnxruntime as ort
import numpy as np

def validate_onnx(onnx_path: str, pytorch_model, test_image: np.ndarray):
    # Load dan check model ONNX
    onnx_model = onnx.load(onnx_path)
    onnx.checker.check_model(onnx_model)

    # Bandingkan output PyTorch vs ONNX
    ort_session = ort.InferenceSession(onnx_path)
    ort_inputs = {"image": test_image}
    ort_output = ort_session.run(None, ort_inputs)[0]

    with torch.no_grad():
        torch_output = pytorch_model(torch.tensor(test_image)).numpy()

    max_diff = np.abs(ort_output - torch_output).max()
    assert max_diff < 1e-5, f"Output berbeda: max diff = {max_diff}"
    print(f"✅ Validasi ONNX berhasil. Max diff: {max_diff:.8f}")
```

### 8.3 Optimasi ONNX

```python
from onnxruntime.transformers import optimizer

# Quantization (opsional, kurangi ukuran ~4x dengan sedikit penurunan akurasi)
from onnxruntime.quantization import quantize_dynamic, QuantType

quantize_dynamic(
    model_input="model/agridisease_v1.0.0.onnx",
    model_output="model/agridisease_v1.0.0_quantized.onnx",
    weight_type=QuantType.QUInt8,
)
```

### 8.4 ML Service Contract

Model di-expose sebagai REST API dengan kontrak berikut (tidak boleh berubah tanpa versioning):

**Endpoint:** `POST /predict`

**Request:**
```json
{
  "image_base64": "<base64 encoded JPEG/PNG>",
  "crop_type": "rice"
}
```

**Response (success):**
```json
{
  "success": true,
  "predictions": [
    {
      "label": "rice_leaf_blast",
      "label_display": "Blast Padi",
      "confidence": 0.923
    },
    {
      "label": "rice_brown_spot",
      "label_display": "Bercak Cokelat",
      "confidence": 0.054
    },
    {
      "label": "rice_healthy",
      "label_display": "Sehat",
      "confidence": 0.018
    }
  ],
  "model_version": "1.0.0",
  "inference_time_ms": 187
}
```

**Response (gambar tidak dikenali):**
```json
{
  "success": true,
  "predictions": null,
  "message": "Gambar tidak dapat dikenali sebagai penyakit tanaman",
  "model_version": "1.0.0"
}
```

### 8.5 Mock ML Service untuk Development Aplikasi

Agar tim aplikasi tidak perlu menunggu model selesai, sediakan mock service:

```python
# ml-service/app/mock_inference.py
import random
import time

MOCK_RESPONSES = {
    "rice": [
        {"label": "rice_leaf_blast", "label_display": "Blast Padi", "confidence": 0.87},
        {"label": "rice_brown_spot", "label_display": "Bercak Cokelat", "confidence": 0.08},
        {"label": "rice_healthy", "label_display": "Sehat", "confidence": 0.05},
    ],
    "corn": [
        {"label": "corn_common_rust", "label_display": "Karat Jagung", "confidence": 0.91},
        {"label": "corn_northern_leaf_blight", "label_display": "Hawar Daun Utara", "confidence": 0.07},
        {"label": "corn_healthy", "label_display": "Sehat", "confidence": 0.02},
    ],
}

@router.post("/predict")
async def mock_predict(request: PredictRequest):
    time.sleep(random.uniform(0.5, 2.0))  # Simulasi latency
    predictions = MOCK_RESPONSES.get(request.crop_type, MOCK_RESPONSES["rice"])
    return {
        "success": True,
        "predictions": predictions,
        "model_version": "mock-1.0.0",
        "inference_time_ms": random.randint(100, 300),
    }
```

Aktifkan dengan environment variable: `USE_MOCK_MODEL=true`

---

## 9. Struktur Repositori

```
agrishield-model/
├── README.md
├── requirements.txt              # PyTorch, albumentations, onnx, wandb, dll
├── class_names.json              # Daftar kelas FINAL yang digunakan (source of truth)
│
├── data/
│   ├── raw/                      # Dataset original yang didownload (jangan di-commit)
│   │   ├── plantvillage/
│   │   ├── rice_disease_minhhuy/
│   │   ├── rice_leaf_shayanriyaz/
│   │   └── corn_leaf_smaranjit/
│   ├── processed/                # Dataset setelah normalisasi label (jangan di-commit)
│   │   ├── train/
│   │   │   ├── rice_leaf_blast/
│   │   │   ├── rice_bacterial_leaf_blight/
│   │   │   └── ...
│   │   ├── val/
│   │   └── test/
│   └── .gitignore                # Abaikan semua folder data
│
├── scripts/
│   ├── download_datasets.py      # Script download semua dataset dari Kaggle API
│   ├── prepare_dataset.py        # Normalize label, split train/val/test, cek duplikat
│   ├── analyze_dataset.py        # EDA: distribusi kelas, sample gambar, kualitas
│   ├── label_mapping.py          # Mapping label asli → label standar
│   ├── train.py                  # Main training script
│   ├── evaluate.py               # Evaluasi model pada test set
│   ├── export_onnx.py            # Export PyTorch → ONNX
│   └── validate_onnx.py          # Validasi output ONNX vs PyTorch
│
├── configs/
│   └── efficientnet_b3.yaml      # Semua hyperparameter training
│
├── src/
│   ├── dataset.py                # PyTorch Dataset class
│   ├── model.py                  # Definisi arsitektur model
│   ├── transforms.py             # Albumentations transforms
│   ├── trainer.py                # Training loop
│   └── utils.py                  # Helper functions
│
├── checkpoints/                  # Model checkpoint (.pth) — jangan di-commit ke git
│   └── .gitignore
│
├── models/                       # Model final (.onnx) — upload ke release GitHub
│   ├── agridisease_v1.0.0.onnx
│   └── agridisease_v1.0.0_quantized.onnx
│
├── notebooks/
│   ├── 01_eda.ipynb              # Exploratory Data Analysis
│   ├── 02_training_experiment.ipynb
│   └── 03_error_analysis.ipynb
│
└── reports/
    ├── v1.0.0_evaluation.md      # Laporan evaluasi setiap versi model
    └── confusion_matrix_v1.png
```

---

## 10. Jadwal & Milestone

### Minggu 1–2: Data Collection & Preparation

- [ ] Download semua dataset dari Kaggle (gunakan Kaggle API)
- [ ] Jalankan `analyze_dataset.py`: cek distribusi, kualitas gambar, duplikat
- [ ] Verifikasi visual: cek sampel gambar setiap kelas, pastikan label benar
- [ ] Khusus PlantVillage `Rice___Leaf_scald`: tentukan apakah gabung dengan `leaf_blast` atau kelas terpisah
- [ ] Jalankan `prepare_dataset.py`: normalize label, buat split 80/10/10
- [ ] Dokumentasikan statistik final dataset di `reports/dataset_stats.md`

**Gate:** Dataset siap dengan distribusi yang sudah diverifikasi manual

---

### Minggu 3–4: Baseline Training

- [ ] Implementasi `dataset.py`, `model.py`, `transforms.py`
- [ ] Setup W&B project
- [ ] Training Fase 1 (freeze backbone, 5 epoch)
- [ ] Training Fase 2 (unfreeze top, 15 epoch)
- [ ] Evaluasi baseline pada val set
- [ ] Analisis confusion matrix: identifikasi kelas yang bermasalah
- [ ] Iterasi augmentasi/weight jika akurasi < 80%

**Gate:** Val accuracy ≥ 80%

---

### Minggu 5: Evaluasi & Robustness Testing

- [ ] Evaluasi final pada test set (bukan val set)
- [ ] Test dengan gambar "sulit" (blur, gelap, bukan tanaman)
- [ ] Test confidence threshold (temukan nilai optimal)
- [ ] Buat laporan evaluasi `reports/v1.0.0_evaluation.md`
- [ ] Jika test accuracy < 85%: kembali ke Minggu 3–4 untuk iterasi

**Gate:** Test accuracy ≥ 85%, semua per-class recall ≥ 78%

---

### Minggu 6: Export & Integration

- [ ] Export model terbaik ke ONNX
- [ ] Validasi output ONNX vs PyTorch
- [ ] Benchmark inferensi di CPU (harus < 500ms)
- [ ] Opsional: quantization jika ukuran model > 50MB
- [ ] Upload model ke GitHub Release dengan tag `v1.0.0`
- [ ] Update `class_names.json` dan `model_version` di ml-service
- [ ] Test integrasi: ml-service menggunakan model ONNX yang baru
- [ ] Handoff ke tim aplikasi: ganti `USE_MOCK_MODEL=false`

**Gate:** Model berjalan di ml-service dengan latency < 500ms di CPU VPS

---

## 11. Risiko & Mitigasi

| Risiko | Dampak | Probabilitas | Mitigasi |
|---|---|---|---|
| Dataset kondisi lapangan berbeda dari test set | Tinggi | Tinggi | Tambah augmentasi yang mensimulasikan foto HP (blur, noise, pencahayaan buruk) |
| Kelas dengan gambar sedikit (bacterial_leaf_blight) akurasi rendah | Sedang | Sedang | Weighted sampler + class weights di loss function + augmentasi agresif |
| Model overfit pada background putih PlantVillage | Tinggi | Sedang | Augmentasi background, mix dengan dataset kondisi lapangan |
| Inferensi terlalu lambat di VPS (CPU only) | Tinggi | Sedang | ONNX quantization; jika masih lambat pertimbangkan MobileNetV3 |
| Label overlap antar dataset (Leaf_Blast vs Leaf_Scald) | Sedang | Tinggi | Verifikasi visual wajib sebelum gabung label |
| Google Colab disconnect saat training | Sedang | Sedang | Simpan checkpoint setiap epoch; gunakan Colab Pro atau Kaggle Notebook (30 jam/minggu gratis) |

---

*Dokumen ini adalah panduan tim model. Update setiap ada perubahan signifikan pada dataset, arsitektur, atau hasil evaluasi.*

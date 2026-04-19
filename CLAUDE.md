# CLAUDE.md — AgriShield AI

Dokumen ini adalah panduan utama untuk AI agent (Claude) yang bekerja di dalam proyek AgriShield AI. Baca seluruh dokumen ini sebelum melakukan tindakan apapun.

---

## Identitas Proyek

**Nama:** AgriShield AI  
**Deskripsi:** Platform deteksi penyakit tanaman berbasis AI untuk petani Indonesia. Menggabungkan Computer Vision (model fine-tuned EfficientNet-B3) dengan Generative AI untuk diagnosis penyakit padi dan jagung serta rekomendasi penanganan.  
**Bahasa utama kode & dokumentasi:** Indonesia  
**Tim:** 2–3 orang  
**Stack:** React + FastAPI + PostgreSQL/PostGIS + Redis + Celery + ONNX

---

## Struktur Direktori

```
agrishield-ai/
├── frontend/              # React + Vite + Tailwind
│   └── src/
│       ├── components/    # Komponen UI reusable
│       ├── pages/         # Halaman (route level)
│       ├── hooks/         # Custom React hooks
│       ├── stores/        # Zustand stores
│       └── utils/         # Helper functions
├── backend/               # FastAPI utama
│   └── app/
│       ├── api/           # Router dan endpoint handler
│       ├── core/          # Config, security, dependencies
│       ├── models/        # SQLAlchemy ORM models
│       ├── schemas/       # Pydantic request/response schemas
│       ├── services/      # Business logic layer
│       └── tasks/         # Celery async tasks
├── ml-service/            # FastAPI untuk inferensi model ONNX
│   └── app/
│       ├── models/        # File .onnx model
│       ├── preprocessing/ # Transformasi gambar
│       └── inference/     # Logika prediksi
├── ml-training/           # Script training (tidak di-deploy)
│   ├── datasets/
│   ├── notebooks/
│   └── scripts/
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
├── docker-compose.prod.yml
└── .github/workflows/
```

---

## Aturan Umum untuk Agent

### Sebelum Memulai Task Apapun

1. **Pahami konteks terlebih dahulu.** Baca file yang relevan sebelum mengubah apapun.
2. **Jangan asumsikan.** Jika tidak yakin dengan scope task, berhenti dan tanyakan.
3. **Satu task, satu perubahan.** Jangan selesaikan banyak hal berbeda dalam satu langkah. Pecah menjadi sub-task yang kecil.
4. **Selalu verifikasi hasil.** Setelah membuat atau mengubah file, baca kembali untuk memastikan tidak ada error.

### Larangan Keras

- **JANGAN** mengubah file `.env` atau credential apapun
- **JANGAN** commit atau push langsung ke branch `main`
- **JANGAN** menghapus file tanpa konfirmasi eksplisit dari pengguna
- **JANGAN** mengubah skema database tanpa membuat file migrasi Alembic
- **JANGAN** mengubah konfigurasi Nginx atau Docker tanpa konfirmasi
- **JANGAN** mengganti model ONNX yang sedang digunakan di production tanpa persetujuan
- **JANGAN** memanggil Anthropic API atau LLM eksternal lainnya dalam kode kecuali di `backend/app/services/recommendation_service.py`

---

## Konvensi Kode

### Python (Backend & ML)

```python
# Penamaan: snake_case untuk semua
# Kelas: PascalCase
# Konstanta: UPPER_SNAKE_CASE

# Contoh struktur endpoint FastAPI
@router.post("/scans", response_model=ScanResponse, status_code=201)
async def create_scan(
    file: UploadFile = File(...),
    crop_type: CropType = Form(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ScanResponse:
    """
    Upload gambar tanaman dan mulai proses analisis penyakit.
    Return scan_id yang bisa digunakan untuk polling status.
    """
    return await scan_service.create_scan(file, crop_type, current_user, db)
```

**Aturan Python:**
- Gunakan type hints di semua fungsi
- Docstring wajib untuk semua fungsi publik (Bahasa Indonesia boleh)
- Gunakan `async/await` untuk semua operasi I/O di FastAPI
- Validasi input SELALU menggunakan Pydantic schema, bukan manual
- Exception handling: gunakan custom exception classes dari `app/core/exceptions.py`
- Jangan gunakan `print()` — gunakan `logging` dengan level yang tepat

### TypeScript/React (Frontend)

```typescript
// Penamaan komponen: PascalCase
// Fungsi & variabel: camelCase
// Konstanta: UPPER_SNAKE_CASE
// File komponen: PascalCase.tsx
// File hooks: use[Name].ts

// Contoh komponen
interface DiseaseCardProps {
  diseaseName: string;
  confidence: number;
  alternatives: AlternativeDiagnosis[];
}

const DiseaseCard: React.FC<DiseaseCardProps> = ({
  diseaseName,
  confidence,
  alternatives,
}) => {
  // implementasi
};

export default DiseaseCard;
```

**Aturan React/TypeScript:**
- Selalu gunakan TypeScript, tidak ada `any` kecuali benar-benar terpaksa
- **DILARANG menggunakan `useEffect`** — gunakan alternatif yang lebih tepat:
  - Data fetching → gunakan React Query (`useQuery`, `useMutation`)
  - Derived state → hitung langsung saat render atau gunakan `useMemo`
  - Event subscription → gunakan library yang menyediakan hook (contoh: `useIntersectionObserver`)
  - Sync ke external store → gunakan `useSyncExternalStore`
  - Satu-satunya pengecualian yang diizinkan: integrasi library pihak ketiga yang tidak punya React binding (contoh: inisialisasi Leaflet map instance)
- Komponen harus pure dan tidak punya side effect di render
- Data fetching: gunakan React Query (`useQuery`, `useMutation`)
- Global state: Zustand, bukan Context untuk state yang sering berubah
- Styling: Tailwind CSS utility classes saja, tidak ada CSS inline

### SQL & Database

```sql
-- Nama tabel: snake_case, plural (users, scans, disease_reports)
-- Nama kolom: snake_case
-- Primary key: selalu UUID dengan gen_random_uuid()
-- Timestamps: created_at dan updated_at (TIMESTAMPTZ)
-- Foreign key: [table_singular]_id (user_id, scan_id)
```

**Aturan Database:**
- Setiap perubahan skema WAJIB dibuatkan file migrasi Alembic
- Jangan pernah tulis query raw SQL langsung di endpoint — gunakan service layer
- Query geospatial (PostGIS) hanya di `database/spatial_queries.py`
- Selalu gunakan index untuk kolom yang sering difilter (lihat IMPLEMENTATION_PLAN.md)

---

## Panduan per Modul

### Backend API (`backend/`)

**Saat membuat endpoint baru:**
1. Buat Pydantic schema di `app/schemas/[nama].py`
2. Buat atau update model SQLAlchemy di `app/models/[nama].py`
3. Buat business logic di `app/services/[nama]_service.py`
4. Buat router di `app/api/[nama].py`
5. Daftarkan router di `app/api/__init__.py`
6. Buat migrasi Alembic: `alembic revision --autogenerate -m "deskripsi"`
7. Buat unit test di `tests/test_[nama].py`

**Hierarki lapisan (jangan skip):**
```
Router (api/) → Service (services/) → Database (models/) 
                     ↓
              External calls (ml-service, anthropic, storage)
```

**Error handling standar:**
```python
# Gunakan HTTPException dengan kode yang sesuai
raise HTTPException(status_code=404, detail="Scan tidak ditemukan")
raise HTTPException(status_code=422, detail="Format gambar tidak didukung")
raise HTTPException(status_code=503, detail="ML service tidak tersedia")
```

### Celery Tasks (`backend/app/tasks/`)

**Saat membuat task baru:**
- Dekorasi dengan `@celery_app.task(bind=True, max_retries=3)`
- Selalu implementasi retry dengan exponential backoff
- Log setiap tahap task (start, progress, done, error)
- Task harus idempoten (aman dijalankan ulang)

```python
@celery_app.task(bind=True, max_retries=3)
def analyze_scan(self, scan_id: str) -> dict:
    try:
        logger.info(f"Mulai analisis scan {scan_id}")
        # ... logika
        logger.info(f"Analisis scan {scan_id} selesai")
    except MLServiceUnavailable as exc:
        logger.error(f"ML service error untuk scan {scan_id}: {exc}")
        raise self.retry(exc=exc, countdown=2 ** self.request.retries * 30)
```

### ML Service (`ml-service/`)

**Status Model:**
Model AI dikembangkan di repositori terpisah (`agrishield-model`). Aplikasi ini **tidak bergantung** pada model yang sudah selesai. Gunakan mock service selama model masih dalam development.

**Cara mengaktifkan mock:**
```env
# .env
USE_MOCK_MODEL=true   # Gunakan ini sampai model ONNX tersedia
USE_MOCK_MODEL=false  # Setelah model ONNX siap di-deploy
```

**Mock response sudah tersedia di:** `ml-service/app/mock_inference.py`  
Mock mensimulasikan latency 0.5–2 detik dan mengembalikan prediksi realistis.

**Model yang digunakan (saat USE_MOCK_MODEL=false):**
- Arsitektur: EfficientNet-B3 fine-tuned
- Format: ONNX (`.onnx`)
- Lokasi file: `ml-service/app/models/agridisease_v[VERSION].onnx`
- Input: gambar 300×300 pixel, normalized (ImageNet mean/std)
- Output: array probabilitas untuk 9 kelas

**Kelas output (urutan HARUS konsisten dengan training — source of truth: `class_names.json`):**
```python
CLASS_NAMES = [
    "rice_leaf_blast",            # 0
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

> Label ini mengikuti dataset publik yang tersedia. Jangan ubah urutan atau nama label tanpa update model sekaligus.

**Saat update model:**
1. Simpan model baru dengan versi baru (contoh: `agridisease_v2.onnx`)
2. Update `MODEL_VERSION` di config
3. Test model baru vs model lama pada test set
4. Akurasi baru harus ≥ akurasi model lama
5. Baru update referensi di konfigurasi production

### Frontend (`frontend/`)

**Saat membuat halaman baru:**
1. Buat file di `src/pages/[NamaHalaman].tsx`
2. Daftarkan route di `src/App.tsx`
3. Buat komponen reusable di `src/components/` jika diperlukan
4. Buat custom hook di `src/hooks/` jika ada logika yang bisa dipisah

**Landing Page (`src/pages/LandingPage.tsx`):**
- Halaman publik, tidak memerlukan autentikasi
- Terdiri dari seksi: Hero, Stats, Fitur, Cara Kerja, Tanaman Didukung, Testimoni, CTA, Footer
- Animasi scroll menggunakan Intersection Observer API — **bukan `useEffect`**
  - Gunakan custom hook `useIntersectionObserver` yang sudah tersedia di `src/hooks/`
- Counter angka pada Stats section: gunakan hook `useCountUp`
- Semua gambar harus format WebP dan menggunakan `loading="lazy"`
- Target Lighthouse: Performance ≥ 90, Accessibility ≥ 95
- CTA utama mengarah ke `/scan` (scan bisa dicoba tanpa login)

**Data fetching dengan React Query:**
```typescript
// Query data
const { data: scanResult, isLoading, error } = useQuery({
  queryKey: ['scan', scanId],
  queryFn: () => scanApi.getById(scanId),
  refetchInterval: (data) => data?.status === 'pending' ? 2000 : false,
});

// Mutasi
const uploadMutation = useMutation({
  mutationFn: scanApi.create,
  onSuccess: (data) => {
    navigate(`/scan/${data.id}/result`);
  },
  onError: (error) => {
    toast.error('Gagal mengupload gambar. Coba lagi.');
  },
});
```

---

## Testing

### Menjalankan Test

```bash
# Backend unit test
cd backend && pytest tests/ -v

# Backend dengan coverage
cd backend && pytest tests/ --cov=app --cov-report=html

# Frontend unit test
cd frontend && npm run test

# Integration test (butuh docker compose running)
cd backend && pytest tests/integration/ -v
```

### Aturan Testing

- Setiap fungsi service baru WAJIB punya unit test
- Mock semua external calls (ML service, Anthropic API, S3)
- Gunakan `pytest-asyncio` untuk test fungsi async
- Test harus bisa dijalankan tanpa koneksi internet
- Coverage target: ≥ 70% untuk backend

```python
# Contoh test dengan mock
@pytest.mark.asyncio
async def test_analyze_scan_success(mock_ml_service, mock_db):
    mock_ml_service.predict.return_value = {
        "disease": "rice_blast",
        "confidence": 0.92,
        "alternatives": [...]
    }
    result = await scan_service.analyze_scan("scan-id-123", mock_db)
    assert result.detected_disease == "rice_blast"
    assert result.confidence == 92.0
```

---

## Perintah Umum

```bash
# Development: jalankan semua service
make dev
# atau
docker compose up -d

# Buat migrasi database baru
cd backend && alembic revision --autogenerate -m "deskripsi perubahan"

# Jalankan migrasi
cd backend && alembic upgrade head

# Rollback migrasi satu step
cd backend && alembic downgrade -1

# Lihat log service tertentu
docker compose logs -f api
docker compose logs -f worker
docker compose logs -f ml-service

# Masuk ke container database
docker compose exec db psql -U postgres -d agrishield

# Rebuild image setelah ada perubahan dependency
docker compose build api
docker compose up -d api

# Training model (di direktori ml-training)
cd ml-training && python scripts/train.py --config configs/efficientnet_b3.yaml

# Export model ke ONNX
cd ml-training && python scripts/export_onnx.py --checkpoint checkpoints/best.pth
```

---

## Variabel Lingkungan yang Dikenali

Agent tidak boleh mengubah nilai ini, hanya perlu tahu namanya:

| Variabel | Digunakan di | Keterangan |
|---|---|---|
| `DATABASE_URL` | backend, worker | Connection string PostgreSQL |
| `REDIS_URL` | backend, worker | Connection string Redis |
| `SECRET_KEY` | backend | Signing JWT tokens |
| `ML_SERVICE_URL` | backend | URL internal ml-service |
| `ANTHROPIC_API_KEY` | backend | API key Claude untuk rekomendasi |
| `S3_ENDPOINT` | backend, worker | Endpoint object storage |
| `S3_BUCKET_NAME` | backend, worker | Nama bucket gambar |
| `ENVIRONMENT` | semua | `development` atau `production` |

---

## Panduan Menulis Kode Baru

### Checklist Sebelum Selesai

Sebelum menyatakan task selesai, pastikan:

- [ ] Kode sudah ditest (unit test dan/atau manual test)
- [ ] Tidak ada `print()` atau `console.log()` yang tertinggal untuk debug
- [ ] Tidak ada credential atau API key yang ditulis langsung di kode
- [ ] Semua fungsi publik punya docstring atau komentar yang menjelaskan tujuan
- [ ] Import sudah terurut (stdlib → third-party → local)
- [ ] Tidak ada dead code (fungsi/variabel yang tidak digunakan)
- [ ] Response API mengikuti format standar `{success, data, meta}`
- [ ] Error response menggunakan kode HTTP yang tepat

### Komentar dalam Kode

Tulis komentar untuk menjelaskan **mengapa**, bukan **apa**:

```python
# BAIK: Menjelaskan alasan
# Threshold 40% berdasarkan eksperimen: confidence di bawah ini 
# terlalu sering salah dan lebih baik dikembalikan sebagai "tidak terdeteksi"
if max_confidence < 0.40:
    return None

# BURUK: Hanya menjelaskan apa yang sudah jelas dari kode
# Cek apakah confidence kurang dari 40%
if max_confidence < 0.40:
    return None
```

---

## Informasi Domain: Penyakit Tanaman

### Padi — Penyakit yang Didukung

| Kode | Nama Indonesia | Nama Ilmiah | Gejala Utama |
|---|---|---|---|
| `rice_blast` | Blast Padi | *Magnaporthe oryzae* | Bercak berlian abu-abu pada daun |
| `bacterial_leaf_blight` | Hawar Daun Bakteri | *Xanthomonas oryzae* | Tepi daun menguning, basah |
| `brown_spot` | Bercak Cokelat | *Bipolaris oryzae* | Bercak oval cokelat pada daun |
| `tungro` | Tungro | Virus | Daun menguning kemerahan, stunting |
| `rice_healthy` | Sehat | — | Tidak ada gejala |

### Jagung — Penyakit yang Didukung

| Kode | Nama Indonesia | Nama Ilmiah | Gejala Utama |
|---|---|---|---|
| `northern_leaf_blight` | Hawar Daun Utara | *Exserohilum turcicum* | Bercak panjang abu-abu kehijauan |
| `southern_leaf_blight` | Hawar Daun Selatan | *Bipolaris maydis* | Bercak kecil persegi panjang |
| `common_rust` | Karat Jagung | *Puccinia sorghi* | Pustula cokelat kemerahan |
| `ear_rot` | Busuk Tongkol | *Fusarium* spp. | Tongkol berjamur, biji rusak |
| `corn_healthy` | Sehat | — | Tidak ada gejala |

---

## Cara Agent Harus Melaporkan Progress

Saat mengerjakan task yang panjang, agent harus:

1. **Nyatakan apa yang akan dikerjakan** sebelum mulai
2. **Update setiap langkah selesai** dengan status singkat
3. **Jika ada hambatan**, berhenti dan jelaskan hambatannya secara spesifik
4. **Di akhir task**, buat ringkasan:
   - Apa yang sudah dikerjakan
   - File apa yang dibuat/diubah
   - Langkah selanjutnya yang disarankan
   - Apakah ada hal yang perlu dikonfirmasi

Contoh format ringkasan:
```
✅ Selesai: Implementasi endpoint POST /scans

File yang dibuat/diubah:
- backend/app/schemas/scan.py (baru)
- backend/app/models/scan.py (baru)  
- backend/app/services/scan_service.py (baru)
- backend/app/api/scans.py (baru)
- backend/app/api/__init__.py (diupdate)

Migrasi database: alembic/versions/001_add_scans_table.py (baru)

Langkah selanjutnya:
- Jalankan `alembic upgrade head` untuk apply migrasi
- Test dengan: pytest tests/test_scans.py -v

Yang perlu dikonfirmasi:
- Apakah field `location` di tabel scans bisa null (jika user tidak share lokasi)?
```

---

*Dokumen ini harus diupdate setiap kali ada perubahan arsitektur signifikan, penambahan service baru, atau perubahan konvensi yang disepakati tim.*

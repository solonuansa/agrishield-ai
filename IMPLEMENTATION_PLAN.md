# AgriShield AI — Implementation Plan
**Versi:** 1.0.0  
**Tanggal:** Maret 2026  
**Tim:** 2–3 Orang  
**Bahasa:** Indonesia

---

## Daftar Isi

1. [Deskripsi Proyek](#1-deskripsi-proyek)
2. [Tujuan & Target](#2-tujuan--target)
3. [Target Pengguna](#3-target-pengguna)
4. [Output yang Diharapkan](#4-output-yang-diharapkan)
5. [Desain Sistem & UI/UX](#5-desain-sistem--uiux)
6. [Tech Stack](#6-tech-stack)
7. [Arsitektur Sistem](#7-arsitektur-sistem)
8. [Model AI & Pipeline ML](#8-model-ai--pipeline-ml)
9. [Struktur Database](#9-struktur-database)
10. [API Design](#10-api-design)
11. [Keamanan & Infrastruktur](#11-keamanan--infrastruktur)
12. [Strategi Testing](#12-strategi-testing)
13. [Deployment Strategy](#13-deployment-strategy)
14. [Risiko & Mitigasi](#14-risiko--mitigasi)

---

## 1. Deskripsi Proyek

**AgriShield AI** adalah platform kecerdasan buatan berbasis web yang dirancang untuk membantu ekosistem pertanian Indonesia — mulai dari petani kecil hingga lembaga pemerintah — dalam mendeteksi, memantau, dan menangani penyakit tanaman secara cepat dan akurat.

Platform ini menggabungkan **Computer Vision** (model fine-tuned untuk tanaman padi dan jagung) dengan **Generative AI** untuk menghasilkan rekomendasi penanganan yang kontekstual, serta sistem **GeoSpatial** untuk memetakan persebaran penyakit secara regional.

### Latar Belakang

Indonesia adalah negara agraris dengan jutaan petani kecil yang menghadapi tantangan nyata:
- Akses terbatas ke penyuluh pertanian
- Keterlambatan diagnosis penyakit yang menyebabkan gagal panen
- Tidak adanya sistem peringatan dini berbasis data
- Kerugian ekonomi signifikan akibat penanganan yang salah

AgriShield AI hadir sebagai solusi digital yang dapat diakses kapan saja, di mana saja, tanpa memerlukan keahlian khusus dari pengguna.

---

## 2. Tujuan & Target

### Tujuan Utama
- Membangun sistem deteksi penyakit tanaman berbasis gambar dengan akurasi ≥ 85% untuk padi dan jagung
- Menyediakan rekomendasi penanganan yang praktis, mudah dipahami petani
- Membangun heatmap persebaran penyakit berbasis GeoJSON untuk monitoring regional
- Menyediakan dashboard analitik untuk kebutuhan pemerintah dan NGO

### Target Terukur (per Phase)

| Phase | Target |
|---|---|
| Phase 1 | MVP: upload foto → deteksi → rekomendasi berjalan end-to-end |
| Phase 2 | Heatmap aktif, autentikasi pengguna, histori lahan tersimpan |
| Phase 3 | Early warning system aktif, smart recommendation berbasis cuaca & lokasi |
| Phase 4 | Komunitas petani aktif, dashboard analitik pemerintah/NGO |

---

## 3. Target Pengguna

### 3.1 Petani Kecil/Subsisten
- Kebutuhan: diagnosis cepat tanpa bahasa teknis, rekomendasi mudah dipraktikkan
- Akses: smartphone Android low-end, koneksi internet tidak stabil
- Solusi desain: UI sederhana, gambar besar, teks singkat, Bahasa Indonesia yang mudah

### 3.2 Petani Komersial
- Kebutuhan: histori penyakit per lahan, laporan berkala, rekomendasi berbasis varietas
- Akses: smartphone/tablet, internet stabil
- Solusi desain: dashboard lahan, export laporan, tracking multi-lahan

### 3.3 Penyuluh Pertanian
- Kebutuhan: data lapangan dari banyak petani, laporan untuk pelaporan dinas
- Akses: web browser desktop/laptop
- Solusi desain: view semua laporan dari area binaan, export data

### 3.4 Pemerintah / NGO
- Kebutuhan: data agregat, tren penyakit, peta persebaran, efektivitas program
- Akses: web browser desktop
- Solusi desain: dashboard analitik penuh, filter per wilayah, export CSV/PDF

---

## 4. Output yang Diharapkan

### 4.1 Produk Digital
- Web application responsif (mobile-first)
- REST API terdokumentasi (OpenAPI/Swagger)
- Model AI ter-deploy dan dapat diakses via API internal

### 4.2 Output per Fitur

**Deteksi Penyakit**
- Nama penyakit (contoh: Blast Padi, Hawar Daun Jagung)
- Confidence score dalam persentase
- Maksimal 3 alternatif diagnosis
- Gambar anotasi area yang terdeteksi

**Rekomendasi Penanganan**
- Penjelasan penyakit dalam Bahasa Indonesia sederhana
- Langkah penanganan step-by-step (3–7 langkah)
- Nama produk pestisida/fungisida yang direkomendasikan
- Dosis dan metode aplikasi
- Estimasi biaya penanganan

**Heatmap Penyakit**
- Peta interaktif berbasis Leaflet.js
- Warna gradasi berdasarkan tingkat keparahan (hijau → kuning → merah)
- Filter per jenis penyakit dan per rentang waktu
- Tooltip detail saat hover lokasi

**Dashboard Analitik**
- Grafik tren penyakit (mingguan/bulanan)
- Tabel area rawan prioritas
- Statistik jumlah laporan dan pengguna aktif

---

## 5. Desain Sistem & UI/UX

### 5.1 Prinsip Desain
- **Mobile-first**: mayoritas petani mengakses via smartphone
- **Simplicity**: tampilan bersih, tidak membingungkan pengguna non-teknis
- **Speed**: hasil deteksi tampil dalam < 10 detik
- **Accessibility**: kontras tinggi, font readable, instruksi bergambar

### 5.2 Halaman Utama (Sitemap)

```
/                        → Landing page (publik)
/login                   → Login / Register
/dashboard               → Dashboard pengguna
/scan                    → Upload & scan foto
/scan/:id/result         → Hasil deteksi + rekomendasi
/history                 → Riwayat scan
/map                     → Heatmap penyakit
/community               → Forum diskusi petani
/admin                   → Dashboard analitik (pemerintah/NGO)
/profile                 → Profil & pengaturan
```

### 5.3 Landing Page (`/`)

Landing page adalah halaman publik yang dapat diakses tanpa login. Tujuannya adalah meyakinkan petani, penyuluh, dan instansi pemerintah untuk menggunakan platform ini.

**Seksi-seksi Landing Page (urutan dari atas ke bawah):**

#### Hero Section
- Headline utama: **"Deteksi Penyakit Tanaman dalam Hitungan Detik"**
- Subheadline: manfaat singkat dalam 1–2 kalimat
- Tombol CTA primer: "Coba Sekarang — Gratis" → `/scan` (tanpa login untuk percobaan)
- Tombol CTA sekunder: "Pelajari Lebih Lanjut" → scroll ke seksi fitur
- Visual: ilustrasi/foto petani menggunakan smartphone di sawah
- Background: warna gradasi hijau pertanian

#### Stats Section
- Angka-angka dampak (animasi counter saat scroll masuk viewport):
  - "X+ Petani Terbantu"
  - "X Penyakit Terdeteksi"
  - "X Provinsi Terjangkau"
  - "X% Akurasi Model AI"
- Desain: 4 kotak horizontal, background hijau gelap, teks putih

#### Fitur Unggulan Section
- Grid 3 kolom (desktop) / 1 kolom (mobile)
- Setiap kartu: ikon SVG + judul + deskripsi 2 kalimat
- Fitur yang ditampilkan:
  1. 🔍 Deteksi Instan — Upload foto, hasil dalam detik
  2. 💊 Rekomendasi Penanganan — Langkah praktis berbasis AI
  3. 🗺️ Peta Penyebaran — Pantau wabah di wilayahmu
  4. ⚠️ Peringatan Dini — Notifikasi sebelum wabah menyebar
  5. 📊 Data Analitik — Untuk pemerintah dan peneliti
  6. 👥 Komunitas Petani — Belajar dari sesama

#### Cara Kerja Section
- Judul: "Semudah 3 Langkah"
- Timeline horizontal (desktop) / vertikal (mobile):
  1. **Foto** — Ambil gambar daun tanaman yang sakit
  2. **Analisis** — AI mendeteksi penyakit dalam hitungan detik
  3. **Tangani** — Ikuti rekomendasi penanganan yang tepat
- Visual: mockup smartphone menunjukkan UI aplikasi

#### Tanaman yang Didukung Section
- Judul: "Mendukung Tanaman Pangan Utama Indonesia"
- Card padi: daftar 4 penyakit yang bisa dideteksi
- Card jagung: daftar 3 penyakit yang bisa dideteksi
- Catatan: "Lebih banyak tanaman segera hadir"

#### Testimoni Section (Phase 2+)
- Quote dari petani atau penyuluh yang sudah mencoba
- Foto, nama, lokasi, jabatan
- Carousel di mobile, grid 3 kolom di desktop

#### CTA Final Section
- Judul: "Mulai Lindungi Tanamanmu Sekarang"
- Tombol: "Daftar Gratis" → `/login?mode=register`
- Sub-teks: "Tidak perlu kartu kredit. Gratis selamanya untuk petani."

#### Footer
- Logo + tagline
- Link navigasi: Tentang, Fitur, Peta Penyakit, Komunitas, Kontak
- Link legal: Kebijakan Privasi, Syarat Penggunaan
- Media sosial
- Copyright

**Teknologi & Implementasi Landing Page:**
- Dibangun sebagai bagian dari React app yang sama (route `/`)
- Animasi scroll menggunakan **Intersection Observer API** (bukan library berat)
- Counter angka: custom hook `useCountUp` yang trigger saat elemen masuk viewport
- Gambar dioptimasi: WebP format, lazy loading
- Tidak memerlukan autentikasi — semua data statis atau dari endpoint publik
- Lighthouse score target: Performance ≥ 90, Accessibility ≥ 95

### 5.5 Alur Pengguna Utama (Happy Path)

```
Buka aplikasi
  → Upload foto daun/tanaman
    → Pilih jenis tanaman (padi/jagung)
      → Klik "Analisis"
        → Loading (proses AI ~5-8 detik)
          → Tampil hasil: nama penyakit + confidence
            → Klik "Lihat Rekomendasi"
              → Tampil langkah penanganan
                → Simpan ke riwayat (opsional)
```

### 5.6 Color Palette

| Elemen | Warna | Hex |
|---|---|---|
| Primary | Hijau pertanian | `#2D6A4F` |
| Secondary | Kuning panen | `#F4A261` |
| Danger/Alert | Merah penyakit | `#E63946` |
| Background | Abu-abu terang | `#F8F9FA` |
| Text utama | Hitam lembut | `#212529` |

### 5.7 Komponen UI Kritis

- **ImageUploader**: drag & drop + kamera langsung, preview sebelum kirim
- **DiseaseCard**: tampilan hasil deteksi dengan confidence bar
- **TreatmentStepper**: langkah penanganan berurutan dengan ikon
- **DiseaseMap**: Leaflet map interaktif dengan layer kontrol
- **AlertBanner**: notifikasi early warning berwarna merah

---

## 6. Tech Stack

### 6.1 Frontend

| Teknologi | Versi | Fungsi |
|---|---|---|
| React | 18.x | Framework UI utama |
| Vite | 5.x | Build tool & dev server |
| Tailwind CSS | 3.x | Utility-first styling |
| React Router | 6.x | Client-side routing |
| Leaflet.js | 1.9.x | Peta interaktif heatmap |
| React Leaflet | 4.x | React wrapper untuk Leaflet |
| Axios | 1.x | HTTP client |
| Zustand | 4.x | State management ringan |
| React Query | 5.x | Server state & caching |
| Recharts | 2.x | Grafik dashboard analitik |

### 6.2 Backend

| Teknologi | Versi | Fungsi |
|---|---|---|
| FastAPI | 0.110.x | REST API framework |
| Python | 3.11+ | Runtime backend |
| Uvicorn | 0.x | ASGI server |
| SQLAlchemy | 2.x | ORM database |
| Alembic | 1.x | Database migrations |
| Pydantic | 2.x | Validasi data & schema |
| Python-Jose | 3.x | JWT authentication |
| Passlib | 1.x | Password hashing (bcrypt) |
| Celery | 5.x | Task queue async |
| Redis | 7.x | Broker Celery + caching |
| Boto3 | 1.x | Koneksi S3-compatible storage |

### 6.3 AI / Machine Learning

| Teknologi | Fungsi |
|---|---|
| PyTorch 2.x | Framework training model |
| Torchvision | Pretrained backbone (EfficientNet/ResNet) |
| Hugging Face Transformers | Alternatif backbone ViT |
| Albumentations | Data augmentation saat training |
| ONNX Runtime | Inference model yang dioptimasi |
| FastAPI (ML server) | Serve model sebagai microservice |
| Weights & Biases | Experiment tracking training |

### 6.4 Database

| Teknologi | Fungsi |
|---|---|
| PostgreSQL 16 | Database relasional utama |
| PostGIS 3.x | Ekstensi geospatial untuk heatmap |
| Redis 7 | Cache, session, message broker |

### 6.5 Infrastructure & DevOps

| Teknologi | Fungsi |
|---|---|
| Docker & Docker Compose | Kontainerisasi semua service |
| Nginx | Reverse proxy & static files |
| GitHub Actions | CI/CD pipeline |
| VPS (2 vCPU, 4GB RAM) | Hosting production |
| Cloudflare R2 / MinIO | Object storage gambar |
| Certbot | SSL/TLS otomatis |

---

## 7. Arsitektur Sistem

### 7.1 Diagram Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│              React App (Mobile & Desktop Browser)            │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼─────────────────────────────────┐
│                     NGINX (Reverse Proxy)                    │
│              SSL Termination + Static Files                  │
└───────┬───────────────────┬─────────────────────────────────┘
        │                   │
┌───────▼───────┐   ┌───────▼───────────────────────────────┐
│  Frontend     │   │       Backend API (FastAPI)            │
│  Static Files │   │   Auth, Business Logic, Orchestration  │
└───────────────┘   └───────┬──────────────┬────────────────┘
                            │              │
                ┌───────────▼──┐   ┌───────▼──────────┐
                │  PostgreSQL  │   │   Redis (Cache   │
                │  + PostGIS   │   │   + Broker)      │
                └──────────────┘   └───────┬──────────┘
                                           │
                                  ┌────────▼──────────┐
                                  │  Celery Workers   │
                                  │  (Async Tasks)    │
                                  └────────┬──────────┘
                                           │
                                  ┌────────▼──────────┐
                                  │  ML Inference     │
                                  │  Service (ONNX)   │
                                  └────────┬──────────┘
                                           │
                                  ┌────────▼──────────┐
                                  │  Object Storage   │
                                  │  (R2 / MinIO)     │
                                  └───────────────────┘
```

### 7.2 Deskripsi Setiap Layer

**Client Layer**
React SPA yang berjalan di browser. Berkomunikasi hanya dengan Nginx via HTTPS. Tidak ada akses langsung ke database atau ML service.

**Nginx**
Bertindak sebagai gerbang utama: meneruskan request API ke FastAPI, menyajikan file statis React, dan menangani SSL termination. Menerapkan rate limiting di level ini.

**Backend API (FastAPI)**
Otak dari sistem. Bertanggung jawab atas autentikasi, validasi request, business logic, dan orkestrasi task. Ketika ada request analisis gambar, backend akan menyimpan gambar ke storage dan mendorong task ke Celery queue.

**Celery Workers**
Memproses task berat secara asinkron: mengirim gambar ke ML Inference Service, menerima hasil, memanggil LLM untuk rekomendasi, menyimpan hasil ke database, dan mengupdate data heatmap.

**ML Inference Service**
Microservice FastAPI terpisah yang menjalankan model ONNX. Menerima gambar, mengembalikan prediksi penyakit dan confidence score. Dijalankan dalam container terpisah agar bisa di-scale secara independen.

**PostgreSQL + PostGIS**
Menyimpan semua data persisten: user, lahan, hasil diagnosis, data geospatial untuk heatmap.

**Redis**
Dua fungsi utama: message broker untuk Celery, dan cache untuk response API yang sering diakses (daftar penyakit, data heatmap).

**Object Storage**
Menyimpan semua gambar yang diupload pengguna dan gambar hasil anotasi model.

### 7.3 Service Breakdown untuk Docker Compose

```yaml
services:
  frontend       # React build di-serve Nginx
  nginx          # Reverse proxy
  api            # FastAPI backend utama
  ml-service     # FastAPI ML inference
  worker         # Celery worker
  db             # PostgreSQL + PostGIS
  redis          # Redis
  minio          # Object storage (development)
```

---

## 8. Model AI & Pipeline ML

### 8.1 Strategi Model

Karena dataset penyakit tanaman Indonesia belum tersedia secara publik dalam skala besar, strategi yang digunakan adalah **Transfer Learning + Fine-tuning** pada dataset publik yang kemudian di-adapt ke kondisi lokal.

### 8.2 Dataset

**Dataset Publik (Baseline Training)**

| Dataset | Jumlah Gambar | Tanaman | Sumber |
|---|---|---|---|
| PlantVillage | ~54.000 | Padi, Jagung, dll | Kaggle / GitHub |
| Rice Disease Dataset | ~3.000 | Padi | Kaggle |
| Corn Disease Dataset | ~4.000 | Jagung | Kaggle |

**Data Lokal (Fine-tuning)**
- Pengumpulan foto dari lapangan oleh tim atau mitra penyuluh
- Labelisasi menggunakan Label Studio (self-hosted)
- Target minimum: 500 gambar per kelas penyakit

### 8.3 Kelas Penyakit Target

**Padi (Rice)**
1. Blast Padi (Rice Blast) — *Magnaporthe oryzae*
2. Hawar Daun Bakteri (Bacterial Leaf Blight) — *Xanthomonas oryzae*
3. Bercak Cokelat (Brown Spot) — *Bipolaris oryzae*
4. Tungro
5. Sehat (Healthy)

**Jagung (Corn)**
1. Hawar Daun Utara (Northern Leaf Blight) — *Exserohilum turcicum*
2. Hawar Daun Selatan (Southern Leaf Blight)
3. Karat Jagung (Common Rust) — *Puccinia sorghi*
4. Busuk Tongkol (Ear Rot)
5. Sehat (Healthy)

### 8.4 Arsitektur Model

**Backbone:** EfficientNet-B3 (pretrained ImageNet)

Alasan pemilihan:
- Akurasi tinggi dengan ukuran model yang kecil (ideal untuk deployment di VPS RAM 4GB)
- Terbukti efektif untuk klasifikasi penyakit tanaman di literatur riset
- Inferensi cepat bahkan tanpa GPU

**Konfigurasi Fine-tuning:**

```python
# Fase 1: Freeze backbone, train classifier head
model.freeze_backbone()
train(epochs=10, lr=1e-3)

# Fase 2: Unfreeze top layers, fine-tune
model.unfreeze_top_layers(n=30)
train(epochs=20, lr=1e-4)

# Fase 3 (opsional): Full fine-tune dengan LR sangat kecil
train(epochs=10, lr=1e-5)
```

**Augmentasi Data (Albumentations):**
- Random horizontal/vertical flip
- Random rotation (±30°)
- Color jitter (brightness, contrast, saturation)
- Random crop & resize
- Gaussian blur & noise
- Elastic transform

### 8.5 Pipeline Inference

```
Gambar diterima API
        ↓
Preprocess: resize 300x300, normalize (ImageNet mean/std)
        ↓
Model EfficientNet-B3 (ONNX Runtime)
        ↓
Softmax → Top-3 predictions + confidence scores
        ↓
Filter: jika confidence < 40% → return "Tidak terdeteksi"
        ↓
Kirim ke LLM untuk generate rekomendasi
        ↓
Simpan hasil ke database + update heatmap
        ↓
Return response ke frontend
```

### 8.6 Rekomendasi Penanganan (LLM)

Setelah model mendeteksi penyakit, sistem memanggil LLM API (Claude) dengan prompt terstruktur:

```
Sistem: Kamu adalah ahli pertanian Indonesia. Berikan rekomendasi penanganan penyakit tanaman 
        dalam Bahasa Indonesia yang mudah dipahami petani.

User: Tanaman: [Padi/Jagung]
      Penyakit terdeteksi: [Nama Penyakit]
      Confidence: [XX%]
      Lokasi petani: [Provinsi]
      Musim saat ini: [Hujan/Kemarau]
      
      Berikan: 1) Penjelasan singkat penyakit
               2) Langkah penanganan (maks 7 langkah)
               3) Rekomendasi pestisida yang tersedia di Indonesia
               4) Dosis dan metode aplikasi
               5) Tips pencegahan
```

### 8.7 Evaluasi Model

**Metrik yang digunakan:**
- Accuracy keseluruhan
- Per-class Precision, Recall, F1-Score
- Confusion matrix
- Top-3 accuracy (apakah penyakit benar ada di 3 prediksi teratas)

**Target minimum sebelum deploy:**
- Overall accuracy ≥ 85%
- Per-class recall ≥ 80% (terutama untuk penyakit kritis)

---

## 9. Struktur Database

### 9.1 Skema Tabel Utama

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'farmer', -- farmer, extension, admin, gov
    province VARCHAR(50),
    district VARCHAR(50),
    village VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lahan Pertanian
CREATE TABLE fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    crop_type VARCHAR(20) NOT NULL, -- rice, corn
    area_ha DECIMAL(10,2),
    location GEOMETRY(POINT, 4326), -- PostGIS geometry
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hasil Scan/Diagnosis
CREATE TABLE scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    field_id UUID REFERENCES fields(id),
    image_url TEXT NOT NULL,
    crop_type VARCHAR(20) NOT NULL,
    detected_disease VARCHAR(100),
    confidence DECIMAL(5,2),
    alternatives JSONB, -- [{disease, confidence}, ...]
    location GEOMETRY(POINT, 4326),
    status VARCHAR(20) DEFAULT 'pending', -- pending, done, failed
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rekomendasi Penanganan
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID REFERENCES scans(id) ON DELETE CASCADE,
    summary TEXT,
    steps JSONB, -- [{step, description, image_url}, ...]
    pesticides JSONB, -- [{name, dose, method}, ...]
    prevention TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data Heatmap (agregat per wilayah)
CREATE TABLE disease_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID REFERENCES scans(id),
    disease_name VARCHAR(100) NOT NULL,
    crop_type VARCHAR(20) NOT NULL,
    severity VARCHAR(10), -- low, medium, high
    location GEOMETRY(POINT, 4326) NOT NULL,
    reported_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifikasi Early Warning
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type VARCHAR(50), -- outbreak_detected, new_disease
    disease_name VARCHAR(100),
    area_polygon GEOMETRY(POLYGON, 4326),
    message TEXT,
    severity VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- Komunitas / Forum
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    title VARCHAR(200),
    content TEXT,
    scan_id UUID REFERENCES scans(id), -- opsional link ke scan
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 9.2 Indeks Penting

```sql
-- Spatial index untuk query heatmap
CREATE INDEX idx_disease_reports_location ON disease_reports USING GIST(location);
CREATE INDEX idx_scans_location ON scans USING GIST(location);
CREATE INDEX idx_fields_location ON fields USING GIST(location);

-- Index untuk query umum
CREATE INDEX idx_scans_user_id ON scans(user_id);
CREATE INDEX idx_scans_created_at ON scans(created_at DESC);
CREATE INDEX idx_disease_reports_disease_name ON disease_reports(disease_name);
CREATE INDEX idx_disease_reports_reported_at ON disease_reports(reported_at DESC);
```

---

## 10. API Design

### 10.1 Base URL & Versioning

```
https://api.agrishield.id/v1/
```

### 10.2 Endpoint Utama

**Autentikasi**
```
POST   /auth/register          → Daftar akun baru
POST   /auth/login             → Login, return JWT token
POST   /auth/refresh           → Refresh access token
POST   /auth/logout            → Invalidate token
```

**Scan & Deteksi**
```
POST   /scans                  → Upload gambar & mulai analisis
GET    /scans                  → Daftar riwayat scan user
GET    /scans/:id              → Detail hasil scan
GET    /scans/:id/status       → Status pemrosesan (SSE / polling)
```

**Rekomendasi**
```
GET    /scans/:id/recommendation  → Rekomendasi penanganan
```

**Peta & Heatmap**
```
GET    /map/heatmap            → Data GeoJSON untuk heatmap
GET    /map/alerts             → Daftar early warning aktif
GET    /map/stats              → Statistik per wilayah
```

**Lahan**
```
POST   /fields                 → Tambah lahan
GET    /fields                 → Daftar lahan user
PUT    /fields/:id             → Update data lahan
DELETE /fields/:id             → Hapus lahan
```

**Komunitas**
```
GET    /posts                  → Daftar post forum
POST   /posts                  → Buat post baru
GET    /posts/:id              → Detail post
POST   /posts/:id/comments     → Tambah komentar
POST   /posts/:id/like         → Like/unlike post
```

**Admin & Analitik**
```
GET    /admin/stats            → Statistik platform
GET    /admin/trends           → Tren penyakit per periode
GET    /admin/hotspots         → Area rawan prioritas
GET    /admin/users            → Manajemen pengguna
```

### 10.3 Format Response Standar

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-03-28T10:00:00Z",
    "request_id": "abc123"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Format gambar tidak didukung",
    "details": { ... }
  }
}
```

---

## 11. Keamanan & Infrastruktur

### 11.1 Autentikasi & Otorisasi

- **JWT** dengan access token (15 menit) + refresh token (7 hari)
- Role-based access control (RBAC): farmer, extension, admin, gov
- Password di-hash dengan bcrypt (cost factor 12)
- Refresh token disimpan di Redis dengan TTL

### 11.2 Security Measures

| Lapisan | Implementasi |
|---|---|
| Transport | HTTPS/TLS 1.3 via Let's Encrypt |
| Rate Limiting | 60 req/menit per IP (Nginx); 10 scan/jam per user |
| Input Validation | Pydantic schema validation di semua endpoint |
| File Upload | Validasi MIME type, max size 10MB, scan virus (ClamAV) |
| SQL Injection | SQLAlchemy ORM (parameterized queries) |
| XSS | Content Security Policy header |
| CORS | Whitelist domain frontend saja |

### 11.3 Spesifikasi VPS Production

```
CPU    : 2 vCPU
RAM    : 4 GB
Storage: 80 GB SSD
OS     : Ubuntu 22.04 LTS
Network: 1 Gbps

Perkiraan penggunaan resource:
- PostgreSQL      : ~512 MB RAM
- Redis           : ~256 MB RAM
- FastAPI API     : ~256 MB RAM
- Celery Worker   : ~512 MB RAM
- ML Service      : ~1 GB RAM (ONNX model)
- Nginx           : ~64 MB RAM
- Buffer OS       : ~400 MB
Total estimasi    : ~3 GB (masih dalam batas aman)
```

---

## 12. Strategi Testing

### 12.1 Unit Testing

- Backend: `pytest` untuk setiap fungsi bisnis logik
- Frontend: `Vitest` + `React Testing Library` untuk komponen kritis
- Coverage target: ≥ 70%

### 12.2 Integration Testing

- Test end-to-end API dengan `pytest` + `httpx`
- Test upload gambar → hasil deteksi (menggunakan gambar fixture)
- Test pipeline Celery dengan task yang di-mock

### 12.3 Model Testing

- Evaluasi model pada test set terpisah (80/10/10 split)
- Threshold testing: pastikan model tidak confident pada gambar random/tidak relevan
- Regression testing: setiap update model harus dibandingkan dengan versi sebelumnya

### 12.4 Load Testing

- `Locust` untuk simulasi concurrent users
- Target: 50 concurrent users tanpa degradasi signifikan
- Bottleneck identification sebelum go-live

---

## 13. Deployment Strategy

### 13.1 Struktur Direktori Project

```
agrishield-ai/
├── frontend/                  # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── stores/
│   │   └── utils/
│   └── Dockerfile
├── backend/                   # FastAPI
│   ├── app/
│   │   ├── api/              # Router endpoints
│   │   ├── core/             # Config, security, deps
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   └── tasks/            # Celery tasks
│   ├── alembic/              # Database migrations
│   └── Dockerfile
├── ml-service/                # ML Inference FastAPI
│   ├── app/
│   │   ├── models/           # ONNX model files
│   │   ├── preprocessing/
│   │   └── inference/
│   └── Dockerfile
├── ml-training/               # Training scripts (tidak di-deploy)
│   ├── datasets/
│   ├── notebooks/
│   └── scripts/
├── nginx/
│   └── nginx.conf
├── docker-compose.yml         # Development
├── docker-compose.prod.yml    # Production
└── .github/workflows/         # CI/CD
```

### 13.2 CI/CD Pipeline (GitHub Actions)

```yaml
Trigger: Push ke branch main

Steps:
1. Checkout code
2. Run unit tests (pytest + vitest)
3. Build Docker images
4. Push ke Docker Hub / GitHub Container Registry
5. SSH ke VPS
6. Pull images terbaru
7. docker compose up -d --no-downtime
8. Run database migrations (alembic upgrade head)
9. Health check semua service
10. Notifikasi Slack/WhatsApp jika berhasil/gagal
```

### 13.3 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@db:5432/agrishield
REDIS_URL=redis://redis:6379/0

# Auth
SECRET_KEY=<random 256-bit key>
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Storage
S3_ENDPOINT=https://...
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_BUCKET_NAME=agrishield-images

# AI
ML_SERVICE_URL=http://ml-service:8001
ANTHROPIC_API_KEY=...

# App
ENVIRONMENT=production
ALLOWED_ORIGINS=https://agrishield.id
```

---

## 14. Risiko & Mitigasi

| Risiko | Dampak | Probabilitas | Mitigasi |
|---|---|---|---|
| Akurasi model rendah pada kondisi lapangan | Tinggi | Sedang | Pengumpulan data lokal yang cukup; threshold confidence minimum |
| VPS kehabisan RAM saat load tinggi | Tinggi | Sedang | Monitoring dengan Prometheus; batas request per user |
| Gambar kualitas rendah dari HP petani | Sedang | Tinggi | Preprocessing agresif; panduan foto dalam UI |
| Dataset penyakit lokal sulit dikumpulkan | Tinggi | Tinggi | Mulai dari dataset publik + data augmentation; kerjasama mitra |
| Biaya API LLM tinggi | Sedang | Sedang | Cache rekomendasi per penyakit; limit generate per user |
| Tim kecil → bottleneck | Tinggi | Tinggi | Prioritas ketat per phase; scope minimal viable per feature |
| Koneksi internet petani tidak stabil | Sedang | Tinggi | Kompresi gambar di frontend; offline mode untuk lihat histori (Phase 3) |

---

*Dokumen ini adalah living document. Update setiap awal phase baru.*

# AgriShield AI

Platform deteksi penyakit tanaman berbasis AI untuk petani Indonesia.

AgriShield AI membantu petani mendeteksi penyakit tanaman padi dan jagung secara cepat dan akurat melalui foto dari smartphone, tanpa membutuhkan keahlian khusus.

---

## Daftar Isi

- [Latar Belakang](#latar-belakang)
- [Fitur Utama](#fitur-utama)
- [Tanaman yang Didukung](#tanaman-yang-didukung)
- [Tech Stack](#tech-stack)
- [Prasyarat](#prasyarat)
- [Setup Development (Docker Compose)](#setup-development-docker-compose)
- [Menjalankan Frontend Tanpa Docker](#menjalankan-frontend-tanpa-docker)
- [Perintah Umum](#perintah-umum)
- [Deployment Production](#deployment-production)
- [Struktur Direktori](#struktur-direktori)
- [Status Pengembangan](#status-pengembangan)
- [Lisensi](#lisensi)

---

## Latar Belakang

Indonesia adalah negara agraris dengan lebih dari 33 juta petani, mayoritas adalah petani kecil yang menghadapi tantangan nyata setiap musim tanam:

- Akses terbatas ke penyuluh pertanian, terutama di daerah terpencil
- Keterlambatan diagnosis yang menyebabkan gagal panen yang seharusnya bisa dicegah
- Tidak ada sistem peringatan dini untuk wabah penyakit
- Kerugian ekonomi akibat penanganan yang salah atau terlambat

AgriShield AI hadir sebagai solusi digital yang dapat diakses dengan antarmuka sederhana untuk pengguna non-teknis.

---

## Fitur Utama

### Deteksi Penyakit Instan
Upload foto daun tanaman, AI menganalisis dan mengidentifikasi penyakit dalam hitungan detik. Didukung model EfficientNet-B3 yang di-fine-tune khusus untuk tanaman padi dan jagung Indonesia.

### Rekomendasi Penanganan Berbasis AI
Setelah deteksi, sistem menghasilkan rekomendasi penanganan yang praktis menggunakan Google Gemini. Langkah-langkah ditulis dalam Bahasa Indonesia yang mudah dipahami petani, lengkap dengan nama produk, dosis, dan estimasi biaya.

### Peta Persebaran Penyakit
Visualisasi heatmap interaktif yang menampilkan persebaran penyakit di seluruh Indonesia secara real-time. Data dikumpulkan dari laporan pengguna dan dapat difilter per jenis penyakit, tanaman, dan rentang waktu.

### Sistem Peringatan Dini
Notifikasi otomatis ketika wabah penyakit terdeteksi di wilayah terdekat, memungkinkan petani mengambil tindakan pencegahan sebelum lahan mereka terdampak. Didukung algoritma clustering Haversine dengan radius 50 km.

### Dashboard Analitik
Dashboard khusus untuk petani, penyuluh pertanian, dan dinas pertanian. Menampilkan tren penyakit, statistik scan, distribusi tanaman, dan riwayat diagnosis.

### Forum Komunitas Petani
Diskusi antar petani untuk berbagi pengalaman, pertanyaan gejala, dan tips pencegahan. Mendukung like, komentar, filter kategori, dan pencarian.

---

## Tanaman yang Didukung

| Tanaman | Penyakit yang Dapat Dideteksi |
|---|---|
| Padi (5 kelas) | Blast Padi, Hawar Daun Bakteri, Bercak Cokelat, Hispa, Sehat |
| Jagung (4 kelas) | Hawar Daun Utara, Karat Jagung, Bercak Daun Abu-abu, Sehat |

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, TypeScript 5, Framer Motion, Recharts |
| Backend API | FastAPI, Python 3.11, SQLAlchemy 2, Alembic, Pydantic 2 |
| Task Queue | Celery 5 + Redis 7 |
| Database | PostgreSQL 16 + PostGIS 3 |
| ML Inference | ONNX Runtime, EfficientNet-B3 (fine-tuned) |
| Generative AI | Google Gemini (via recommendation_service.py) |
| Object Storage | Cloudflare R2 (S3-compatible) |
| Infrastruktur | Docker, Docker Compose, Nginx, GitHub Actions |

---

## Prasyarat

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (sudah include Docker Compose)
- [Node.js 22+](https://nodejs.org/) (untuk dev frontend di host)
- Git

---

## Setup Development (Docker Compose)

### 1. Clone repository

```bash
git clone https://github.com/your-org/agrishield-ai.git
cd agrishield-ai
```

### 2. Salin dan isi environment variables

```bash
cp .env.example .env
```

Edit `.env` -- minimal isi:
- `SECRET_KEY` - string acak minimal 32 karakter
- `GEMINI_API_KEY` - untuk fitur rekomendasi AI
- `R2_*` - konfigurasi Cloudflare R2

### 3. Jalankan semua service

```bash
docker compose up -d
```

### 4. Jalankan migrasi database

```bash
docker compose exec api alembic upgrade head
```

### 5. Akses aplikasi

| Service | URL |
|---|---|
| Frontend (Next.js) | http://localhost:3000 |
| API Swagger docs | http://localhost:8000/docs |
| Backend API langsung | http://localhost:8000 |
| Aplikasi lengkap (via Nginx) | http://localhost |

---

## Menjalankan Frontend Tanpa Docker

Untuk pengembangan frontend dengan hot-reload yang lebih cepat:

```bash
cd frontend
npm install
npm run dev
```

Frontend akan tersedia di **http://localhost:3000**

Pastikan backend sudah berjalan melalui Docker Compose agar API dapat diakses.

---

## Perintah Umum

### Docker Compose

```bash
# Menjalankan semua service
docker compose up -d

# Menghentikan semua service
docker compose down

# Melihat log service
docker compose logs -f api
docker compose logs -f worker
docker compose logs -f ml-service

# Restart service tertentu
docker compose restart api

# Rebuild service
docker compose build frontend
docker compose up -d frontend
```

### Database

```bash
# Menjalankan migrasi
docker compose exec api alembic upgrade head

# Rollback satu migrasi
docker compose exec api alembic downgrade -1

# Membuat migrasi baru
docker compose exec api alembic revision --autogenerate -m "deskripsi perubahan"

# Masuk ke shell database
docker compose exec db psql -U postgres -d agrishield
```

### Testing

```bash
# Backend - semua test
cd backend && pytest tests/ -v --cov=app

# Frontend - type check
cd frontend && npm run type-check

# Frontend - lint
cd frontend && npm run lint

# Frontend - unit test
cd frontend && npm run test

# Frontend - build
cd frontend && npm run build
```

---

## Deployment Production

### Prasyarat Server

- Ubuntu 22.04+
- Docker Engine + Docker Compose plugin
- Domain dengan DNS mengarah ke server
- Port 80 dan 443 terbuka

### Langkah Deploy Pertama Kali

1. Clone repo di server:
   ```bash
   git clone https://github.com/your-org/agrishield-ai.git /opt/agrishield-ai
   cd /opt/agrishield-ai
   ```

2. Buat file `.env` production:
   ```bash
   cp .env.example .env
   ```
   Isi semua nilai: SECRET_KEY, POSTGRES_PASSWORD, GEMINI_API_KEY, R2 credentials, ENVIRONMENT=production.

3. Pasang SSL dengan Certbot:
   ```bash
   apt install certbot
   certbot certonly --standalone -d agrishield.id -d www.agrishield.id
   ```

4. Jalankan service production:
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   docker compose -f docker-compose.prod.yml exec api alembic upgrade head
   ```

### CI/CD Otomatis

Push ke branch `main` memicu GitHub Actions untuk:
1. Menjalankan lint dan test
2. Build Docker image (api, ml-service, frontend)
3. Push image ke GitHub Container Registry (GHCR)
4. Deploy ke server via SSH

**Secrets GitHub yang diperlukan:**

| Secret | Keterangan |
|---|---|
| SSH_HOST | IP atau domain server production |
| SSH_USER | Username SSH (contoh: ubuntu) |
| SSH_PRIVATE_KEY | Private key SSH (tanpa passphrase) |

---

## Struktur Direktori

```
agrishield-ai/
├── frontend/              # Next.js 16 (React 19, Tailwind CSS 4)
│   └── src/
│       ├── app/           # Halaman (route Next.js App Router)
│       ├── components/    # Komponen UI dan fitur
│       ├── lib/           # Utility, hooks, API client
│       └── types/         # TypeScript API types
├── backend/               # FastAPI
│   └── app/
│       ├── api/           # Router endpoint
│       ├── core/          # Config, security, database, logging
│       ├── models/        # SQLAlchemy models
│       ├── schemas/       # Pydantic schemas
│       ├── services/      # Business logic
│       └── tasks/         # Celery tasks
├── ml-service/            # FastAPI untuk inferensi ONNX
│   └── app/
│       ├── inference/     # ONNX runner
│       └── models/        # File .onnx (tidak di-commit)
├── ml-training/           # Notebook training (local-only, tidak di-commit)
├── nginx/                 # Konfigurasi reverse proxy
├── docker-compose.yml     # Stack development
├── docker-compose.prod.yml# Stack production
└── .github/workflows/     # CI/CD pipeline
```

---

## Status Pengembangan

| Area | Status | Catatan |
|---|---|---|
| Backend API (auth, scans, fields, map, alerts, community, dashboard, admin) | Selesai | Seluruh modul inti |
| Frontend (scan, history, map, dashboard, fields, community, admin, landing page) | Selesai | Termasuk hardening UX |
| Celery async worker + alert detection | Selesai | Clustering Haversine, periodik + trigger per scan |
| ML Service (ONNX runner + mock mode) | Selesai | Mode mock aktif secara default |
| Google Gemini recommendation | Selesai | Rekomendasi bilingual |
| Observability (structured logging, health check, coverage) | Selesai | Sprint B hardening |
| Model ONNX production | Tertunda | Dikembangkan di repo terpisah (USE_MOCK_MODEL=true) |

---

## Lisensi

Proyek ini dikembangkan untuk kepentingan pertanian Indonesia. Lisensi akan ditentukan sebelum rilis publik.

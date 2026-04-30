# AgriShield AI

**Platform deteksi penyakit tanaman berbasis AI untuk petani Indonesia.**

AgriShield AI membantu petani mendeteksi penyakit tanaman padi dan jagung secara cepat dan akurat — cukup dengan foto dari smartphone, tanpa membutuhkan keahlian khusus.

---

## Latar Belakang

Indonesia adalah negara agraris dengan lebih dari 33 juta petani, mayoritas adalah petani kecil yang menghadapi tantangan nyata setiap musim tanam:

- **Akses terbatas ke penyuluh pertanian** — rasio penyuluh dan petani sangat timpang, terutama di daerah terpencil
- **Keterlambatan diagnosis** — penyakit yang tidak terdeteksi dini menyebabkan gagal panen yang seharusnya bisa dicegah
- **Tidak ada sistem peringatan dini** — wabah penyakit menyebar tanpa data yang terstruktur
- **Kerugian ekonomi** — penanganan yang salah atau terlambat mengakibatkan kerugian miliaran rupiah setiap tahunnya

AgriShield AI hadir sebagai solusi digital yang dapat diakses kapan saja, di mana saja, dengan antarmuka yang sederhana untuk pengguna non-teknis.

---

## Fitur Utama

### Deteksi Penyakit Instan
Upload foto daun tanaman, AI menganalisis dan mengidentifikasi penyakit dalam hitungan detik. Didukung model EfficientNet-B3 yang di-fine-tune khusus untuk tanaman padi dan jagung Indonesia.

### Rekomendasi Penanganan Berbasis AI
Setelah deteksi, sistem menghasilkan rekomendasi penanganan yang praktis menggunakan Generative AI (Claude). Langkah-langkah ditulis dalam Bahasa Indonesia yang mudah dipahami petani, lengkap dengan nama produk, dosis, dan estimasi biaya.

### Peta Persebaran Penyakit
Visualisasi heatmap interaktif yang menampilkan persebaran penyakit di seluruh Indonesia secara real-time. Data dikumpulkan dari laporan pengguna dan dapat difilter per jenis penyakit dan rentang waktu.

### Sistem Peringatan Dini
Notifikasi otomatis ketika wabah penyakit terdeteksi di wilayah terdekat, memungkinkan petani mengambil tindakan pencegahan sebelum lahan mereka terdampak.

### Dashboard Analitik
Dashboard khusus untuk penyuluh pertanian, dinas pertanian, dan NGO. Menampilkan tren penyakit, peta area rawan, statistik laporan, dan mendukung export data CSV/PDF.

### Komunitas Petani
Forum diskusi antar petani untuk berbagi pengalaman, foto gejala, dan solusi penanganan. Dimoderasi oleh penyuluh pertanian terverifikasi.

---

## Tanaman yang Didukung

| Tanaman | Penyakit yang Dapat Dideteksi |
|---|---|
| **Padi** | Blast Padi, Hawar Daun Bakteri, Bercak Cokelat, Hispa |
| **Jagung** | Hawar Daun Utara, Karat Jagung, Bercak Daun Abu-abu |

> Lebih banyak tanaman dan penyakit akan ditambahkan pada fase pengembangan berikutnya.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4, TypeScript 5 |
| **Backend API** | FastAPI 0.110, Python 3.11, SQLAlchemy 2, Alembic, Pydantic 2 |
| **Task Queue** | Celery 5, Redis 7 |
| **Database** | PostgreSQL 16 + PostGIS 3 |
| **ML Inference** | ONNX Runtime, EfficientNet-B3 (fine-tuned) |
| **Generative AI** | Google Gemini (via `recommendation_service.py`) |
| **Object Storage** | Cloudflare R2 (S3-compatible) |
| **Infrastruktur** | Docker, Docker Compose, Nginx, GitHub Actions |

---

## Setup Development

### Prasyarat

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (sudah include Docker Compose)
- [Node.js 22+](https://nodejs.org/) (untuk dev frontend di host)
- Git

### Langkah Setup

**1. Clone repository**
```bash
git clone https://github.com/your-org/agrishield-ai.git
cd agrishield-ai
```

**2. Salin dan isi environment variables**
```bash
cp .env.example .env
```

Edit `.env` — minimal isi:
- `SECRET_KEY` — string acak minimal 32 karakter
- `GEMINI_API_KEY` — untuk fitur rekomendasi AI (Google Gemini)
- `R2_*` — konfigurasi Cloudflare R2 untuk object storage

**3. Jalankan semua service dengan Docker Compose**

```bash
# Windows (PowerShell / CMD)
docker compose up -d

# Linux / macOS
docker compose up -d
```

**4. Jalankan migrasi database**
```bash
docker compose exec api alembic upgrade head
```

**5. Akses aplikasi**

| Service | URL |
|---|---|
| Aplikasi web (via Nginx) | http://localhost |
| Frontend langsung (Next.js) | http://localhost:3000 |
| API Swagger docs | http://localhost/docs |
| Backend API langsung | http://localhost:8000 |

> **Catatan**: Di development, frontend berjalan pada port `3000` (Next.js dev server). Nginx di port `80` akan proxy ke frontend. Jika port `80` sudah dipakai, ubah mapping port di `docker-compose.yml`.

---

## Menjalankan Frontend Tanpa Docker (Dev Mode)

Untuk pengembangan frontend dengan hot-reload yang lebih cepat, jalankan langsung di host:

```bash
cd frontend
npm install
npm run dev
```

Frontend akan tersedia di **http://localhost:3000**

---

## Perintah Umum

### Docker Compose (Windows & Linux)

```bash
# Jalankan semua service
docker compose up -d

# Hentikan semua service
docker compose down

# Lihat log service
docker compose logs -f api
docker compose logs -f worker
docker compose logs -f ml-service
docker compose logs -f frontend

# Restart service tertentu
docker compose restart frontend

# Rebuild setelah ubah Dockerfile
docker compose build frontend
docker compose up -d frontend
```

### Database

```bash
# Jalankan migrasi
docker compose exec api alembic upgrade head

# Rollback satu migrasi
docker compose exec api alembic downgrade -1

# Buat migrasi baru
docker compose exec api alembic revision --autogenerate -m "deskripsi"

# Masuk ke PostgreSQL
docker compose exec db psql -U postgres -d agrishield
```

### Testing

```bash
# Backend unit test
cd backend && pytest tests/ -v

# Frontend build test
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

**1. Clone repo di server**
```bash
git clone https://github.com/your-org/agrishield-ai.git /opt/agrishield-ai
cd /opt/agrishield-ai
```

**2. Buat file `.env` production**
```bash
cp .env.example .env
# Edit .env — isi semua nilai, terutama:
# - SECRET_KEY (random 64 karakter)
# - POSTGRES_PASSWORD (password kuat)
# - GEMINI_API_KEY
# - R2_* credentials
# - ENVIRONMENT=production
```

**3. Pasang SSL dengan Certbot**
```bash
apt install certbot
certbot certonly --standalone -d agrishield.id -d www.agrishield.id
```

**4. Jalankan service**
```bash
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec api alembic upgrade head
```

### CI/CD Otomatis

Push ke branch `main` → GitHub Actions otomatis:
1. Menjalankan lint dan test
2. Build Docker image untuk `api`, `ml-service`, dan `frontend`
3. Push image ke GitHub Container Registry (GHCR)
4. Deploy ke server via SSH

**Secrets yang perlu diset di GitHub repository:**

| Secret | Keterangan |
|---|---|
| `SSH_HOST` | IP atau domain server production |
| `SSH_USER` | Username SSH (contoh: `ubuntu`) |
| `SSH_PRIVATE_KEY` | Private key SSH (tanpa passphrase) |

---

## Struktur Direktori

```
agrishield-ai/
├── frontend/          # Next.js 16 + React 19 + Tailwind CSS 4
├── backend/           # FastAPI utama (auth, scan, dll)
├── ml-service/        # FastAPI inferensi model ONNX
├── ml-training/       # Notebook & script training (tidak di-push ke git)
├── nginx/             # Konfigurasi reverse proxy
├── docker-compose.yml
└── docker-compose.prod.yml
```

---

## Status Pengembangan

| Phase | Deskripsi | Status |
|---|---|---|
| **Phase 0** | Foundation & Setup | Selesai |
| **Phase 1** | MVP Core (Scan & Diagnosa) | Dalam pengerjaan |
| **Phase 2** | Heatmap & Auth lengkap | Belum mulai |
| **Phase 3** | Early Warning & Smart Recommendation | Belum mulai |
| **Phase 4** | Community & Analytics | Belum mulai |

---

## Lisensi

Proyek ini dikembangkan untuk kepentingan pertanian Indonesia. Lisensi akan ditentukan sebelum rilis publik.

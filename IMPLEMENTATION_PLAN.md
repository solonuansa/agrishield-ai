# AgriShield AI Implementation Plan

Versi dokumen: 1.1 (update Mei 2026)

Dokumen ini menggambarkan kondisi implementasi aktual dan arah eksekusi teknis berikutnya.

## 1. Arsitektur Implementasi Saat Ini

```text
Client (Next.js)
  -> Nginx
    -> FastAPI API (backend)
      -> PostgreSQL (data utama)
      -> Redis (broker/result backend Celery)
      -> Celery Worker (task async)
      -> ML Service (FastAPI ONNX/mock)
      -> Cloudflare R2 (storage gambar)
```

### Service Runtime

- `frontend`: Next.js dev server
- `api`: FastAPI utama (`/api/*`)
- `worker`: Celery worker
- `ml-service`: inferensi model
- `db`: PostgreSQL (postgis image)
- `redis`: broker/cache
- `nginx`: reverse proxy

## 2. Modul yang Sudah Terpasang

### Backend API

- Health: `/api/health`
- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`
- Scans: create guest/auth, list user, detail
- Fields: CRUD lahan user
- Map: `/api/map/heatmap`
- Alerts: list + mark read
- Community: posts/comments/likes
- Dashboard user: `/api/dashboard/stats`
- Dashboard admin: `/api/admin/stats`

### Async Task

- `tasks.analyze_scan`: download image, call ML service, generate recommendation, simpan hasil
- `tasks.check_outbreaks`: deteksi outbreak periodik
- `tasks.check_outbreak_for_scan`: trigger outbreak check setelah scan selesai

### ML Service

- Endpoint: `POST /predict`
- Health: `GET /health`
- Mode:
  - Mock (`USE_MOCK_MODEL=true`)
  - ONNX (`USE_MOCK_MODEL=false`)

## 3. Kontrak Data Kritis

### Scan Flow

1. User upload image ke `/api/scans` atau `/api/scans/auth`
2. API simpan metadata scan + object key
3. Worker analisis async
4. Hasil tersedia via `/api/scans/{scan_id}`

### Dashboard Stats (User)

Field utama dari backend:

- `total_scans`
- `completed_scans`
- `disease_detected`
- `healthy_detected`
- `by_crop`
- `top_diseases`
- `timeline`

## 4. Konfigurasi Environment Aktif

### Backend

- `DATABASE_URL`
- `REDIS_URL`
- `ML_SERVICE_URL`
- `USE_MOCK_MODEL`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `R2_ENDPOINT`
- `R2_BUCKET_NAME`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_PUBLIC_URL`

### Frontend

- `NEXT_PUBLIC_API_BASE`
- `INTERNAL_API_BASE` (opsional untuk server-side fetch)

## 5. Gap Utama Saat Ini

1. Konsistensi deployment frontend production belum final.
2. CI frontend/backend masih perlu sinkron penuh dengan script aktual.
3. Cakupan test masih dasar untuk flow kompleks async.
4. Beberapa keputusan produk masih placeholder (mis. strategi fallback confidence rendah model).

## 6. Rencana Eksekusi Teknis Berikutnya

### Tahap 1 - Integrasi dan Konsistensi

- Finalisasi kontrak API lintas frontend-backend
- Rapikan pipeline CI agar fail-fast dan reproducible
- Samakan dokumentasi dev/prod command dengan script aktual

### Tahap 2 - Reliability

- Tambah integration test async scan + worker
- Tambah validasi upload size/mime secara ketat
- Monitoring error rate dan retry behavior Celery

### Tahap 3 - Feature Hardening

- Perbaiki kualitas alert clustering
- Tingkatkan UX map/community/dashboard
- Integrasi model ONNX tervalidasi untuk mode non-mock

## 7. Catatan Scope

- `ml-training/` tetap local-only (tidak menjadi sumber kebenaran di repo aplikasi)
- Source of truth API ada di `backend/app/api` dan `backend/app/schemas`
- Source of truth UI route ada di `frontend/src/app`

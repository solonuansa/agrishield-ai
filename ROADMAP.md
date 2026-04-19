# AgriShield AI — Roadmap Lengkap
**Versi:** 1.0.0 | **Tim:** 2–3 orang | **Metodologi:** Agile Sprint 2 minggu

---

## Ringkasan Phase

| Phase | Nama | Durasi Estimasi | Status |
|---|---|---|---|
| 0 | Foundation & Setup | 1–2 minggu | Belum mulai |
| 1 | MVP Core (Scan & Diagnosa) | 6–8 minggu | Belum mulai |
| 2 | Heatmap & Auth | 4–6 minggu | Belum mulai |
| 3 | Early Warning & Smart Recommendation | 4–6 minggu | Belum mulai |
| 4 | Community & Analytics | 4–6 minggu | Belum mulai |

**Total estimasi: 4–6 bulan** (fleksibel, tergantung kapasitas tim)

---

## PHASE 0 — Foundation & Setup
**Durasi: 1–2 minggu**  
**Tujuan: Semua anggota tim bisa mulai coding dengan environment yang sama dan terstandarisasi**

---

### Minggu 1: Project Setup

#### [P0-01] Inisialisasi Repository & Struktur Proyek
- Buat GitHub organization / repo `agrishield-ai`
- Setup branch strategy: `main` (production), `develop` (staging), `feature/*`
- Buat `README.md` dasar dan dokumentasi awal
- Setup `.gitignore` untuk Python, Node, Docker, env files
- Setup `CONTRIBUTING.md` dan pull request template

#### [P0-02] Setup Development Environment
- Buat `docker-compose.yml` untuk development:
  - PostgreSQL 16 + PostGIS
  - Redis 7
  - MinIO (S3-compatible local storage)
- Buat `Makefile` dengan command umum: `make dev`, `make test`, `make migrate`
- Dokumentasikan setup di README (one-command setup)

#### [P0-03] Inisialisasi Backend (FastAPI)
- Scaffold struktur folder FastAPI (`app/api`, `app/core`, `app/models`, dll)
- Setup konfigurasi via `pydantic-settings` + `.env`
- Koneksi database PostgreSQL dengan SQLAlchemy 2.x
- Setup Alembic untuk database migrations
- Setup Celery + Redis broker
- Buat health check endpoint `GET /health`

#### [P0-04] Inisialisasi Frontend (React + Vite)
- Scaffold dengan `npm create vite@latest` + TypeScript
- Install dan konfigurasi Tailwind CSS
- Setup React Router dengan struktur halaman dasar
- Setup Axios dengan interceptor (auth token, error handling)
- Setup Zustand untuk global state
- Setup React Query untuk server state

#### [P0-05] Setup CI/CD Dasar
- GitHub Actions: lint + test otomatis pada setiap PR ke `develop`
- Konfigurasi environment variables di GitHub Secrets
- Setup Docker build test (pastikan image bisa di-build)

#### [P0-06] Setup ML Training Environment
- Buat direktori `ml-training/` terpisah
- Setup virtual environment Python dengan `requirements.txt`
- Konfigurasi Weights & Biases untuk experiment tracking
- Download dan validasi dataset awal (PlantVillage dari Kaggle)
- Setup Label Studio untuk anotasi data lokal (opsional, jika ada data baru)

---

## PHASE 1 — MVP Core: Scan & Diagnosa
**Durasi: 6–8 minggu**  
**Tujuan: Pengguna bisa upload foto tanaman dan mendapatkan hasil diagnosis + rekomendasi penanganan**

---

### Sprint 1 (Minggu 1–2): Model Training Baseline

#### [P1-01] Data Preparation & EDA
- Download dataset PlantVillage, Rice Disease, Corn Disease
- Analisis distribusi kelas (class imbalance check)
- Exploratory Data Analysis: cek kualitas gambar, resolusi, variasi
- Pisahkan data: 80% train, 10% validation, 10% test
- Dokumentasikan statistik dataset

#### [P1-02] Pipeline Training Dasar
- Implementasi `DataLoader` dengan Albumentations augmentation
- Implementasi training loop dengan EfficientNet-B3 backbone
- Setup training dengan fase freeze → unfreeze (transfer learning)
- Training baseline pertama, catat metrics awal

#### [P1-03] Evaluasi & Export Model
- Evaluasi model pada test set: accuracy, per-class F1-score, confusion matrix
- Iterasi hyperparameter jika akurasi < 80%
- Export model ke format ONNX
- Validasi model ONNX (hasil harus identik dengan PyTorch)
- Upload model ke storage / artifact Weights & Biases

**Kriteria selesai:** Model ONNX dengan akurasi ≥ 80% pada test set

---

### Sprint 2 (Minggu 3–4): ML Service & Upload Gambar

#### [P1-04] ML Inference Service
- Buat FastAPI microservice baru (`ml-service/`)
- Implementasi endpoint `POST /predict`:
  - Terima gambar (bytes)
  - Preprocessing: resize, normalize
  - Inference dengan ONNX Runtime
  - Return top-3 prediksi + confidence score
- Tambahkan ke `docker-compose.yml`
- Unit test untuk preprocessing dan inference

#### [P1-05] Backend: Upload Gambar
- Implementasi `POST /scans` endpoint:
  - Validasi file (MIME type: jpg/png/webp, max 10MB)
  - Kompresi gambar dengan Pillow (resize ke max 1024px)
  - Upload ke MinIO/S3
  - Simpan record scan ke database dengan status `pending`
  - Push Celery task untuk proses analisis
  - Return `scan_id` ke frontend

#### [P1-06] Celery Task: Pipeline Analisis
- Implementasi Celery task `analyze_scan`:
  1. Ambil gambar dari storage
  2. Kirim ke ML Service
  3. Terima hasil prediksi
  4. Update record scan di database
  5. Push task berikutnya: generate rekomendasi

**Kriteria selesai:** Upload gambar → task berjalan di background → hasil tersimpan di DB

---

### Sprint 3 (Minggu 5–6): Rekomendasi & Frontend Scan

#### [P1-07] Backend: Generate Rekomendasi
- Implementasi Celery task `generate_recommendation`:
  - Bangun prompt terstruktur (penyakit + tanaman + lokasi + musim)
  - Panggil Anthropic API (Claude)
  - Parse response JSON dari LLM
  - Simpan ke tabel `recommendations`
  - Update status scan ke `done`
- Implementasi endpoint `GET /scans/:id` dan `GET /scans/:id/recommendation`
- Implementasi cache Redis untuk rekomendasi per kombinasi penyakit+tanaman

#### [P1-08] Frontend: Halaman Scan
- Komponen `ImageUploader`:
  - Drag & drop area
  - Klik untuk buka file dialog
  - Preview gambar sebelum upload
  - Indikator ukuran file
- Komponen `CropTypeSelector`: pilih padi atau jagung
- Logika upload + polling status via `GET /scans/:id/status`
- Loading state yang informatif ("Menganalisis gambar...")

#### [P1-09] Frontend: Halaman Hasil Deteksi
- Tampilan `DiseaseCard`:
  - Nama penyakit (besar, jelas)
  - Confidence bar (persentase)
  - 2 alternatif diagnosis dengan confidence lebih rendah
- Tab "Rekomendasi":
  - Penjelasan penyakit dalam bahasa sederhana
  - Langkah penanganan step-by-step dengan nomor
  - Daftar pestisida + dosis + metode
  - Tips pencegahan

**Kriteria selesai:** Alur upload → loading → hasil diagnosis → rekomendasi berjalan end-to-end di browser

---

### Sprint 4 (Minggu 7–8): Polish MVP & Stabilisasi

#### [P1-10] Error Handling & Edge Cases
- Tangani gambar bukan tanaman (confidence semua kelas < 40%): tampilkan pesan "Gambar tidak terdeteksi sebagai tanaman"
- Tangani timeout ML service
- Tangani Celery task failure: retry otomatis 3x
- Loading state dan error state yang user-friendly di frontend

#### [P1-11] Optimasi Performa
- Kompresi gambar di frontend sebelum upload (browser-side resize)
- Caching response rekomendasi di Redis (TTL 24 jam per penyakit)
- Optimasi query database dengan EXPLAIN ANALYZE

#### [P1-12] Testing & QA Phase 1
- Unit test backend: upload, task, endpoint
- Integration test: end-to-end alur scan
- Manual QA dengan 10+ gambar penyakit riil
- Fix bug yang ditemukan

#### [P1-13] Deployment Phase 1 ke VPS
- Setup VPS: install Docker, Docker Compose, Nginx
- Deploy semua service via `docker-compose.prod.yml`
- Setup SSL dengan Certbot
- Setup GitHub Actions CD ke VPS
- Smoke test production

**Output Phase 1:** MVP berjalan di production. Pengguna bisa scan foto dan mendapat diagnosis + rekomendasi.

---

## PHASE 2 — Heatmap & Autentikasi
**Durasi: 4–6 minggu**  
**Tujuan: Sistem multipengguna dengan heatmap penyebaran penyakit yang bisa dilihat publik**

---

### Sprint 5 (Minggu 1–2): Autentikasi & Profil Pengguna

#### [P2-01] Backend: Sistem Auth
- Implementasi `POST /auth/register` (validasi nomor HP + email)
- Implementasi `POST /auth/login` (return JWT access + refresh token)
- Implementasi `POST /auth/refresh`
- Middleware autentikasi JWT untuk endpoint protected
- Role-based guard: farmer, extension, admin, gov

#### [P2-02] Backend: Manajemen Lahan
- CRUD endpoint untuk tabel `fields`
- Simpan koordinat GPS lahan (dari input manual atau browser geolocation API)
- Hubungkan scan dengan field_id (opsional saat scan)

#### [P2-03] Frontend: Auth Flow
- Halaman Login (nomor HP / email + password)
- Halaman Register (nama, lokasi, jenis pengguna)
- Redirect ke dashboard setelah login
- Auto-refresh token yang expired
- Logout dan clear state

#### [P2-04] Frontend: Dashboard & Profil
- Halaman Dashboard: ringkasan scan terbaru, statistik singkat
- Halaman Histori Scan: list dengan filter & search
- Halaman Profil: edit data diri dan lokasi
- Halaman Manajemen Lahan: CRUD lahan

---

### Sprint 6 (Minggu 3–4): Heatmap Penyakit

#### [P2-05] Backend: Data Geospatial
- Saat scan selesai dan ada koordinat, simpan ke tabel `disease_reports`
- Implementasi endpoint `GET /map/heatmap`:
  - Query PostGIS: agregasi titik penyakit dalam radius tertentu
  - Return GeoJSON FeatureCollection
  - Filter opsional: penyakit, tanaman, rentang tanggal, provinsi
- Cache hasil heatmap di Redis (TTL 1 jam, invalidate saat ada report baru)

#### [P2-06] Frontend: Halaman Peta
- Integrasi Leaflet.js dengan tile OpenStreetMap
- Render GeoJSON dari API sebagai titik / circle marker
- Warna marker berdasarkan severity:
  - Hijau: 1–3 laporan
  - Kuning: 4–10 laporan
  - Merah: > 10 laporan dalam radius 5km
- Panel filter: pilih penyakit, rentang tanggal
- Klik marker: popup detail (jenis penyakit, jumlah laporan, tanggal terbaru)
- Kontrol zoom dan layer toggle

#### [P2-07] Capture Lokasi saat Scan
- Tambahkan tombol "Gunakan lokasi saya" di halaman scan
- Request browser Geolocation API
- Kirim koordinat bersama gambar ke backend
- Tampilkan preview lokasi pada map kecil di form scan

---

### Sprint 7 (Minggu 5–6): Histori & Stabilisasi Phase 2

#### [P2-08] Histori Scan per Lahan
- Endpoint `GET /fields/:id/scans`: riwayat scan untuk satu lahan
- Frontend: tampilkan timeline penyakit per lahan
- Filter: bulan, jenis penyakit

#### [P2-09] Testing & QA Phase 2
- Test autentikasi: register, login, token expiry, refresh
- Test heatmap dengan data seed
- Test geolocation capture di browser mobile
- Fix bug

#### [P2-10] Update Deployment
- Database migration untuk tabel baru
- Update environment variables jika ada yang baru
- Deploy dan smoke test

**Output Phase 2:** Sistem multipengguna dengan login, data lahan, dan heatmap penyebaran penyakit regional.

---

## PHASE 3 — Early Warning & Smart Recommendation
**Durasi: 4–6 minggu**  
**Tujuan: Sistem proaktif yang memberi peringatan dini dan rekomendasi berbasis konteks**

---

### Sprint 8 (Minggu 1–2): Early Warning System

#### [P3-01] Logika Deteksi Wabah
- Implementasi Celery Beat (periodic task scheduler)
- Scheduled task setiap 6 jam: `detect_outbreaks`
  - Query PostGIS: temukan cluster titik penyakit yang sama dalam radius 10km dalam 7 hari terakhir
  - Threshold wabah: ≥ 5 laporan penyakit sama dalam area tersebut
  - Generate alert baru jika belum ada alert aktif untuk area + penyakit yang sama
- Simpan ke tabel `alerts` dengan bounding polygon wilayah wabah

#### [P3-02] Backend: Sistem Notifikasi
- Endpoint `GET /map/alerts`: daftar alert aktif dengan GeoJSON polygon
- Endpoint `GET /users/me/alerts`: alert relevan berdasarkan lokasi user
- Implementasi push notification (gunakan Firebase Cloud Messaging atau WhatsApp Business API)
- Notifikasi dikirim ke user yang lokasinya dalam radius 20km dari wabah

#### [P3-03] Frontend: Tampilan Early Warning
- Banner alert merah di atas halaman dashboard jika ada wabah di dekat lokasi user
- Layer peta khusus: polygon area wabah dengan warna merah transparan
- Halaman detail alert: deskripsi wabah, penyakit, tanggal, saran tindakan
- Badge notifikasi di navbar

---

### Sprint 9 (Minggu 3–4): Smart Recommendation Engine

#### [P3-04] Integrasi Data Cuaca
- Integrasi dengan Open-Meteo API (gratis, tidak butuh API key)
- Ambil data cuaca berdasarkan koordinat user: suhu, curah hujan, kelembaban
- Cache data cuaca di Redis (TTL 3 jam)

#### [P3-05] Backend: Prompt Engineering Kontekstual
- Upgrade prompt rekomendasi LLM dengan konteks tambahan:
  - Cuaca saat ini (suhu, kelembaban, curah hujan)
  - Musim (hitung dari tanggal + lokasi Indonesia: hujan/kemarau)
  - Varietas tanaman (jika user mengisi di profil lahan)
  - Riwayat penyakit lahan yang sama (dari histori scan)
  - Alert wabah di sekitar (jika ada)
- Evaluasi kualitas rekomendasi vs versi sebelumnya

#### [P3-06] Frontend: Rekomendasi Enhanced
- Tampilkan konteks yang digunakan: "Berdasarkan cuaca [kota] hari ini..."
- Highlight penyakit yang sedang wabah di area user
- Tampilkan tips musiman yang relevan

---

### Sprint 10 (Minggu 5–6): Stabilisasi & Performance

#### [P3-07] Performance Optimization
- Load test dengan Locust: simulasi 50 concurrent users
- Identifikasi bottleneck dan optimasi
- Tuning jumlah Celery worker berdasarkan beban aktual
- Optimasi query PostGIS untuk heatmap (tambah indeks jika perlu)

#### [P3-08] Model Improvement (jika data lokal sudah terkumpul)
- Fine-tune model dengan data foto lokal Indonesia
- Re-evaluasi akurasi: harus ≥ 85% sebelum deploy model baru
- Versioning model: simpan versi lama sebagai fallback
- Deploy model baru dengan zero-downtime (swap model file)

#### [P3-09] Testing & Deployment Phase 3
- Integration test untuk early warning end-to-end
- Manual test notifikasi push
- Deploy ke production
- Monitor 1 minggu pertama secara intensif

**Output Phase 3:** Sistem aktif yang mendeteksi wabah, memberi peringatan, dan rekomendasi berbasis cuaca dan konteks lokal.

---

## PHASE 4 — Community & Analytics Dashboard
**Durasi: 4–6 minggu**  
**Tujuan: Ekosistem penuh dengan komunitas petani dan dashboard data untuk pemerintah/NGO**

---

### Sprint 11 (Minggu 1–2): Community Platform

#### [P4-01] Backend: Forum API
- CRUD endpoint untuk `posts` dan `comments`
- Endpoint like/unlike post
- Filter: terbaru, terpopuler, per kategori tanaman
- Moderasi: soft delete, report post
- Pagination untuk list post

#### [P4-02] Frontend: Halaman Komunitas
- Feed post dengan infinite scroll
- Form buat post: judul, konten, lampiran scan (opsional)
- Tampilan post detail dengan komentar
- Profil pengguna publik (nama, lokasi, jumlah kontribusi)
- Notifikasi komentar baru pada post sendiri

#### [P4-03] Gamification Dasar
- Badge "Kontributor Aktif" untuk pengguna dengan 10+ post
- Rating solusi: thumbs up/down pada komentar yang berisi solusi
- Sort komentar berdasarkan rating

---

### Sprint 12 (Minggu 3–4): Analytics Dashboard

#### [P4-04] Backend: Agregasi Data Analitik
- Endpoint `GET /admin/stats`:
  - Total scan, total pengguna, total penyakit terdeteksi
  - Filter per provinsi, kabupaten
- Endpoint `GET /admin/trends`:
  - Tren penyakit per minggu/bulan (format untuk grafik)
  - Perbandingan antar periode
- Endpoint `GET /admin/hotspots`:
  - 10 area dengan laporan terbanyak
  - Breakdown per jenis penyakit
- Endpoint `GET /admin/export`:
  - Export data sebagai CSV

#### [P4-05] Frontend: Dashboard Admin/Gov
- Halaman khusus untuk role `gov` dan `admin`
- KPI cards: total laporan, penyakit dominan, area rawan
- Line chart: tren penyakit 30/90/365 hari (Recharts)
- Bar chart: distribusi penyakit per tanaman
- Tabel hotspot dengan sortir dan filter
- Tombol export CSV data

---

### Sprint 13 (Minggu 5–6): Polishing & Go-Live

#### [P4-06] UX Improvement Berdasarkan Feedback
- Kumpulkan feedback dari pengguna awal (petani, penyuluh)
- Prioritaskan dan implementasikan improvement UX paling kritis
- A/B test jika memungkinkan

#### [P4-07] Dokumentasi Lengkap
- Dokumentasi API (Swagger/OpenAPI sudah auto-generate, rapikan)
- Panduan pengguna (PDF / halaman help dalam aplikasi)
- Panduan instalasi untuk tim baru / contributor
- Update CLAUDE.md dengan context terbaru

#### [P4-08] Security Audit
- Review semua endpoint: pastikan otorisasi benar
- Test penetrasi dasar (OWASP Top 10)
- Review rate limiting: apakah cukup untuk mencegah abuse?
- Pastikan tidak ada credential yang ter-commit ke repo

#### [P4-09] Final Deployment & Monitoring
- Setup monitoring: Prometheus + Grafana (atau alternatif seperti Better Uptime)
- Setup log aggregation (bisa gunakan Loki atau sekadar log file terstruktur)
- Setup alerting: notifikasi jika service down atau error rate tinggi
- Soft launch ke pengguna terbatas (50–100 petani pilot)
- Evaluasi 2 minggu, fix critical issues
- Full launch

---

## Backlog (Post-Phase 4)

Item-item berikut disiapkan untuk roadmap jangka panjang:

- **Mobile App** (React Native) untuk pengalaman lebih baik di smartphone petani
- **Offline Mode**: scan tersimpan lokal, sync saat ada koneksi
- **Multi-bahasa**: Jawa, Sunda, Bugis untuk penetrasi lebih dalam
- **Integrasi BMKG**: data cuaca resmi Indonesia
- **Ekspansi tanaman**: cabai, tomat, kedelai, singkong
- **Marketplace**: koneksi petani dengan toko pertanian terdekat
- **API publik**: untuk integrasi dengan sistem Kementan / Dinas Pertanian
- **Model pada edge**: TFLite untuk inferensi langsung di perangkat (tanpa internet)

---

## Definisi "Done" (Definition of Done)

Setiap task dianggap selesai jika:
1. Kode sudah di-push ke branch dan PR sudah di-merge ke `develop`
2. Unit test lulus (jika applicable)
3. Tidak ada regresi pada fitur sebelumnya
4. Sudah di-review minimal satu anggota tim lain
5. Dokumentasi inline (docstring / komentar) sudah ada untuk fungsi kompleks

Setiap phase dianggap selesai jika:
1. Semua task dalam phase sudah "Done"
2. Integration test phase lulus
3. Sudah di-deploy ke production dan smoke test lulus
4. Tidak ada critical bug terbuka

---

## Cara Penggunaan Dokumen Ini

- Review roadmap setiap awal sprint (2 minggu sekali)
- Tandai task yang sudah selesai
- Jika ada task yang melebihi estimasi, sesuaikan scope sprint berikutnya
- Tambahkan task baru di Backlog, jangan langsung masukkan ke sprint aktif tanpa diskusi tim
- Update estimasi durasi jika ada perubahan signifikan pada kapasitas tim

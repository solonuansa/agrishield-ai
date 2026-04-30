# AgriShield AI Roadmap

Versi dokumen: 1.1 (update Mei 2026)

## Ringkasan Status

| Phase | Fokus | Status | Catatan |
|---|---|---|---|
| 0 | Foundation & Setup | Selesai | Struktur service, CI dasar, migrasi awal selesai |
| 1 | MVP Core Scan | Sebagian besar selesai | Scan, async inference, rekomendasi, histori tersedia |
| 2 | Heatmap & Auth | Dalam pengerjaan | Auth, fields, map points sudah ada; perlu hardening |
| 3 | Early Warning | Dalam pengerjaan | Alert service dan task sudah ada; tuning logic diperlukan |
| 4 | Community & Analytics | Dalam pengerjaan | API dan halaman dasar sudah ada; perlu pendalaman fitur |

## Yang Sudah Berjalan di Kode

- API modul: `auth`, `scans`, `fields`, `map`, `alerts`, `community`, `dashboard`, `admin`
- Worker Celery untuk analisis scan dan deteksi wabah periodik
- ML service dengan mode `USE_MOCK_MODEL=true/false`
- Frontend route utama: `/`, `/scan`, `/history`, `/fields`, `/map`, `/community`, `/dashboard`, `/admin`

## Prioritas Sprint Berikutnya

### Sprint A - Stabilitas Integrasi

- Konsolidasi kontrak API frontend-backend (hindari mismatch schema)
- Rapikan CI (`type-check`, test frontend, setup DB test)
- Finalisasi strategi deploy frontend production (Next runtime vs static)
- Tambah validasi size upload image di backend

### Sprint B - Hardening Operasional

- Tambah test integration untuk scan async end-to-end
- Tuning deteksi klaster wabah dan parameter severity
- Tambah observability minimal (health checks, error logging konsisten)
- Perbaiki dokumentasi deployment production end-to-end

### Sprint C - Peningkatan Produk

- Perkaya dashboard (tren lebih detail, filter lanjutan)
- Perluas fitur komunitas (moderasi, paging UX, engagement)
- Integrasi model ONNX non-mock yang tervalidasi

## Milestone Rilis Internal

1. Rilis `v0.2.x` (Stabil Integrasi)
- Fokus: konsistensi API, CI hijau, deploy reproducible

2. Rilis `v0.3.x` (Hardened Platform)
- Fokus: reliability worker, alert quality, test coverage membaik

3. Rilis `v0.4.x` (Feature Maturity)
- Fokus: pengalaman komunitas + analytics lebih siap pilot

## Backlog Setelah v0.4

- Offline-first untuk histori
- Dukungan komoditas tambahan
- Integrasi data cuaca eksternal
- Mobile app khusus petani

## Definisi Done (Praktis)

Suatu task dianggap selesai jika:

- Kode sudah merge
- Lint/build/test relevan lulus
- Tidak merusak alur utama scan
- Dokumentasi yang terdampak ikut diperbarui

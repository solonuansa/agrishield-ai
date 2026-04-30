# CLAUDE.md - AgriShield AI Agent Guide

Dokumen ini adalah panduan singkat untuk agent yang bekerja di repository `agrishield-ai`.

## Konteks Proyek

- Frontend: Next.js App Router (`frontend/src/app`)
- Backend: FastAPI (`backend/app`)
- Async worker: Celery (`backend/app/tasks`)
- ML service: FastAPI (`ml-service/app`)
- Database: PostgreSQL
- Cache/broker: Redis

## Prinsip Kerja

1. Baca file terkait sebelum mengubah kode.
2. Jangan ubah `.env` atau kredensial.
3. Jangan hapus data/migrasi tanpa permintaan eksplisit.
4. Untuk perubahan schema DB, selalu sertakan migrasi Alembic.
5. Jangan ubah kontrak endpoint tanpa memastikan frontend/backend tetap sinkron.

## Source of Truth

- Endpoint: `backend/app/api`
- Schema response/request: `backend/app/schemas`
- Business logic: `backend/app/services`
- UI route: `frontend/src/app`
- API client frontend: `frontend/src/lib/api.ts` dan `frontend/src/lib/server-api.ts`

## Command Umum

```bash
# start local stack
docker compose up -d

# database migration
docker compose exec api alembic upgrade head

# backend tests
cd backend && pytest tests/ -v

# frontend checks
cd frontend && npm run lint && npm run build
```

## Catatan Integrasi

- Semua route backend di-mount dengan prefix `/api`.
- Scan default berjalan async melalui Celery task.
- Recommendation service memakai Google Gemini (bukan Anthropic/Claude API).
- Frontend dev port: `3000`.

## Checklist Sebelum Selesai Task

- Perubahan relevan sudah diuji minimal lint/build/test yang tersedia.
- Dokumentasi yang terdampak ikut diperbarui.
- Tidak ada perubahan yang tidak diminta pada file sensitif.

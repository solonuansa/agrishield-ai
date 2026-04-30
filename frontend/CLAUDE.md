# CLAUDE.md - Frontend Agent Guide

Panduan khusus agent untuk folder `frontend/`.

## Ruang Lingkup

- Implementasi UI di `src/app` dan `src/components`
- Integrasi API via `src/lib/api.ts` dan `src/lib/server-api.ts`
- Session/auth helper di `src/lib/auth.ts`

## Aturan Utama

1. Jangan ubah kontrak data sembarang; cocokkan dengan `backend/app/schemas`.
2. Untuk halaman protected, gunakan `ProtectedRoute`.
3. Utamakan TypeScript strict typing, hindari `any`.
4. Pastikan perubahan lolos:

```bash
npm run lint
npm run build
```

## Kebutuhan Runtime

- Dev port: `3000`
- API base default: `http://localhost:8000/api`

## Checklist

- Komponen tidak memecah style global secara tidak sengaja.
- Error/loading state tetap ditangani.
- Tidak menambahkan script npm yang tidak dipakai.

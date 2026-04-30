# AgriShield Frontend

Frontend AgriShield dibangun dengan Next.js App Router.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- TanStack React Query

## Menjalankan Lokal

```bash
cd frontend
npm install
npm run dev
```

Default berjalan di `http://localhost:3000`.

## Script yang Tersedia

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Struktur Utama

```text
frontend/
|-- src/app/            # route App Router
|-- src/components/     # komponen UI
|-- src/lib/            # util, auth, API client
|-- public/             # aset statis
```

## Integrasi API

Frontend membaca base URL dari:

- `NEXT_PUBLIC_API_BASE` (client-side)
- `INTERNAL_API_BASE` (server-side, opsional)

Fallback default: `http://localhost:8000/api`.

## Catatan

- Halaman yang butuh login memakai `ProtectedRoute`.
- Data fetch client-side memakai React Query.
- Build produksi wajib lulus sebelum merge.

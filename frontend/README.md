# AgriShield Frontend

AgriShield frontend built with Next.js App Router.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- TanStack React Query
- i18next + react-i18next (EN/ID bilingual)

## Running Locally

```bash
cd frontend
npm install
npm run dev
```

Default at `http://localhost:3000`.

## Available Scripts

```bash
npm run dev       # Start dev server
npm run lint      # Run ESLint
npm run build     # Production build
npm run start     # Start production server
npm run type-check # TypeScript check
npm run test      # Run Vitest
```

## Directory Structure

```text
frontend/
├── src/app            # App Router routes
├── src/components     # UI and feature components
├── src/lib            # Utilities, auth, API client, i18n
├── public             # Static assets
└── public/locales     # Translation JSON files
```

## API Integration

Frontend reads the base URL from:

- `NEXT_PUBLIC_API_BASE` (client-side)
- `INTERNAL_API_BASE` (server-side, optional)

Default fallback: `http://localhost:8000/api`.

## Internationalization

The app supports English (EN) and Indonesian (ID). Language can be toggled from the navbar. Preference is saved to `localStorage`.

Translation files are located at:

```
src/lib/i18n/locales/
├── en.json
└── id.json
```

## Notes

- Pages requiring authentication use `ProtectedRoute`.
- Data fetching uses React Query.
- Production builds must pass CI before merging.

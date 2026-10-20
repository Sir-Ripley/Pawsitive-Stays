# Pawsitive-Stays
A place for pet parents to receive feedback from hotel cleaning staff on there cleanliness. And a place for pet parents to connect, and discuss their stays with pet friendly, and not so pet friendly hotels/motels.

## How it works
- **Pet parents** create a profile and get a **Pawsitive Score (0–100)** with a tier badge (Bronze Paw → Silver Verified Guest → Gold Standard Pet Parent → AKC Diamond Exhibitor).
- Each stay generates a **printable QR tent card**. Hotel staff scan it after checkout — no login needed — and complete a 30-second room inspection (messes, room condition, noise & respect, crates/mats used, welcome back?).
- Every verified inspection recomputes the score, badge, and clean-room streak, giving high-scoring pet parents portable proof to request **lower or waived pet deposits**.
- The **community hotel directory** tracks real pet deposits (amount, refundable or not, weight limits, show-site notes) with reviews from fellow exhibitors.

## Stack
Next.js 15 (App Router, TypeScript) · Prisma ORM · Neon PostgreSQL (via Vercel) · Tailwind CSS · qrcode.react

## Key routes
- `/` — Pet parent dashboard: profile, score & badge, QR card studio, hotel community forum
- `/verify/[qrToken]` — zero-login staff inspection portal (mobile)
- `/api/profile` — profile GET/PATCH
- `/api/verify/[qrToken]` — card lookup (GET) + staff inspection submit (POST)
- `/api/hotels` — community hotel deposit directory & reviews (GET/POST)

## Environment
Database connection strings are injected by the connected Neon store (`POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`). The Vercel build runs `prisma db push` to keep the schema in sync.

## License
Apache 2.0 © R&R Droids — Rodney A. Ripley Jr.

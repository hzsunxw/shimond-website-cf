# Nimbus Site CMS — Agent Instructions

> **Supplement to `CLAUDE.md`** (which contains coding philosophy guidelines). This file adds repo-specific facts that are easy to miss.

---

## Verified Tech Stack

| Layer | Actual Usage |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.x (`strict: true`) |
| ORM | Prisma 5.x |
| Database | PostgreSQL 15 |
| Cache | Redis 7 |
| Styling | Tailwind CSS 3.x + shadcn/ui |
| Auth | **Custom JWT via `jose`** (not next-auth) |
| API | **Next.js Route Handlers** (`route.ts`) — tRPC is in `package.json` but unused |
| Tests | **None** — no test runner or test files exist |

⚠️ **Do not assume tRPC or next-auth are wired up.** `CLAUDE.md` mentions them, but the codebase uses plain Route Handlers and a custom JWT cookie scheme (`admin-token`).

---

## Quick Commands

| Task | Command |
|---|---|
| Dev server | `npm run dev` (binds `0.0.0.0`) |
| Type check | `npm run type-check` (`tsc --noEmit`) |
| Lint | `npm run lint` |
| DB migrate + generate | `npm run db:migrate` → `npm run db:generate` |
| DB seed | `npm run db:seed` (uses `tsx prisma/seed.ts`) |
| DB studio | `npm run db:studio` |
| Docker dev stack | `docker-compose up` (Postgres + Redis + app) |

**No `test` script exists.** Do not reference `pnpm test`.

---

## Architecture Notes

### Entry Points
- **`src/app/(site)/page.tsx`** → public homepage (based on `ver1/` design)
- **`src/app/admin/layout.tsx`** → sidebar + main content shell
- **`src/app/admin/login/page.tsx`** → admin login
- **`src/middleware.ts`** → protects `/admin/*` (except `/admin/login`) via `admin-token` cookie

### Frontend (Public Site)
The project now has a public-facing website rendered by Next.js App Router, based on the `ver1/` design:

| Route | File | Description |
|---|---|---|
| `/` | `src/app/(site)/page.tsx` | Homepage (Hero, Products, Features, About, Gallery, Contact) |
| `/{slug}` | `src/app/(site)/[slug]/page.tsx` | Dynamic CMS page renderer (reads `Page` model) |
| `/products` | `src/app/(site)/products/page.tsx` | Product list |
| `/products/{slug}` | `src/app/(site)/products/[slug]/page.tsx` | Product detail |
| `/cases` | `src/app/(site)/cases/page.tsx` | Case list |
| `/cases/{slug}` | `src/app/(site)/cases/[slug]/page.tsx` | Case detail |
| `/news` | `src/app/(site)/news/page.tsx` | News list |
| `/news/{slug}` | `src/app/(site)/news/[slug]/page.tsx` | News detail |
| `/contact` | `src/app/(site)/contact/page.tsx` | Contact page |

Shared components: `src/components/site/` (Header, Footer, HeroSection, ProductsSection, etc.)

### Public API Routes
Read-only endpoints for the frontend (no auth required):
- `/api/site/public` → `SiteConfig`
- `/api/pages/public` → active pages list
- `/api/pages/public/{slug}` → single page with modules
- `/api/products/public` → active `ServiceItem` list
- `/api/products/public/{slug}` → single product
- `/api/cases/public` → active `CaseItem` list
- `/api/cases/public/{slug}` → single case
- `/api/news/public` → active `NewsItem` list
- `/api/news/public/{slug}` → single news article

### API Pattern
All backend endpoints are **Next.js App Router Route Handlers** (`src/app/api/**/route.ts`). There is no `src/server/` directory with tRPC routers despite what `CLAUDE.md` says.

Example:
- `src/app/api/auth/login/route.ts` — POST, validates credentials, sets `admin-token` HTTP-only cookie
- `src/app/api/site-config/route.ts` — GET / PATCH

### Auth Flow
1. Login POST → bcrypt compare → `jose` SignJWT → `admin-token` cookie (24h)
2. Middleware reads cookie on every `/admin/*` request
3. No role-based access control — single `AdminUser` model

### Prisma Client Setup
`src/lib/prisma.ts` uses a **conditional singleton**:
- If `DATABASE_URL` is set → real `PrismaClient`
- If missing (dev) → falls back to `src/lib/prisma-mock.ts`
- Dev instance is stored on `global` to survive HMR

### Database Schema Overview
12 models in `prisma/schema.prisma`:
- `AdminUser`, `SiteConfig`, `Template`, `Page`, `PageModule`, `PageModuleTemplate`
- `ServiceItem`, `CaseItem`, `NewsItem`
- `Language`, `Translation` (i18n system)
- `CodeSnippet`, `Order`, `OrderItem`

Seed (`prisma/seed.ts`) creates:
- Default admin: `admin` / `admin123`
- 4 languages (zh, en, es, ar)
- 6 default pages (home, about, products, cases, news, contact)
- Default site config for "Shimond"

---

## Path Aliases

```
@/*      → ./src/*
@prisma/* → ./prisma/*
```

---

## Docker & Deployment

- **Dev**: `docker-compose.yml` uses `Dockerfile.dev` with volume mount for hot reload
- **Prod**: `docker-compose.prod.yml` uses multi-stage `Dockerfile` with `output: 'standalone'`
- Both require `openssl` in Alpine image for Prisma
- Dev DB: `nimbus_cms` / `postgres:postgres`
- Prod DB credentials via `DB_USER`, `DB_PASSWORD`, `DB_NAME`

---

## shadcn/ui Conventions

- Utility: `cn()` in `src/lib/utils.ts` (clsx + tailwind-merge)
- Theme tokens: CSS variables in `src/app/globals.css`
- Components: `src/components/ui/*` (Button, Card, Input, Label)
- Tailwind content paths include `./src/**/*.{ts,tsx}`

---

## Important Gotchas

1. **No tests.** Adding tests requires installing a runner first (Jest/Vitest + React Testing Library).
2. **tRPC deps are dormant.** `@trpc/*` packages are installed but nowhere imported. Do not introduce tRPC unless explicitly asked.
3. **next-auth is dormant.** `next-auth` v5 beta is in `package.json` but unused. Auth is fully custom.
4. **Mock Prisma in dev.** If `DATABASE_URL` is missing, `prisma` is a mock object. Some Prisma features may behave differently or fail silently.
5. **No CI/CD workflows.** `.github/workflows/` does not exist.
6. **`ver2/` is legacy.** Static HTML/CSS/JS prototype. Do not modify unless the request explicitly targets it.
7. **Admin UI is Chinese-first.** Most labels and API error messages are in Chinese.

---

## Database Change Workflow

1. Edit `prisma/schema.prisma`
2. `npm run db:migrate -- --name <descriptive>`
3. `npm run db:generate`
4. Verify types with `npm run type-check`
5. (Optional) `npm run db:deploy` to verify migration applies cleanly

---

## Environment Variables

Copy `.env.example` → `.env`. Key vars:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nimbus_cms?schema=public
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-in-production
REDIS_URL=redis://localhost:6379
```

OSS and SMTP vars are defined but unused in current code.

---

## Related Files

- `CLAUDE.md` — Coding philosophy (Karpathy principles) + aspirational conventions
- `prisma/schema.prisma` — Schema source of truth
- `docker-compose.yml` / `Dockerfile.dev` — Local dev environment
- `src/middleware.ts` — Route guard
- `src/lib/prisma.ts` — DB client singleton

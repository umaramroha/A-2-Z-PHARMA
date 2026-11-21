# A-2-Z PHARMA — Architecture

> Last verified against branch `chore/security-hardening`, commit `09118e587fb94806e54c77636d003aee00eea760` (21 Nov 2026). This document records observed architecture, not a proposed redesign.

## 1. Application stack

| Layer | Verified implementation |
|---|---|
| Web framework | Next.js 15.5.29, App Router |
| UI runtime | React 19.3.1 |
| Language | TypeScript |
| Styling | Tailwind CSS 3.4 |
| Database | PostgreSQL |
| ORM/client | Prisma 5.22 |
| Authentication/session | `iron-session` 8 |
| Password hashing | `bcryptjs` |
| Input validation | Zod |
| PostgreSQL driver dependency | `pg` |
| Hosting/build | Vercel |
| Package manager | pnpm 10.x on Vercel; frozen lockfile install |

The package is private and currently named `aq-website` in `package.json`. Do not infer customer-facing branding from this internal package name.

## 2. Repository and runtime structure

- Next.js App Router source lives under `src/app`.
- HTTP endpoints are implemented as route handlers under `src/app/api/**/route.ts`.
- Shared server-side utilities live under `src/lib`.
- Prisma schema is `prisma/schema.prisma`.
- Build and hosting configuration includes `package.json`, `pnpm-lock.yaml`, `vercel.json`, `next.config.mjs`, and `tsconfig.json`.

This document intentionally does not invent a complete page/component map. Add route-level diagrams only after checking the current route tree and its implementation.

## 3. Data model

The current Prisma schema defines these models:

- **Product** — catalogue data, slug, description, price/MRP, image, category, stock and active flag.
- **Order** — customer/contact and delivery address details, subtotal, delivery fee, total, order status, payment method/status, timestamps and optional Customer relation.
- **OrderItem** — product, quantity and recorded item price; belongs to an Order and references a Product.
- **AdminUser** — admin email, password hash storage field, role and creation timestamp.
- **Customer** — name, unique email, optional mobile, password hash storage field and related orders.
- **Banner** — title/subtitle, image URL, optional link/CTA, ordering, active flag and timestamps.

The schema's PostgreSQL connection is read from `DATABASE_URL`. Do not run migrations, `prisma db push`, SQL, seed scripts, or other database mutations as part of documentation or routine checks without explicit user approval.

**Known schema observation:** the rate-limit implementation has been observed using a PostgreSQL `RateLimit` table via raw SQL, but the current Prisma schema does not declare a RateLimit model. The table's existence in the connected database is unverified. Do not assume it exists or create it without explicit approval.

## 4. Authentication and sessions

- Customer session configuration is in `src/lib/session.ts`.
- Admin session configuration is in `src/lib/adminSession.ts`.
- Both currently read `SESSION_PASSWORD` and reject missing values or values shorter than 32 characters.
- Customer and admin sessions use distinct cookie names: `a2z-session` and `a2z-admin-session`.
- Both configurations set HTTP-only cookies, use `sameSite: lax`, set `secure` in production, and have a seven-day max age.
- Password hashing uses `bcryptjs`.

A separate admin signing secret is not currently configured in these files. Admin-session invalidation after password changes remains an identified security review item; do not claim it is solved.

## 5. Security and request handling

- Next.js response headers configured in `next.config.mjs`: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, and a restrictive `Permissions-Policy` for camera, microphone and geolocation.
- Vercel has also been observed returning HSTS on Preview and Production responses. HSTS is platform-observed behavior, not configured in the shown `next.config.mjs`.
- CSP is not currently configured in `next.config.mjs`; do not add a policy blindly without assessing Next.js scripts, styles, images and external services.
- API authorization must be checked in the relevant route/helper. Middleware cookie-presence checks alone are not proof of authorization.
- Rate-limit logic is in `src/lib/rateLimit.ts`; database availability and RateLimit table existence remain separate runtime dependencies.

## 6. Image handling

The current Next.js image configuration allows HTTPS images from `images.unsplash.com` and `plus.unsplash.com`. Other image providers must be confirmed against the current configuration before use. Do not change upload providers or image behavior as part of unrelated work.

## 7. Build and deployment

The current Vercel build command is:

```sh
pnpm prisma generate && pnpm run build
```

The Vercel install command is:

```sh
pnpm install --frozen-lockfile
```

Vercel uses the `chore/security-hardening` branch for Preview deployments. Production is associated with `main`. Do not merge, promote, or deploy Production without explicit user approval.

The latest documentation-only commit `09118e5` was picked up by Vercel on the Preview branch and its deployment reached **READY**. This verifies deployment/build status, not all runtime user journeys.

## 8. Package scripts and cautions

| Script | Command | Caution |
|---|---|---|
| `dev` | `next dev` | Local development |
| `build` | `next build` | Production compilation |
| `start` | `next start` | Runs built app |
| `lint` | `eslint .` | ESLint config/coverage must be verified before treating it as a reliable gate |
| `db:generate` | `prisma generate` | Generates client; does not intentionally mutate database |
| `db:push` | `prisma db push` | Database mutation; explicit approval required |

No dedicated test script was present in the inspected `package.json`. No GitHub Actions workflow files were found in the inspected target branch tree at the time of this review.

## 9. Architecture change rules

1. Preserve existing business workflows and database relationships.
2. Prefer focused, backwards-compatible changes.
3. Review every affected API route and caller before changing shared authentication, pricing, stock, order, or payment code.
4. Treat database schema changes and data operations as approval-gated.
5. Update this document only when verified architecture changes.
6. Use `AGENTS.md` as the permanent repository workflow and safety instruction source.

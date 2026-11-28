# A-2-Z Pharma

A small-business online catalogue and order-management website for Ayurvedic and Unani products. The application supports customer accounts, product browsing, cart/checkout, order tracking, and a protected Admin area.

## Current operating model

- Payment methods: **Cash on Delivery (COD)** and **manual UPI** only. There is no payment gateway.
- Manual UPI must be verified by staff and marked **PAID** before an order can be shipped.
- COD can be marked **PAID** only after delivery and collection.
- A refund is recorded manually only after staff has actually sent it. Eligible refunds can be recorded for cancelled or delivered orders.
- Stock is reserved transactionally when an order is created and restored on an eligible cancellation.
- Product listings and descriptions must contain owner-verified information. Website content is not medical advice.

## Technology

- Next.js 15 App Router, React 19 and TypeScript
- Prisma ORM with PostgreSQL (currently pinned to 5.22.0; upgrade to supported Prisma 7 is a pre-launch task requiring an adapter/config migration and isolated DB tests)
- Tailwind CSS
- iron-session customer/Admin sessions
- Vercel deployment and Cloudinary image uploads

## Local development

1. Install the pinned dependencies with `pnpm install --frozen-lockfile`.
2. Copy `.env.example` to `.env` and fill in local development values.
3. Generate the Prisma client with `pnpm db:generate`.
4. Start the development server with `pnpm dev`.

Useful commands:

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start local development |
| `pnpm build` | Create a production build |
| `pnpm start` | Start the production server locally |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript without emitting files |
| `pnpm test` | Run Node.js unit tests |
| `pnpm db:generate` | Generate the Prisma client; does not connect to the database |

## Environment variables

- `DATABASE_URL`: PostgreSQL connection string.
- `SESSION_PASSWORD`: unique secret of at least 32 characters for encrypted sessions.
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`: required for Admin banner/product image uploads.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD`: optional values only for intentionally running the guarded Admin bootstrap script. The password must be 12–128 characters and at most 72 UTF-8 bytes.

Never commit real `.env` files, database URLs, session secrets, or Admin credentials. `.env.example` contains placeholders only.

## Database safety

- Prisma schema and any future migrations must be reviewed before application.
- Do not use `prisma db push` against Preview or Production. The convenience `db:push` package command is intentionally not exposed.
- The application uses a raw SQL `RateLimit` table and `resetAt` index. The user previously reported creating these in Neon; the exact database target must be verified before any further database operation.
- Never run seed, SQL, migration, or schema scripts against a live database without explicit approval and a confirmed isolated target.

## Deployment safety

- Work on the `chore/security-hardening` branch and verify GitHub CI plus the matching Vercel Preview for each coherent commit.
- Preview is for build verification only until it is confirmed to use a database isolated from Production.
- Do not merge to `main`, promote a Preview, deploy Production, or change environment variables/secrets without explicit approval.

## Reference project

Amroha Pharmacy v2 is the read-only reference for compatible behavior and implementation patterns. Do not modify its repository or copy its business identity, contact details, policies, product claims, or legal information into A-2-Z Pharma.

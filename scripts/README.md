# Safe maintenance scripts

These scripts are deliberately not exposed as package scripts. They connect to the database and must only be used after the target database has been independently verified.

## create-ratelimit-table.js

Creates the external `RateLimit` table and `resetAt` index if they do not exist. It does not alter an existing table.

- Reads `DATABASE_URL` from the local `.env` file.
- Requires `ALLOW_DB_SCHEMA_SETUP=true` as an explicit opt-in.
- Uses the same `TIMESTAMP(3)` column type as the manually verified table.
- Never run against Production or Preview without explicit approval and a confirmed target.

## seed-admin.js

Creates an initial AdminUser only when the configured email does not already exist.

- Reads `DATABASE_URL` from the environment or local `.env`.
- Requires `ALLOW_DB_SEED=true` as an explicit opt-in.
- Requires `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- Password must be 12–128 characters and at most 72 UTF-8 bytes.
- Does not print credentials or change an existing admin account.

## Removed legacy scripts

The following one-off scripts were removed because they were unreferenced, stale, or could write obsolete/demo data or alter source files unexpectedly:

- `clean-notes.py`
- `create-tables.js`
- `fix-admin-date.js`
- `seed-products.js`
- `update-admin-apis.sh`
- `update-orders-table.js`

Use Prisma migrations for approved schema evolution; do not revive these scripts.

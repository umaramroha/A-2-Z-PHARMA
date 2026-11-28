# Safe maintenance scripts

These scripts are deliberately not exposed as package scripts. They connect to the database and must only be used after the target database has been independently verified.

## seed-admin.js

Creates an initial AdminUser only when the configured email does not already exist.

- Reads `DATABASE_URL` from the environment or local `.env`.
- Requires an explicit shell opt-in: `ALLOW_DB_SEED=true node scripts/seed-admin.js`.
- Reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from the environment or local `.env` file.
- Password must be 12–128 characters and at most 72 UTF-8 bytes.
- Does not print credentials or change an existing admin account.

## Removed legacy scripts

The one-off `create-ratelimit-table.js` helper was also removed after the RateLimit table and index were created manually. Do not re-create the table without confirming the target database and obtaining approval.


The following one-off scripts were removed because they were unreferenced, stale, or could write obsolete/demo data or alter source files unexpectedly:

- `clean-notes.py`
- `create-tables.js`
- `fix-admin-date.js`
- `seed-products.js`
- `update-admin-apis.sh`
- `update-orders-table.js`

Use Prisma migrations for approved schema evolution; do not revive these scripts.

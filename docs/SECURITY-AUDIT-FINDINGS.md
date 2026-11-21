# A-2-Z PHARMA — Security Audit Findings

**Audit branch:** `chore/security-hardening`  
**Inspected commit:** `0db761c1812e44469743fb995600b6dcfc1fa2b1`  
**Scope:** Read-only source inspection. No application code, schema, environment, or database was changed.

## Executive summary

The source-level review identified two important security/operational dependencies:

1. Admin password changes previously did not revoke older admin sessions. The no-schema password-hash-bound session remediation is now implemented across all discovered protected admin API routes.
2. Customer login, customer registration, and admin login depend on a raw PostgreSQL `RateLimit` table that is not represented in the Prisma schema. The helper intentionally fails closed when its database operation fails. The deployed table's actual presence and structure have not been verified.

These are source-level findings. No production database was queried, and no live authentication flow was exercised.

## SEC-01 — Admin password changes and session invalidation

### Current implementation status

**Admin implementation complete at source level; runtime flow not independently exercised.**

- `src/lib/adminSession.ts` defines the password-hash-bound admin session validator.
- Admin login stores the current database password hash inside the encrypted iron-session cookie.
- Protected admin API routes compare the session hash with the current database password hash before authorizing.
- Admin password updates rotate the current session's stored hash; older sessions retain the old hash and are rejected.
- The implementation uses the existing schema and does not require a migration.
- The discovered protected admin API routes were covered: banners, banner mutations, orders, order detail, products, product mutations, stats, settings, and admin session introspection.
- Login remains accessible to create a session; logout remains accessible to destroy a cookie.

### Remaining qualification

No customer password-change endpoint was found in the inspected API tree. Customer password-change/session-revocation behavior is therefore unverified, not a confirmed defect. The implementation has not been exercised through a live browser/API session test.

## SEC-02 — Rate limiting has a raw-table dependency

### Source evidence

- `src/lib/rateLimit.ts` performs a PostgreSQL atomic upsert against `"RateLimit"`, using columns `"key"`, `"count"`, and `"resetAt"`.
- The upsert is atomic for concurrent requests sharing a key. It starts a 15-minute window, increments the count within that window, and caps the stored count at six (one beyond the five allowed attempts).
- A request is allowed only while the returned count is at most five. The helper returns the remaining attempts and reset duration.
- Expired records are reset when the same key is used again. No scheduled cleanup or global expired-row cleanup was found in the inspected helper/script.
- `resetRateLimit` deletes the key after a successful customer/admin login. Errors in this deletion are caught and logged but not propagated, so a successful login can leave the old counter in place until its window expires or a later reset succeeds.
- Customer login uses `login:<normalized-email>`.
- Admin login uses `admin-login:<normalized-email>`.
- Customer registration uses `register:<IP>`. The IP is selected from the first `x-forwarded-for` value, falling back to `x-real-ip`, then `unknown`. The source comment itself notes that proxy configuration must be trusted; whether the deployed proxy sanitizes these headers was not established by this source-only audit.
- The helper catches query failures and returns `allowed: false` (fail closed). Therefore an unavailable/missing/incompatible table can block customer login, registration, and admin login.
- `prisma/schema.prisma` has no `RateLimit` model. This does not prove the raw table is absent; it may have been provisioned independently.
- `scripts/create-ratelimit-table.js` contains SQL to create the expected table with a text primary key, integer counter, timestamp-with-time-zone reset value, and an index on `resetAt`. The script reads a local `.env` file and connects to the configured database.

### Impact and risk

- **Availability dependency:** If the raw table is missing, inaccessible, or incompatible, all three authentication/registration entry points that call `checkRateLimit` fail closed.
- **Counter-reset reliability:** A failed post-login delete does not fail the login response, but can leave a counter in place and cause later attempts to be throttled earlier than expected.
- **Registration IP attribution:** The registration limit depends on trusted forwarding headers. The actual Vercel/proxy header behavior was not verified here.
- **Data lifecycle:** The inspected implementation has no periodic cleanup for keys that are never used again. Expired keys are only reset on a subsequent request for that same key; the table may therefore accumulate stale rows.
- **Schema visibility:** The Prisma schema does not describe the raw table, so Prisma schema inspection alone cannot establish whether the deployed table exists or matches the SQL contract.

### Safe next step

Verify table existence, columns, primary key, and index through an explicitly approved read-only database inspection or the provider's schema viewer. Also verify the trusted proxy behavior for registration IP headers.

Do not run `scripts/create-ratelimit-table.js`, `CREATE TABLE`, migrations, `db push`, or any write operation without explicit approval. Do not assume the table is missing based only on the Prisma schema. No database inspection was performed during this audit.

## Additional observations

- `src/app/admin/settings/page.tsx` previously had a six-character password minimum message while the server requires at least twelve. This UI/server mismatch remains a separate small UI task unless already corrected in a later commit.
- The inspected customer API tree includes login, registration, profile update, and logout, but no customer password-change route was found.
- Customer and admin iron-session cookies use the shared `SESSION_PASSWORD`, with distinct cookie names.
- No live authentication, rate-limit, proxy-header, or database behavior was tested.

## Explicit non-actions

- No source code was modified as part of the audit itself.
- No Prisma schema or migration was changed.
- No SQL, database query, seed, or table-creation script was run.
- No environment variables or secrets were read or changed.
- No production deployment, merge, or promotion was performed.

## Next audit sequence

1. Obtain explicit approval for a read-only inspection of the deployed `RateLimit` table, or use the database provider's read-only schema viewer.
2. Review SEC-03 customer API ownership checks and remaining authorization boundaries.
3. Review SEC-04 security headers and CSP feasibility.
4. Correct the admin settings page's six-versus-twelve character validation copy as a separate focused UI change.
5. Continue the core commerce authorization and checkout audit.


## SEC-03 — Admin and customer API authorization review

### Scope inspected

Read-only review of the complete discovered `src/app/api/**` route tree, the shared customer/admin session helpers, and `src/middleware.ts`. No requests were sent to authenticated endpoints and no database operations were performed.

### Findings

**Admin API authorization**

- All discovered protected admin data/mutation endpoints use `getValidAdminSession()`: banners collection and item mutations, orders collection and item routes, products collection and item routes, stats, settings, and admin session introspection.
- The shared helper validates the encrypted session's admin ID and stored password hash against the current `AdminUser.password` value in the database.
- Admin login is intentionally public because it creates the session. Admin logout is intentionally accessible so it can destroy a session even when stale.
- No uncovered protected admin API route was found in the current recursive API tree.

**Customer API authorization and ownership**

- `GET /api/orders` and `POST /api/orders` both require a customer session with `isLoggedIn` and `userId`.
- Order listing is filtered by `customerId: session.userId`.
- `GET /api/orders/[id]` requires a customer session and explicitly compares the fetched order's `customerId` with the session user ID, returning 403 for a different owner.
- `PATCH /api/auth/update-profile` requires a customer session and updates only the record addressed by `session.userId`; client input cannot choose a customer ID.
- `GET /api/auth/me` returns only a limited customer projection and destroys the session if its customer record no longer exists.
- Customer login/register intentionally create a session; logout intentionally destroys it without requiring an existing valid session.
- No direct customer ownership bypass was identified in these inspected routes.

**Public read endpoints**

- `GET /api/products`, `GET /api/products/[slug]`, and `GET /api/banners` are public catalogue/banner endpoints. The product endpoints filter to active products; the banner endpoint filters to active banners.
- These are expected public storefront reads, not admin mutation endpoints.

**Middleware boundary**

- `src/middleware.ts` protects the `/admin/:path*` page area by checking whether the admin cookie exists. It does not cryptographically validate the cookie or authorize API requests.
- This is only a page-navigation gate. It must not be treated as the security boundary. Protected API routes must continue to call `getValidAdminSession()` directly; the reviewed protected admin APIs do so.
- Middleware sets `Cache-Control: no-store, must-revalidate` on matched admin pages and on the non-admin/login pass-through path.

### Remaining limitations / follow-up

- Customer sessions are not currently bound to the customer's current password hash. No customer password-change endpoint was found, so password-change revocation is not an available workflow today. If customer password changes or account disable/delete functionality is added, session invalidation must be designed as part of that feature.
- The review is source-only. It does not prove runtime authorization behavior under forged cookies, stale cookies, concurrency, or deployed configuration.
- Consider a future dedicated automated test suite covering unauthenticated access, customer A attempting to read customer B's order, valid owner access, stale/deleted customer sessions, and all admin API methods. No such test execution is claimed here.

### SEC-03 conclusion

**No confirmed customer order-ownership bypass or uncovered protected admin API endpoint was found in the inspected tree.** The middleware cookie-presence check is not sufficient by itself, but the reviewed admin APIs perform their own shared session validation. This item is source-audited; runtime tests remain outstanding. No code fix is justified by the evidence in this audit.


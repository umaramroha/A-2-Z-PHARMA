# A-2-Z PHARMA — Security Audit Findings

**Audit branch:** `chore/security-hardening`  
**Inspected commit:** `25d1897bb6ac9ebcf4210f10ddf233f71aa0267a`  
**Scope:** Read-only source inspection. No application code, schema, environment, or database was changed.

## Executive summary

Two high-priority operational/security items need attention:

1. **Admin sessions are not revoked after an admin password change.** The current cookie is stateless and the admin API handlers generally trust its signed-in flag and admin ID without checking the current database password hash.
2. **Authentication depends on a raw PostgreSQL `RateLimit` table that is not represented in the Prisma schema.** Rate limiting intentionally fails closed, so a missing/unavailable table blocks customer registration and customer/admin login. The table's actual presence in the deployed database has not been verified.

These are source-level findings. No production database was queried, and no live authentication flow was exercised.

## SEC-01 — Admin password changes do not revoke existing sessions

### Evidence

- `src/lib/adminSession.ts` configures an iron-session cookie named `a2z-admin-session`, signed/sealed with the shared `SESSION_PASSWORD`, with a seven-day max age.
- `src/app/api/admin/login/route.ts` stores `adminId`, `email`, `role`, and `isAdminLoggedIn` in the session. It does not store a server-checked session version or password-change marker.
- `src/app/api/admin/settings/route.ts` verifies the current password and writes a new bcrypt password hash when `newPassword` is supplied. It does not revoke the session after a password change. It only updates and saves the current session when the email changes.
- The `AdminUser` model in `prisma/schema.prisma` has no `passwordChangedAt` or `sessionVersion` field.
- The admin API route handlers inspected (`banners`, `orders`, `products`, `stats`, and settings) authorize using `isAdminLoggedIn` plus `adminId`. Those guards do not compare the session to the current admin password hash. `/api/admin/me` checks whether the admin record still exists, but does not check whether the password has changed.
- The middleware checks only whether the admin cookie exists; it is not an authorization boundary for API operations.

### Impact

If an admin changes their password, another browser/device holding an older, unexpired admin cookie can continue using the protected admin APIs until that cookie expires, is destroyed locally, or the global session signing secret is rotated. Changing the password alone does not invalidate the other sealed cookies.

### Candidate remediation (not implemented)

A no-schema approach may be possible: include the current stored admin password hash in the sealed session at login, then validate it against the current database value in a shared server-side admin guard on every protected admin API request. On password change, the current session can be updated with the new hash; other sessions retain the old hash and are rejected. This requires updating every admin API authorization path and carefully checking that the hash is never returned in API responses or exposed to client-side code.

Alternative: add a dedicated session-version/password-change field to `AdminUser` and validate it on each protected request. This requires a Prisma schema change and a database migration, so it is outside current approval.

**Recommendation:** prioritize a complete no-schema remediation design and route inventory before changing code. Existing sessions may need to sign in again after rollout.

## SEC-02 — Rate limiting has a raw-table dependency

### Evidence

- `src/lib/rateLimit.ts` uses raw SQL against PostgreSQL table `"RateLimit"` for atomic upsert and deletion.
- The helper catches database/query errors and returns `allowed: false` for `checkRateLimit` (fail closed).
- Customer login, customer registration, and admin login call this helper.
- `prisma/schema.prisma` does not define a `RateLimit` model.
- `scripts/create-ratelimit-table.js` contains SQL to create the table and its `resetAt` index by connecting to the database using a local `.env` file.

### Impact

The missing Prisma model does not prove the raw table is absent: it may have been created separately. However, if the table is absent, inaccessible, or incompatible, the fail-closed behavior blocks login and registration rather than silently allowing unthrottled attempts.

### Safe next step

Verify table existence through an explicitly approved, read-only database inspection or the database provider's schema viewer. Do not run `scripts/create-ratelimit-table.js`, `CREATE TABLE`, migrations, `db push`, or any write operation without explicit approval. Do not assume the table is missing based only on the Prisma schema.

## Additional observations

- `src/app/admin/settings/page.tsx` still tells admins the new password minimum is six characters, while the server schema requires at least twelve. This is a UI validation/message mismatch; the server remains authoritative.
- The inspected customer routes include login, registration, profile update, and logout, but no customer password-change route was found in the inspected API tree. Customer password-change/session-revocation behavior therefore remains unverified rather than being reported as a confirmed password-change defect.
- Both customer and admin iron-session cookies use the shared `SESSION_PASSWORD`, but distinct cookie names.
- No session revocation, password-change, or rate-limit behavior was tested against production data.

## Explicit non-actions

- No source code was modified.
- No Prisma schema or migration was changed.
- No SQL, database query, seed, or table-creation script was run.
- No environment variables or secrets were read or changed.
- No production deployment, merge, or promotion was performed.

## Next audit sequence

1. Design and review the complete admin session invalidation fix, including every protected admin API route.
2. Establish an approved read-only way to verify the raw `RateLimit` table and its columns/index.
3. Correct the admin settings page's six-versus-twelve character validation copy as a separate small UI change.
4. Continue the core commerce authorization and checkout audit.

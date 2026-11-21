# A-2-Z PHARMA — Security Audit Findings

**Audit branch:** `chore/security-hardening`  
**Inspected commit:** `1beda00edfb6afdee036f876a5fb8ed5a5284767`  
**Scope:** Read-only source inspection. No application code, schema, environment, or database was changed.

## Executive summary

The source-level review identified three important security/operational dependencies:

1. Admin password changes previously did not revoke older admin sessions. The no-schema password-hash-bound session remediation is now implemented across all discovered protected admin API routes.
2. Customer login, customer registration, and admin login depend on a raw PostgreSQL `RateLimit` table that is not represented in the Prisma schema. The helper intentionally fails closed when its database operation fails. The deployed table's actual presence and structure have not been verified.
3. Admin/customer API authorization source review found no confirmed ownership bypass or uncovered protected admin API endpoint. Runtime tests remain outstanding.

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
- `resetRateLimit` deletes the key after a successful customer/admin login. Errors in this deletion are caught and logged but not propagated, so a successful login can leave the counter in place until its window expires or a later reset succeeds.
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

## SEC-04 — Security headers and Content Security Policy feasibility

### Scope inspected

Read-only inspection of `next.config.mjs`, `src/middleware.ts`, root layout, global CSS, homepage, banner/product sliders, header/footer, WhatsApp link component, image configuration, and the recursive application source tree at commit `1beda00edfb6afdee036f876a5fb8ed5a5284767`.

### Existing protections

`next.config.mjs` already applies these response headers to `/:path*`:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

The admin middleware also sets `Cache-Control: no-store, must-revalidate`. No duplicate or conflicting header configuration was found in the inspected `vercel.json` or middleware source.

### Gaps and CSP constraints

- No `Strict-Transport-Security` header is currently configured in `next.config.mjs`. The deployed site is served through Vercel HTTPS; HSTS is a reasonable focused hardening addition, but should be applied only to HTTPS responses and should not include `preload` without a separate domain/subdomain readiness decision.
- No Content Security Policy is currently configured.
- A strict CSP cannot safely be guessed from the current source. Next.js App Router emits framework scripts; the root layout uses `next/font/google` (font files are normally self-hosted in the build output); the banner and product components render image URLs supplied dynamically by stored records; Next image configuration currently allowlists Unsplash hosts, while the ordinary `img` elements can load other record-provided URLs.
- The WhatsApp component navigates to `https://wa.me`; this is a top-level link rather than an embedded frame. No third-party script tag or embedded third-party iframe was found in the inspected root layout and key storefront components.
- The WhatsApp button uses an inline style attribute. A strict style policy would need to account for inline style attributes; Next.js script execution would need a nonce/hash strategy or carefully justified directives. No nonce propagation is currently implemented in middleware.
- The database-backed banner/product image host inventory is not known from source inspection alone. Adding a restrictive `img-src` policy now could silently break stored images.

### Conclusion and safe next steps

**Existing baseline headers are present; HSTS is a confirmed omission. CSP is not ready for enforcement based on the current evidence.**

1. Add HSTS as a separate, focused configuration change with a one-year max-age; do not add `includeSubDomains` or `preload` without verifying all relevant domains.
2. Before CSP enforcement, inventory actual production/Preview image origins and any future third-party integrations. Then design a nonce-aware Next.js CSP or a carefully scoped report-only rollout.
3. Do not use `unsafe-eval` or a broad `unsafe-inline` policy as a shortcut. Do not block existing dynamic image hosts based only on the current static allowlist.
4. Verify actual response headers on the Preview after the HSTS change. This source audit does not claim a live header test.

No CSP or header code was changed during this audit.


## COM-01 — Checkout and order creation audit

**Inspected commit:** `434d270ccb6df94a90c4f74f92ff22833164600b`  
**Scope:** Read-only source trace of checkout UI, cart state, customer session, order API, product/order schema, and delivery configuration. No live order was placed and no database was queried or changed.

### Verified protections

- `POST /api/orders` requires an authenticated customer session and derives `customerId` from `session.userId`; the client cannot choose the order owner.
- The server validates customer name, mobile, optional email, address, city, state, six-digit pincode, payment method, and item array with Zod. Item count is limited to 1–50 and each submitted quantity to 1–100.
- The server ignores client-supplied prices, subtotal, delivery fee, and total. It fetches active products and calculates each line from the current database price.
- Duplicate product IDs are merged before stock validation. The combined quantity for one product cannot exceed 100.
- Product availability and stock are checked inside a Prisma transaction. Stock is decremented using a conditional `updateMany` predicate requiring the product to remain active and have sufficient stock; a failed decrement throws and rolls back the transaction.
- Order creation and stock decrement occur in the same transaction. The persisted order stores the server-calculated subtotal, delivery fee, and total, plus product prices copied from the database.
- The current target business rule is consistent in the checkout UI, cart UI, server API, and `src/lib/config.ts`: delivery is ₹50 below ₹500 and free at ₹500 or above. The API is authoritative.
- The server sets new orders to `PENDING` and payment status to `PENDING`. It does not mark UPI orders paid merely because the customer selected UPI.
- Invalid input returns 400; unavailable/inactive products and insufficient stock return 409. The customer order list is scoped to the authenticated user, and the order-detail route checks ownership.

### Findings and risks

1. **No server-side idempotency protection was found.** The checkout button is disabled while the browser's request is in flight, but that is only a client-side guard. A repeated request, retry after a lost response, or two concurrent requests can create two separate orders (and reserve stock twice) if stock remains available. This is a duplicate-order risk, not a price/stock bypass. Consider a future idempotency design before adding automatic retries or payment callbacks; do not add a schema field or database constraint without approval.
2. **UPI is currently a manual/pending workflow, not a verified online payment.** The checkout screen displays placeholder text that the QR code will be added later, yet allows the customer to place an order with `paymentMethod: "upi"`. The API correctly leaves `paymentStatus: "PENDING"`. The UI must not imply that payment has been received. Actual payment confirmation and admin/manual status transitions belong in COM-02.
3. **Mobile validation is syntactic, not a strict digit-count check.** The API permits 10–20 characters from digits, plus, parentheses, spaces, and hyphens, but does not verify a meaningful number of digits or normalize the number. This can accept malformed values made mostly of punctuation. A future validation improvement should preserve legitimate Indian/international formats and be tested before implementation.
4. **Delivery rule values are duplicated in source.** The same ₹50 / ₹500 rule currently matches `src/lib/config.ts`, cart, checkout, and API, but UI and server literals can drift during future changes. The server-side calculation remains authoritative. Centralization can be considered as a focused maintenance change after COM-03 confirms all delivery edge cases.
5. **The checkout form sends extra client fields** (`price`, `subtotal`, `deliveryFee`, `total`) that the server does not trust or use. This is not currently an integrity vulnerability because server values are recalculated, but the unused payload is unnecessary and can be cleaned up separately after confirming no compatibility dependency.

### COM-01 conclusion

**Server-side pricing, active-product checks, stock reservation, customer ownership, and atomic order persistence are implemented in the inspected source.** No client-price manipulation or direct inactive-product purchase path was identified in this order-creation route. The main confirmed commerce risks are duplicate order submissions without server idempotency and the unfinished/manual UPI presentation; phone-number validation is comparatively weak. Runtime concurrency, duplicate-submit, and real payment tests were not performed.

### Explicit non-actions

- No checkout or API code was changed.
- No order was created and no stock was reserved.
- No database query, SQL, migration, seed, or schema change was performed.
- No payment settings, credentials, or production configuration were changed.
- No production deployment, merge, or promotion was performed.

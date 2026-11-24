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


## COM-02 — COD/UPI and order/payment status transition audit

**Inspected commit:** `31fdbdf616a9bd78d488e0f9da57be1a79857ac0`  
**Scope:** Read-only inspection of checkout payment UI, order-creation API, admin order detail API, admin orders UI, and Prisma Order schema. No payment was made, no order was updated, and no database was queried or changed.

### Current state model

- New orders are created with order `status: PENDING` and `paymentStatus: PENDING`, regardless of whether the selected method is `cod` or `upi`.
- The server explicitly does not treat UPI selection as proof of payment.
- Admin order status transitions are monotonic through `PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED`; cancellation is allowed only from `PENDING`, `CONFIRMED`, or `PROCESSING`. `DELIVERED` and `CANCELLED` are terminal for order status.
- Payment transitions implemented in the API are `PENDING → PAID` or `FAILED`, `FAILED → PENDING`, and `PAID → REFUNDED`. `REFUNDED` is terminal.
- Admin PATCH requests validate the requested values and perform a compare-and-set update inside a Prisma transaction. If the stored order/payment state changed concurrently, the request returns a conflict rather than blindly overwriting it.
- Cancellation restores each ordered product's stock in the same transaction as the order status change. The compare-and-set guard prevents two concurrent status updates from both winning and restoring stock twice.
- The current admin orders page exposes order-status buttons only. It displays payment status as read-only text; there is no visible payment-status control in this page.

### Findings and risks

1. **UPI is not actually payable through the current checkout UI.** The option is labelled “UPI Payment (QR Code)” and tells the customer to scan a QR code, but the QR area explicitly says the code will be added after payment integration. The page then says “After payment, place your order below.” No QR, UPI intent, payment provider, transaction reference, or server-side payment verification flow was found in the inspected checkout/API source. The API correctly leaves the order payment status pending. This is a confirmed incomplete checkout experience; customers should not be led to believe a payment was accepted or verified.
2. **Payment transitions are not constrained by payment method.** The same API transition function applies to COD and UPI. Source does not prevent a COD order from being marked `PAID`/ `REFUNDED`, nor require a UPI-specific verification step before `PAID`. Admin authentication is required, but no method-specific invariant exists.
3. **Order and payment states are not cross-validated.** The PATCH schema allows an order status and payment status to be changed independently. The code does not prevent marking a cancelled order paid, marking a delivered order refunded without a defined refund workflow, or cancelling a paid order without simultaneously recording a refund. These combinations may be operationally legitimate in some businesses, but the current rules do not define them.
4. **The UI does not provide payment-status management.** The admin page can change order status but only displays payment status. The API supports payment-status changes, but no control in the inspected page exposes them. This creates a gap between API capability and the normal admin workflow.
5. **No payment evidence/audit trail is stored in the Order model.** The schema has payment method and status only; no transaction/reference ID, provider event ID, paid-at timestamp, refund reference, or status-history model was found. This limits independent reconciliation of manual UPI receipts and refunds. No schema change is proposed without explicit approval.
6. **No gateway callback or webhook path was identified in the inspected API route tree.** This supports the conclusion that there is no automated payment verification in the current implementation; it does not rule out out-of-band/manual confirmation by the business.

### COM-02 conclusion

**The backend has guarded, transactional status transitions and protects against concurrent duplicate cancellation stock restoration. However, payment handling is only a basic manually administered status field, not a payment integration.** The UPI checkout UI presents a QR payment step that is not implemented. The API also lacks payment-method and cross-state invariants, while the admin page does not expose payment status controls. These are source-level findings; no runtime payment or refund tests were performed.

### Recommended next steps (audit only; no implementation authorized here)

- Decide whether UPI should remain temporarily unavailable, be clearly presented as “manual payment — contact us for details,” or be integrated with a real provider after business/provider details are supplied.
- Define allowed COD and UPI state transitions separately, including what proof is required before marking an order paid.
- Define whether a paid order may be cancelled and how refunds are represented; define whether delivered orders can be refunded.
- Add a visible, authenticated admin payment workflow only after those business rules are confirmed.
- Consider an auditable payment-reference/history design only with explicit schema-change approval.

### Explicit non-actions

- No payment provider, QR code, UPI ID, webhook, or credentials were added.
- No order/payment state was changed.
- No admin UI or API code was modified.
- No Prisma schema, migration, SQL, database, or environment configuration was changed.
- No production deployment, merge, or promotion was performed.


## COM-03 — Delivery fee and pincode behavior audit

**Inspected branch:** `chore/security-hardening` at the current audit commit.  
**Scope:** Read-only inspection of `src/lib/config.ts`, cart and checkout pages, `POST /api/orders`, and the discovered `src/app/api/**` route tree. No delivery quote was requested from an external carrier, no order was placed, and no database was queried or changed.

### Current delivery rules

- `src/lib/config.ts` declares `deliveryConfig.areas: ["All India"]`, `fee: 50`, and `freeAbove: 500`.
- Cart UI displays free delivery when subtotal is ₹500 or more; otherwise it displays ₹50. An empty cart is explicitly shown with zero delivery fee.
- Checkout UI calculates ₹0 delivery at ₹500 or more and ₹50 below ₹500.
- The order API independently recalculates the fee from the database-derived subtotal: ₹0 at ₹500 or more and ₹50 below ₹500. Client-supplied subtotal, delivery fee, and total are not trusted.
- Therefore the currently inspected UI/API calculations agree on the ₹500 threshold and ₹50 fee. The API remains authoritative for persisted orders.

### Pincode and serviceability behavior

- Checkout collects a pincode as a required text field.
- The server Zod schema trims it and accepts exactly six numeric digits (`/^\d{6}$/`). This is format validation only.
- No postal lookup, pincode-to-city/state verification, delivery-zone lookup, carrier serviceability API, shipping-rate API, or pincode-specific fee rule was found in the inspected application API tree.
- The `areas: ["All India"]` setting is descriptive configuration; the checkout/order API does not consult it to determine serviceability.
- The submitted city, state, and pincode are stored as customer-entered address fields. The inspected order route does not cross-check that they correspond to one another.
- No pincode autofill or serviceability feedback is implemented in the inspected checkout page.

### Findings and risks

1. **No actual pincode serviceability check exists in the inspected flow.** A syntactically valid six-digit pincode can be submitted regardless of whether the business/carrier can deliver there. The “All India” configuration does not enforce coverage.
2. **City/state/pincode consistency is not verified.** Customer-entered city and state can disagree with the pincode. This is an address-quality/fulfilment risk, not a pricing-integrity bypass.
3. **Delivery fee is duplicated in four places.** Config declares the values, while cart, checkout, and API each contain fee/threshold logic. They currently match, but future edits can drift. Centralizing the constants would reduce maintenance risk; any change must preserve the existing ₹50 below ₹500 / free at ₹500+ business rule.
4. **No location-specific delivery surcharge or exclusion is implemented.** The current behavior is one flat fee/free-threshold rule; do not infer carrier coverage or promise universal delivery from the configuration label alone.
5. **Pincode validation accepts only ASCII digits.** This is a format constraint, not proof that the postal code exists or is serviceable. No validation change is proposed in this audit.

### COM-03 conclusion

**The current rule is a flat ₹50 delivery fee below ₹500 and free delivery at/above ₹500, with no pincode-based serviceability or location-specific pricing logic found in the inspected source.** UI and server calculations match today; server-side pricing remains authoritative. The principal gaps are missing delivery-coverage verification, no city/state/pincode consistency check, and duplicated fee constants. No runtime carrier integration or real-world delivery coverage was tested.

### Explicit non-actions

- No delivery fee, threshold, coverage, or address rule was changed.
- No postal lookup or carrier provider was integrated.
- No customer address or order was created or modified.
- No database query, SQL, migration, seed, or schema change was performed.
- No production deployment, merge, or promotion was performed.



## COM-04 — Cancellation, ownership, and stock restoration audit

**Inspected branch:** `chore/security-hardening` at commit `9e1320cde9c5710fcdc7c65fcab690b98bc56e30`.  
**Scope:** Read-only inspection of the complete discovered `src/app/api/**` route tree, customer order list/detail pages, admin order page, customer/admin order APIs, product delete API, and Prisma Order/OrderItem/Product relations. No endpoint was called, no order was changed, and no database was queried or modified.

### Cancellation paths and ownership

- The customer API route `GET /api/orders/[id]` is read-only. It requires a logged-in customer session, loads the order, and explicitly compares `order.customerId` to `session.userId`; a non-owner receives 403.
- `GET /api/orders` requires a customer session and filters records by `customerId: session.userId`.
- The customer-facing `/orders` list and `/orders/[id]` detail pages show order status/tracking but contain no cancellation action or customer cancellation request.
- The complete discovered API route tree contains no customer cancellation endpoint and no other customer order mutation route.
- The only discovered cancellation path is the authenticated admin `PATCH /api/admin/orders/[id]` route, with `status: "CANCELLED"`.
- The admin collection and detail APIs both require `getValidAdminSession()`. The detail PATCH validates the admin session before parsing or changing the order.

### Admin transition and concurrency safeguards

- The API permits cancellation only when the current order status is `PENDING`, `CONFIRMED`, or `PROCESSING`. `SHIPPED`, `DELIVERED`, and `CANCELLED` cannot transition to `CANCELLED`; `DELIVERED` and `CANCELLED` are terminal in the order-state transition function.
- The requested state is checked against the current database state inside a Prisma transaction.
- Before restoring stock, the handler performs a compare-and-set `order.updateMany` constrained by the current order ID, current order status, and current payment status. If another request has already changed either state, the update count is not one and the transaction aborts with a conflict.
- Stock restoration happens only after the guarded order update succeeds, and in the same transaction. Each order item increments its linked product stock by the purchased quantity.
- Consequently, for the inspected code path, a repeated or concurrent cancellation cannot successfully pass the same current-state compare-and-set twice and restore stock twice. If any product update fails, the transaction is expected to roll back the order-state change and any earlier stock increments.
- The API returns 409 for invalid transitions and compare-and-set conflicts; it returns 404 when the order does not exist.
- The payment state is included in the compare-and-set predicate even when only order status is being changed. This is conservative and prevents overwriting a concurrent payment-state update.

### Product/order relationship and deletion behavior

- Prisma schema defines `OrderItem.productId` as a required relation to `Product` with no `onDelete: Cascade` on the product relation. Order items themselves cascade when their parent order is deleted.
- The admin product DELETE route checks whether any OrderItem references the product. If so, it soft-deletes by setting `isActive: false` and retains the product row and its historical order relation.
- If no order item references the product, the route hard-deletes it.
- This behavior preserves the product record needed by historical order items, so normal admin product deletion should not remove a product referenced by an existing order.
- No stock restoration occurs when a product is deactivated; that is appropriate for cancellation accounting because the product remains available as a database row and stock is restored only by the cancellation transaction.

### Findings and risks

1. **No customer self-service cancellation workflow exists.** Customers can view their orders but cannot request cancellation through the inspected storefront or API. Cancellation is admin-only. This is a product/operations limitation, not an ownership bypass. Whether customer cancellation should be offered is a business-policy decision, especially after confirmation or processing.
2. **Admin status controls show all statuses regardless of current state.** The admin page renders buttons for every status, including transitions the server will reject (for example, cancelling a shipped/delivered order or moving a terminal order). The API correctly enforces the state machine, but the UI does not pre-filter allowed transitions.
3. **Admin UI does not surface failed status-update responses.** The client only updates its local order state when `res.ok`; non-OK responses such as 409 are otherwise silently ignored. An admin may not understand why a status action did not apply. This is a usability/operational feedback gap; the server remains authoritative.
4. **Cancellation does not create a separate audit/history record.** The inspected schema stores the current status and timestamps only; no status-history or cancellation-reason model/field was found. This limits later review of who cancelled an order and why. Adding history/reason fields would require a separate business/schema decision and explicit approval.
5. **Cancellation policy is status-based, not payment-method/payment-state-aware.** As also noted in COM-02, the same order cancellation transition applies regardless of COD/UPI and does not coordinate a refund if payment status is already PAID. No payment refund behavior should be inferred from a successful cancellation.
6. **No live concurrency or rollback test was performed.** The compare-and-set and transaction structure are visible in source, but actual database isolation, lock behavior, and rollback under failure have not been exercised in a test environment.

### COM-04 conclusion

**Source review found no customer order-ownership bypass in the inspected read routes. Cancellation is admin-only, and the admin cancellation path uses a transactional compare-and-set guard before restoring stock, preventing the same order from winning cancellation twice in the inspected logic.** Product deletion preserves products referenced by order items through soft deactivation. Remaining gaps are the absence of customer cancellation, admin UI transition/error feedback, no cancellation audit history, and no payment/refund coordination. Runtime concurrency and rollback behavior remain unverified.

### Explicit non-actions

- No customer cancellation endpoint or UI was added.
- No order status, payment status, product stock, or product active state was changed.
- No Prisma schema, migration, SQL, database query, or database write was performed.
- No cancellation reason, status history, or payment/refund policy was invented.
- No production deployment, merge, or promotion was performed.


## COM-05 — Product stock and active/inactive handling audit

**Inspected branch:** `chore/security-hardening` at the current source state following commit `04c92dacff11148b24550c53e659e94467a65fbb`.  
**Scope:** Read-only inspection of admin product collection/item APIs, public product collection/detail APIs, product listing/detail pages, cart state, checkout, order creation, product deletion behavior, and the Prisma Product/OrderItem relations. No product was created or edited, no stock was changed, no order was placed, and no database was queried or modified.

### Product creation and admin stock controls

- Authenticated admin `POST /api/admin/products` validates name, slug, positive price, optional MRP, optional text fields, and stock.
- Stock is constrained to a safe integer from 0 through 10,000,000. Omitted stock defaults to 0.
- Newly created products are explicitly `isActive: true`, even when their stock is 0. This represents an active but sold-out catalogue item; it does not make it orderable.
- Authenticated admin `PATCH /api/admin/products/[id]` validates stock as a non-negative safe integer within the same upper bound and validates `isActive` as a boolean. It can independently change stock and active state; no requirement forces zero-stock products inactive.
- Admin product GET endpoints include inactive products so administrators can manage/reactivate them.
- The admin UI exposes stock editing and Activate/Deactivate controls. It shows stock and an Inactive label, but it does not show a dedicated Sold Out badge in the product management list.

### Public catalogue and product detail

- `GET /api/products` filters with `isActive: true`; `GET /api/products/[slug]` also requires `isActive: true`.
- Therefore an inactive product is excluded from the public list and direct slug lookup returns 404. Public API callers cannot retrieve inactive products through these routes.
- Public listing cards do not receive or display stock quantity, so an active zero-stock product can still appear in the catalogue.
- Product detail receives stock and displays In Stock / Out of Stock. Add-to-cart and WhatsApp controls are disabled/hidden when the fetched stock is zero.
- Product detail quantity selection is capped at the fetched stock (with a fallback cap only when stock is falsy); for zero stock the purchase controls remain disabled.
- Product data is fetched from the active-only public API. A product deactivated after it was already loaded may remain visible in the customer's current browser state until a refresh or server response.

### Cart and order API enforcement

- Cart contents are persisted in browser localStorage and include client-side name, price, image, and quantity. Cart add/increment operations do not fetch current stock or enforce a stock ceiling; cart quantities can exceed available stock, especially after multiple additions or when stock changes after the product page was loaded.
- Checkout sends product IDs and quantities to the order API. Client-supplied price/subtotal/delivery/total are not used as authoritative values.
- `POST /api/orders` re-fetches products from the database with `isActive: true`. If any requested product is missing or inactive, the whole request is rejected as unavailable (409).
- Within the Prisma transaction, it checks each requested quantity against current database stock, then uses a conditional `updateMany` predicate requiring the product ID, `isActive: true`, and `stock >= quantity` before decrementing stock.
- If any conditional decrement does not affect exactly one row, the transaction throws and the order/stock changes roll back. Order creation and stock reservation occur in the same transaction.
- Duplicate product IDs are merged before validation; combined quantity is capped at 100. Each individual submitted quantity is also constrained to 1–100.
- Thus direct API requests cannot purchase inactive products or exceed the stock available at the guarded decrement, based on the inspected source. Client-side cart state is not trusted for price, active state, or stock.

### Deactivation and deletion

- Admin DELETE checks whether any OrderItem references the product. If referenced, it soft-deactivates the product and retains the row; otherwise it hard-deletes the product.
- The required Product relation on OrderItem has no product-side cascade delete, preserving historical order references.
- If an already ordered product is deactivated, cancellation stock restoration still targets the retained Product row. It increments stock without reactivating the product, so the product remains unavailable publicly until an admin explicitly reactivates it.
- No hard-delete race/concurrency test was performed; relational constraints provide an additional safeguard, but runtime behavior was not exercised.

### Findings and risks

1. **Cart quantity is not bounded by current stock.** The detail page initially caps quantity using the fetched stock, but the persisted cart and cart-page increment controls do not enforce stock limits or refresh stock. A customer can therefore prepare an over-quantity or stale cart. The order API rejects it with 409 rather than overselling; this is a UX/recovery issue, not a confirmed stock bypass.
2. **Active zero-stock products remain visible in the catalogue.** This is consistent with the detail page's explicit Out of Stock state and disabled purchase controls, but the listing card itself does not indicate availability. Customers may open a product only to discover it is sold out.
3. **WhatsApp ordering is a separate client-generated message path.** Product detail/cart can generate WhatsApp messages from browser-held product and quantity data; this path does not call the order API, reserve stock, or verify current prices/availability. It is a customer enquiry/contact flow, not a persisted order. Staff must confirm current stock and price before accepting such requests; no automatic stock reservation should be inferred.
4. **Admin stock/active controls are independently editable.** The server-side order guard correctly handles zero stock and inactive state at purchase time. No rule requires an active product to have positive stock, which is not inherently incorrect because sold-out items can remain listed.
5. **No live concurrency test was performed.** The conditional stock decrement and transaction are visible in source, but simultaneous checkout, admin stock edits, deactivation, and deletion races were not exercised against a test database.

### COM-05 conclusion

**No direct order-API path was found that can purchase an inactive product or exceed current stock in the inspected source.** The server rechecks active state and stock and conditionally decrements stock in the same transaction as order creation. Inactive products are excluded from public list/detail APIs; order-linked products are soft-deactivated rather than deleted. Main gaps are stale/unbounded client cart quantities, no stock indicator on catalogue cards, and the separate WhatsApp enquiry flow's lack of live price/stock verification. Runtime concurrency and deletion-race behavior remain unverified.

### Explicit non-actions

- No product, stock count, active flag, cart, or order was changed.
- No customer-facing or admin code was modified.
- No Prisma schema, migration, SQL, database query, or database write was performed.
- No product was purchased or reserved.
- No production deployment, merge, or promotion was performed.


## Follow-up verification — 24 November 2026

**Verified branch head:** `4905ad7a05f9e3aa5fa0d6cfb4b22011aa5dd792` (`chore/security-hardening`). This follow-up records changes made after the earlier COM-01/COM-02/COM-04 snapshots above. Earlier sections remain historical findings for their explicitly named inspected commits; do not read their old UI observations as the current state.

### Current checkout and payment UI

- The checkout no longer displays the old “QR code will be added later” placeholder. The current UPI option is labelled **UPI Payment (Manual)**.
- The current instructions tell the customer to place the order and use the global WhatsApp button to request verified UPI payment details for the order total.
- The UI warns customers not to send money to an unverified UPI ID and says payment remains pending until verified.
- No UPI ID, QR code, payment intent, gateway, transaction reference, or automated verification has been added. UPI is therefore a manual contact-and-verification workflow, not an online payment integration.
- `POST /api/orders` accepts only `cod` and `upi`; it creates both with `paymentStatus: PENDING` and does not mark UPI paid based on the selected method.

### Current admin payment and order-status UI

- The admin orders page now exposes manual payment-status actions: Mark Paid, Mark Failed, Reset to Pending, and Mark Refunded.
- The admin order detail PATCH route validates admin session, validates requested states, checks the shared transition rules, and performs a compare-and-set update inside a Prisma transaction.
- The latest order-status UI fix parses the response and displays a failure alert instead of silently leaving an unsuccessful status change unexplained. It updates local state only after a successful response.
- Payment status remains an admin-entered/manual state. The application does not verify bank/UPI receipts itself.
- Existing payment transition rules still do not enforce method-specific invariants or cross-check order status against payment status. Admins must verify the actual payment and follow the business's approved cancellation/refund process before changing these fields; the source does not establish that policy.

### Current WhatsApp and RateLimit observations

- The customer root layout includes the global WhatsApp button, so it is available across customer-facing routes without duplicating page-specific buttons. The current component links to the configured A-2-Z WhatsApp contact.
- The raw `RateLimit` table remains an external database dependency. `prisma/schema.prisma` does not declare it; `scripts/create-ratelimit-table.js` defines the expected table/index and reads a local `.env` `DATABASE_URL` before connecting to the configured database.
- No database connection, table inspection, setup script, SQL, migration, seed, or database write was performed. Table existence and runtime authentication availability remain **unverified**. Because rate-limit errors fail closed, this remains a launch-critical availability check to perform through an explicitly approved read-only provider/schema inspection.

### Verification boundary

The GitHub Actions quality checks and the Vercel Preview build for commit `4905ad7a05f9e3aa5fa0d6cfb4b22011aa5dd792` both completed successfully; the matching Preview reached READY. This confirms the recorded CI checks and deployment build, not live database connectivity, payment receipt verification, or complete end-to-end customer/admin journeys.

No production deployment, merge, promotion, environment change, or database operation was performed for this follow-up.

# A-2-Z PHARMA — Feature and Maintenance Backlog

> Scope: development branch `chore/security-hardening`. This is a prioritized audit backlog, not blanket approval to copy features from the read-only reference repository. Items marked **audit** require inspection before any implementation.

## Priority 0 — Security and release safety

**Current reviewed source commit:** `056585449644972067f2cd1064fe8c1d04a91fa4` (2026-11-28).

| ID | Task | Status | Acceptance / safety boundary |
|---|---|---|---|
| SEC-01 | Review admin and customer session invalidation after password changes | Admin implementation complete; customer password-change flow not present | Admin login stores the current password hash in the encrypted session; all discovered protected admin API routes validate it against the current database hash. Password updates rotate the current session hash, invalidating older sessions. No customer password-change endpoint was found, so customer password-change invalidation remains unverified. No schema/DB changes. |
| SEC-02 | Audit rate-limit implementation and its database dependency | Table/index creation reported successful by the user in Neon SQL Editor; exact Vercel database identity remains unverified | Source helper still fails closed. User supplied successful SQL Editor output for `RateLimit` and `RateLimit_resetAt_idx`. Vercel metadata shows one `DATABASE_URL` variable record scoped to both Production and Preview; values were not decrypted, so DB identity/isolation cannot be confirmed. Do not run SQL or runtime write tests without explicit approval and an isolated database. |
| SEC-03 | Review authorization on admin and customer API routes | Source audit complete; no confirmed authorization gap found | All discovered protected admin API routes use the shared password-bound session validator. Customer order reads enforce session ownership; profile updates use the session user ID. Public catalogue/banner reads and login/logout are intentionally public. Middleware cookie-presence check is only a page gate; APIs authorize independently. Runtime/forged-cookie and cross-customer tests remain outstanding. |
| SEC-04 | Review security headers and CSP feasibility | Baseline headers and one-year HSTS are configured; live response-header verification outstanding; CSP deferred | `next.config.mjs` contains baseline headers plus HSTS without includeSubDomains/preload. The Preview build is READY, but an external response-header check was not completed. Do not enforce CSP until Next.js runtime, inline styles, integrations, and stored image origins are inventoried. |

## Priority 1 — Core commerce correctness

| ID | Task | Status | Acceptance / safety boundary |
|---|---|---|---|
| COM-01 | Audit checkout and order creation | Source audit and deterministic validation tests improved; idempotency and isolated runtime tests outstanding | Server recalculates product prices/totals and transactionally decrements stock. Shared ₹50/₹500 delivery logic is tested. A shared Indian mobile validator now covers registration, profile update, and order API; checkout also blocks repeated submission in the same mounted form. Cross-tab/network-retry idempotency is not implemented. No Preview/Production order test was run because `DATABASE_URL` is scoped to both targets and DB isolation is unconfirmed. |
| COM-02 | Audit COD and UPI/manual payment transitions | Source implementation and unit tests complete; real payment verification/refund remains manual; isolated runtime tests outstanding | Pure transition rules enforce allowed order/payment moves, UPI must be PAID before shipping/delivery, COD can be marked PAID only after delivery, FAILED is limited to UPI before shipment, cancelled orders allow only a REFUNDED transition, and refunds can be recorded after cancellation or delivery. Admin API uses transaction/CAS; admin confirms before marking a refund sent. No payment gateway or automatic refund exists. Manual payment collection/verification remains an operations task. |
| COM-03 | Audit delivery fee and pincode behavior | Shared fee rule centralized and unit-tested; runtime carrier coverage unverified | Cart, checkout, and order API now use one pure delivery calculator backed by the existing ₹50 / ₹500 configuration; server still recalculates from DB-derived subtotal and ignores client totals. Decimal threshold comparisons avoid floating-point rounding. Pincode remains required and format-validated as six ASCII digits only. No postal lookup, address cross-check, delivery-zone/serviceability check, carrier rate lookup, or pincode-specific pricing was found. `areas: ["All India"]` remains descriptive and is not enforced by the API. No pricing values, address, DB, or provider settings changed. |
| COM-04 | Audit cancellation, ownership, and stock restoration | Customer cancellation route/UI and admin transition safeguards implemented; runtime concurrency/rollback tests outstanding | Customer can cancel only own PENDING/CONFIRMED/PROCESSING order. Customer and admin cancellation use transactional compare-and-set before stock restoration; admin UI shows only valid next statuses and confirms cancellation. Paid cancellations require manual refund handling. No live concurrency/rollback test, DB write, or schema change was performed. |
| COM-05 | Audit product stock and active/inactive handling | Source audit complete; runtime concurrency/deletion-race tests outstanding | No direct order-API path to buy inactive products or exceed current stock was found. Server rechecks active state and stock and conditionally decrements in the order transaction. Order-linked products are soft-deactivated. Findings: cart quantities can become stale/over-stock, catalogue cards do not show sold-out state, and WhatsApp enquiries do not verify live price/stock or reserve inventory. No code/DB change or runtime concurrency test. |

## Priority 2 — Customer trust and operational readiness

| ID | Task | Status | Acceptance / safety boundary |
|---|---|---|---|
| OPS-01 | Review required legal and policy pages | Core policy pages now exist; business facts and qualified legal review remain launch blockers | Privacy, Terms, Medical/Product Disclaimer, Shipping/Delivery, and Cancellation/Return/Refund pages exist; footer and checkout links were added. Unsupported return/refund deadlines and reference-business wording were removed. About-page statistics/authenticity/expert claims were replaced with factual catalogue/order information. Legal operator identity, licence details, final delivery/serviceability, refund rules, data practices, and grievance contact still need owner confirmation and qualified review. |
| OPS-02 | Evaluate password recovery and email verification | Password policy strengthened; recovery/verification not implemented; provider decision remains open | Customer registration now requires at least 8 characters and enforces bcrypt's 72 UTF-8-byte limit. No forgot/reset-password or email-verification flow/token lifecycle exists. No email provider was selected or configured in source. No schema or secret change. |
| OPS-03 | Evaluate product gallery and medicine information fields | Single-image Cloudinary upload added; gallery and structured medicine fields still require business/compliance decision | Admin product form supports one Cloudinary image upload to `a2z-products` plus the existing URL field. Product schema remains unchanged: no gallery, manufacturer/composition/usage/warnings/batch/expiry fields. Unsupported static ratings/verification/authenticity claims were removed. Cloudinary upload variables are Production-only in Vercel metadata, so Preview upload was not tested. |

## Priority 3 — Optional features (not committed scope)

Evaluate individually only after core workflows and security are sound:
- Wishlist.
- Coupons and promotional campaigns.
- Admin customer management and follow-up.
- Notification history and resend.
- Reports and revenue analytics.
- Email subscriptions.
- Hindi blog routes and health-content sections.

These features are reference-only observations, not approved requirements. Do not implement them merely to achieve feature-count parity.

## Priority 4 — Engineering quality

| ID | Task | Status | Acceptance / safety boundary |
|---|---|---|---|
| QA-01 | Audit ESLint configuration and scripts | Standalone lint verified by GitHub Actions | `pnpm lint` passed in GitHub Actions run `46138450965` for exact commit `056585449644972067f2cd1064fe8c1d04a91fa4`. Vercel still reports non-blocking `<img>` optimization and React Hook dependency warnings. Findings: `docs/QA-AUDIT-FINDINGS.md`. |
| QA-02 | Establish a safe TypeScript check | Standalone typecheck verified by GitHub Actions | `pnpm typecheck` passed in GitHub Actions run `45134250957` for exact commit `c728003f5bc771f06fbe90a71493dae5811ff4be`. Strict TypeScript configuration remains unchanged. |
| QA-03 | Add focused tests for critical business flows | Order/payment transition and delivery-fee unit tests pass; broader coverage pending | Node built-in order/payment and delivery-fee tests pass in GitHub Actions run `46138450965` for commit `056585449644972067f2cd1064fe8c1d04a91fa4`. Existing order/payment rules are preserved. Delivery fee now has shared threshold/boundary tests; API authorization, transaction, stock concurrency, and browser flows remain outside this suite. |
| QA-04 | Add GitHub Actions CI | Read-only quality workflow verified green | `.github/workflows/quality.yml` runs `pnpm test`, `pnpm typecheck`, and `pnpm lint` on pushes to `chore/security-hardening` and pull requests targeting `main`. Exact commit `c728003f5bc771f06fbe90a71493dae5811ff4be` passed all checks in Actions run `45134250957`. It uses frozen-lockfile installation and Prisma Client generation only; no secrets, DB connection, migration, seed, or write step. Vercel Preview remains the production-build gate. |
| QA-05 | Resolve React Hook dependency warnings | Five effect warnings resolved and verified on commit `579ea2b521feb74c22456332f2f34ad6845f5fb1`; no React Hook warnings remain in Preview logs | Use stable useCallback loaders and include them in corresponding useEffect dependency arrays. No rule suppression or API/business change. |
| QA-06 | Reduce safe image optimization warnings | Static Unsplash blog imagery migrated; dynamic DB/user-managed image sources remain under audit | Use Next Image only where the source host is already allowlisted and stable. Do not restrict or break arbitrary product/order/banner image URLs without inspecting existing data and allowed-host requirements. |

## Execution order

1. Finish security audits SEC-01 through SEC-04, fixing only confirmed issues in focused commits.
2. Audit commerce flows COM-01 through COM-05 and record concrete findings before changing behavior.
3. Address operational readiness items only after the business facts/provider needs are confirmed.
4. Add tests and CI based on the repository's actual setup.
5. Revisit optional features only when A-2-Z's business requirements justify them.

## Working rules

- Target repository: `umaramroha/A-2-Z-PHARMA` only.
- Reference repository: `umaramroha/Amroha-Pharmacy-v2`, read-only.
- Preserve A-2-Z identity, content, contact details, data, features, and business rules.
- No production deploy/merge, environment/secret changes, schema changes, migrations, SQL, seed scripts, or database writes without explicit approval.
- Group related files into one planned coherent commit; keep unrelated or high-risk changes separate. Inspect the complete combined diff and applicable checks before committing. Inspect the matching Vercel Preview and actual build logs before the next commit.
- A successful build is not proof of complete runtime or end-to-end behavior.


## Current release blockers and qualifications (2026-11-28)

- Do not run order/cancellation/stock end-to-end tests against Preview until a dedicated isolated Preview database is configured and confirmed. Vercel metadata currently scopes the `DATABASE_URL` record to both Production and Preview; its value was not read.
- Cloudinary public cloud-name/upload-preset variables are scoped to Production only. Admin product image upload is source/build-verified, not Preview-upload-verified.
- No production merge, promotion, deployment, database migration, schema change, SQL write, or environment-variable mutation has been performed.
- Product data, actual licence/legal-operator details, final business policy decisions, and live COD/manual-UPI verification remain owner/operations tasks.

# A-2-Z PHARMA — Feature and Maintenance Backlog

> Scope: development branch `chore/security-hardening`. This is a prioritized audit backlog, not blanket approval to copy features from the read-only reference repository. Items marked **audit** require inspection before any implementation.

## Priority 0 — Security and release safety

**Current reviewed source commit:** `9fcfb1f61a5691ed82a05baa0dc8c64813a4a1de` (2026-11-28).

| ID | Task | Status | Acceptance / safety boundary |
|---|---|---|---|
| SEC-01 | Review admin and customer session invalidation after password changes | Admin implementation complete; customer password-change flow not present | Admin login stores the current password hash in the encrypted session; all discovered protected admin API routes validate it against the current database hash. Password updates rotate the current session hash, invalidating older sessions. No customer password-change endpoint was found, so customer password-change invalidation remains unverified. No schema/DB changes. |
| SEC-02 | Audit rate-limit implementation and its database dependency | User reports table/index created in Neon; source-level cleanup and order-create limiting added; exact Vercel DB identity remains unverified | The user supplied successful SQL Editor output for `RateLimit` and `RateLimit_resetAt_idx`. Vercel metadata shows one `DATABASE_URL` record scoped to both Production and Preview; values were not decrypted. Rate-limit records older than 24 hours are pruned on a 1% request sample. The one-off table-creation script was removed after manual setup. Do not run SQL or runtime write tests without explicit approval and an isolated database. |
| SEC-03 | Review authorization on admin and customer API routes | Source audit complete; no confirmed authorization gap found | All discovered protected admin API routes use the shared password-bound session validator. Customer order reads enforce session ownership; profile updates use the session user ID. Public catalogue/banner reads and login/logout are intentionally public. Middleware cookie-presence check is only a page gate; APIs authorize independently. Runtime/forged-cookie and cross-customer tests remain outstanding. |
| SEC-04 | Review security headers and CSP feasibility | Baseline headers and one-year HSTS are configured; live response-header verification outstanding; CSP deferred | `next.config.mjs` contains baseline headers plus HSTS without includeSubDomains/preload. The Preview build is READY, but an external response-header check was not completed. Do not enforce CSP until Next.js runtime, inline styles, integrations, and stored image origins are inventoried. |

## Priority 1 — Core commerce correctness

| ID | Task | Status | Acceptance / safety boundary |
|---|---|---|---|
| COM-01 | Audit checkout and order creation | Source audit and deterministic tests improved; idempotency and isolated runtime tests outstanding | Server recalculates product prices/totals and transactionally decrements stock. Shared ₹50/₹500 delivery logic is tested. Indian mobile validation covers registration, profile update, and order API. Checkout blocks repeat clicks in one mounted form; API limits each customer to 5 valid order attempts per 15 minutes. Cross-tab/network-retry idempotency is not implemented. No Preview/Production order test was run because DB isolation is unconfirmed. |
| COM-02 | Audit COD and UPI/manual payment transitions | Source implementation and unit tests complete; real payment verification/refund remains manual; isolated runtime tests outstanding | Manual UPI must be marked PAID before shipping/delivery; COD can be marked PAID only after DELIVERED. FAILED is limited to UPI while the order is still pre-shipment. REFUNDED is available only for a paid CANCELLED or DELIVERED order and Admin confirms the refund was actually sent. API validates against current order/payment state and uses transaction/CAS. No gateway or automatic refund exists. |
| COM-03 | Audit delivery fee and pincode behavior | Shared fee rule centralized and unit-tested; runtime carrier coverage unverified | Cart, checkout, and order API now use one pure delivery calculator backed by the existing ₹50 / ₹500 configuration; server still recalculates from DB-derived subtotal and ignores client totals. Decimal threshold comparisons avoid floating-point rounding. Pincode remains required and format-validated as six ASCII digits only. No postal lookup, address cross-check, delivery-zone/serviceability check, carrier rate lookup, or pincode-specific pricing was found. `areas: ["All India"]` remains descriptive and is not enforced by the API. No pricing values, address, DB, or provider settings changed. |
| COM-04 | Audit cancellation, ownership, and stock restoration | Customer cancellation route/UI and admin transition safeguards implemented; runtime concurrency/rollback tests outstanding | Customer can cancel only own PENDING/CONFIRMED/PROCESSING order. Customer and admin cancellation use transactional compare-and-set before stock restoration. Paid cancellations can be refunded after the order is cancelled; delivered orders can be refunded after eligible return handling without restocking automatically. No live concurrency/rollback test, DB write, or schema change was performed. |
| COM-05 | Audit product stock and active/inactive handling | Source audit complete; runtime concurrency/deletion-race tests outstanding | No direct order-API path to buy inactive products or exceed current stock was found. Server rechecks active state and stock and conditionally decrements in the order transaction. Order-linked products are soft-deactivated. Findings: cart quantities can become stale/over-stock, catalogue cards do not show sold-out state, and WhatsApp enquiries do not verify live price/stock or reserve inventory. No code/DB change or runtime concurrency test. |

## Priority 2 — Customer trust and operational readiness

| ID | Task | Status | Acceptance / safety boundary |
|---|---|---|---|
| OPS-01 | Review required legal and policy pages | Core policy pages exist; business facts and qualified legal review remain launch blockers | Privacy, Terms, Medical/Product Disclaimer, Shipping/Delivery, and Cancellation/Return/Refund pages exist; footer, checkout and product detail links are present. Unsupported return/refund deadlines and reference-business wording were removed. About/blog/product trust claims were softened or removed; Admin empty-state/field copy is English. Legal operator identity, licence details, delivery/serviceability, refund rules, data practices, grievance contact and all real product claims still need owner confirmation and qualified review. |
| OPS-02 | Evaluate password recovery, email verification and order email | Password policy strengthened; recovery/verification/email notifications not implemented | Customer registration requires at least 8 characters and enforces bcrypt's 72 UTF-8-byte limit. No forgot/reset-password, email-verification flow, email provider, or order email notification integration was found. No schema or secret change. |
| OPS-03 | Evaluate product gallery and medicine information fields | Single-image Cloudinary upload added; gallery and structured medicine fields still require business/compliance decision | Admin product form supports one Cloudinary image upload to `a2z-products` plus the existing URL field. Product schema remains unchanged: no gallery, manufacturer/composition/usage/warnings/batch/expiry fields. Cloudinary uses the existing unsigned public preset; preset-side file/folder restrictions were not independently verified. Preview upload was not tested because Cloudinary env variables are Production-only. |

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
| QA-01 | Audit ESLint configuration and scripts | Standalone lint verified by latest GitHub Actions | `pnpm lint` passed in Actions run `46139023206` for commit `9fcfb1f61a5691ed82a05baa0dc8c64813a4a1de`. It reports 13 non-blocking `@next/next/no-img-element` warnings; no lint errors. |
| QA-02 | Establish a safe TypeScript check | Standalone typecheck verified by latest GitHub Actions | `pnpm typecheck` passed in Actions run `46139023206` for commit `9fcfb1f61a5691ed82a05baa0dc8c64813a4a1de`. Strict TypeScript configuration remains unchanged. |
| QA-03 | Add focused tests for critical business flows | 52 deterministic unit tests pass; broader coverage pending | Node built-in tests passed 52/52 in Actions run `46139023206` for commit `9fcfb1f61a5691ed82a05baa0dc8c64813a4a1de`. Coverage includes redirect safety, IP parsing, delivery fee, order input helpers, phone/password policy, and order/payment transition rules. API authorization, DB transaction/stock concurrency, and browser flows remain outside this suite. |
| QA-04 | Add GitHub Actions CI | Read-only quality workflow verified green | `.github/workflows/quality.yml` runs `pnpm test`, `pnpm typecheck`, and `pnpm lint` with frozen-lockfile installation and Prisma Client generation only. Run `46139023206` for exact commit `9fcfb1f61a5691ed82a05baa0dc8c64813a4a1de` passed all checks. Matching Vercel Preview `dpl_HohsQgnbHeP6gaWnKrpwbJujPdrj` reached READY; 39/39 static pages generated. |
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


## Additional current release notes — 2026-11-28

- Repository hygiene: `.env.*` and `.vercel` are ignored; `.env.example` contains placeholders; root `README.md` documents setup and safety. The `db:push` package shortcut and obsolete one-off SQL/source-edit/demo-seed scripts were removed. The remaining Admin seed script requires an explicit shell opt-in and enforces bcrypt's 72-byte limit.
- The unsigned Cloudinary preset is public by design. Client-side type/size checks are not a substitute for preset-side restrictions or signed uploads; verify Cloudinary allowed formats, size limits and folder restrictions before scaling.
- Preview is a build gate only. No DB-backed order, payment, cancellation, stock or refund test was run.

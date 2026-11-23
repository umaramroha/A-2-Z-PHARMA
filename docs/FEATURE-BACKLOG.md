# A-2-Z PHARMA — Feature and Maintenance Backlog

> Scope: development branch `chore/security-hardening`. This is a prioritized audit backlog, not blanket approval to copy features from the read-only reference repository. Items marked **audit** require inspection before any implementation.

## Priority 0 — Security and release safety

| ID | Task | Status | Acceptance / safety boundary |
|---|---|---|---|
| SEC-01 | Review admin and customer session invalidation after password changes | Admin implementation complete; customer password-change flow not present | Admin login stores the current password hash in the encrypted session; all discovered protected admin API routes validate it against the current database hash. Password updates rotate the current session hash, invalidating older sessions. No customer password-change endpoint was found, so customer password-change invalidation remains unverified. No schema/DB changes. |
| SEC-02 | Audit rate-limit implementation and its database dependency | Source audit complete; deployed table existence remains unverified | Raw SQL uses the `RateLimit` table, which has no Prisma model. Login and registration fail closed on DB/query errors. The table may exist outside Prisma; no DB inspection or mutation was performed. Verify deployed table/columns/index through an approved read-only provider view before considering any schema/table change. |
| SEC-03 | Review authorization on admin and customer API routes | Source audit complete; no confirmed authorization gap found | All discovered protected admin API routes use the shared password-bound session validator. Customer order reads enforce session ownership; profile updates use the session user ID. Public catalogue/banner reads and login/logout are intentionally public. Middleware cookie-presence check is only a page gate; APIs authorize independently. Runtime/forged-cookie and cross-customer tests remain outstanding. |
| SEC-04 | Review security headers and CSP feasibility | Source audit complete; HSTS configured; response-header verification outstanding; CSP deferred | Existing baseline headers are configured. A one-year HSTS header was added without includeSubDomains/preload. The actual HTTP response header still needs external verification. Do not enforce CSP until Next.js runtime requirements, inline styles, integrations, and stored image origins are inventoried. |

## Priority 1 — Core commerce correctness

| ID | Task | Status | Acceptance / safety boundary |
|---|---|---|---|
| COM-01 | Audit checkout and order creation | Source audit complete; runtime/concurrency tests outstanding | Authenticated session owns the order; server recalculates product prices, delivery fee, and totals; active/stock checks and stock decrement/order creation occur transactionally. Findings include missing idempotency, manual/pending UPI without payment verification, syntactic-only mobile validation, duplicated delivery rules, and unused client-supplied totals. No business rules or DB changed. |
| COM-02 | Audit COD and UPI/manual payment transitions | Source audit complete; payment-policy decisions and runtime tests outstanding | Order/payment transition paths and compare-and-set transaction behavior were traced. UPI has no payment integration/verification; payment transitions are not method-specific and order/payment states are not cross-validated. No payment configuration, business rules, code, or DB changed. |
| COM-03 | Audit delivery fee and pincode behavior | Shared fee rule centralized and unit-tested; runtime carrier coverage unverified | Cart, checkout, and order API now use one pure delivery calculator backed by the existing ₹50 / ₹500 configuration; server still recalculates from DB-derived subtotal and ignores client totals. Decimal threshold comparisons avoid floating-point rounding. Pincode remains required and format-validated as six ASCII digits only. No postal lookup, address cross-check, delivery-zone/serviceability check, carrier rate lookup, or pincode-specific pricing was found. `areas: ["All India"]` remains descriptive and is not enforced by the API. No pricing values, address, DB, or provider settings changed. |
| COM-04 | Audit cancellation, ownership, and stock restoration | Source audit complete; runtime concurrency/rollback tests outstanding | Customer order reads enforce session ownership; no customer cancellation route/UI exists, so cancellation is admin-only. Admin cancellation is limited to PENDING/CONFIRMED/PROCESSING and uses a transactional compare-and-set before restoring stock, preventing the same order from winning cancellation twice in the inspected source. Product deletion soft-deactivates products referenced by order items. Gaps: admin UI shows invalid status choices and silently ignores failed updates; no cancellation reason/history or payment/refund coordination. No live concurrency/rollback test, DB write, or schema change. |
| COM-05 | Audit product stock and active/inactive handling | Source audit complete; runtime concurrency/deletion-race tests outstanding | No direct order-API path to buy inactive products or exceed current stock was found. Server rechecks active state and stock and conditionally decrements in the order transaction. Order-linked products are soft-deactivated. Findings: cart quantities can become stale/over-stock, catalogue cards do not show sold-out state, and WhatsApp enquiries do not verify live price/stock or reserve inventory. No code/DB change or runtime concurrency test. |

## Priority 2 — Customer trust and operational readiness

| ID | Task | Status | Acceptance / safety boundary |
|---|---|---|---|
| OPS-01 | Review required legal and policy pages | Source audit complete; publication blocked pending owner facts and legal review | No dedicated Terms, Privacy, Shipping/Delivery, Returns/Refunds, or Cancellation pages were found; checkout's Terms text is not linked. Footer/header have no policy links. Confirm legal operator identity/address, applicable licence details, actual delivery/serviceability, cancellation/return/refund rules, payment handling, data practices, and grievance contact before drafting. Verify About-page claims. Do not invent facts, copy reference wording, or publish legal text without qualified review. Findings: `docs/OPERATIONAL-AUDIT-FINDINGS.md`. |
| OPS-02 | Evaluate password recovery and email verification | Source audit complete; provider environment configuration unverified; implementation requires provider/business decision | No forgot-password/reset-password or email-verification page/API/token flow was found. Registration immediately creates a logged-in session; login has no verified-email gate. Customer schema has no verification/reset token fields; no email provider dependency or tracked email utility/template was found. Vercel environment variable presence/values were not inspected. No provider, secret, schema, or behavior changed. Findings: `docs/OPERATIONAL-AUDIT-FINDINGS.md`. |
| OPS-03 | Evaluate product gallery and medicine information fields | Source audit complete; gallery/storage and structured-field requirements need business/compliance decision | Current admin/public product flow supports one image URL, free-text description, and broad category only; no gallery controls, dedicated upload integration, or structured medicine fields were found. Static five-star/“Verified product” display has no product-review/verification model behind it. Confirm image roles/count/storage and required medicine fields with the owner/pharmacist/compliance lead before implementation. Preserve existing product/order history; no schema, data, provider, or code changes. Findings: `docs/OPERATIONAL-AUDIT-FINDINGS.md`. |

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
| QA-01 | Audit ESLint configuration and scripts | Standalone lint verified by GitHub Actions | `pnpm lint` passed in GitHub Actions run `45134250957` for exact commit `c728003f5bc771f06fbe90a71493dae5811ff4be`. Vercel still reports non-blocking `<img>` optimization and React Hook dependency warnings. Findings: `docs/QA-AUDIT-FINDINGS.md`. |
| QA-02 | Establish a safe TypeScript check | Standalone typecheck verified by GitHub Actions | `pnpm typecheck` passed in GitHub Actions run `45134250957` for exact commit `c728003f5bc771f06fbe90a71493dae5811ff4be`. Strict TypeScript configuration remains unchanged. |
| QA-03 | Add focused tests for critical business flows | Order/payment transition and delivery-fee unit tests pass; broader coverage pending | Node built-in order/payment and delivery-fee tests pass in GitHub Actions run `45134250957` for commit `c728003f5bc771f06fbe90a71493dae5811ff4be`. Existing order/payment rules are preserved. Delivery fee now has shared threshold/boundary tests; API authorization, transaction, stock concurrency, and browser flows remain outside this suite. |
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

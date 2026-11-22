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
| COM-03 | Audit delivery fee and pincode behavior | Source audit complete; runtime carrier coverage unverified | Cart, checkout, and order API currently use a flat ₹50 fee below ₹500 and free delivery at/above ₹500; server recalculates from DB-derived subtotal and ignores client totals. Pincode is required and format-validated as six ASCII digits only. No postal lookup, address cross-check, delivery-zone/serviceability check, carrier rate lookup, or pincode-specific pricing was found. `areas: ["All India"]` is descriptive and not enforced by the API. Delivery constants are duplicated across config/UI/API, creating drift risk. No delivery rules, address, DB, or provider settings changed. |
| COM-04 | Audit cancellation, ownership, and stock restoration | Source audit complete; runtime concurrency/rollback tests outstanding | Customer order reads enforce session ownership; no customer cancellation route/UI exists, so cancellation is admin-only. Admin cancellation is limited to PENDING/CONFIRMED/PROCESSING and uses a transactional compare-and-set before restoring stock, preventing the same order from winning cancellation twice in the inspected source. Product deletion soft-deactivates products referenced by order items. Gaps: admin UI shows invalid status choices and silently ignores failed updates; no cancellation reason/history or payment/refund coordination. No live concurrency/rollback test, DB write, or schema change. |
| COM-05 | Audit product stock and active/inactive handling | Source audit complete; runtime concurrency/deletion-race tests outstanding | No direct order-API path to buy inactive products or exceed current stock was found. Server rechecks active state and stock and conditionally decrements in the order transaction. Order-linked products are soft-deactivated. Findings: cart quantities can become stale/over-stock, catalogue cards do not show sold-out state, and WhatsApp enquiries do not verify live price/stock or reserve inventory. No code/DB change or runtime concurrency test. |

## Priority 2 — Customer trust and operational readiness

| ID | Task | Status | Acceptance / safety boundary |
|---|---|---|---|
| OPS-01 | Review required legal and policy pages | Source audit complete; publication blocked pending owner facts and legal review | No dedicated Terms, Privacy, Shipping/Delivery, Returns/Refunds, or Cancellation pages were found; checkout's Terms text is not linked. Footer/header have no policy links. Confirm legal operator identity/address, applicable licence details, actual delivery/serviceability, cancellation/return/refund rules, payment handling, data practices, and grievance contact before drafting. Verify About-page claims. Do not invent facts, copy reference wording, or publish legal text without qualified review. Findings: `docs/OPERATIONAL-AUDIT-FINDINGS.md`. |
| OPS-02 | Evaluate password recovery and email verification | Source audit complete; provider environment configuration unverified; implementation requires provider/business decision | No forgot-password/reset-password or email-verification page/API/token flow was found. Registration immediately creates a logged-in session; login has no verified-email gate. Customer schema has no verification/reset token fields; no email provider dependency or tracked email utility/template was found. Vercel environment variable presence/values were not inspected. No provider, secret, schema, or behavior changed. Findings: `docs/OPERATIONAL-AUDIT-FINDINGS.md`. |
| OPS-03 | Evaluate product gallery and medicine information fields | Needs business decision | Confirm operational need before proposing UI/schema work. Any schema change requires explicit approval. |

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
| QA-01 | Audit ESLint configuration and scripts | Pending audit | Confirm the actual config and whether `pnpm lint` is a reliable gate before changing CI. |
| QA-02 | Establish a safe TypeScript check | Pending audit | Verify current compiler configuration and use `npx tsc --noEmit` where dependencies are available. |
| QA-03 | Add focused tests for critical business flows | Pending design | Choose test tooling only after inspecting current dependencies; no DB mutation or production data. |
| QA-04 | Add GitHub Actions CI | Pending audit | Inspect existing workflows first; run read-only checks only and avoid duplicate/unnecessary dependencies. |

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
- One focused change per commit. Inspect the matching Vercel Preview and actual build logs before the next commit.
- A successful build is not proof of complete runtime or end-to-end behavior.

# A-2-Z PHARMA — Feature and Maintenance Backlog

> Scope: development branch `chore/security-hardening`. This is a prioritized audit backlog, not blanket approval to copy features from the read-only reference repository. Items marked **audit** require inspection before any implementation.

## Priority 0 — Security and release safety

| ID | Task | Status | Acceptance / safety boundary |
|---|---|---|---|
| SEC-01 | Review admin and customer session invalidation after password changes | Pending audit | Trace session creation, password update, and every protected API/page. Propose a backward-compatible fix only if a concrete weakness is confirmed. No schema/DB changes without approval. |
| SEC-02 | Audit rate-limit implementation and its database dependency | Pending audit | Inspect callers, raw SQL, failure behavior, and schema mismatch. Do not query or mutate production DB; do not create the missing table/model without approval. |
| SEC-03 | Review authorization on admin and customer API routes | Pending audit | Verify server-side session/ownership checks, not merely middleware cookie presence. Report confirmed gaps before focused fixes. |
| SEC-04 | Review security headers and CSP feasibility | Pending audit | Inventory scripts, styles, images, and external services before any CSP change. Avoid breaking Next.js runtime. |

## Priority 1 — Core commerce correctness

| ID | Task | Status | Acceptance / safety boundary |
|---|---|---|---|
| COM-01 | Audit checkout and order creation | Pending audit | Trace client input to server-side price, stock, delivery, payment method, and persisted order values. Preserve existing A-2-Z rules. |
| COM-02 | Audit COD and UPI/manual payment transitions | Pending audit | Verify allowed transitions and server-side validation; do not change payment configuration or business rules without approval. |
| COM-03 | Audit delivery fee and pincode behavior | Pending audit | Document actual rules and edge cases from target code; do not import reference pricing. |
| COM-04 | Audit cancellation, ownership, and stock restoration | Pending audit | Trace customer/admin cancellation paths and status transitions; verify idempotency and stock effects without DB writes. |
| COM-05 | Audit product stock and active/inactive handling | Pending audit | Confirm unavailable/inactive products cannot be purchased through direct API calls. Preserve existing admin behavior. |

## Priority 2 — Customer trust and operational readiness

| ID | Task | Status | Acceptance / safety boundary |
|---|---|---|---|
| OPS-01 | Review required legal and policy pages | Needs business decision | Identify required pages and missing A-2-Z-specific facts. Do not copy reference wording or invent legal/business claims. |
| OPS-02 | Evaluate password recovery and email verification | Needs provider/config audit | First inspect existing email utilities and environment-variable names (never expose values). No new provider or secrets without approval. |
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

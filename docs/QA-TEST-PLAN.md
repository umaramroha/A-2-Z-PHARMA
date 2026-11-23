# A-2-Z PHARMA — QA Test Plan

## Purpose and boundaries
Build repeatable tests around deterministic business logic before database-backed or browser end-to-end tests. Tests must run without production credentials, network calls, Prisma connections, or database writes.

## Selected first test runner
- Use Node.js built-in `node:test` and `node:assert/strict`.
- Run with `pnpm test` (script: `node --test`).
- This avoids a new test-framework dependency and lockfile churn for the initial pure-logic suite.
- TypeScript has `allowJs: true`; pure ESM `.mjs` helpers with JSDoc types can be executed directly by Node and imported by TypeScript.
- Keep initial tests deterministic and free of Prisma/database setup.

## Initial coverage
- Exhaustively check every pair of existing order statuses. The current predicate permits any forward-rank transition among PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED, including skipped intermediate stages; cancellation is permitted only from PENDING, CONFIRMED, or PROCESSING. Reject same-state, backward, post-shipment cancellation, and transitions out of terminal states. This records existing behavior; it does not decide whether skipping stages is desirable business policy.
- Exhaustively check every pair of existing payment statuses: PENDING → PAID/FAILED; FAILED → PENDING; PAID → REFUNDED; reject all other and same-state transitions.
- These tests preserve current behavior. They do not add COD/UPI-specific rules or cross-validate order/payment status, both documented as unresolved COM-02 policy gaps.

## Verification commands
```sh
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```
Mark a command passed only after its actual exit status is observed. A Vercel READY build does not prove that standalone `pnpm test` or `pnpm typecheck` ran.

## Delivery-fee coverage
- `src/lib/deliveryRules.mjs` is the shared source for the existing ₹50 fee and ₹500 free-delivery threshold.
- `calculateDeliveryFee` accepts numeric or decimal-string subtotals and compares the integer rupee portion without floating-point threshold rounding.
- `src/lib/deliveryRules.test.mjs` covers below-threshold, exact-threshold, above-threshold, decimal-edge, invalid-input, and configuration cases.
- Cart, checkout, and the order API use the shared calculator. The order API continues to derive subtotal from database product prices and never trusts client totals.
- Cart's empty-cart presentation remains free; non-empty carts use the shared rule.

## Next test candidates (not covered yet)
1. Order-input validation boundaries and duplicate product-ID quantity aggregation after safe extraction.
3. WhatsApp message/link encoding and quantity/total formatting.
4. API authorization and customer ownership using isolated mocks/test doubles.
5. Transaction rollback, concurrent stock reservation, and duplicate cancellation only with a disposable isolated test DB or purpose-built harness; never Preview/Production data.
6. Browser checkout/admin flows only with an approved test environment and test accounts.

## Explicitly out of scope
- No production/Preview DB connection, SQL, migration, seed, `db:push`, or data write.
- No gateway, COD/UPI, stock, or order policy changes. Delivery fee values and threshold are unchanged; the existing rule was centralized and tested.
- No production deployment, branch merge, or environment/secret modification.


## Continuous integration

- `.github/workflows/quality.yml` runs on pushes to `chore/security-hardening` and pull requests targeting `main`.
- It installs with the frozen lockfile, generates Prisma Client without connecting to a database, then runs unit tests, TypeScript, and ESLint.
- CI has only `contents: read` permission and does not receive application or production secrets.
- The workflow does not run `next build`; matching Vercel Preview is the production-build gate.
- Treat CI as pending until the GitHub Actions run for the exact commit is complete and its logs show all checks passed.


## First CI run — test expectation correction

- The first run of `pnpm test` on commit `659fb05657d3e73baad3f0a9239a0ee4b87ea50d` exposed that the initial expected transition matrix incorrectly rejected `PENDING → PROCESSING`.
- Source inspection confirms the pre-existing `STATUS_ORDER[next] > STATUS_ORDER[current]` predicate permits any later-ranked status, including skipped intermediate stages.
- Correct the expected matrix to preserve this current behavior. Do not tighten or otherwise change the production transition predicate as part of QA.
- The failed run stopped before standalone typecheck and lint; those checks remain pending until a successful rerun.


## Successful quality-check baseline

- GitHub Actions run `45133861216` for commit `17f672161b49ce67b8020c78ebb2b04639ce2fa4` passed `pnpm test`, `pnpm typecheck`, and `pnpm lint`.
- Matching Vercel Preview for that exact commit reached READY after successful Prisma generation, Next.js compilation, lint/type-check phase, and 34/34 static page generation.
- This baseline is superseded for subsequent commits; inspect each new commit's Actions run and Vercel Preview independently.

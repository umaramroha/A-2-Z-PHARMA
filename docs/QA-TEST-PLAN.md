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
- Exhaustively check every pair of existing order statuses: forward path PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED; cancellation only from PENDING, CONFIRMED, PROCESSING; reject same-state, backward/skipped, post-shipment cancellation, and transitions out of terminal states.
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

## Next test candidates (not covered yet)
1. Order-input validation boundaries and duplicate product-ID quantity aggregation after safe extraction.
2. Delivery fee boundaries (₹499/₹500) after a shared pure calculator is introduced without changing policy.
3. WhatsApp message/link encoding and quantity/total formatting.
4. API authorization and customer ownership using isolated mocks/test doubles.
5. Transaction rollback, concurrent stock reservation, and duplicate cancellation only with a disposable isolated test DB or purpose-built harness; never Preview/Production data.
6. Browser checkout/admin flows only with an approved test environment and test accounts.

## Explicitly out of scope
- No production/Preview DB connection, SQL, migration, seed, `db:push`, or data write.
- No gateway, COD/UPI, delivery, stock, or order policy changes in this initial test batch.
- No production deployment, branch merge, or environment/secret modification.

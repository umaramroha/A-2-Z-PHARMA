# A-2-Z PHARMA — QA Audit Findings

> Scope: read-only repository audit on `chore/security-hardening`. Findings below describe tracked source/configuration only. No commands that mutate the database, application data, or environment were run.

## QA-01 — ESLint configuration and scripts

**Status: Minimal Next.js ESLint configuration added; standalone `pnpm lint` passed in GitHub Actions run `45133861216` for commit `17f672161b49ce67b8020c78ebb2b04639ce2fa4`.**

### Verified repository facts

- `package.json` defines:
  - `"lint": "eslint ."`
  - `"build": "next build"`
  - `"db:generate": "prisma generate"`
  - `"db:push": "prisma db push"`
- ESLint is declared as `^8.57.0`; `eslint-config-next` is declared at `15.5.29`.
- At the initial audit commit, the tracked tree contained no ESLint configuration. A minimal `.eslintrc.json` extending `next/core-web-vitals` has since been added on this branch.
- No tracked `.github/workflows/` files were found.
- No tracked test, unit-test, integration-test, e2e, Jest, Vitest, Playwright, or Cypress paths/configuration were found in the repository tree.
- No test script or dedicated test-runner dependency appears in `package.json`.
- `tsconfig.json` enables `strict: true` and `noEmit: true`, with TypeScript source and Next-generated types included.
- The initial Preview build for commit `a23e0b613b35407fc28bbea258d205a7b36847ae` reported:
  - Prisma Client generation successful.
  - Next.js production compilation successful.
  - Next.js log line: `Linting and checking validity of types ...`.
  - Static page generation successful (34/34).
  - Deployment completed and reached READY.
- The build log does not identify the ESLint configuration used or prove that the standalone `pnpm lint` script works.

### Findings and implications

1. **Lint configuration gap:** the repository has a lint script and ESLint packages but no tracked ESLint configuration. With ESLint 8's legacy configuration discovery, `eslint .` is expected to fail when no applicable config is available. This command was not executed in this audit, so its actual exit code remains unverified.
2. **Build check is not a substitute for a verified standalone lint gate:** the Preview build passed and emitted Next.js's lint/type-check phase, but its log does not show which configuration or files ESLint checked. Do not describe `pnpm lint` as passing based on the Vercel build.
3. **Lint remediation outcome:** after adding `.eslintrc.json`, the first Preview exposed three unescaped-entity errors. Focused fixes were committed for the banner empty state, product empty state, and homepage apostrophe. The Preview for commit `0df5cc17227782666bfc22f1f8764f307404b76a` reached READY; its logs show Next.js compilation, the lint/type-check phase, route generation, and deployment completed. Warnings remain for `<img>` usage and missing React Hook dependencies; they did not block this build. This verifies the Vercel build's lint phase, not the standalone `pnpm lint` script.
4. **No automated test suite is currently evident:** no test script, test-runner dependency, or tracked test files/config were found. This is an inventory finding, not proof that no external/manual tests exist.
5. **No GitHub Actions CI workflow is currently tracked:** QA-04 should design a minimal workflow only after the individual lint and TypeScript commands are made reliable and tests are selected.
6. **Existing database scripts require strict handling:** scripts include table creation, admin/product seeding, date fixes, and order-table updates; `db:push` is also exposed as a package script. These are not QA checks and must not be run as part of CI or this audit without explicit approval. The current audit did not execute them.

### Recommended safe sequence

- QA-01: standalone `pnpm lint` passed in GitHub Actions run `45134250957` for commit `c728003f5bc771f06fbe90a71493dae5811ff4be`; non-blocking warnings remain visible in the Vercel build logs.
- QA-02: strict TypeScript settings remain enabled; standalone `pnpm typecheck` passed in the same exact-commit Actions run.
- QA-03: Node's built-in test runner is in place; order/payment transition and delivery-fee boundary suites passed in the recorded Actions run. Extend only with deterministic pure logic before any isolated DB-backed tests.
- QA-04: read-only GitHub Actions quality workflow is now green for the recorded commit. CI must not access production secrets or run database mutation/seed scripts.

### Safety and verification limits

- The initial audit made no changes. Subsequent focused commits added ESLint configuration, test scripts, a read-only CI workflow, and pure helper tests; no new dependency, Prisma schema, database, secret, or payment policy was changed.
- Standalone `pnpm test`, `pnpm typecheck`, and `pnpm lint` passed in Actions run `45134250957` for exact commit `c728003f5bc771f06fbe90a71493dae5811ff4be`. No database command was executed.
- The READY Preview verifies the configured Vercel build path for the exact commit; it does not establish runtime correctness, test coverage, or standalone lint-script reliability.


## QA-02 — Dedicated TypeScript check script

**Status: Script added; standalone `pnpm typecheck` passed in GitHub Actions run `45133861216` for commit `17f672161b49ce67b8020c78ebb2b04639ce2fa4`.**

### Verified implementation and deployment

- Added the package script `"typecheck": "tsc --noEmit"` in commit `1d685bea5cbb27c60f5b1ef6525c55bc5a3b519c`.
- The change was limited to `package.json`; dependency versions, lockfile, TypeScript configuration, Prisma schema, and application code were not changed.
- The exact commit was built by Vercel Preview deployment `dpl_BJMgysur78sjGiGWTbuz58TewGaC` for repository `umaramroha/A-2-Z-PHARMA`, branch `chore/security-hardening`.
- Deployment reached **READY**. Build logs confirm frozen-lockfile installation, Prisma Client generation, successful Next.js compilation, the integrated lint/type-check phase, route generation, and deployment completion.
- Existing non-blocking warnings include `<img>` optimization recommendations and missing React Hook dependencies.

### Verification limits and next steps

- The standalone `pnpm typecheck` command was not executed independently. Do not report it as independently passing based only on the Vercel build.
- QA-02's script addition and Preview build verification are complete; independent local command verification remains outstanding.
- QA-03 should select a minimal test approach and define focused tests for pure validation/state-transition logic. Avoid database-backed tests until a safe isolated test database and explicit scope are established.
- QA-04 should add CI only after standalone lint/typecheck execution and test tooling are reliable. CI must not run database mutation, seed, or production-environment scripts.


## QA-03 — Dependency-free unit test foundation

**Status: Order/payment transition unit suite passes in GitHub Actions run `45133861216`; broader business-flow coverage remains pending.**

- Inspected dependencies and lockfile; no Jest, Vitest, Playwright, Cypress, `tsx`, or `ts-node` test runner was already installed.
- Selected Node's built-in `node:test` and `node:assert/strict` to avoid a new dependency and lockfile churn.
- Added the `pnpm test` script (`node --test`).
- Extracted the existing order/payment transition constants and predicates into `src/lib/orderTransitions.mjs` without changing their rules; the admin order API now imports the same helper.
- Added exhaustive pairwise tests for both existing status sets in `src/lib/orderTransitions.test.mjs` and documented scope/limits in `docs/QA-TEST-PLAN.md`.
- Tests do not prove API authorization, Prisma transaction/rollback behavior, concurrent stock restoration, payment-method policy, or runtime behavior. Actual test/typecheck/lint/build results must be recorded after execution.
- No database, Prisma schema, business policy, payment configuration, environment secret, or customer/order data was changed. QA-04 CI remains pending until checks are independently reliable.


## QA-04 — Read-only GitHub Actions quality workflow

**Status: Workflow green for commit `17f672161b49ce67b8020c78ebb2b04639ce2fa4`; all three quality commands passed.**

- Added `.github/workflows/quality.yml` for pushes to `chore/security-hardening` and pull requests targeting `main`.
- The job uses read-only repository permissions, Node.js 20, pnpm 10.28.0, and `pnpm install --frozen-lockfile`.
- The job generates Prisma Client locally, then runs `pnpm test`, `pnpm typecheck`, and `pnpm lint`.
- No GitHub secrets, Vercel secrets, production credentials, database URL, database connection, migration, seed, `db:push`, or data-write step is configured.
- The workflow intentionally does not run `next build`; Vercel Preview already performs the configured production build and remains the build/deployment gate. This avoids inventing or exposing environment values in GitHub Actions.
- GitHub Actions run `45133861216` completed with conclusion `success`; all workflow steps including install, Prisma generation, unit tests, typecheck, and lint passed.
- Branch protection/required status checks were not changed. The branch currently reports protection disabled; enabling repository rules is outside this change.


## QA-03/04 — First automated CI execution and correction

**Historical first run: commit `659fb05657d3e73baad3f0a9239a0ee4b87ea50d` failed only because the test's expected matrix incorrectly rejected a permitted forward-rank transition. Corrected on commit `17f672161b49ce67b8020c78ebb2b04639ce2fa4`; subsequent Actions run passed.**

- GitHub Actions run: `45133695589`, commit `659fb05657d3e73baad3f0a9239a0ee4b87ea50d`.
- Frozen-lockfile dependency installation completed successfully.
- Prisma Client generation completed successfully without a database connection.
- `pnpm test` failed on `PENDING → PROCESSING`: actual predicate returned `true`, while the initial expected matrix said `false`.
- Existing source ranks order states and accepts any forward rank (not only the next adjacent state). Therefore the mismatch is in the new test expectation/documentation, not evidence that the application logic changed or failed.
- Corrective change updates the test matrix and plan to explicitly preserve skipped forward stages. Production transition rules remain unchanged.
- The successful rerun executed `pnpm test`, `pnpm typecheck`, and `pnpm lint`; all passed.


## QA-03 / COM-03 — Shared delivery fee rule and boundary tests

**Status: Verified by CI and matching Vercel Preview for commit `c728003f5bc771f06fbe90a71493dae5811ff4be`.**

- Source audit found the same ₹50 below ₹500 / free at ₹500+ rule duplicated in the cart, checkout, and order API; `deliveryConfig` already held those values but was not the shared calculation path.
- Added `src/lib/deliveryRules.mjs` as the single source of delivery fee values, the existing `areas: ["All India"]` setting, and a pure calculator.
- Calculator compares the integer rupee portion from the exact decimal string; the server passes `Prisma.Decimal.toString()` and still calculates subtotal from database product prices.
- Cart, checkout, and API now call the shared calculator. The empty-cart display remains free; non-empty carts follow the configured rule.
- Added tests for below/exact/above threshold, decimal boundaries, invalid amounts, and unchanged configuration values including `areas`.
- No fee amount, free-delivery threshold, pincode validation, payment policy, product price, order total source, Prisma schema, database, or business data changed.
- GitHub Actions run `45134250957` passed unit tests, typecheck, and lint; matching Vercel Preview `dpl_J7UNtiLmZxYMNNkgw29qJsKWuTHc` reached READY with successful compilation, integrated lint/typecheck, and 34/34 static page generation. Existing `<img>` and React Hook warnings remain non-blocking.
- Pincode remains syntax-only; no postal lookup, delivery serviceability, carrier, or region pricing has been introduced.


## QA-05 — Admin React Hook dependency warnings

**Status: Three initial warnings passed verification on commit `de7a4c0d27503b6f6585117b1c05a1a6e033e8eb`; two additional warnings corrected in this follow-up batch, verification pending.**

- The Vercel build reported missing useEffect dependencies for fetchStats, fetchOrders, and fetchProducts in the admin dashboard, orders, and products pages.
- Each loader is now memoized with useCallback and its actual dependency (router); the matching effect calls it and includes the callback in its dependency array.
- No ESLint rule was disabled or suppressed. Request URLs, authentication redirects, loading state, and API/business behavior are unchanged.
- Remaining img optimization warnings are not changed in this batch because image sources include user-managed/dynamic URLs and should be migrated only after the supported host/loader behavior is audited.


## QA-05 follow-up — Admin settings and customer order detail

**Status: Two additional dependency warnings corrected; verification pending.**

- Memoized the admin settings loader with `useCallback([router])` and moved the effect to depend on that callback.
- Memoized the customer order loader with `useCallback([orderId])`; the effect now depends on authentication state, the scalar route ID, router, and loader callback instead of the entire params object.
- Request endpoints, authorization redirects, order ownership checks, UI, and business behavior are unchanged.
- No lint rules are disabled. Re-run Actions and inspect the exact Preview build log to confirm the five hook warnings are gone.

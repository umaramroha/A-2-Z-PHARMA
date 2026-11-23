# A-2-Z PHARMA — QA Audit Findings

> Scope: read-only repository audit on `chore/security-hardening`. Findings below describe tracked source/configuration only. No commands that mutate the database, application data, or environment were run.

## QA-01 — ESLint configuration and scripts

**Status: Minimal Next.js ESLint configuration added; Vercel build lint phase passes. Standalone `pnpm lint` remains unverified.**

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

- QA-01: configuration and build-integrated lint remediation are complete for the current Preview path. Run `pnpm lint` separately in a controlled development environment before claiming the standalone script is independently verified.
- QA-02: retain strict TypeScript settings and establish a dedicated `typecheck` script using `tsc --noEmit`; run it with installed dependencies. A successful Next.js build is useful evidence but does not replace a separately recorded TypeScript command result.
- QA-03: select a small test framework and write focused tests for pure validation/state-transition logic before attempting database-backed integration tests.
- QA-04: add GitHub Actions only after the checks above are independently executable. CI must not access production secrets or run database mutation/seed scripts.

### Safety and verification limits

- The initial audit made no changes. Subsequent focused commits added `.eslintrc.json` and escaped three unescaped JSX entities; no test framework, CI workflow, dependency, Prisma schema, database, secret, or business rule was changed.
- No standalone `pnpm lint`, `tsc --noEmit`, test command, or database command was executed. The successful Preview build is the only current verification of the integrated lint/type-check phase.
- The READY Preview verifies the configured Vercel build path for the exact commit; it does not establish runtime correctness, test coverage, or standalone lint-script reliability.


## QA-02 — Dedicated TypeScript check script

**Status: Script added; matching Vercel Preview build verified. Standalone `pnpm typecheck` remains unverified.**

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

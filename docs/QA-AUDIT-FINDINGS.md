# A-2-Z PHARMA — QA Audit Findings

> Scope: read-only repository audit on `chore/security-hardening`. Findings below describe tracked source/configuration only. No commands that mutate the database, application data, or environment were run.

## QA-01 — ESLint configuration and scripts

**Status: Source audit complete; standalone lint command is not established as a reliable gate.**

### Verified repository facts

- `package.json` defines:
  - `"lint": "eslint ."`
  - `"build": "next build"`
  - `"db:generate": "prisma generate"`
  - `"db:push": "prisma db push"`
- ESLint is declared as `^8.57.0`; `eslint-config-next` is declared at `15.5.29`.
- The tracked repository tree (148 paths at audited commit) contains no `.eslintrc*`, `eslint.config.*`, or `.eslintignore` file.
- No tracked `.github/workflows/` files were found.
- No tracked test, unit-test, integration-test, e2e, Jest, Vitest, Playwright, or Cypress paths/configuration were found in the repository tree.
- No test script or dedicated test-runner dependency appears in `package.json`.
- `tsconfig.json` enables `strict: true` and `noEmit: true`, with TypeScript source and Next-generated types included.
- The latest Preview build for commit `a23e0b613b35407fc28bbea258d205a7b36847ae` reported:
  - Prisma Client generation successful.
  - Next.js production compilation successful.
  - Next.js log line: `Linting and checking validity of types ...`.
  - Static page generation successful (34/34).
  - Deployment completed and reached READY.
- The build log does not identify the ESLint configuration used or prove that the standalone `pnpm lint` script works.

### Findings and implications

1. **Lint configuration gap:** the repository has a lint script and ESLint packages but no tracked ESLint configuration. With ESLint 8's legacy configuration discovery, `eslint .` is expected to fail when no applicable config is available. This command was not executed in this audit, so its actual exit code remains unverified.
2. **Build check is not a substitute for a verified standalone lint gate:** the Preview build passed and emitted Next.js's lint/type-check phase, but its log does not show which configuration or files ESLint checked. Do not describe `pnpm lint` as passing based on the Vercel build.
3. **No automated test suite is currently evident:** no test script, test-runner dependency, or tracked test files/config were found. This is an inventory finding, not proof that no external/manual tests exist.
4. **No GitHub Actions CI workflow is currently tracked:** QA-04 should design a minimal workflow only after the individual lint and TypeScript commands are made reliable and tests are selected.
5. **Existing database scripts require strict handling:** scripts include table creation, admin/product seeding, date fixes, and order-table updates; `db:push` is also exposed as a package script. These are not QA checks and must not be run as part of CI or this audit without explicit approval. The current audit did not execute them.

### Recommended safe sequence

- QA-01: add an explicit, version-compatible ESLint configuration only after selecting the intended rules and confirming compatibility with the installed Next.js/ESLint versions; then run `pnpm lint` in a controlled development environment.
- QA-02: retain strict TypeScript settings and establish a dedicated `typecheck` script using `tsc --noEmit`; run it with installed dependencies. A successful Next.js build is useful evidence but does not replace a separately recorded TypeScript command result.
- QA-03: select a small test framework and write focused tests for pure validation/state-transition logic before attempting database-backed integration tests.
- QA-04: add GitHub Actions only after the checks above are independently executable. CI must not access production secrets or run database mutation/seed scripts.

### Safety and verification limits

- No ESLint configuration, test framework, CI workflow, application code, dependencies, Prisma schema, database, secrets, or business rules were changed in this audit.
- No standalone `pnpm lint`, `tsc --noEmit`, test command, or database command was executed.
- The READY Preview verifies the configured Vercel build path for the exact commit; it does not establish runtime correctness, test coverage, or standalone lint-script reliability.

# Project Decisions

This file records durable decisions for A-2-Z PHARMA. Update it when an approved decision changes.

## Repository boundaries
- The implementation target is `umaramroha/A-2-Z-PHARMA`.
- `umaramroha/Amroha-Pharmacy-v2` is a read-only reference for comparison and learning.
- Never commit, push, merge, or deploy changes to the reference repository.

## Product identity and scope
- A-2-Z PHARMA retains its own business identity, branding, contact information, address, content, data, and business rules.
- Reference-project features are not copied automatically. Compare first, then adopt only what fits A-2-Z requirements.
- Preserve existing customer and admin functionality unless a change is explicitly required and verified.
- Avoid unrelated redesigns, feature additions, and dependency upgrades.

## Change discipline
- Audit existing implementation before changing it; do not rewrite code based only on assumptions or a reference implementation.
- Plan related multi-file changes together and commit them as one coherent batch. Keep unrelated tasks separate; isolate security-sensitive, payment, schema, and data-impacting changes. Review the full combined diff and run the relevant checks before committing.
- Review the diff and run the applicable checks before committing.
- Never hide a failing check by disabling it or weakening its configuration without a documented reason.

## Preview verification
- Work on `chore/security-hardening` and use its Vercel Preview deployments for validation.
- After each individual commit, inspect the matching Preview deployment and build logs.
- Do not begin the next commit until the previous commit's Preview checkpoint has been reviewed.
- A READY deployment confirms build/deployment completion, not complete end-to-end functionality.
- Do not merge to `main`, promote Production, or deploy Production without explicit user approval.

## Protected operations
- Do not change database schema, run migrations, execute `prisma db push`, run seed scripts, or write to a database without explicit approval.
- Do not change Production environment variables, secrets, or live data without explicit approval.
- Keep credentials and secret values out of source control, logs, and documentation.
- Preserve existing payment, delivery, stock, order, cancellation, authentication, and admin business rules.

## Verification and documentation
- Distinguish confirmed findings from unverified risks.
- Record tests as pending until they have actually been run.
- Keep architecture, parity, backlog, known-issue, QA, and project-status documents aligned with the code that has been inspected.
- Do not claim automated tests, AI auto-repair, or CI protections exist unless they are configured and verified.

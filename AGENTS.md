# A-2-Z PHARMA — Agent Instructions

## 1. Repository boundaries

- **Development target:** `umaramroha/A-2-Z-PHARMA` only.
- **Read-only reference:** `umaramroha/Amroha-Pharmacy-v2`.
- Never create, edit, commit, push, merge, or deploy changes to the reference repository.
- Use the reference to study design, UI patterns, workflows, and functionality. Preserve A-2-Z PHARMA's own business identity, branding, content, data, contact details, and approved business rules.
- A reference-only feature is not automatically approved for implementation. Compare and document gaps; implement only when compatible with the current A-2-Z requirements and decisions.

## 2. Source of truth and requirement handling

Before every task:
1. Review this file and relevant project documentation.
2. Review the user's original requirement and the latest explicit decisions.
3. Inspect the current implementation and Git diff/state.
4. Check the backlog, known issues, dependencies, and likely side effects.
5. Define what completion and verification mean before editing.

The latest explicit user decision wins when it clearly changes an earlier decision. Record material changes in `docs/DECISIONS.md`. Do not silently remove or reinterpret existing requirements.

## 3. Protected application behavior

Preserve existing A-2-Z functionality unless the user explicitly approves a change, including:
- Customer registration, login, profile, and order history.
- Product catalogue and product detail behavior.
- Cart and checkout.
- COD and UPI/manual payment workflows.
- Existing delivery fee rules and pincode behavior.
- Stock validation, order creation, cancellation, and status transitions.
- Admin login, dashboard, products, banners, orders, and settings.
- Existing branding, contact details, address, and business content.

Do not redesign the application or add unrelated features during security/maintenance work.

## 4. Safety boundaries

Never, without explicit user approval:
- Merge a branch or promote/deploy to Production.
- Change production environment variables or secrets.
- Run SQL, database writes, Prisma migrations, `prisma db push`, seed scripts, or destructive data operations.
- Change Prisma schema or database relationships.
- Delete user data, alter payment configuration, or change business rules.

Do not expose secrets in output, logs, commits, or documentation. Treat `.env` and Vercel secret values as confidential.

## 5. Implementation discipline

- Work only on the approved A-2-Z development branch (currently `chore/security-hardening` unless the user directs otherwise).
- Inspect Git status and the target branch head before editing. Preserve unrelated user changes.
- Prefer the smallest safe, backward-compatible change.
- Avoid broad dependency upgrades, rewrites, and unrelated cleanup.
- Group related files into one planned batch and one commit when they implement a coherent task (for example, a pure helper, its tests, the calling route, scripts, and matching documentation). Split unrelated or high-risk work into separate batches. Review every changed file and the complete combined diff before committing.
- Do not claim tests or runtime behavior were verified unless they were actually checked.
- If blocked, document the exact blocker and continue only with independent, safe work.

## 6. Required verification and deployment checkpoint

For each code or documentation commit:
1. Verify repository, branch, commit SHA, and changed files.
2. Inspect the corresponding Vercel Preview deployment and its actual build logs.
3. Confirm the deployment belongs to the expected commit and branch.
4. Check install, Prisma generation, compilation, lint/type checks, page generation, and final deployment state where applicable.
5. If failed, investigate the real error and make a focused correction in a separate commit; inspect that commit's Preview too.
6. Do not make the next change until the current commit's Preview checkpoint has been reviewed.

A successful push is not proof of a successful build. A successful build is not proof that every user flow works. Report these verification levels separately. Manual/production behavior must not be claimed unless actually tested in the relevant environment.

## 7. Quality checks

Use the checks supported by the repository. Current build command is:
```sh
pnpm prisma generate && pnpm run build
```

Use `npx tsc --noEmit` when a local Node/Termux environment is available and the dependency state is suitable. Inspect the actual ESLint setup before relying on `pnpm lint`. Do not weaken or disable genuine checks to make a build green.

Before introducing GitHub Actions, test frameworks, or new automation:
- Inspect existing workflows and scripts first.
- Avoid duplicate checks and unnecessary dependencies.
- Keep CI read-only with respect to production data.
- Do not run database mutation scripts in CI.
- Require successful checks before considering a change complete.

## 8. Continuous development and progress memory

Continue with the highest-priority independent task after a verified checkpoint; do not stop merely because one small task is complete. Keep the user informed about material findings, blockers, and required user actions.

Maintain project documentation in `docs/` when it is introduced:
- `ARCHITECTURE.md`: verified architecture and important data flows.
- `REFERENCE-PARITY-MATRIX.md`: reference/target comparison and scope decisions.
- `FEATURE-BACKLOG.md`: prioritized pending work and dependencies.
- `PROJECT-STATUS.md`: current branch/commit, completed work, blockers, and exact next task.
- `DECISIONS.md`: durable decisions and reasons.
- `KNOWN-ISSUES.md`: confirmed issues, impact, and status.
- `QA-TEST-PLAN.md`: repeatable checks and test coverage.

Document only facts verified from the repository or user decisions. Mark unknowns as unverified; never invent completion status.

## 9. Current project safeguards

- Production is separate from the security-hardening Preview branch.
- No Production merge/deploy is authorized by this file.
- The Prisma schema/database must remain unchanged unless the user explicitly approves.
- Keep reference repository access read-only.

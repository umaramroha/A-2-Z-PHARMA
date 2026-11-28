# A-2-Z Pharma — Release Readiness

**Review date:** 28 November 2026  
**Repository:** \`umaramroha/A-2-Z-PHARMA\`  
**Working branch:** \`chore/security-hardening\`  
**Reviewed branch head:** \`9fcfb1f61a5691ed82a05baa0dc8c64813a4a1de\`  
**Status:** **NOT PRODUCTION-READY.** Code hardening is progressing on a Preview branch. This is not production launch approval.

## Latest verified checkpoint

- GitHub Actions run \`46139023206\` for the reviewed commit passed **52/52 unit tests**, TypeScript, and ESLint.
- ESLint emitted 13 non-blocking \`@next/next/no-img-element\` warnings. No lint errors.
- Matching Vercel Preview deployment \`dpl_HohsQgnbHeP6gaWnKrpwbJujPdrj\` reached READY; the Next.js build generated 39/39 static pages.
- Source review covers customer/Admin sessions, order ownership, rate limiting, validation/body limits, baseline security headers, checkout/order creation, cancellation, payment transitions, stock restoration and product management.
- Amroha Pharmacy v2 was used only as a read-only reference. Its repository and data were not modified.

## Implemented in the current branch

- COD and manual UPI only; no payment gateway.
- Manual UPI must be verified and marked PAID before shipping/delivery.
- COD can be marked PAID only after delivery and collection.
- Refunds can be recorded for paid cancelled or delivered orders only after Admin confirms the transfer was actually sent. No automatic refund transfer.
- Customer cancellation is limited to the customer's own PENDING/CONFIRMED/PROCESSING order. Customer/Admin cancellation use transactional compare-and-set before stock restoration.
- Customer order creation is limited to 5 valid attempts per customer per 15-minute window. Old rate-limit records are pruned on a 1% request sample.
- Product Admin supports one Cloudinary image upload plus a manual image URL field.
- Privacy, Terms, Shipping, Returns/Refunds, and Medical/Product Disclaimer pages exist; product detail links to the disclaimer.
- Global WhatsApp, centralized contact details, English Admin empty states, root README, \`.env.example\`, and stronger \`.gitignore\` rules are present.
- \`db:push\` package shortcut and obsolete one-off SQL/source-edit/demo-seed scripts were removed.

## Must be resolved before accepting real customer orders

0. **Prisma ORM support**
   - The repository pins `prisma` and `@prisma/client` to 5.22.0. Prisma 6 support ended on 19 November 2026; the official supported upgrade path for PostgreSQL is Prisma 7. Prisma 7 requires Node 20.19+/22.12+, ESM compatibility, a `prisma.config.ts`, and a PostgreSQL driver adapter. The current app has no Prisma config/adapter. See the [official release status](https://www.prisma.io/docs/orm/release-status) and [Prisma 7 upgrade guide](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7).
   - Do not perform a package-only bump. Regenerate the pnpm lockfile in an approved environment, then validate connection pooling, transactions, order creation, cancellation and stock restoration against an isolated staging database. No Prisma upgrade or DB change was performed in this review.


1. **Database isolation and RateLimit table**
   - Vercel metadata showed one \`DATABASE_URL\` record scoped to both Production and Preview. The secret value was not decrypted.
   - The user reported manually creating \`RateLimit\` and \`RateLimit_resetAt_idx\` in Neon SQL Editor. It has not been independently confirmed that this is the exact database referenced by Vercel.
   - Rate limiting fails closed if the table is missing. Verify the target database through an approved read-only method before launch.
   - Do not use Preview for order, cancellation, stock, or payment tests until it has a separate isolated database. No DB reads/writes or schema changes were performed during this review.

2. **Real product and regulatory data**
   - Replace demonstration/placeholder catalogue entries with actual products, prices, stock, labels, composition, manufacturer, warnings and other required information.
   - Confirm the business's actual drug licence and legal-operator details with the owner and obtain qualified compliance/legal review. Do not invent licence numbers, approvals or medical claims.

3. **Business operations and contact details**
   - Owner must confirm phone/WhatsApp number, email, address, serviceable pincodes, delivery charges/coverage, dispatch estimates, cancellation/return/refund rules, data practices and grievance contact.
   - No UPI ID/recipient details were configured or independently verified in this code review. Staff must provide verified manual UPI details. No gateway or automatic refund provider is integrated.
   - No email provider, order email notification, password reset or email-verification workflow was found.

4. **Real workflow validation**
   - Run customer registration/login, checkout, COD, manual UPI, cancellation, stock restoration, delivery and refund tests only against an isolated staging database with test products.
   - Verify Cloudinary upload, WhatsApp handoff, delivery/serviceability and any operational notifications manually. Source checks and CI are not end-to-end proof.

5. **Order idempotency**
   - Checkout prevents repeat clicks within one mounted form and order creation is rate-limited. A server-side idempotency key that safely returns the original order after network retries is not implemented.
   - Proper idempotency needs a persisted request key/unique constraint or equivalent database design. Treat as a recommended pre-launch improvement; do not add schema changes without approval.

6. **Cloudinary upload controls**
   - The existing unsigned Cloudinary preset is public by design. Client-side file type/size checks can be bypassed; preset-side allowed formats, maximum size and folder restrictions were not independently verified.
   - Preview upload was not tested because Cloudinary public variables are scoped to Production only. Review preset restrictions before scaling, or approve a signed server-upload design with a secret.

## Known scope limitations

- No payment gateway; manual UPI remains staff-verified.
- Prisma ORM 5.22.0 remains a high-priority dependency-support blocker until a tested Prisma 7 upgrade is completed.
- No automatic refund transfer; staff sends the refund and only then marks REFUNDED.
- No carrier API, postal lookup or enforced delivery-zone serviceability check.
- No customer password reset or email-verification flow.
- No browser E2E suite or real DB transaction/concurrency test was run.
- 13 non-blocking \`<img>\` optimization warnings remain in ESLint.
- Preview's database isolation from Production is not confirmed.

## Deployment and safety boundary

- This work remains on \`chore/security-hardening\`.
- No merge to \`main\`, production promotion/deployment, production secret/environment change, database migration, schema change, SQL write, seed or production data mutation was performed.
- Do not describe this branch as production-ready until the owner completes the operational items above and isolated staging tests pass.

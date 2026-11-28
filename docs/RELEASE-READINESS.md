# A-2-Z Pharma — Release Readiness

**Review date:** 28 November 2026  
**Repository:** `umaramroha/A-2-Z-PHARMA`  
**Working branch:** `chore/security-hardening`  
**Status:** Code hardening is progressing on a Preview branch. This is **not production launch approval**.

## Verified in the latest reviewed checkpoint

- GitHub Actions run `46138450965` for commit `056585449644972067f2cd1064fe8c1d04a91fa4` passed: 52/52 unit tests, TypeScript check, and ESLint.
- Matching Vercel Preview deployment `dpl_9LYvRebqTKLAUX1v1TLc4Kna7sWp` reached READY. The Next.js build generated all 39 static pages.
- Admin/customer session validation, order ownership checks, rate limiting, input/body validation, and baseline security headers have been reviewed at source level.
- COD and manual UPI state rules are covered by pure unit tests. UPI must be verified before shipment/delivery; COD is marked paid only after delivery; cancellation restores stock in a transaction; refunds are recorded manually.
- Customer cancellation and admin cancellation use compare-and-set updates before stock restoration. Duplicate concurrent cancellation cannot restore stock twice at the application transaction boundary.
- Terms, Privacy, Shipping, Returns/Refunds, and Medical/Product Disclaimer pages exist. Unverified business claims and fixed refund promises were removed.
- Amroha Pharmacy v2 was used as a read-only reference. No reference repository changes were made.

## Must be resolved before accepting real customer orders

1. **Database isolation and RateLimit table**
   - Vercel metadata shows one `DATABASE_URL` record scoped to both Production and Preview. The secret value was not decrypted.
   - The user reported manually creating the `RateLimit` table and `RateLimit_resetAt_idx` in Neon SQL Editor. It has not been independently confirmed that this was the exact database referenced by Vercel.
   - Rate limiting fails closed if the table is missing. Verify the target database through an approved read-only method before launch.
   - Do not use Preview for order, cancellation, stock, or payment tests until Preview has a separate isolated database. No DB reads/writes or schema changes were performed during this review.

2. **Real product and regulatory data**
   - Replace any demonstration/placeholder catalogue entries with actual products, prices, stock, labels, composition, manufacturer, warnings, and other required information.
   - Confirm the business's actual licence and legal-operator details with the owner and obtain qualified compliance/legal review. Do not invent licence numbers, approvals, or medical claims.

3. **Business operations and contact details**
   - Owner must confirm phone/WhatsApp number, email, address, serviceable pincodes, delivery charges/coverage, dispatch estimates, cancellation/return/refund rules, and grievance contact.
   - Confirm the actual UPI recipient/ID and staff verification procedure. No UPI ID or automatic payment/refund gateway is configured by this code review.

4. **Real workflow validation**
   - Run customer registration/login, checkout, COD, manual UPI, cancellation, stock restoration, delivery, and refund tests only against an isolated staging database with test products.
   - Verify email/WhatsApp notifications and delivery/serviceability manually. Source checks and CI are not end-to-end proof.

5. **Order idempotency**
   - The checkout prevents repeated clicks within the same mounted form and order creation is rate-limited. A server-side idempotency key that safely returns the original order after network retries is not implemented.
   - Proper idempotency needs a persisted request key/unique constraint or an equivalent database design. Treat this as a recommended pre-launch improvement if customers may retry after a timeout; do not add schema changes without approval.

## Known scope limitations

- No payment gateway; manual UPI remains staff-verified.
- No automatic refund transfer; staff must send the refund and only then mark the order REFUNDED.
- No carrier API, postal lookup, or enforced delivery-zone serviceability check.
- No customer password reset or email-verification flow.
- No browser E2E suite or real DB transaction/concurrency test was run.
- Vercel Cloudinary upload variables are Production-only; Preview upload behavior was not verified.
- The unsigned Cloudinary upload preset is intentionally public by design; review upload restrictions/abuse controls in Cloudinary before scaling.

## Deployment and safety boundary

- This work remains on `chore/security-hardening`.
- No merge to `main`, production promotion/deployment, production secret/environment change, database migration, schema change, SQL write, seed, or production data mutation was performed.
- Do not describe this branch as production-ready until the owner completes the operational items above and isolated staging tests pass.

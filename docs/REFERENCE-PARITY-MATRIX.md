# Reference Parity Matrix

Comparison snapshot: A-2-Z-PHARMA branch `chore/security-hardening` at commit `738d93e` versus read-only reference `Amroha-Pharmacy-v2` branch `main` at the inspected snapshot.

## How to read this matrix
- **Present (route/file)** means a corresponding route or model was found in the repository tree. It does not prove the flow works end to end.
- **Reference-only** means the feature has a visible route, component, library module, or schema support in the reference snapshot but no corresponding target route/file was found in the inspected target tree.
- **Partial / verify** means some related target capability exists, but parity or behavior needs code-level review and testing.
- No reference code, branding, business details, database data, or secrets are copied by this comparison.
- This is a route/tree/schema inventory, not a complete implementation audit. Any adoption requires a separate requirement and risk review.

## Core customer journeys

| Capability | A-2-Z PHARMA | Reference | Assessment |
|---|---|---|---|
| Home page and product discovery | Home, products, product detail routes present | Same | Present in both |
| Product catalogue and detail | `/products`, `/products/[slug]` and product APIs present | Same | Present in both; data and UX parity not established |
| Customer registration/login/logout/session | Register, login, logout, me and profile-update APIs present | Same, plus verification and password recovery | Partial / verify |
| Customer profile | `/profile` and update-profile API present | Same | Present in both |
| Cart and checkout | `/cart`, `/checkout` present | Same | Present in both; detailed checkout behavior not compared |
| Orders and order detail | `/orders`, `/orders/[id]`, order APIs present | Same, plus quote, cancel and payment-switch endpoints | Partial / verify |
| Order cancellation | No dedicated `/api/orders/[id]/cancel` route in target tree; behavior may be elsewhere | Dedicated cancel route present | Reference-only route; inspect target order route before deciding |
| Payment method switching | No dedicated payment-switch route found | Dedicated switch-payment route present | Reference-only route |
| Delivery quote / zone pricing | No dedicated quote route found | Quote route and delivery/pricing modules present | Reference-only route; compare A-2-Z delivery rules before considering |
| Wishlist | No wishlist route/component found in target tree | Wishlist page and context found | Reference-only |
| Blogs | Blog listing and slug routes present | Blog listing, slug and Hindi slug routes present | Partial / verify; Hindi blog route is reference-only |
| Concerns / health categories | No concerns routes/components found | Concerns listing and slug routes plus data found | Reference-only |
| Health tips | No equivalent health-tips component/data tree found | Health tips pages/components/data found | Reference-only |
| Legal/policy pages | No dedicated policy routes found | Disclaimer, privacy, returns, shipping and terms routes found | Reference-only |
| Contact/about | Both have about and contact routes | Both have about and contact routes | Present in both |

## Admin and operations

| Capability | A-2-Z PHARMA | Reference | Assessment |
|---|---|---|---|
| Admin authentication/session | Admin login/logout/me APIs and admin session helper present | Same | Present in both |
| Admin dashboard/stats | Dashboard and stats route present | Same | Present in both |
| Admin product management | Admin product page and CRUD APIs present | Same | Present in both |
| Admin order management | Admin orders page and APIs present | Same | Present in both |
| Admin banners | Admin banners page and APIs present | Same | Present in both |
| Admin settings | Admin settings page and API present | Same | Present in both |
| Admin customer management/follow-up | No admin customers route/page found | Customer management and follow-up APIs/page found | Reference-only |
| Coupons | No coupon routes, page, or target coupon model found | Coupon admin APIs/page and Coupon model found | Reference-only |
| Promotions/campaign management | No promo admin route/page found | Promo route/page and marketing/promo modules found | Reference-only |
| Notification history/resend | No notification admin route/page found | Notification APIs/page and NotificationLog model found | Reference-only |
| Reports/revenue | No dedicated reports page/API found | Reports page/API and revenue module found | Reference-only |
| Email subscription management | No subscribe/confirm/unsubscribe routes found | Subscription routes and EmailSubscriber model found | Reference-only |

## Data model differences that need deliberate review

The target schema currently contains Product, Order, OrderItem, AdminUser, Customer, and Banner models.

The inspected reference schema additionally contains:
- Product gallery and medicine-information fields (images, manufacturer, composition, usage, warnings, batch number, expiry date).
- Order discounts, coupon, delivery-zone, courier/tracking, and payment-reference fields.
- Customer verification, password-reset, follow-up, and marketing-consent fields.
- Admin password-change timestamp.
- RateLimit, Coupon, NotificationLog, and EmailSubscriber models.
- Additional indexes on frequently queried fields.

These are **not automatic migration recommendations**. They affect database shape, customer data, business rules, and operational behavior. Do not add models/columns or run migrations/db push without a separately approved plan.

## Candidate backlog (not yet approved as feature adoption)

1. Audit A-2-Z order and checkout code against its own COD/UPI and delivery requirements; verify pricing, stock, cancellation and status transitions.
2. Review session invalidation and password-change behavior for both admin and customers.
3. Inspect rate-limit implementation and confirm the required backing table exists without querying or mutating production data.
4. Decide whether legal/policy pages are required for A-2-Z's actual business and jurisdiction; author A-2-Z-specific content only.
5. Evaluate password recovery/email verification only after checking available email provider configuration and the desired customer experience.
6. Evaluate product gallery/medicine details only if A-2-Z product operations require them.
7. Evaluate wishlist, coupons, promo campaigns, reports, customer follow-up, notification resend, and subscriptions individually against actual business need.
8. Add automated tests and CI only after the existing lint/typecheck setup has been audited.

## Explicit exclusions
- Do not copy the reference project's brand, Amroha business details, address, contact information, customer/product/order data, or visual identity.
- Do not bulk-copy reference files or schema.
- Do not introduce payment gateways, marketing emails, coupons, tracking integrations, or other external services merely because the reference has them.
- Do not run database migrations, `prisma db push`, seed scripts, or database writes as part of this comparison.

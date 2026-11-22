# A-2-Z PHARMA — Operational Readiness Audit Findings

**Audit branch:** `chore/security-hardening`  
**Inspected source state:** commit `34bfcd194ed082e73155f764ea7caa171bb4ddf3`  
**Scope:** Read-only source inspection of the App Router page tree, root layout, header/footer navigation, About page, Contact page, and checkout consent text. No legal copy, business facts, application code, environment, or database was changed.

## OPS-01 — Legal and customer policy pages

### Confirmed source findings

- The discovered `src/app` route tree contains no dedicated Terms, Privacy, Shipping/Delivery, Returns/Refunds, or Cancellation policy page.
- The global footer links to Shop All, About Us, Health Blog, Contact, and product categories. It has no legal/policy links.
- The header navigation likewise has no legal/policy links.
- Checkout displays the sentence “By placing order you agree to our Terms”, but “Terms” is plain text: it is not linked to a Terms page or document.
- The Contact page collects name, mobile number, optional email, and message, then constructs a WhatsApp message and opens WhatsApp. This form is not submitted to a server endpoint in the inspected source.
- Checkout collects customer identity/contact details and delivery address (including city, state, and pincode) and submits them to the order API. The inspected customer-facing source does not link to a privacy notice explaining this data handling.
- The About page contains material business claims that require owner verification before being relied on in customer-facing legal/policy material: “500+ Happy Customers”, “100+ Products”, “100% Authentic”, “All India Delivery”, “qualified Ayurvedic & Unani experts”, sourcing from trusted manufacturers/practitioners, and statements about the business's history and service. This audit does not verify those claims.
- The Contact page and footer currently display the business location as Amroha, Uttar Pradesh, India, phone `+91 84101 27168`, and email `sahyogherbalpharmacy@gmail.com`. These are observed site details, not verification of the legal operator's registered name or registered address.

### Readiness gaps

1. A customer cannot open the Terms referenced at checkout because no linked Terms page exists in the inspected route tree.
2. No linked privacy notice was found for the personal/contact and delivery information collected through checkout and the WhatsApp contact form.
3. No dedicated delivery/shipping policy explains dispatch or delivery estimates, serviceability limitations, failed delivery, or delivery-fee rules.
4. No dedicated cancellation, return, or refund policy explains eligibility, process, timelines, exceptions, or how the current COD and manual/pending UPI workflows are handled.
5. The legal operator identity, registered/business address, applicable licence/registration details, grievance contact/process, and final policy wording are not established by the inspected source. Do not infer or fabricate them.
6. Quantitative, authenticity, sourcing, consultation, and all-India delivery claims on the About page need owner confirmation. No claim should be copied into a policy or strengthened without evidence.

### Safe next step — business facts required

Before creating or publishing policy pages, the business owner must confirm:
- The exact legal business/operator name and the address to publish (and whether the Amroha location shown today is the correct customer-facing address).
- Which licences/registrations apply to this business and which details are approved for public display.
- Actual shipping coverage/serviceability, dispatch/delivery estimates, carrier process, and the existing ₹50-under-₹500 / free-at-₹500 delivery rule.
- Cancellation cut-off and process; return/refund eligibility, exclusions, timelines, and responsible contact.
- Whether UPI remains a manual/pending payment option, how payment evidence is checked, and what happens on cancellation/refund.
- What customer data is collected, why it is used, which service providers receive it (including WhatsApp), and the approved retention/contact process.
- A monitored grievance/support contact and response process.
- Evidence or approval for the About-page claims listed above.

These findings are an implementation/source audit, not legal advice or a determination that any particular statutory provision applies. Have the final policy text reviewed by an appropriately qualified legal/compliance professional before publication.

### OPS-01 conclusion

**OPS-01 source audit complete; publication is blocked on business-owner facts and legal review.** The Terms reference at checkout currently has no corresponding linked page. No policy pages or footer links should be invented from assumptions.

### Explicit non-actions

- No legal text or policy page was drafted or published.
- No business identity, address, contact detail, licence, delivery, payment, cancellation, return, or refund rule was changed.
- No application code, database, environment variable, or production setting was changed.
- No production deployment, merge, or promotion was performed.

## OPS-02 — Password recovery and email verification

**Audit branch:** `chore/security-hardening`  
**Inspected source state:** commit `fb24f732edb13c61d68d9b4dcb30ff27ba2975f0`  
**Scope:** Read-only inspection of the tracked App Router route tree, customer login/registration pages and API routes, AuthContext, session helper, Prisma Customer model, package dependencies, and tracked repository filenames. No provider settings, secret values, database, or application code were changed.

### Confirmed source findings

- The tracked `src/app` route tree contains login and registration pages, but no forgot-password, reset-password, verify-email, or verification-callback page.
- The tracked `src/app/api/auth` route tree contains login, logout, current-user, registration, and profile-update endpoints only. No password-reset request/consume endpoint or email-verification endpoint was found.
- Customer registration creates the Customer row with a bcrypt password hash and immediately creates an authenticated customer session. There is no pending-verification state or email-confirmation gate in the inspected registration flow.
- Login validates the supplied email/password and creates a session after password comparison. No verified-email condition is checked.
- The Prisma `Customer` model contains identity, email, mobile, password hash, creation timestamp, and order relation only. No email verification timestamp/status, verification token, password reset token, or token expiry fields were found.
- `package.json` includes no dedicated email delivery/provider dependency (for example, Nodemailer or a transactional email SDK). No email utility/template module was found in the tracked source tree.
- The tracked repository tree contains no `.env.example` or equivalent provider configuration template. This does not establish what environment variables may be configured in Vercel.
- No email-verification or password-recovery implementation was found in the inspected source. No email was sent as part of the inspected registration/login flow.

### Readiness gaps and boundaries

1. Customers have no self-service password recovery route in the inspected application source. A forgotten password currently has no implemented recovery workflow.
2. New customer accounts are not required by the inspected source to verify ownership of the supplied email address before receiving a logged-in session.
3. There is no visible token lifecycle implementation for one-time use, expiry, invalidation, replay protection, or rate limiting specific to reset/verification requests.
4. The presence, names, or validity of any provider credentials in Vercel environment settings were not inspected and remain **unverified**. No secret values were requested, retrieved, printed, or changed.
5. No provider choice, sender identity, email template, delivery policy, or account-recovery business rule is established by the current source. Do not select a provider or invent these values.
6. Adding these workflows may require schema and security design decisions (token storage/hash, expiry, single-use semantics, account enumeration protection, throttling, session invalidation, and email delivery failure handling). No schema change is authorized by this audit.

### Safe next step

Record the business/provider decision first: approved sender identity and support contact, preferred email provider, and whether verification is required before account access. Then prepare a design covering hashed single-use tokens, expiry, rate limits, generic responses to prevent account enumeration, session invalidation after password reset, and delivery-failure handling. Any schema migration, provider installation, environment/secret change, or behavior implementation must be separately approved before execution.

### OPS-02 conclusion

**OPS-02 source audit complete; password recovery and email verification are not implemented in the inspected source. Provider environment configuration remains unverified.** This is a source-code finding, not proof that no external provider account or Vercel secret exists.

### Explicit non-actions

- No email provider was selected or installed.
- No environment variable or secret was inspected, exposed, added, or changed.
- No database query, schema change, migration, SQL, or data write was performed.
- No customer account, password, login, or registration behavior was changed.
- No production deployment, merge, or promotion was performed.


## OPS-03 — Product gallery and medicine information fields

**Audit branch:** `chore/security-hardening`  
**Inspected source state:** commit `81685d557d8c247c866e0aa7ec228a971d52bb3a`  
**Scope:** Read-only inspection of the Prisma Product model, admin product page, admin product collection/item APIs, public product collection/detail APIs, product listing/detail UI, API route tree, package dependencies, and Next.js image configuration. No product records, database, schema, code, upload provider, or environment settings were changed.

### Confirmed source findings

- The Prisma `Product` model stores only: `name`, `slug`, `description`, `price`, `mrp`, one nullable `image` URL, `category`, `stock`, `isActive`, and timestamps, plus the order-item relation.
- The admin product form exposes one free-text Image URL field with a small preview. It has no multi-image/gallery controls, upload picker, image ordering, primary-image selection, or delete/reorder action.
- The product create/update APIs accept one optional `image` string (trimmed and limited to 2,048 characters). No dedicated product image upload endpoint or media-management route exists in the inspected API route tree.
- The public product listing/detail types and UI consume a single `image` value. The detail page renders one main image; related/listing cards also use one image each. No gallery/carousel or alternate-image data is represented.
- The inspected `package.json` has no Cloudinary SDK, image-upload SDK, or other dedicated media-storage dependency. The inspected `next.config.mjs` remote image patterns list Unsplash hosts only; current product UI uses ordinary `img` elements, so those patterns are not an upload or storage integration.
- Product-specific descriptive data is currently limited to a free-text description and a category string. The category UI offers Male Problems, Female Problems, and General Problems. No structured fields were found for dosage/form, composition/ingredients, pack size/quantity, manufacturer, directions for use, warnings/contraindications, batch number, expiry date, or medicine licence details.
- The product detail UI includes a static five-star row labelled “Verified product” and static trust claims such as “100% Authentic”. No product rating/review model or verification evidence field exists in the inspected Product schema. These labels are not dynamically backed by product-level review/verification records in the inspected source.
- The public API returns the Product record and filters by active status; no transformation or separate gallery/medicine metadata source was found in the inspected routes.

### Readiness gaps and decisions needed

1. **Gallery requirement:** Current product management supports only one externally hosted image URL. Confirm whether A-2-Z needs multiple product images, and if so the expected maximum count, image roles (front/back/label), ordering, and primary image behavior.
2. **Image storage:** Choose an approved storage/upload approach and ownership/account before implementation. Confirm allowed formats, maximum file size/dimensions, deletion behavior, and whether existing image URLs must remain valid. No provider or bucket should be selected by assumption.
3. **Medicine information:** The owner/pharmacist/compliance lead must identify which structured fields are actually required for A-2-Z's product types and applicable rules. Do not invent dosage, composition, indications, contraindications, licence data, or medical advice.
4. **Historical data and order safety:** Any future schema design must preserve existing product records, image URLs, order-item relations, and historical order display. No migration or data backfill was designed or run.
5. **Trust labels:** Confirm evidence and approval for “Verified product”, five-star presentation, and “100% Authentic” before relying on them as factual claims. No ratings/verification implementation was added.
6. **Scope:** This audit does not establish that every listed medicine field is legally required for every product. Requirements depend on product classification, licence, and applicable compliance review.

### OPS-03 conclusion

**OPS-03 source audit complete; gallery/storage and structured medicine-field requirements need an explicit business and compliance decision before implementation.** Current implementation is single-image URL + free-text description + broad category. No schema change is authorized by this audit.

### Explicit non-actions

- No product image, product record, order, or customer data was read from or written to the database.
- No schema, migration, SQL, storage bucket, Cloudinary account, provider, or environment setting was created or changed.
- No medicine directions, claims, ingredients, licence details, or other medical content were invented.
- No product UI/API code or business behavior was changed.
- No production deployment, merge, or promotion was performed.


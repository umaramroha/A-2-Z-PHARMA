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

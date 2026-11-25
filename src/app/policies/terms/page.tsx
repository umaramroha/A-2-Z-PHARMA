import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions",
  description: "Terms governing the use of the A2Z Pharma website and orders.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="transition hover:text-primary">Home</Link>
          <span>/</span><span className="text-gray-700">Terms & Conditions</span>
        </nav>
        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
          <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">Terms & Conditions</h1>
          <p className="mb-8 text-sm text-gray-500">Effective Date: 25/11/2026 | Last Updated: 25/11/2026</p>
          <div className="prose prose-sm max-w-none space-y-6 text-gray-700 md:prose-base">
            <p>These Terms & Conditions apply when you access or use the A2Z Pharma website, create an account, contact us or place an order. Please also read our <Link href="/policies/privacy">Privacy Policy</Link>, <Link href="/policies/shipping">Shipping & Delivery Policy</Link>, <Link href="/policies/returns">Cancellation, Return & Refund Policy</Link> and <Link href="/policies/disclaimer">Medical & Product Disclaimer</Link>.</p>
            <p>By using the website or placing an order, you acknowledge these terms. If you do not agree, please do not use the website.</p>
            <h2>1. Website and business contact</h2>
            <p>This website is presented under the trading name A2Z Pharma. For customer support, contact us using the details published on our <Link href="/contact">Contact page</Link>. These terms do not state or imply any legal-entity, licence, tax-registration or regulatory details that have not been separately published and verified.</p>
            <h2>2. Eligibility and account responsibility</h2>
            <p>You must be legally capable of entering into a binding agreement under applicable law. You agree to provide accurate and current contact and delivery information, keep your account credentials confidential, and notify us if you suspect unauthorised access. Do not use the website for unlawful, fraudulent or abusive activity.</p>
            <h2>3. Product information</h2>
            <p>We take reasonable care when presenting product names, descriptions, images, prices and availability. Packaging, labels or appearance may differ from website images, and availability can change. Always check the actual product packaging, ingredients, warnings, batch details and expiry information before use. Product listings and website content are not a substitute for professional medical advice.</p>
            <h2>4. Orders and acceptance</h2>
            <p>Submitting an order is a request to purchase the selected products; it does not prevent us from reviewing availability, delivery details, pricing or other order information. We may contact you to verify an order or place it on hold, reject or cancel it where a product is unavailable, details are incomplete, a listing error occurs, delivery is not serviceable, fraud is reasonably suspected or applicable law requires it. If an order is cancelled after payment has been received, any eligible refund will be handled under the Refund Policy and applicable law.</p>
            <h2>5. Prices and delivery charges</h2>
            <p>Prices and delivery charges shown at checkout apply to the order submitted, subject to correction of manifest errors and applicable law. Current delivery charges are described in our <Link href="/policies/shipping">Shipping & Delivery Policy</Link>. The server determines the final order amount; information entered or displayed by a customer does not override the confirmed order total.</p>
            <h2>6. Payment</h2>
            <p>The website currently offers Cash on Delivery (COD) and manual UPI. For manual UPI, place the order and obtain verified payment instructions from A2Z Pharma through the official contact channel. Do not transfer money to an unverified UPI ID or number. A manual UPI order remains unpaid/pending until the payment is checked and recorded by us. Do not treat an order confirmation as proof of payment. COD amounts are payable when the order is delivered.</p>
            <h2>7. Shipping, cancellation, returns and refunds</h2>
            <p>Delivery is subject to serviceability and operational availability. Delivery estimates, if provided, are indicative. Cancellation, return, replacement and refund requests are handled under the separate <Link href="/policies/shipping">Shipping & Delivery Policy</Link> and <Link href="/policies/returns">Cancellation, Return & Refund Policy</Link>. Nothing in these terms limits a consumer right or remedy that cannot lawfully be excluded.</p>
            <h2>8. Health and product use</h2>
            <p>Information about medicines, Ayurveda, Unani, ingredients, wellness or traditional uses is general information only. It is not diagnosis, treatment, prescription or a guarantee of results. Read the <Link href="/policies/disclaimer">Medical & Product Disclaimer</Link> and consult a qualified healthcare professional before using a product where appropriate.</p>
            <h2>9. Website use and intellectual property</h2>
            <p>Do not attempt unauthorised access, interfere with website security, introduce harmful code, submit false information, scrape or misuse website content, or use the website in violation of law. Website design, original text, graphics and branding are protected by applicable intellectual-property laws. Third-party brand names and marks belong to their respective owners.</p>
            <h2>10. Third-party services and availability</h2>
            <p>The website relies on third-party hosting, database, communication and other service providers. Their services may be subject to separate terms. We aim to keep the website available but do not guarantee uninterrupted or error-free operation.</p>
            <h2>11. Changes and applicable law</h2>
            <p>We may update these terms by publishing a revised version with a new update date. These terms are governed by the laws of India, subject to mandatory consumer protections and applicable jurisdiction rules.</p>
            <h2>12. Contact and grievances</h2>
            <p>For questions, complaints or order assistance, contact A2Z Pharma using the phone, WhatsApp or email details on the <Link href="/contact">Contact page</Link>. We will handle complaints in accordance with applicable law. The identity and details of the designated grievance contact should be confirmed and published by the business before launch.</p>
            <p>Nothing in these terms excludes or restricts any statutory consumer right, remedy or liability that cannot legally be excluded or restricted.</p>
          </div>
        </article>
      </div>
    </main>
  );
}

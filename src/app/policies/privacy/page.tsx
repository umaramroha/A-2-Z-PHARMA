import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
  description: "How A2Z Pharma collects, uses and protects customer information.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="transition hover:text-primary">Home</Link>
          <span>/</span><span className="text-gray-700">Privacy Policy</span>
        </nav>
        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
          <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">Privacy Policy</h1>
          <p className="mb-8 text-sm text-gray-500">Effective Date: 24/11/2026 | Last Updated: 24/11/2026</p>
          <div className="prose prose-sm max-w-none space-y-6 text-gray-700 md:prose-base">
            <p>This policy explains how A2Z Pharma ("we", "us" or "our") handles information when you visit our website, create an account, contact us or place an order. It should be read with our Cancellation, Return & Refund Policy and Shipping & Delivery Policy.</p>
            <h2>1. Information we collect</h2>
            <p>Depending on how you use the website, we may collect your name, mobile number, email address, account details, delivery address, pincode, order and purchase details, messages you send us, and information needed to support or verify an order. Basic technical information such as browser, device, IP address and security logs may also be processed when you use the website.</p>
            <h2>2. How we use information</h2>
            <ul><li>To create and secure accounts and maintain login sessions;</li><li>To receive, process and fulfil orders and check product availability;</li><li>To contact you about orders, delivery, payment confirmation, returns or support;</li><li>To respond to enquiries sent through WhatsApp, phone or email;</li><li>To protect the website, prevent misuse and meet applicable legal obligations;</li><li>To maintain and improve website functionality.</li></ul>
            <h2>3. Payments and WhatsApp</h2>
            <p>Our available checkout methods are Cash on Delivery (COD) and manual UPI. UPI payment instructions are shared separately through our support channel; the website does not claim to verify a UPI payment automatically. Do not send money to an unverified UPI ID. If you choose to contact us through WhatsApp, the information you send is also handled by WhatsApp under its own terms and privacy policy.</p>
            <h2>4. Cookies and local storage</h2>
            <p>The website may use cookies, session technologies and browser local storage to support login, cart and essential website functions. Disabling these technologies may affect some features.</p>
            <h2>5. Sharing and service providers</h2>
            <p>We may share only the information reasonably needed with service providers that help operate the website, host data, provide technical support or deliver orders, and with authorities where disclosure is required by law. We do not sell personal information to third parties.</p>
            <h2>6. Data security and retention</h2>
            <p>We use reasonable technical and organisational safeguards designed to protect information. No internet transmission or storage system can be guaranteed completely secure. We retain information for as long as reasonably required for account and order operations, support, security, dispute resolution and legal obligations, and then delete or anonymise it where appropriate.</p>
            <h2>7. Your choices and requests</h2>
            <p>You may contact us to request access to or correction of account or order information, or to raise a privacy concern. Some records may need to be retained where required for legal, security or order-related purposes.</p>
            <h2>8. Children</h2>
            <p>The website is not intended for children under 18. We do not knowingly seek to collect personal information from children.</p>
            <h2>9. Changes to this policy</h2>
            <p>We may update this policy when our website or practices change. The latest version and update date will be published on this page.</p>
            <h2>10. Contact</h2>
            <p>For privacy questions or requests, contact A2Z Pharma, Amroha, Uttar Pradesh, India.</p>
            <p>Email: <a href="mailto:sahyogherbalpharmacy@gmail.com">sahyogherbalpharmacy@gmail.com</a><br />Phone / WhatsApp: <a href="tel:+918410127168">+91 84101 27168</a></p>
          </div>
        </article>
      </div>
    </main>
  );
}

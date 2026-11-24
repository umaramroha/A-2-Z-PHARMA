import Link from "next/link";

export const metadata = {
  title: "Cancellation, Return & Refund Policy",
  description: "Cancellation, return and refund information for A2Z Pharma orders.",
};

export default function ReturnsPolicyPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="transition hover:text-primary">Home</Link>
          <span>/</span><span className="text-gray-700">Cancellation, Return & Refund Policy</span>
        </nav>
        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
          <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">Cancellation, Return & Refund Policy</h1>
          <p className="mb-8 text-sm text-gray-500">Effective Date: 24/11/2026 | Last Updated: 24/11/2026</p>
          <div className="prose prose-sm max-w-none space-y-6 text-gray-700 md:prose-base">
            <p>This policy applies to orders placed through A2Z Pharma. It is based on the cancellation, return and refund approach used by our Amroha Pharmacy reference website, adapted to A2Z Pharma's COD and manual UPI checkout.</p>
            <h2>1. Order cancellation</h2>
            <p>You may request cancellation before dispatch by contacting us as soon as possible through WhatsApp, phone or email. Once an order has been dispatched, cancellation may not be possible. COD orders may be cancelled before dispatch. We may cancel or hold an order where a product is unavailable, order details cannot be verified, a listing error occurs, delivery is not serviceable, or cancellation is required by law or for security reasons.</p>
            <h2>2. Eligible return or replacement requests</h2>
            <p>Please contact us if an item arrives damaged, incorrect, tampered with, expired, incomplete or with a verifiable quality or safety issue. Medicines and other consumable healthcare products that have been opened or used are generally not returnable for change of mind or preference. This does not remove any remedy available under applicable law for a defective, incorrect, damaged or expired product.</p>
            <h2>3. Reporting window</h2>
            <ul><li><strong>Damaged, incorrect, tampered or expired item:</strong> report within 48 hours of delivery.</li><li><strong>Other eligible quality or safety concern:</strong> report within 7 days of delivery.</li></ul>
            <p>Please include your order number, registered mobile number, a short description and clear photographs of the item and packaging. We may ask for further information to review the request. These reporting windows do not limit rights that cannot legally be restricted.</p>
            <h2>4. Review and return process</h2>
            <p>We will review each request and explain the next steps. If a return is approved, keep the item, packaging, labels and invoice in the condition requested by our support team. Do not send an item back before receiving return instructions. A refund or replacement is subject to review and applicable law.</p>
            <h2>5. Refunds</h2>
            <ul><li><strong>Manual UPI payments:</strong> an approved refund will be arranged through the original UPI route where practicable, or another verified method agreed with the customer.</li><li><strong>COD orders:</strong> an approved refund will be arranged by bank transfer or UPI using details verified with the customer.</li><li><strong>Processing:</strong> approved refunds are ordinarily initiated within 3–5 business days. The time for the amount to appear may depend on the bank or payment provider.</li></ul>
            <p>Shipping charges will be refunded where the return is due to an error attributable to A2Z Pharma or where required by applicable law. No payment gateway deduction is promised or applied by this policy.</p>
            <h2>6. Statutory rights</h2>
            <p>Nothing in this policy excludes or limits a consumer right or remedy that cannot be excluded or limited under applicable Indian law. Where this policy conflicts with such a right, the applicable law will prevail.</p>
            <h2>7. Contact us</h2>
            <p>For cancellation, return or refund assistance, contact A2Z Pharma, Amroha, Uttar Pradesh, India.</p>
            <p>Email: <a href="mailto:sahyogherbalpharmacy@gmail.com">sahyogherbalpharmacy@gmail.com</a><br />Phone / WhatsApp: <a href="tel:+918410127168">+91 84101 27168</a></p>
          </div>
        </article>
      </div>
    </main>
  );
}

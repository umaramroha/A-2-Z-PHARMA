import Link from "next/link";

export const metadata = {
  title: "Shipping & Delivery Policy",
  description: "Shipping charges and delivery information for A2Z Pharma orders.",
};

export default function ShippingPolicyPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="transition hover:text-primary">Home</Link>
          <span>/</span><span className="text-gray-700">Shipping & Delivery Policy</span>
        </nav>
        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
          <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">Shipping & Delivery Policy</h1>
          <p className="mb-8 text-sm text-gray-500">Effective Date: 24/11/2026 | Last Updated: 24/11/2026</p>
          <div className="prose prose-sm max-w-none space-y-6 text-gray-700 md:prose-base">
            <p>This policy explains how A2Z Pharma handles order processing, shipping and delivery for purchases made through our website.</p>
            <h2>1. Delivery coverage</h2>
            <p>We aim to serve delivery locations across India, subject to pincode serviceability, product restrictions and operational availability. If a location cannot be served, we may contact you before accepting or dispatching the order.</p>
            <h2>2. Shipping charges</h2>
            <p>Current website shipping charges are calculated on the order subtotal as follows:</p>
            <ul><li><strong>Orders below ₹500:</strong> ₹50 delivery fee.</li><li><strong>Orders of ₹500 or more:</strong> free delivery.</li></ul>
            <p>The applicable delivery fee is shown in the checkout order summary before you place the order. If the checkout amount differs from this policy, please contact us before confirming the order.</p>
            <h2>3. Order processing and delivery estimates</h2>
            <p>Orders are processed after the order details and product availability have been reviewed. Delivery time can vary by destination, product availability, courier operations, weather, public holidays and other circumstances outside our reasonable control. Any delivery estimate communicated to you is indicative, not a guaranteed arrival date.</p>
            <h2>4. Cash on Delivery</h2>
            <p>COD is offered as a checkout payment option. We may contact you to confirm order details before dispatch. Please provide a complete delivery address and an active mobile number, and ensure someone is available to receive the order and pay the amount due.</p>
            <h2>5. Failed or undelivered orders</h2>
            <p>If delivery cannot be completed because the address or phone number is incorrect, the recipient is unavailable, or the order is refused, the shipment may be returned to us. Please contact support if you need to correct delivery details or discuss a delayed shipment. Any additional shipping or re-dispatch charge will be communicated before it is applied.</p>
            <h2>6. Order support</h2>
            <p>For delivery questions, contact A2Z Pharma, Amroha, Uttar Pradesh, India.</p>
            <p>Email: <a href="mailto:sahyogherbalpharmacy@gmail.com">sahyogherbalpharmacy@gmail.com</a><br />Phone / WhatsApp: <a href="tel:+918410127168">+91 84101 27168</a></p>
          </div>
        </article>
      </div>
    </main>
  );
}

import Link from "next/link";

const orderingSteps = [
  {
    number: "01",
    title: "Browse the catalogue",
    description: "Explore the Ayurvedic and Unani product listings available on the website.",
  },
  {
    number: "02",
    title: "Review product details",
    description: "Check the displayed description, price and availability before placing an order.",
  },
  {
    number: "03",
    title: "Choose a payment method",
    description: "Select Cash on Delivery or manual UPI at checkout. UPI remains pending until verified by our team.",
  },
  {
    number: "04",
    title: "Get order assistance",
    description: "Contact A2Z Pharma by phone, email or WhatsApp if you need help with an order.",
  },
];

export default function AboutPage() {
  return (
    <div className="page-shell">
      <section className="bg-gradient-to-br from-primary to-primary-dark py-12 text-white md:py-16">
        <div className="section-shell text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">About us</p>
          <h1 className="mt-3 text-3xl font-extrabold md:text-5xl">About A2Z Pharma</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/85">
            An online catalogue for Ayurvedic and Unani products, based in Amroha, Uttar Pradesh.
          </p>
        </div>
      </section>

      <section className="section-shell section-space">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">Our store</p>
          <h2 className="section-title mt-2">A clear way to explore product listings</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-gray-600 sm:text-base">
            <p>
              A2Z Pharma is based in Amroha, Uttar Pradesh. This website provides a digital catalogue where customers can browse listed Ayurvedic and Unani products, review the information shown on each listing and place an order online.
            </p>
            <p>
              Product details, prices and stock availability may change. Orders are subject to product availability and delivery serviceability, and the confirmed order total is calculated by the website at checkout.
            </p>
            <p>
              We currently offer Cash on Delivery (COD) and manual UPI. A manual UPI order remains pending until the payment has been checked and confirmed by our team. The website does not automatically verify UPI transfers.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-gray-200/70 bg-white py-12 sm:py-16">
        <div className="section-shell">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow">How it works</p>
            <h2 className="section-title mt-2">From browsing to order support</h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {orderingSteps.map((step) => (
              <div key={step.number} className="surface p-5">
                <p className="text-sm font-extrabold text-primary">{step.number}</p>
                <h3 className="mt-3 text-base font-bold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell section-space">
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          <div className="surface p-6">
            <h2 className="text-lg font-bold text-gray-900">Delivery information</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              The delivery charge is displayed in the checkout summary. Delivery is subject to serviceability and operational availability.
            </p>
            <Link href="/policies/shipping" className="mt-4 inline-flex text-sm font-bold text-primary hover:underline">
              Read Shipping & Delivery Policy →
            </Link>
          </div>
          <div className="surface p-6">
            <h2 className="text-lg font-bold text-gray-900">Questions or order assistance?</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Contact us for questions about product listings, availability, delivery or an existing order. For personal medical advice, consult a qualified healthcare professional.
            </p>
            <Link href="/contact" className="mt-4 inline-flex text-sm font-bold text-primary hover:underline">
              Contact A2Z Pharma →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-primary/5 py-12">
        <div className="section-shell text-center">
          <h2 className="text-2xl font-extrabold text-primary md:text-3xl">Explore the product catalogue</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-600">
            Review the available listings and their details before placing an order.
          </p>
          <Link href="/products" className="btn-primary mt-6 inline-flex">
            Browse Products
          </Link>
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";

export const metadata = {
  title: "Medical & Product Disclaimer",
  description: "Important information about health content and products listed by A2Z Pharma.",
};

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="transition hover:text-primary">Home</Link>
          <span>/</span><span className="text-gray-700">Medical & Product Disclaimer</span>
        </nav>
        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
          <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">Medical & Product Disclaimer</h1>
          <p className="mb-8 text-sm text-gray-500">Effective Date: 25/11/2026 | Last Updated: 25/11/2026</p>
          <div className="prose prose-sm max-w-none space-y-6 text-gray-700 md:prose-base">
            <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4">
              <p className="mb-1 font-semibold text-amber-900">Important health notice</p>
              <p className="text-sm text-amber-900">Website content is general information only. It is not medical advice, diagnosis, treatment or a prescription. Consult a qualified healthcare professional before using a medicine or healthcare product.</p>
            </div>
            <p>This disclaimer applies to product listings, descriptions, images, articles and other health-related information on the A2Z Pharma website. Read it together with our <Link href="/policies/terms">Terms & Conditions</Link>.</p>
            <h2>1. No medical advice</h2>
            <p>Nothing on this website should be treated as medical advice, diagnosis, treatment, prescription or a substitute for consultation with a qualified healthcare professional. Do not use website content to self-diagnose, self-treat a serious condition, delay medical care or change prescribed treatment.</p>
            <h2>2. Consult a qualified professional</h2>
            <p>Seek professional advice before using a product, particularly if you are pregnant or breastfeeding, buying for a child, elderly, have a medical condition, have known allergies, or take prescription medicines or other supplements. Do not start, stop, replace or change prescribed medicines without advice from the prescribing professional.</p>
            <h2>3. Product information and traditional use</h2>
            <p>Product information may include details supplied by manufacturers, brand owners, packers or distributors, together with general informational content. Traditional use or wellness descriptions do not establish that a product is proven to prevent, diagnose, treat or cure a disease. Product information may change; refer to the actual packaging and legally required label information for the product supplied.</p>
            <h2>4. No guaranteed results</h2>
            <p>Individual responses to medicines, herbal preparations and wellness products vary. A2Z Pharma does not promise a particular result or that a product will be suitable for every person. Any product-specific claims must be supported by the applicable label and lawful evidence.</p>
            <h2>5. Check the product before use</h2>
            <p>Before use, check the product name, ingredients, directions, warnings, batch number, manufacturer details, packaging integrity and expiry date. Do not use a product if it appears damaged, tampered with, expired or inconsistent with the order. Contact customer support promptly about a concern.</p>
            <h2>6. Allergies and adverse reactions</h2>
            <p>Review ingredients and warnings if you have a known allergy or sensitivity. Stop using a product and seek appropriate medical attention if you experience an adverse reaction. In an emergency, contact local emergency services or visit the nearest hospital; this website and its support channels are not emergency medical services.</p>
            <h2>7. Regulatory requirements and statutory rights</h2>
            <p>Products may be subject to applicable Indian laws, restrictions, labelling requirements and prescription conditions. Nothing on this website overrides those requirements. Nothing in this disclaimer excludes or limits a liability or consumer right that cannot lawfully be excluded or limited.</p>
            <h2>8. Contact</h2>
            <p>For website or product-listing questions, contact A2Z Pharma through the details on our <Link href="/contact">Contact page</Link>. For personal medical questions, consult a qualified healthcare professional.</p>
          </div>
        </article>
      </div>
    </main>
  );
}

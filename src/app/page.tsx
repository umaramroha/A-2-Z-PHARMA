import Link from "next/link";
import BannerSlider from "@/components/home/BannerSlider";
import TrustStrip from "@/components/home/TrustStrip";
import ProductSlider from "@/components/home/ProductSlider";
import BlogsStrip from "@/components/home/BlogsStrip";
import HealthAdviceCTA from "@/components/home/HealthAdviceCTA";

const categories = [
  {
    title: "Male Wellness",
    slug: "male-problems",
    icon: "♂",
    copy: "Explore products curated around men's wellness needs.",
  },
  {
    title: "Female Wellness",
    slug: "female-problems",
    icon: "♀",
    copy: "Browse products for everyday women's wellness.",
  },
  {
    title: "General Wellness",
    slug: "general-problems",
    icon: "✦",
    copy: "Everyday Ayurvedic & Unani care for the family.",
  },
];

export default function Home() {
  return (
    <div className="page-shell">
      <BannerSlider />
      <TrustStrip />

      <ProductSlider eyebrow="Most loved" title="Best Sellers" limit={8} />

      <section className="section-shell section-space">
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="eyebrow">Browse by need</p>
            <h2 className="section-title mt-2">
              Find what you're looking for
            </h2>
            <p className="section-copy">
              Start with a category and discover products available through the
              existing A2Z Pharma catalog.
            </p>
          </div>
          <Link
            href="/products"
            className="hidden text-sm font-bold text-primary sm:block"
          >
            View all →
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {categories.map((cat, i) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="group surface p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-bold ${
                  i === 1
                    ? "bg-secondary/10 text-secondary"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {cat.icon}
              </div>
              <h3 className="mt-5 text-lg font-bold text-gray-900">
                {cat.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                {cat.copy}
              </p>
              <span className="mt-5 inline-block text-sm font-bold text-primary transition group-hover:translate-x-1">
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-gray-200/70 bg-white">
        <div className="section-shell grid gap-4 py-8 sm:grid-cols-3">
          <div className="flex gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              ✓
            </span>
            <div>
              <b className="text-sm">Authentic products</b>
              <p className="mt-1 text-xs leading-5 text-gray-500">
                Carefully sourced wellness products.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
              ↗
            </span>
            <div>
              <b className="text-sm">Convenient delivery</b>
              <p className="mt-1 text-xs leading-5 text-gray-500">
                Delivery across India with available payment options.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              ?
            </span>
            <div>
              <b className="text-sm">Helpful support</b>
              <p className="mt-1 text-xs leading-5 text-gray-500">
                Reach out whenever you need assistance.
              </p>
            </div>
          </div>
        </div>
      </section>

      <BlogsStrip />
      <HealthAdviceCTA />
    </div>
  );
}

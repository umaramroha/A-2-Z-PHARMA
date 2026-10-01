"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image?: string | null;
  category?: string;
};

export default function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts((d.products || []).slice(0, 4)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="section-shell section-space">
        <h2 className="section-title">Best Sellers</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="surface h-64 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (!products.length) return null;

  return (
    <section className="section-shell section-space">
      <div className="flex items-end justify-between gap-5">
        <div>
          <p className="eyebrow">Most loved</p>
          <h2 className="section-title mt-2">Best Sellers</h2>
          <p className="section-copy">Our most popular wellness picks.</p>
        </div>
        <Link
          href="/products"
          className="hidden text-sm font-bold text-primary sm:block"
        >
          View all →
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        {products.map((p) => (
          <div
            key={p.id}
            className="surface flex flex-col p-3 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <Link href={`/products/${p.slug}`} className="block">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl">
                    🌿
                  </div>
                )}
              </div>
              <h3 className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm font-bold text-gray-900">
                {p.name}
              </h3>
            </Link>
            <div className="mt-2">
              <span className="text-base font-extrabold text-primary">
                ₹{p.price}
              </span>
            </div>
            <button
              onClick={() =>
                addToCart({
                  id: p.id,
                  name: p.name,
                  price: p.price,
                  image: p.image || undefined,
                  quantity: 1,
                })
              }
              className="btn-primary mt-3 py-2 text-xs"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

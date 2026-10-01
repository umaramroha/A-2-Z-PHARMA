"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/contexts/CartContext";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  mrp: number | null;
  image: string | null;
  category: string | null;
  stock: number;
};

type Props = {
  title: string;
  eyebrow?: string;
  category?: string;
  limit?: number;
};

export default function ProductSlider({
  title,
  eyebrow,
  category,
  limit = 8,
}: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const url = category
      ? `/api/products?category=${category}`
      : "/api/products";
    fetch(url)
      .then((r) => r.json())
      .then((d) => setProducts((d.products || []).slice(0, limit)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, limit]);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <section className="section-shell section-space">
        <h2 className="section-title">{title}</h2>
        <div className="mt-5 flex gap-3 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="surface h-64 w-[160px] shrink-0 animate-pulse sm:w-[200px]"
            />
          ))}
        </div>
      </section>
    );
  }

  if (!products.length) return null;

  return (
    <section className="section-shell section-space">
      <div className="flex items-end justify-between gap-4">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 className="section-title mt-1">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            aria-label="Scroll left"
            onClick={() => scroll("left")}
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-primary transition hover:border-primary/30 hover:bg-primary/5 sm:flex"
          >
            ‹
          </button>
          <button
            aria-label="Scroll right"
            onClick={() => scroll("right")}
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-primary transition hover:border-primary/30 hover:bg-primary/5 sm:flex"
          >
            ›
          </button>
          <Link
            href={category ? `/products?category=${category}` : "/products"}
            className="text-sm font-bold text-primary"
          >
            View all →
          </Link>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((p) => {
          const discount =
            p.mrp && p.mrp > p.price
              ? Math.round(((p.mrp - p.price) / p.mrp) * 100)
              : 0;
          const outOfStock = p.stock === 0;
          return (
            <div
              key={p.id}
              className="surface flex w-[160px] shrink-0 snap-start flex-col p-3 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:w-[200px]"
            >
              <Link
                href={`/products/${p.slug}`}
                className="relative block aspect-square overflow-hidden rounded-xl bg-gray-50"
              >
                {p.image ? (
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
                {discount > 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-white">
                    {discount}% OFF
                  </span>
                )}
                {outOfStock && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-bold uppercase tracking-wide text-white">
                    Out of Stock
                  </span>
                )}
              </Link>

              <Link href={`/products/${p.slug}`}>
                <h3 className="mt-3 line-clamp-2 min-h-[2.5rem] text-xs font-bold text-gray-900 sm:text-sm">
                  {p.name}
                </h3>
              </Link>

              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-base font-extrabold text-primary sm:text-lg">
                  ₹{p.price}
                </span>
                {p.mrp && p.mrp > p.price && (
                  <span className="text-xs text-gray-400 line-through">
                    ₹{p.mrp}
                  </span>
                )}
              </div>

              <button
                onClick={() =>
                  !outOfStock &&
                  addToCart({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    image: p.image || undefined,
                    quantity: 1,
                  })
                }
                disabled={outOfStock}
                className={`mt-3 rounded-xl py-2 text-[11px] font-bold transition sm:text-xs ${
                  outOfStock
                    ? "cursor-not-allowed bg-gray-100 text-gray-400"
                    : "bg-primary text-white hover:bg-primary-dark"
                }`}
              >
                {outOfStock ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { getProductOrderMessage, getWhatsAppLink } from "@/lib/whatsapp";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  mrp: number | null;
  image: string | null;
  category: string | null;
  description: string | null;
  stock: number;
};

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${params.slug}`);
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        setProduct(data.product);

        // Fetch related products (same category)
        if (data.product?.category) {
          try {
            const relRes = await fetch(
              `/api/products?category=${data.product.category}`
            );
            const relData = await relRes.json();
            setRelated(
              (relData.products || [])
                .filter((p: Product) => p.id !== data.product.id)
                .slice(0, 4)
            );
          } catch {
            /* silent */
          }
        }
      } catch (err) {
        console.error("Failed to fetch product", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="section-shell py-10">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-2xl bg-gray-100" />
          <div className="space-y-4">
            <div className="h-6 w-32 animate-pulse rounded bg-gray-100" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-gray-100" />
            <div className="h-8 w-40 animate-pulse rounded bg-gray-100" />
            <div className="h-24 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="section-shell py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-3xl">
          🔍
        </div>
        <h1 className="mt-5 text-2xl font-extrabold text-gray-900">
          Product Not Found
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          This product may have been removed or is unavailable.
        </p>
        <Link href="/products" className="btn-primary mt-6 inline-block">
          ← Back to Products
        </Link>
      </div>
    );
  }

  const mrp = product.mrp || product.price;
  const discount =
    mrp > product.price ? Math.round(((mrp - product.price) / mrp) * 100) : 0;
  const inStock = product.stock > 0;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || undefined,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const categoryLabels: Record<string, string> = {
    "male-problems": "Male Wellness",
    "female-problems": "Female Wellness",
    "general-problems": "General Wellness",
  };

  return (
    <div className="page-shell">
      <div className="section-shell py-5 pb-32 sm:py-8 sm:pb-8">
        {/* Breadcrumb */}
        <div className="mb-4 text-xs text-gray-500 sm:text-sm">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-primary">
            Products
          </Link>
          <span className="mx-2">/</span>
          <span className="line-clamp-1 text-gray-700">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
          {/* Image */}
          <div className="surface overflow-hidden">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center bg-gray-50 text-7xl text-gray-300">
                💊
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {product.category && (
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                {categoryLabels[product.category] || product.category}
              </span>
            )}
            <h1 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">
              {product.name}
            </h1>

            {/* Rating placeholder */}
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="text-yellow-500">★★★★★</span>
              <span className="text-gray-400">(Verified product)</span>
            </div>

            {/* Price */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-3xl font-extrabold text-primary">
                ₹{product.price}
              </span>
              {mrp > product.price && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    ₹{mrp}
                  </span>
                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Stock */}
            <div className="mt-3">
              {inStock ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  In Stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Out of Stock
                </span>
              )}
            </div>

            <p className="mt-5 text-sm leading-7 text-gray-600">
              {product.description || "No description available."}
            </p>

            {/* Trust badges */}
            <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-gray-50 p-3 text-center">
              <div>
                <p className="text-lg">✓</p>
                <p className="mt-1 text-[10px] font-semibold leading-tight text-gray-600">
                  100% Authentic
                </p>
              </div>
              <div>
                <p className="text-lg">🚚</p>
                <p className="mt-1 text-[10px] font-semibold leading-tight text-gray-600">
                  India-wide Delivery
                </p>
              </div>
              <div>
                <p className="text-lg">💵</p>
                <p className="mt-1 text-[10px] font-semibold leading-tight text-gray-600">
                  COD Available
                </p>
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-5">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                Quantity
              </label>
              <div className="flex w-fit items-center rounded-xl border border-gray-200">
                <button
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!inStock}
                  className="h-10 w-10 text-lg font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                >
                  −
                </button>
                <span className="w-12 text-center text-base font-bold">
                  {quantity}
                </span>
                <button
                  aria-label="Increase quantity"
                  onClick={() =>
                    setQuantity(Math.min(product.stock || 99, quantity + 1))
                  }
                  disabled={!inStock}
                  className="h-10 w-10 text-lg font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            {/* Desktop buttons */}
            <div className="mt-6 hidden space-y-3 sm:block">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className={`flex-1 rounded-xl py-3 text-sm font-bold transition ${
                    !inStock
                      ? "cursor-not-allowed bg-gray-200 text-gray-500"
                      : added
                      ? "bg-green-600 text-white"
                      : "bg-primary text-white hover:bg-primary-dark"
                  }`}
                >
                  {!inStock
                    ? "Out of Stock"
                    : added
                    ? "✓ Added to Cart"
                    : "Add to Cart"}
                </button>
                <Link
                  href="/cart"
                  className="flex-1 rounded-xl border-2 border-primary py-3 text-center text-sm font-bold text-primary transition hover:bg-primary hover:text-white"
                >
                  View Cart
                </Link>
              </div>

              {inStock && (
                <a
                  href={getWhatsAppLink(
                    getProductOrderMessage({
                      name: product.name,
                      price: product.price,
                      slug: product.slug,
                      quantity,
                    })
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white transition hover:brightness-95"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Order on WhatsApp
                </a>
              )}
            </div>

            {/* Delivery info */}
            <div className="mt-5 rounded-2xl bg-gray-50 p-4 text-xs leading-6 text-gray-600">
              <p>
                🚚 <strong>Fast delivery</strong> all over India
              </p>
              <p>
                💵 <strong>Cash on Delivery</strong> available
              </p>
              <p>
                📱 <strong>UPI Payment</strong> accepted
              </p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-12">
            <div className="flex items-end justify-between">
              <div>
                <p className="eyebrow">You may also like</p>
                <h2 className="mt-1 text-xl font-extrabold text-gray-900 sm:text-2xl">
                  Related Products
                </h2>
              </div>
              <Link
                href={`/products?category=${product.category}`}
                className="text-sm font-bold text-primary"
              >
                View all →
              </Link>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="surface flex flex-col p-3 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50">
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
                  </div>
                  <h3 className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm font-bold text-gray-900">
                    {p.name}
                  </h3>
                  <span className="mt-2 text-base font-extrabold text-primary">
                    ₹{p.price}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile sticky Add to Cart bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-6px_24px_rgba(20,50,36,0.08)] backdrop-blur-xl sm:hidden">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              Total
            </p>
            <p className="text-lg font-extrabold text-primary">
              ₹{product.price * quantity}
            </p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`flex-1 max-w-[65%] rounded-xl py-3 text-sm font-bold transition ${
              !inStock
                ? "cursor-not-allowed bg-gray-200 text-gray-500"
                : added
                ? "bg-green-600 text-white"
                : "bg-primary text-white"
            }`}
          >
            {!inStock
              ? "Out of Stock"
              : added
              ? "✓ Added"
              : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

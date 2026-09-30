"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

type Product = { id: string; name: string; slug: string; price: number; mrp: number | null; image: string | null; category: string | null; description: string | null };
const priceRanges = [{ label: "All", value: "all" }, { label: "Under ₹300", value: "0-300" }, { label: "₹300–₹500", value: "300-500" }, { label: "Above ₹500", value: "500-99999" }];
const sortOptions = [{ label: "Recommended", value: "default" }, { label: "Price: Low to High", value: "price-asc" }, { label: "Price: High to Low", value: "price-desc" }, { label: "Name: A to Z", value: "name" }];
const categoryTitles: Record<string, string> = { "male-problems": "Male Problems", "female-problems": "Female Problems", "general-problems": "General Problems" };

function ProductCard({ product }: { product: Product }) {
  const mrp = product.mrp || product.price;
  const discount = mrp > product.price ? Math.round(((mrp - product.price) / mrp) * 100) : 0;
  return <Link href={`/products/${product.slug}`} className="group overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl">
    <div className="relative aspect-square overflow-hidden bg-[#f3f6f4]">
      {product.image ? <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full w-full items-center justify-center text-5xl text-primary/20">🌿</div>}
      {discount > 0 && <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-white">{discount}% OFF</span>}
    </div>
    <div className="p-3.5 sm:p-4">
      <p className="line-clamp-2 min-h-[2.8rem] text-sm font-semibold leading-5 text-gray-800">{product.name}</p>
      {product.category && <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">{categoryTitles[product.category] || product.category}</p>}
      <div className="mt-3 flex items-end justify-between gap-2"><div><span className="text-lg font-extrabold text-primary">₹{product.price}</span>{product.mrp && product.mrp > product.price && <span className="ml-2 text-xs text-gray-400 line-through">₹{product.mrp}</span>}</div><span className="text-xs font-bold text-primary opacity-0 transition group-hover:opacity-100">View →</span></div>
    </div>
  </Link>;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const query = searchParams.get("q") || "";
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true); setError(false);
      try {
        const params = new URLSearchParams(); if (category) params.set("category", category); if (query) params.set("q", query);
        const res = await fetch(`/api/products?${params.toString()}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json(); setAllProducts(data.products || []);
      } catch { setAllProducts([]); setError(true); } finally { setLoading(false); }
    };
    fetchProducts();
  }, [category, query]);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];
    if (priceRange !== "all") { const [min, max] = priceRange.split("-").map(Number); result = result.filter(p => p.price >= min && p.price <= max); }
    if (sortBy === "price-asc") result.sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") result.sort((a, b) => b.price - a.price);
    if (sortBy === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [allProducts, priceRange, sortBy]);

  const title = query ? `Search results` : category ? categoryTitles[category] || "Our Products" : "Our Products";
  return <div className="page-shell">
    <div className="border-b border-gray-200 bg-white"><div className="section-shell py-8 sm:py-10"><p className="eyebrow">A2Z Pharma catalog</p><div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="section-title">{title}</h1>{query && <p className="mt-1 text-sm text-gray-500">Showing matches for “{query}”</p>}</div><p className="text-sm font-medium text-gray-500">{loading ? "Loading products…" : `${filteredProducts.length} product${filteredProducts.length === 1 ? "" : "s"}`}</p></div></div></div>
    <div className="section-shell py-6 sm:py-8">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">{[["All","/products",!category],["Male Problems","/products?category=male-problems",category === "male-problems"],["Female Problems","/products?category=female-problems",category === "female-problems"],["General Problems","/products?category=general-problems",category === "general-problems"]].map(([label, href, active]) => <Link key={href as string} href={href as string} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${active ? "bg-primary text-white" : "border border-gray-200 bg-white text-gray-600 hover:border-primary/30 hover:text-primary"}`}>{label as string}</Link>)}</div>
      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-gray-200/80 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="flex gap-2 overflow-x-auto"><span className="self-center whitespace-nowrap text-xs font-bold text-gray-500">Price</span>{priceRanges.map(r => <button key={r.value} onClick={() => setPriceRange(r.value)} className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${priceRange === r.value ? "bg-primary text-white" : "bg-gray-50 text-gray-600 hover:bg-primary/5"}`}>{r.label}</button>)}</div>
        <label className="flex items-center gap-2 text-xs font-bold text-gray-500">Sort <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 outline-none focus:border-primary"><option value="default">Recommended</option>{sortOptions.slice(1).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
      </div>

      {error ? <div className="surface mt-6 p-10 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-xl text-red-500">!</div><h2 className="mt-4 text-lg font-bold">We couldn’t load the products</h2><p className="mt-2 text-sm text-gray-500">Please refresh and try again.</p><button onClick={() => window.location.reload()} className="btn-primary mt-5">Retry</button></div> : loading ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">{Array.from({length: 8}).map((_, i) => <div key={i} className="overflow-hidden rounded-2xl border bg-white"><div className="aspect-square animate-pulse bg-gray-200"/><div className="space-y-2 p-4"><div className="h-4 animate-pulse rounded bg-gray-200"/><div className="h-4 w-2/3 animate-pulse rounded bg-gray-200"/><div className="h-5 w-1/3 animate-pulse rounded bg-gray-200"/></div></div>)}</div> : filteredProducts.length === 0 ? <div className="surface mt-6 p-12 text-center"><div className="text-5xl">⌕</div><h2 className="mt-4 text-lg font-bold text-gray-800">No products found</h2><p className="mt-2 text-sm text-gray-500">Try another search or clear the filters.</p><Link href="/products" className="btn-primary mt-5">Clear filters</Link></div> : <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">{filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}</div>}
    </div>
  </div>;
}

export default function ProductsPage() { return <Suspense fallback={<div className="section-shell py-16 text-center text-sm text-gray-500">Loading products…</div>}><ProductsContent /></Suspense>; }

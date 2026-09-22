"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useMemo } from "react";

const allProducts = [
  {
    id: "1",
    name: "Ayurvedic Capsule",
    slug: "ayurvedic-capsule",
    price: 299,
    mrp: 399,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500",
    category: "general-problems",
  },
  {
    id: "2",
    name: "Herbal Safoof",
    slug: "herbal-safoof",
    price: 199,
    mrp: 249,
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500",
    category: "general-problems",
  },
  {
    id: "3",
    name: "Majoon Special",
    slug: "majoon-special",
    price: 499,
    mrp: 599,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500",
    category: "male-problems",
  },
  {
    id: "4",
    name: "Women Wellness Tonic",
    slug: "women-wellness-tonic",
    price: 349,
    mrp: 449,
    image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=500",
    category: "female-problems",
  },
  {
    id: "5",
    name: "Unani Pills",
    slug: "unani-pills",
    price: 249,
    mrp: 299,
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500",
    category: "general-problems",
  },
  {
    id: "6",
    name: "Herbal Oil",
    slug: "herbal-oil",
    price: 399,
    mrp: 499,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500",
    category: "general-problems",
  },
  {
    id: "7",
    name: "Men Power Capsule",
    slug: "men-power-capsule",
    price: 599,
    mrp: 799,
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500",
    category: "male-problems",
  },
  {
    id: "8",
    name: "Female Vitality Syrup",
    slug: "female-vitality-syrup",
    price: 449,
    mrp: 549,
    image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=500",
    category: "female-problems",
  },
];

const priceRanges = [
  { label: "All Prices", value: "all" },
  { label: "Under ₹300", value: "0-300" },
  { label: "₹300 - ₹500", value: "300-500" },
  { label: "Above ₹500", value: "500-99999" },
];

const sortOptions = [
  { label: "Default", value: "default" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Discount: High to Low", value: "discount" },
  { label: "Name: A to Z", value: "name" },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const query = searchParams.get("q") || "";

  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Category filter
    if (category) {
      result = result.filter((p) => p.category === category);
    }

    // Search filter
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Price filter
    if (priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number);
      result = result.filter((p) => p.price >= min && p.price <= max);
    }

    // Sorting
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "discount":
        result.sort(
          (a, b) =>
            (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp
        );
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [category, query, priceRange, sortBy]);

  const categoryTitles: Record<string, string> = {
    "male-problems": "Male Problems",
    "female-problems": "Female Problems",
    "general-problems": "General Problems",
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-2 text-primary">
        {query
          ? `Search: "${query}"`
          : category
          ? categoryTitles[category] || "Our Products"
          : "Our Products"}
      </h1>
      <p className="text-gray-600 mb-6">
        {filteredProducts.length} product(s) found
      </p>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/products"
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            !category
              ? "bg-primary text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-primary hover:text-white"
          }`}
        >
          All
        </Link>
        <Link
          href="/products?category=male-problems"
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            category === "male-problems"
              ? "bg-primary text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-primary hover:text-white"
          }`}
        >
          Male Problems
        </Link>
        <Link
          href="/products?category=female-problems"
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            category === "female-problems"
              ? "bg-primary text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-primary hover:text-white"
          }`}
        >
          Female Problems
        </Link>
        <Link
          href="/products?category=general-problems"
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            category === "general-problems"
              ? "bg-primary text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-primary hover:text-white"
          }`}
        >
          General Problems
        </Link>
      </div>

      {/* Price Filter + Sort Bar */}
      <div className="bg-white rounded-lg border shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Price Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Price:</span>
          <div className="flex flex-wrap gap-2">
            {priceRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setPriceRange(range.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  priceRange === range.value
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-primary bg-white"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold mb-2 text-gray-700">
            No products found
          </h2>
          <p className="text-gray-500 mb-6">
            Try changing your search or filter.
          </p>
          <Link
            href="/products"
            className="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-full font-semibold transition"
          >
            Clear All Filters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product) => {
            const discount = Math.round(
              ((product.mrp - product.price) / product.mrp) * 100
            );
            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden border group"
              >
                <div className="aspect-square bg-gray-100 overflow-hidden relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                    {discount}% OFF
                  </span>
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="font-semibold text-sm md:text-base mb-2 line-clamp-2 min-h-[2.5rem]">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">
                      ₹{product.price}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      ₹{product.mrp}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 text-center">
          Loading products...
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}

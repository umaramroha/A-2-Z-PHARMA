"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

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
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  const filteredProducts = category
    ? allProducts.filter((p) => p.category === category)
    : allProducts;

  const categoryTitles: Record<string, string> = {
    "male-problems": "Male Problems",
    "female-problems": "Female Problems",
    "general-problems": "General Problems",
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-2 text-primary">
        {category ? categoryTitles[category] || "Our Products" : "Our Products"}
      </h1>
      <p className="text-gray-600 mb-8">
        {category
          ? `Showing ${filteredProducts.length} product(s) in this category`
          : "Authentic Ayurvedic & Unani medicines"}
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href="/products"
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            !category
              ? "bg-primary text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-primary hover:text-white"
          }`}
        >
          All ({allProducts.length})
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

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold mb-2 text-gray-700">
            No products found
          </h2>
          <p className="text-gray-500 mb-6">
            Is category me abhi koi product nahi hai.
          </p>
          <Link
            href="/products"
            className="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-full font-semibold transition"
          >
            View All Products
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
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden border"
              >
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="font-semibold text-sm md:text-base mb-2 line-clamp-2 min-h-[2.5rem]">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-primary">
                      ₹{product.price}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      ₹{product.mrp}
                    </span>
                  </div>
                  <span className="text-xs text-green-600 font-semibold">
                    {discount}% OFF
                  </span>
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
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

import Link from "next/link";

const products = [
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

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-2 text-primary">Our Products</h1>
      <p className="text-gray-600 mb-8">Authentic Ayurvedic & Unani medicines</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link href="/products" className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium">
          All
        </Link>
        <Link href="/products?category=male-problems" className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-full text-sm hover:bg-primary hover:text-white transition">
          Male Problems
        </Link>
        <Link href="/products?category=female-problems" className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-full text-sm hover:bg-primary hover:text-white transition">
          Female Problems
        </Link>
        <Link href="/products?category=general-problems" className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-full text-sm hover:bg-primary hover:text-white transition">
          General Problems
        </Link>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => {
          const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
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
                  <span className="text-lg font-bold text-primary">₹{product.price}</span>
                  <span className="text-sm text-gray-400 line-through">₹{product.mrp}</span>
                </div>
                <span className="text-xs text-green-600 font-semibold">{discount}% OFF</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

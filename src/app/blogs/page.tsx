import Link from "next/link";

const blogs = [
  {
    id: "1",
    title: "Ayurveda: Ancient Wisdom for Modern Health",
    slug: "ayurveda-ancient-wisdom",
    excerpt: "Discover how Ayurveda's 5000-year-old wisdom can help you live a healthier, more balanced life today.",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
    date: "15 Jan 2026",
    author: "A2Z Pharma Team",
  },
  {
    id: "2",
    title: "Unani Medicine: A Complete Guide",
    slug: "unani-medicine-guide",
    excerpt: "Learn about the principles of Unani medicine and how it treats various health conditions naturally.",
    image: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=800",
    date: "10 Jan 2026",
    author: "A2Z Pharma Team",
  },
  {
    id: "3",
    title: "Top 5 Herbs for Men's Health",
    slug: "herbs-for-mens-health",
    excerpt: "Explore the most effective Ayurvedic herbs that support men's vitality, strength, and overall wellness.",
    image: "https://images.unsplash.com/photo-1616432043562-3671ea2e5242?w=800",
    date: "5 Jan 2026",
    author: "A2Z Pharma Team",
  },
  {
    id: "4",
    title: "Natural Remedies for Women's Wellness",
    slug: "remedies-for-womens-wellness",
    excerpt: "Ayurvedic and Unani solutions for hormonal balance, reproductive health, and overall women's wellness.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
    date: "1 Jan 2026",
    author: "A2Z Pharma Team",
  },
];

export default function BlogsPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-primary">
          Our Blog
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Health tips, Ayurvedic wisdom, and Unani medicine insights from our experts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <Link
            key={blog.id}
            href={`/blogs/${blog.slug}`}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden border group"
          >
            <div className="aspect-video bg-gray-100 overflow-hidden">
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                <span>📅 {blog.date}</span>
                <span>✍️ {blog.author}</span>
              </div>
              <h2 className="text-lg font-bold mb-2 text-gray-800 group-hover:text-primary transition line-clamp-2">
                {blog.title}
              </h2>
              <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                {blog.excerpt}
              </p>
              <span className="text-primary font-semibold text-sm">
                Read More →
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
        <p className="text-sm text-yellow-800">
          <strong>Coming Soon:</strong> Blog detail page aur admin panel se blog add karne ka feature Phase 15 me aayega.
        </p>
      </div>
    </div>
  );
}

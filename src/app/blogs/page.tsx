import Image from "next/image";
import Link from "next/link";

const blogs = [
  {
    id: "1",
    title: "Ayurveda and Unani: An Introduction to Two Traditional Systems",
    slug: "ayurveda-vs-unani-medicine",
    excerpt: "A brief overview of the different traditional frameworks used in Ayurveda and Unani, and why qualified guidance matters.",
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800",
    date: "25 Sep 2026",
  },
  {
    id: "2",
    title: "Everyday Digestive Health: Habits and When to Seek Care",
    slug: "digestive-health-herbal-remedies",
    excerpt: "Learn about everyday habits that support digestive wellbeing and symptoms that should be discussed with a healthcare professional.",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800",
    date: "20 Sep 2026",
  },
  {
    id: "3",
    title: "Seasonal Health: Practical Habits and Responsible Product Use",
    slug: "immunity-boosters-ayurveda-unani",
    excerpt: "A practical look at everyday seasonal-health habits and the limits of supplements and traditional products.",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800",
    date: "15 Sep 2026",
  },
  {
    id: "4",
    title: "Joint Pain and Stiffness: Understanding Your Options",
    slug: "joint-pain-natural-relief",
    excerpt: "Common reasons for joint discomfort, general self-care considerations and signs that need medical assessment.",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800",
    date: "10 Sep 2026",
  },
];

export default function BlogsPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-3xl font-bold text-primary md:text-4xl">
          Health & Wellness Journal
        </h1>
        <p className="mx-auto max-w-2xl text-gray-600">
          General educational articles about traditional systems, everyday health habits and responsible product use.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog) => (
          <Link
            key={blog.id}
            href={`/blogs/${blog.slug}`}
            className="group overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md"
          >
            <div className="relative aspect-video overflow-hidden bg-gray-100">
              <Image
                src={blog.image}
                alt={blog.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-5">
              <p className="mb-2 text-xs text-gray-500">📅 {blog.date}</p>
              <h2 className="mb-2 line-clamp-2 text-lg font-bold text-gray-800 transition group-hover:text-primary">
                {blog.title}
              </h2>
              <p className="mb-3 line-clamp-3 text-sm text-gray-600">
                {blog.excerpt}
              </p>
              <span className="text-sm font-semibold text-primary">
                Read Article →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

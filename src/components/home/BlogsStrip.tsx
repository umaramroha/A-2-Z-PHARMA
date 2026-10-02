import Link from "next/link";

const blogs = [
  {
    slug: "ayurveda-for-beginners",
    title: "Ayurveda for Beginners: Where to Start",
    excerpt: "Simple guide to understanding Ayurvedic principles and daily routines.",
    icon: "🌿",
    category: "Wellness",
  },
  {
    slug: "immunity-herbs",
    title: "5 Herbs That Boost Immunity Naturally",
    excerpt: "Powerful Ayurvedic herbs to keep your immune system strong.",
    icon: "🛡️",
    category: "Health",
  },
  {
    slug: "winter-wellness-tips",
    title: "Winter Wellness Tips from Ayurveda",
    excerpt: "Stay healthy through the cold season with these simple tips.",
    icon: "❄️",
    category: "Seasonal",
  },
];

export default function BlogsStrip() {
  return (
    <section className="section-shell section-space">
      <div className="flex items-end justify-between gap-5">
        <div>
          <p className="eyebrow">Health Journal</p>
          <h2 className="section-title mt-1">Wellness reads</h2>
        </div>
        <Link href="/blogs" className="text-sm font-bold text-primary">
          View all →
        </Link>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {blogs.map((b) => (
          <Link
            key={b.slug}
            href={`/blogs/${b.slug}`}
            className="surface group flex flex-col p-4 transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
              {b.icon}
            </div>
            <span className="mt-3 text-[10px] font-bold uppercase tracking-wider text-secondary">
              {b.category}
            </span>
            <h3 className="mt-1 line-clamp-2 text-sm font-bold text-gray-900 group-hover:text-primary">
              {b.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
              {b.excerpt}
            </p>
            <span className="mt-3 text-xs font-bold text-primary">
              Read more →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

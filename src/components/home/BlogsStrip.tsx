import Link from "next/link";

const blogs = [
  {
    slug: "ayurveda-vs-unani-medicine",
    title: "Ayurveda and Unani: An Introduction",
    excerpt: "Understand the different traditional frameworks and why qualified guidance matters.",
    icon: "🌿",
    category: "Traditional Systems",
  },
  {
    slug: "digestive-health-herbal-remedies",
    title: "Everyday Digestive Health",
    excerpt: "Everyday habits, product-safety considerations and when to seek care.",
    icon: "🥗",
    category: "General Health",
  },
  {
    slug: "joint-pain-natural-relief",
    title: "Joint Pain and Stiffness",
    excerpt: "General information about joint discomfort and when medical assessment is important.",
    icon: "🧘",
    category: "Wellbeing",
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
        {blogs.map((blog) => (
          <Link
            key={blog.slug}
            href={`/blogs/${blog.slug}`}
            className="surface group flex flex-col p-4 transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
              {blog.icon}
            </div>
            <span className="mt-3 text-[10px] font-bold uppercase tracking-wider text-secondary">
              {blog.category}
            </span>
            <h3 className="mt-1 line-clamp-2 text-sm font-bold text-gray-900 group-hover:text-primary">
              {blog.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
              {blog.excerpt}
            </p>
            <span className="mt-3 text-xs font-bold text-primary">
              Read article →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

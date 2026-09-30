import Link from "next/link";

const categories = [
  { title: "Male Wellness", slug: "male-problems", icon: "♂", copy: "Explore products curated around men’s wellness needs." },
  { title: "Female Wellness", slug: "female-problems", icon: "♀", copy: "Browse products for everyday women’s wellness." },
  { title: "General Wellness", slug: "general-problems", icon: "✦", copy: "Everyday Ayurvedic & Unani care for the family." },
];

export default function Home() {
  return <div className="page-shell">
    <section className="relative overflow-hidden bg-[#0e3d2e] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(230,154,69,.2),transparent_30%),radial-gradient(circle_at_10%_80%,rgba(67,155,117,.18),transparent_35%)]" />
      <div className="section-shell relative grid min-h-[560px] items-center gap-10 py-14 lg:grid-cols-[1.1fr_.9fr] lg:py-20">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white/80">Trusted wellness store</span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">Natural care, <span className="text-secondary">made simpler.</span></h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-white/75 sm:text-lg">Shop authentic Ayurvedic & Unani products with easy ordering, dependable delivery and support when you need it.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/products" className="btn-primary bg-secondary hover:bg-secondary-dark">Explore Products</Link><Link href="/contact" className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white hover:text-primary">Talk to Us</Link></div>
          <div className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-6 text-xs text-white/65"><div><b className="block text-lg text-white">Genuine</b>products</div><div><b className="block text-lg text-white">India-wide</b>delivery</div><div><b className="block text-lg text-white">Easy</b>support</div></div>
        </div>
        <div className="hidden lg:block"><div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-white/10 p-3 shadow-2xl backdrop-blur"><div className="rounded-[1.5rem] bg-gradient-to-br from-white to-[#eaf5f0] p-8 text-[#173d30]"><div className="flex items-center justify-between"><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">A2Z PHARMA</span><span className="text-2xl">✦</span></div><div className="py-16 text-center"><div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-primary text-5xl text-white shadow-lg">🌿</div><h2 className="mt-6 text-2xl font-extrabold">Wellness, thoughtfully curated</h2><p className="mt-2 text-sm text-gray-500">Ayurvedic & Unani care for modern everyday life.</p></div><div className="grid grid-cols-2 gap-3"><div className="rounded-xl bg-gray-50 p-3 text-xs font-semibold">Easy ordering</div><div className="rounded-xl bg-gray-50 p-3 text-xs font-semibold">COD available</div></div></div></div></div>
      </div>
    </section>

    <section className="section-shell section-space">
      <div className="flex items-end justify-between gap-5"><div><p className="eyebrow">Browse by need</p><h2 className="section-title mt-2">Find what you’re looking for</h2><p className="section-copy">Start with a category and discover products available through the existing A2Z Pharma catalog.</p></div><Link href="/products" className="hidden text-sm font-bold text-primary sm:block">View all →</Link></div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">{categories.map((cat, i) => <Link key={cat.slug} href={`/products?category=${cat.slug}`} className="group surface p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl"><div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-bold ${i === 1 ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>{cat.icon}</div><h3 className="mt-5 text-lg font-bold text-gray-900">{cat.title}</h3><p className="mt-2 text-sm leading-6 text-gray-500">{cat.copy}</p><span className="mt-5 inline-block text-sm font-bold text-primary transition group-hover:translate-x-1">Explore →</span></Link>)}</div>
    </section>

    <section className="border-y border-gray-200/70 bg-white"><div className="section-shell grid gap-4 py-8 sm:grid-cols-3"><div className="flex gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">✓</span><div><b className="text-sm">Authentic products</b><p className="mt-1 text-xs leading-5 text-gray-500">Carefully sourced wellness products.</p></div></div><div className="flex gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">↗</span><div><b className="text-sm">Convenient delivery</b><p className="mt-1 text-xs leading-5 text-gray-500">Delivery across India with available payment options.</p></div></div><div className="flex gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">?</span><div><b className="text-sm">Helpful support</b><p className="mt-1 text-xs leading-5 text-gray-500">Reach out whenever you need assistance.</p></div></div></div></section>

    <section className="section-shell section-space"><div className="overflow-hidden rounded-[2rem] bg-primary p-7 text-white sm:p-10 lg:flex lg:items-center lg:justify-between lg:p-12"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">Need help?</p><h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">Not sure what to choose?</h2><p className="mt-3 max-w-xl text-sm leading-7 text-white/70">Connect with the A2Z Pharma team and ask your questions before ordering.</p></div><Link href="/contact" className="btn-secondary mt-6 bg-white text-primary lg:mt-0">Contact A2Z Pharma</Link></div></section>
  </div>;
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const slides = [
  {
    tag: "Trusted Wellness Store",
    title: "Natural care, ",
    accent: "made simpler.",
    desc: "Authentic Ayurvedic & Unani products, delivered across India.",
    cta: { label: "Explore Products", href: "/products" },
    cta2: { label: "Talk to Us", href: "/contact" },
  },
  {
    tag: "Up to 20% Off",
    title: "Wellness essentials, ",
    accent: "now on offer.",
    desc: "Save on hand-picked Ayurvedic & Unani products.",
    cta: { label: "Shop Offers", href: "/products" },
  },
  {
    tag: "India-wide Delivery",
    title: "Delivered to ",
    accent: "your doorstep.",
    desc: "Easy ordering. COD available. Support whenever you need it.",
    cta: { label: "Start Shopping", href: "/products" },
  },
];

export default function HeroMobile() {
  const [index, setIndex] = useState(0);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 50) {
      setIndex((i) =>
        dx < 0
          ? (i + 1) % slides.length
          : (i - 1 + slides.length) % slides.length
      );
    }
    touchStart.current = null;
  };

  const s = slides[index];

  return (
    <section
      className="relative overflow-hidden bg-[#0e3d2e] text-white lg:hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(230,154,69,.2),transparent_30%),radial-gradient(circle_at_10%_80%,rgba(67,155,117,.18),transparent_35%)]" />
      <div className="section-shell relative flex min-h-[300px] flex-col justify-center py-7">
        <span className="inline-flex w-fit rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">
          {s.tag}
        </span>
        <h1 className="mt-3 text-2xl font-extrabold leading-[1.15] tracking-tight">
          {s.title}
          <span className="text-secondary">{s.accent}</span>
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-white/75">
          {s.desc}
        </p>
        <div className="mt-5 flex gap-2">
          <Link
            href={s.cta.href}
            className="btn-primary flex-1 bg-secondary py-2.5 text-sm hover:bg-secondary-dark"
          >
            {s.cta.label}
          </Link>
          {s.cta2 && (
            <Link
              href={s.cta2.href}
              className="btn-secondary flex-1 border-white/20 bg-white/10 py-2.5 text-sm text-white hover:bg-white hover:text-primary"
            >
              {s.cta2.label}
            </Link>
          )}
        </div>
        <div className="mt-5 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-secondary" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

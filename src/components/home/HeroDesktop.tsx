"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    tag: "Trusted Wellness Store",
    title: "Natural care, ",
    accent: "made simpler.",
    desc: "Shop authentic Ayurvedic & Unani products with easy ordering, dependable delivery and support when you need it.",
    cta: { label: "Explore Products", href: "/products" },
    cta2: { label: "Talk to Us", href: "/contact" },
  },
  {
    tag: "Up to 20% Off",
    title: "Wellness essentials, ",
    accent: "now on offer.",
    desc: "Hand-picked Ayurvedic & Unani products at limited-time prices.",
    cta: { label: "Shop Offers", href: "/products" },
    cta2: { label: "Browse All", href: "/products" },
  },
  {
    tag: "India-wide Delivery",
    title: "Delivered to ",
    accent: "your doorstep.",
    desc: "Simple ordering, COD available and helpful support whenever you need it.",
    cta: { label: "Start Shopping", href: "/products" },
    cta2: { label: "Contact Us", href: "/contact" },
  },
];

export default function HeroDesktop() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  const s = slides[index];

  return (
    <section className="relative hidden overflow-hidden bg-[#0e3d2e] text-white lg:block">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(230,154,69,.2),transparent_30%),radial-gradient(circle_at_10%_80%,rgba(67,155,117,.18),transparent_35%)]" />
      <div className="section-shell relative grid min-h-[460px] items-center gap-10 py-12 lg:grid-cols-[1.1fr_.9fr]">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white/80">
            {s.tag}
          </span>
          <h1 className="mt-4 text-5xl font-extrabold leading-[1.08] tracking-tight">
            {s.title}
            <span className="text-secondary">{s.accent}</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-white/75">
            {s.desc}
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href={s.cta.href}
              className="btn-primary bg-secondary hover:bg-secondary-dark"
            >
              {s.cta.label}
            </Link>
            {s.cta2 && (
              <Link
                href={s.cta2.href}
                className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white hover:text-primary"
              >
                {s.cta2.label}
              </Link>
            )}
          </div>
          <div className="mt-8 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-5 text-xs text-white/65">
            <div>
              <b className="block text-lg text-white">Genuine</b>products
            </div>
            <div>
              <b className="block text-lg text-white">India-wide</b>delivery
            </div>
            <div>
              <b className="block text-lg text-white">Easy</b>support
            </div>
          </div>
        </div>

        <div>
          <div className="mx-auto max-w-sm rounded-[2rem] border border-white/10 bg-white/10 p-3 shadow-2xl backdrop-blur">
            <div className="rounded-[1.5rem] bg-gradient-to-br from-white to-[#eaf5f0] p-7 text-[#173d30]">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  A2Z PHARMA
                </span>
                <span className="text-2xl">✦</span>
              </div>
              <div className="py-10 text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary text-4xl text-white shadow-lg">
                  🌿
                </div>
                <h2 className="mt-5 text-xl font-extrabold">
                  Wellness, thoughtfully curated
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Ayurvedic & Unani care for modern everyday life.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-gray-50 p-3 text-xs font-semibold">
                  Easy ordering
                </div>
                <div className="rounded-xl bg-gray-50 p-3 text-xs font-semibold">
                  COD available
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        aria-label="Previous slide"
        onClick={() =>
          setIndex((i) => (i - 1 + slides.length) % slides.length)
        }
        className="absolute left-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 xl:flex"
      >
        ‹
      </button>
      <button
        aria-label="Next slide"
        onClick={() => setIndex((i) => (i + 1) % slides.length)}
        className="absolute right-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 xl:flex"
      >
        ›
      </button>

      <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-8 bg-secondary" : "w-2 bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

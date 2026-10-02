"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Banner = {
  id: string;
  title: string | null;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  ctaText: string | null;
  order: number;
  isActive: boolean;
};

export default function BannerSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const touchStart = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch("/api/banners")
      .then((r) => r.json())
      .then((d) => setBanners(d.banners || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (banners.length <= 1) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners.length]);

  const goTo = (i: number) => {
    setIndex(i);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((x) => (x + 1) % banners.length);
    }, 5000);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 40) {
      goTo(
        dx < 0
          ? (index + 1) % banners.length
          : (index - 1 + banners.length) % banners.length
      );
    }
    touchStart.current = null;
  };

  if (loading) {
    return (
      <div className="section-shell py-4">
        <div className="aspect-[16/7] w-full animate-pulse rounded-2xl bg-gray-100 sm:aspect-[16/5]" />
      </div>
    );
  }

  if (!banners.length) return null;

  const b = banners[index];

  const BannerContent = (
    <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl bg-gray-100 sm:aspect-[16/5]">
      <img
        src={b.imageUrl}
        alt={b.title || "Banner"}
        className="h-full w-full object-cover"
      />
      {/* Overlay text */}
      {(b.title || b.subtitle || b.ctaText) && (
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-black/10 to-transparent p-4 sm:p-6">
          {b.title && (
            <h2 className="text-lg font-extrabold leading-tight text-white drop-shadow sm:text-2xl">
              {b.title}
            </h2>
          )}
          {b.subtitle && (
            <p className="mt-1 max-w-md text-xs text-white/85 drop-shadow sm:text-sm">
              {b.subtitle}
            </p>
          )}
          {b.ctaText && (
            <span className="mt-3 w-fit rounded-full bg-secondary px-4 py-1.5 text-xs font-bold text-white shadow sm:text-sm">
              {b.ctaText}
            </span>
          )}
        </div>
      )}
    </div>
  );

  return (
    <section className="section-shell pt-3 pb-1 sm:pt-4 sm:pb-2">
      <div
        className="relative"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {b.linkUrl ? (
          <Link href={b.linkUrl} className="block">
            {BannerContent}
          </Link>
        ) : (
          BannerContent
        )}

        {/* Arrows — only if more than 1 */}
        {banners.length > 1 && (
          <>
            <button
              aria-label="Previous banner"
              onClick={() =>
                goTo((index - 1 + banners.length) % banners.length)
              }
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-primary shadow backdrop-blur transition hover:bg-white"
            >
              ‹
            </button>
            <button
              aria-label="Next banner"
              onClick={() => goTo((index + 1) % banners.length)}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-primary shadow backdrop-blur transition hover:bg-white"
            >
              ›
            </button>

            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
              {banners.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Banner ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-5 bg-white" : "w-1.5 bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

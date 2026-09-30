import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-10 bg-[#102f24] text-white">
      <div className="section-shell py-12 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4 flex items-center gap-3"><Image src="/logo.png" alt="A2Z Pharma" width={46} height={46} className="h-11 w-11 rounded-xl bg-white object-contain" /><div><p className="font-extrabold">A2Z Pharma</p><p className="text-xs text-white/55">Wellness • Care • Trust</p></div></div>
            <p className="max-w-sm text-sm leading-7 text-white/70">Authentic Ayurvedic & Unani products with a simple, dependable shopping experience across India.</p>
          </div>
          <div><h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/50">Explore</h3><div className="grid gap-2 text-sm text-white/75"><Link href="/products" className="hover:text-white">Shop All</Link><Link href="/about" className="hover:text-white">About Us</Link><Link href="/blogs" className="hover:text-white">Health Blog</Link><Link href="/contact" className="hover:text-white">Contact</Link></div></div>
          <div><h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/50">Categories</h3><div className="grid gap-2 text-sm text-white/75"><Link href="/products?category=male-problems" className="hover:text-white">Male Problems</Link><Link href="/products?category=female-problems" className="hover:text-white">Female Problems</Link><Link href="/products?category=general-problems" className="hover:text-white">General Problems</Link></div></div>
          <div><h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/50">Contact</h3><div className="grid gap-3 text-sm text-white/75"><span>Amroha, Uttar Pradesh, India</span><a href="tel:+918410127168" className="hover:text-white">+91 84101 27168</a><a href="mailto:sahyogherbalpharmacy@gmail.com" className="break-words hover:text-white">sahyogherbalpharmacy@gmail.com</a></div></div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-5 text-xs text-white/45">© {new Date().getFullYear()} A2Z Pharma, Amroha. All rights reserved.</div>
      </div>
    </footer>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

const categories = [
  { name: "Male Problems", slug: "male-problems" },
  { name: "Female Problems", slug: "female-problems" },
  { name: "General Problems", slug: "general-problems" },
];

function SearchIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m1.35-5.4a6.75 6.75 0 1 1-13.5 0 6.75 6.75 0 0 1 13.5 0Z" /></svg>;
}
function CartIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l1.2 10.1a2 2 0 0 0 2 1.9h7.9a2 2 0 0 0 1.9-1.5L20 7H6M9 20h.01M17 20h.01" /></svg>;
}
function MenuIcon({ open }: { open: boolean }) {
  return open ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6"><path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" /></svg> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6"><path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" /></svg>;
}

export default function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, isLoggedIn, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    router.push("/");
  };

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 shadow-[0_4px_24px_rgba(20,50,36,0.05)] backdrop-blur-xl">
      <div className="hidden md:block">
        <div className="section-shell flex h-[78px] items-center gap-7">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <Image src="/logo.png" alt="A2Z Pharma" width={52} height={52} className="h-12 w-12 object-contain" priority />
            <div>
              <div className="text-lg font-extrabold tracking-tight text-primary">A2Z Pharma</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">Wellness • Care • Trust</div>
            </div>
          </Link>

          <form action="/products" className="relative mx-auto w-full max-w-2xl">
            <input name="q" placeholder="Search medicines, products or health concerns..." className="input-modern rounded-2xl bg-gray-50 pl-11 pr-4" />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></span>
          </form>

          <div className="flex shrink-0 items-center gap-2">
            <Link href="/cart" className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-primary transition hover:border-primary/30 hover:bg-primary/5" aria-label="Cart">
              <CartIcon />
              {totalItems > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-white">{totalItems}</span>}
            </Link>
            {isLoggedIn && user ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex h-11 items-center gap-2 rounded-xl border border-gray-200 px-3 transition hover:border-primary/30 hover:bg-primary/5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
                  <span className="max-w-24 truncate text-sm font-semibold text-gray-700">{user.name.split(" ")[0]}</span>
                  <span className="text-gray-400">⌄</span>
                </button>
                {userMenuOpen && <>
                  <button aria-label="Close user menu" className="fixed inset-0 z-40 h-full w-full cursor-default" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-14 z-50 w-60 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
                    <div className="rounded-xl bg-primary/5 px-3 py-3"><p className="text-xs text-gray-500">Signed in as</p><p className="truncate text-sm font-semibold text-gray-800">{user.email}</p></div>
                    <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="mt-1 block rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-gray-50">My Profile</Link>
                    <Link href="/orders" onClick={() => setUserMenuOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-gray-50">My Orders</Link>
                    <button onClick={handleLogout} className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50">Logout</button>
                  </div>
                </>}
              </div>
            ) : <Link href="/login" className="btn-secondary min-h-11 px-4">Login</Link>}
          </div>
        </div>
        <nav className="border-t border-gray-100 bg-primary text-white">
          <div className="section-shell flex h-11 items-center gap-8 text-sm font-semibold">
            <Link href="/" className="hover:text-secondary">Home</Link>
            <Link href="/products" className="hover:text-secondary">Shop All</Link>
            <div className="relative h-full" onMouseEnter={() => setCategoriesOpen(true)} onMouseLeave={() => setCategoriesOpen(false)}>
              <button className="flex h-full items-center gap-1 hover:text-secondary">Categories <span>⌄</span></button>
              {categoriesOpen && <div className="absolute left-0 top-full z-50 w-56 rounded-b-2xl border border-gray-100 bg-white p-2 text-gray-800 shadow-xl">
                {categories.map((cat) => <Link key={cat.slug} href={`/products?category=${cat.slug}`} className="block rounded-xl px-3 py-2.5 text-sm hover:bg-primary/5 hover:text-primary">{cat.name}</Link>)}
              </div>}
            </div>
            <Link href="/about" className="hover:text-secondary">About</Link>
            <Link href="/blogs" className="hover:text-secondary">Health Blog</Link>
            <Link href="/contact" className="hover:text-secondary">Contact</Link>
            <Link href="/admin/login" className="ml-auto text-xs font-medium text-white/70 hover:text-white">Admin</Link>
          </div>
        </nav>
      </div>

      <div className="md:hidden">
        <div className="flex h-[64px] items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2" onClick={closeMobile}>
            <Image src="/logo.png" alt="A2Z Pharma" width={42} height={42} className="h-10 w-10 object-contain" priority />
            <span className="text-base font-extrabold tracking-tight text-primary">A2Z Pharma</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/cart" className="relative flex h-10 w-10 items-center justify-center rounded-xl text-primary" aria-label="Cart"><CartIcon />{totalItems > 0 && <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[9px] font-bold text-white">{totalItems}</span>}</Link>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl text-primary" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu"><MenuIcon open={mobileMenuOpen} /></button>
          </div>
        </div>
        <div className="px-4 pb-3">
          <form action="/products" className="relative">
            <input name="q" placeholder="Search medicines & products" className="input-modern h-11 rounded-xl bg-gray-50 pl-10 pr-3" />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></span>
          </form>
        </div>
        {mobileMenuOpen && <div className="border-t border-gray-100 bg-white px-4 pb-5 pt-3 shadow-lg">
          {isLoggedIn && user && <div className="mb-3 rounded-2xl bg-primary/5 p-3"><p className="text-xs text-gray-500">Welcome back</p><p className="font-bold text-primary">{user.name}</p></div>}
          <div className="grid gap-1">
            {[['Home','/'],['Shop All','/products'],['About Us','/about'],['Health Blog','/blogs'],['Contact','/contact']].map(([label, href]) => <Link key={href} href={href} onClick={closeMobile} className="rounded-xl px-3 py-3 text-sm font-semibold text-gray-700 hover:bg-primary/5 hover:text-primary">{label}</Link>)}
            <div className="rounded-xl bg-gray-50 p-3"><p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Categories</p>{categories.map(cat => <Link key={cat.slug} href={`/products?category=${cat.slug}`} onClick={closeMobile} className="block py-2 text-sm font-medium text-gray-700">{cat.name}</Link>)}</div>
            {isLoggedIn && user ? <><Link href="/profile" onClick={closeMobile} className="rounded-xl px-3 py-3 text-sm font-semibold">My Profile</Link><Link href="/orders" onClick={closeMobile} className="rounded-xl px-3 py-3 text-sm font-semibold">My Orders</Link><button onClick={handleLogout} className="rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600">Logout</button></> : <Link href="/login" onClick={closeMobile} className="btn-primary mt-1 w-full">Login / Register</Link>}
          </div>
        </div>}
      </div>

    </header>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import CategoryModal from "./CategoryModal";

export default function Navbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBuyingModalOpen, setIsBuyingModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleContactClick = () => {
    setIsMobileMenuOpen(false);
    if (pathname === '/') {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push('/#contact');
    }
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 glass-card rounded-none border-x-0 border-t-0 border-b-white/10 px-4 md:px-6 py-2 md:py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/compnay_logo..webp"
              alt="ZMR Mobility"
              width={220}
              height={64}
              className="h-10 md:h-16 w-auto object-contain group-hover:opacity-90 transition-opacity"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <button onClick={() => setIsModalOpen(true)} className="hover:text-primary transition-colors font-medium">Leasing</button>
            <button onClick={() => setIsBuyingModalOpen(true)} className="hover:text-primary transition-colors font-medium">Buying</button>
            <Link href="/compare" className="hover:text-primary transition-colors font-medium">Compare</Link>
            <Link href="/sell-ev" className="hover:text-primary transition-colors font-medium">Sell EV</Link>
            <Link href="/blogs" className="hover:text-primary transition-colors font-medium">Blog</Link>
            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
          </div>

          {/* Right: Contact + Hamburger */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleContactClick}
              className="bg-primary hover:bg-primary-dark text-background px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-bold transition-all electric-glow"
            >
              Contact Us
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-2 pb-4 border-t border-white/10 pt-4 flex flex-col gap-1 text-sm font-medium text-white/70">
            <button
              onClick={() => { setIsModalOpen(true); setIsMobileMenuOpen(false); }}
              className="text-left px-2 py-3 hover:text-primary transition-colors border-b border-white/5"
            >
              Leasing
            </button>
            <button
              onClick={() => { setIsBuyingModalOpen(true); setIsMobileMenuOpen(false); }}
              className="text-left px-2 py-3 hover:text-primary transition-colors border-b border-white/5"
            >
              Buying
            </button>
            <Link href="/compare" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-3 hover:text-primary transition-colors border-b border-white/5">Compare</Link>
            <Link href="/sell-ev" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-3 hover:text-primary transition-colors border-b border-white/5">Sell EV</Link>
            <Link href="/blogs" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-3 hover:text-primary transition-colors border-b border-white/5">Blog</Link>
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-3 hover:text-primary transition-colors">About</Link>
          </div>
        )}
      </nav>

      <CategoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <CategoryModal isOpen={isBuyingModalOpen} onClose={() => setIsBuyingModalOpen(false)} mode="buying" />
    </>
  );
}

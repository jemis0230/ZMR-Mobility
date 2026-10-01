"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu, X, Search, ChevronDown, ChevronRight, MapPin, Phone, ArrowLeftRight, Check,
} from "lucide-react";
import CategoryModal from "./CategoryModal";
import {
  PRICE_BUCKETS, YEAR_OPTIONS, KM_OPTIONS, BODY_TYPES, TRANSMISSION_OPTIONS, RANGE_OPTIONS,
  FALLBACK_MAKES, exploreHref, priceHref, bodyTypeHref, type MakeWithModels,
} from "@/lib/explore";

const CITIES = ["Lucknow", "Dehradun", "Chennai", "Bangalore"];
const CITY_KEY = "zmr-city";

const SEARCH_HINTS = ["make", "model", "body type", "budget", "Tata Nexon EV", "e-rickshaw"];

// ── Explore-by menu content ───────────────────────────────────

type MenuLink = { label: string; href: string; image?: string };

function buildExploreMenus(makes: MakeWithModels[]) {
  const simple: { key: string; label: string; links: MenuLink[] }[] = [
    { key: "price", label: "Price Range", links: PRICE_BUCKETS.map((b) => ({ label: b.label, href: priceHref(b) })) },
    { key: "year", label: "Year", links: YEAR_OPTIONS.map((y) => ({ label: `${y} & above`, href: exploreHref({ minYear: y }) })) },
    { key: "km", label: "KM Driven", links: KM_OPTIONS.map((km) => ({ label: `${km.toLocaleString("en-IN")} kms or less`, href: exploreHref({ maxKm: km }) })) },
    { key: "body", label: "Body Type", links: BODY_TYPES.map((b) => ({ label: b.label, href: bodyTypeHref(b.category), image: b.image })) },
    { key: "transmission", label: "Transmission", links: TRANSMISSION_OPTIONS.map((t) => ({ label: t.label, href: exploreHref({ transmission: t.value }) })) },
    { key: "range", label: "Range", links: RANGE_OPTIONS.map((r) => ({ label: `${r}+ km per charge`, href: exploreHref({ minRange: r }) })) },
  ];
  return { simple, makes: makes.length > 0 ? makes : FALLBACK_MAKES };
}

// ── Small building blocks ─────────────────────────────────────

function DropdownLink({ href, children, onClick }: { href: string; children: ReactNode; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group flex items-center justify-between gap-6 px-5 py-3 rounded-xl text-[15px] font-semibold text-white hover:bg-white/10 transition-colors"
    >
      <span className="flex items-center gap-3">{children}</span>
      <ChevronRight className="w-4 h-4 text-white/70 group-hover:translate-x-0.5 transition-transform" />
    </Link>
  );
}

function ExploreItem({
  label, open, onOpen, onClose, children,
}: {
  label: string; open: boolean; onOpen: () => void; onClose: () => void; children: ReactNode;
}) {
  return (
    <div className="relative h-full flex items-center" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button
        type="button"
        onClick={() => (open ? onClose() : onOpen())}
        aria-expanded={open}
        className={`flex items-center gap-1.5 h-full px-1 text-[15px] font-medium transition-colors ${open ? "text-white" : "text-white/90 hover:text-white"}`}
      >
        {label}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {/* active underline */}
      <span className={`absolute left-0 right-0 bottom-0 h-[3px] rounded-t bg-white transition-opacity ${open ? "opacity-100" : "opacity-0"}`} />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full -left-6 z-50"
          >
            <div className="rounded-b-2xl bg-primary-dark shadow-2xl shadow-primary-deep/30 p-3 ring-1 ring-black/5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TopMenu({ label, items }: { label: string; items: { label: string; href?: string; onClick?: () => void; desc?: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 py-2 text-[15px] font-semibold text-ink/80 hover:text-primary transition-colors"
      >
        {label}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full pt-2 z-50"
          >
            <div className="w-64 rounded-2xl bg-white border border-ink/10 shadow-xl p-2">
              {items.map((it) =>
                it.href ? (
                  <Link key={it.label} href={it.href} onClick={() => setOpen(false)} className="block px-4 py-2.5 rounded-xl hover:bg-primary-50 transition-colors">
                    <span className="block text-sm font-semibold text-ink">{it.label}</span>
                    {it.desc && <span className="block text-xs text-ink/50 mt-0.5">{it.desc}</span>}
                  </Link>
                ) : (
                  <button key={it.label} type="button" onClick={() => { setOpen(false); it.onClick?.(); }} className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-primary-50 transition-colors">
                    <span className="block text-sm font-semibold text-ink">{it.label}</span>
                    {it.desc && <span className="block text-xs text-ink/50 mt-0.5">{it.desc}</span>}
                  </button>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CitySelector() {
  const [city, setCity] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { setCity(localStorage.getItem(CITY_KEY)); } catch { /* storage unavailable */ }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const choose = (c: string) => {
    setCity(c);
    setOpen(false);
    try { localStorage.setItem(CITY_KEY, c); } catch { /* storage unavailable */ }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink/80 hover:border-primary hover:text-primary transition-colors whitespace-nowrap"
      >
        <MapPin className="w-4 h-4 text-primary" />
        {city ?? "Select city"}
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-2 w-56 rounded-2xl bg-white border border-ink/10 shadow-xl p-2 z-50">
          <p className="px-3 pt-1 pb-2 text-[11px] font-bold uppercase tracking-wider text-ink/45">We serve in</p>
          {CITIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => choose(c)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-ink hover:bg-primary-50"
            >
              {c}
              {city === c && <Check className="w-4 h-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SearchBar({ onSubmitted, className = "" }: { onSubmitted?: () => void; className?: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [hint, setHint] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setHint((h) => (h + 1) % SEARCH_HINTS.length), 2200);
    return () => clearInterval(id);
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    router.push(exploreHref({ q: value.trim() }));
    onSubmitted?.();
  };

  return (
    <form onSubmit={submit} role="search" className={`relative flex items-center ${className}`}>
      <Search className="absolute left-4 w-4 h-4 text-ink/45 pointer-events-none" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Search EVs by make, model or body type"
        className="peer w-full rounded-full bg-secondary border border-transparent focus:border-primary/40 focus:bg-white pl-11 pr-4 py-2.5 text-sm text-ink outline-none transition-colors"
      />
      {!value && (
        <span className="absolute left-11 text-sm text-ink/45 pointer-events-none peer-focus:opacity-70 overflow-hidden whitespace-nowrap">
          Search by{" "}
          <AnimatePresence mode="wait">
            <motion.span
              key={hint}
              initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="inline-block font-semibold text-ink/70"
            >
              {SEARCH_HINTS[hint]}
            </motion.span>
          </AnimatePresence>
        </span>
      )}
    </form>
  );
}

// ── Main component ────────────────────────────────────────────

export default function Navbar({ makes = [] }: { makes?: MakeWithModels[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBuyingModalOpen, setIsBuyingModalOpen] = useState(false);
  const [isRentModalOpen, setIsRentModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const menus = buildExploreMenus(makes);

  // Close menus on navigation
  useEffect(() => {
    setOpenMenu(null);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const openWithIntent = (key: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(key);
  };
  const closeWithDelay = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
  };

  const handleContactClick = () => {
    setIsMobileMenuOpen(false);
    if (pathname === "/") {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/#contact");
    }
  };

  const buyItems = [
    { label: "Buy Pre-owned EV", desc: "Browse certified used EVs", href: exploreHref() },
    { label: "Buy by Category", desc: "2W, 3W & 4W electric vehicles", onClick: () => setIsBuyingModalOpen(true) },
    { label: "Lease an EV", desc: "Flexible monthly plans", onClick: () => setIsModalOpen(true) },
    { label: "Rent an EV", desc: "Daily, weekly & monthly", onClick: () => setIsRentModalOpen(true) },
    { label: "Compare EVs", desc: "Side-by-side specifications", href: "/compare" },
  ];
  const moreItems = [
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blogs" },
    { label: "FAQs", href: "/#faq" },
    { label: "Contact Us", onClick: handleContactClick },
  ];

  const allExploreKeys = [
    { key: "price", label: "Price Range" },
    { key: "make", label: "Make and Model" },
    ...menus.simple.filter((m) => m.key !== "price").map((m) => ({ key: m.key, label: m.label })),
  ];

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50">
        {/* ── Top bar ── */}
        <div className="bg-white/95 backdrop-blur border-b border-ink/[0.08]">
          <div className="max-w-7xl mx-auto flex items-center gap-3 lg:gap-5 px-4 md:px-6 h-16 lg:h-[72px]">
            <Link href="/" className="shrink-0 flex items-center" aria-label="ZMR Mobility home">
              <Image
                src="/zmr-logo.png"
                alt="ZMR Mobility"
                width={977}
                height={200}
                className="h-8 lg:h-9 w-auto"
                priority
              />
            </Link>

            <div className="hidden lg:block"><CitySelector /></div>

            <SearchBar className="hidden md:flex flex-1 max-w-md" />

            <nav className="hidden lg:flex items-center gap-5 ml-auto">
              <TopMenu label="Buy EV" items={buyItems} />
              <Link href="/sell-ev" className="text-[15px] font-semibold text-ink/80 hover:text-primary transition-colors">Sell EV</Link>
              <TopMenu label="More" items={moreItems} />
              <Link href="/compare" className="flex flex-col items-center text-ink/70 hover:text-primary transition-colors" title="Compare EVs">
                <ArrowLeftRight className="w-5 h-5" />
                <span className="text-[11px] font-semibold mt-0.5">Compare</span>
              </Link>
            </nav>

            <a href="tel:+919045222999" className="hidden xl:flex flex-col leading-tight pl-4 border-l border-ink/10">
              <span className="text-[11px] text-ink/55">Call us at</span>
              <span className="text-[15px] font-extrabold text-primary tracking-wide">+91 90452 22999</span>
            </a>

            <div className="flex items-center gap-2 ml-auto lg:ml-0">
              <button
                onClick={handleContactClick}
                className="bg-primary hover:bg-primary-dark text-white px-4 md:px-5 py-2 rounded-full text-xs md:text-sm font-bold transition-colors electric-glow whitespace-nowrap"
              >
                Contact Us
              </button>
              <button
                onClick={() => setIsMobileMenuOpen((o) => !o)}
                aria-label="Open menu"
                className="lg:hidden p-2 rounded-lg border border-ink/10 text-ink/70 hover:text-ink transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Explore-by bar (desktop) ── */}
        <div className="hidden lg:block bg-gradient-to-r from-primary via-primary to-[#2D8CF0] shadow-md shadow-primary/20">
          <div className="max-w-7xl mx-auto px-6 h-12 flex items-stretch gap-8">
            <span className="flex items-center text-[15px] font-semibold text-white/60">Explore By</span>

            <ExploreItem label="Price Range" open={openMenu === "price"} onOpen={() => openWithIntent("price")} onClose={closeWithDelay}>
              <div className="w-60 py-1">
                {menus.simple[0].links.map((l) => <DropdownLink key={l.label} href={l.href}>{l.label}</DropdownLink>)}
              </div>
            </ExploreItem>

            <ExploreItem label="Make and Model" open={openMenu === "make"} onOpen={() => openWithIntent("make")} onClose={closeWithDelay}>
              <div className="grid grid-flow-col auto-cols-[172px] gap-2 p-2">
                {menus.makes.slice(0, 5).map((m, i) => (
                  <div key={m.make} className={`py-1 ${i === 4 ? "hidden xl:block" : ""}`}>
                    <Link
                      href={exploreHref({ make: m.make })}
                      className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-base font-bold text-white hover:bg-white/10"
                    >
                      {m.make}
                      <ChevronRight className="w-4 h-4 text-white/70 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    {m.models.slice(0, 5).map((model) => (
                      <Link
                        key={model}
                        href={exploreHref({ make: m.make, model })}
                        className="block px-3 py-2.5 rounded-xl text-[15px] font-medium text-white/90 hover:bg-white/10 hover:text-white"
                      >
                        {model}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
              <Link href={exploreHref()} className="mx-2 mb-1 mt-1 flex items-center justify-center gap-1 rounded-xl bg-white/10 hover:bg-white/15 py-2.5 text-sm font-bold text-white">
                View all brands <ChevronRight className="w-4 h-4" />
              </Link>
            </ExploreItem>

            {menus.simple.slice(1).map((menu) => (
              <ExploreItem key={menu.key} label={menu.label} open={openMenu === menu.key} onOpen={() => openWithIntent(menu.key)} onClose={closeWithDelay}>
                <div className={`${menu.key === "km" || menu.key === "body" ? "w-72" : "w-60"} py-1`}>
                  {menu.links.map((l) => (
                    <DropdownLink key={l.label} href={l.href}>
                      {l.image && (
                        <span className="relative w-10 h-8 rounded-md overflow-hidden bg-white/90 shrink-0">
                          <Image src={l.image} alt="" fill sizes="40px" className="object-cover" />
                        </span>
                      )}
                      {l.label}
                    </DropdownLink>
                  ))}
                </div>
              </ExploreItem>
            ))}
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-16 right-0 bottom-0 z-50 w-[88vw] max-w-sm bg-white shadow-2xl overflow-y-auto lg:hidden"
            >
              <div className="p-4 space-y-4">
                <SearchBar onSubmitted={() => setIsMobileMenuOpen(false)} />
                <CitySelector />

                <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-1">
                  <p className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-widest text-white/70">Explore By</p>
                  {allExploreKeys.map(({ key, label }) => {
                    const isOpen = mobileSection === key;
                    const links: MenuLink[] = key === "make"
                      ? menus.makes.map((m) => ({ label: m.make, href: exploreHref({ make: m.make }) }))
                      : menus.simple.find((m) => m.key === key)?.links ?? [];
                    return (
                      <div key={key} className="border-t border-white/10 first:border-t-0">
                        <button
                          type="button"
                          onClick={() => setMobileSection(isOpen ? null : key)}
                          className="w-full flex items-center justify-between px-3 py-3 text-sm font-semibold text-white"
                        >
                          {label}
                          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </button>
                        {isOpen && (
                          <div className="pb-2 grid grid-cols-2 gap-1 px-2">
                            {links.map((l) => (
                              <Link
                                key={l.label}
                                href={l.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20"
                              >
                                {l.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <nav className="flex flex-col text-[15px] font-semibold text-ink/80">
                  <Link href={exploreHref()} className="px-2 py-3 border-b border-ink/[0.06] hover:text-primary">Buy Pre-owned EV</Link>
                  <button onClick={() => { setIsModalOpen(true); setIsMobileMenuOpen(false); }} className="text-left px-2 py-3 border-b border-ink/[0.06] hover:text-primary">Leasing</button>
                  <button onClick={() => { setIsBuyingModalOpen(true); setIsMobileMenuOpen(false); }} className="text-left px-2 py-3 border-b border-ink/[0.06] hover:text-primary">Buy by Category</button>
                  <button onClick={() => { setIsRentModalOpen(true); setIsMobileMenuOpen(false); }} className="text-left px-2 py-3 border-b border-ink/[0.06] hover:text-primary">Rent</button>
                  <Link href="/sell-ev" className="px-2 py-3 border-b border-ink/[0.06] hover:text-primary">Sell EV</Link>
                  <Link href="/compare" className="px-2 py-3 border-b border-ink/[0.06] hover:text-primary">Compare</Link>
                  <Link href="/blogs" className="px-2 py-3 border-b border-ink/[0.06] hover:text-primary">Blog</Link>
                  <Link href="/about" className="px-2 py-3 hover:text-primary">About</Link>
                </nav>

                <a href="tel:+919045222999" className="flex items-center gap-3 rounded-2xl bg-secondary p-4">
                  <span className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center"><Phone className="w-4 h-4" /></span>
                  <span className="leading-tight">
                    <span className="block text-xs text-ink/55">Call us at</span>
                    <span className="block font-extrabold text-primary">+91 90452 22999</span>
                  </span>
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <CategoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <CategoryModal isOpen={isBuyingModalOpen} onClose={() => setIsBuyingModalOpen(false)} mode="buying" />
      <CategoryModal isOpen={isRentModalOpen} onClose={() => setIsRentModalOpen(false)} mode="rent" />
    </>
  );
}

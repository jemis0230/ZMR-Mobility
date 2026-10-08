"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu, X, Search, ChevronDown, ChevronRight, MapPin, Phone, ArrowLeftRight, Check,
} from "lucide-react";
import {
  YEAR_OPTIONS, KM_OPTIONS, BODY_TYPES, RANGE_OPTIONS, DEFAULT_PRICE_BUCKETS,
  FALLBACK_MAKES, ALL_BRANDS_HREF, exploreHref, priceHref, bodyTypeHref, type MakeWithModels, type PriceBucket,
} from "@/lib/explore";
import { useCompare, compareHref } from "./compare/compareStore";

// Category picker modal is only downloaded when first opened.
const CategoryModal = dynamic(() => import("./CategoryModal"), { ssr: false });
// Test-drive form is only downloaded when first opened.
const TestDriveModal = dynamic(() => import("./TestDriveModal"), { ssr: false });

// Shared look for the Test Drive and Contact Us buttons.
const CTA_CLASS =
  "bg-primary hover:bg-primary-dark text-white px-3 max-[359px]:px-2 sm:px-4 md:px-5 py-2.5 rounded-full text-[11px] sm:text-xs md:text-sm font-bold transition-colors electric-glow whitespace-nowrap";

const CITIES = ["Lucknow", "Dehradun", "Chennai", "Bangalore"];
const CITY_KEY = "zmr-city";

const SEARCH_HINTS = ["make", "model", "body type", "budget", "scooter", "bike"];

// ── Explore-by menu content ───────────────────────────────────

type MenuLink = { label: string; href: string; image?: string; count?: number };

function buildExploreMenus(makes: MakeWithModels[], priceBuckets: PriceBucket[]) {
  const simple: { key: string; label: string; links: MenuLink[] }[] = [
    { key: "price", label: "Price Range", links: priceBuckets.map((b) => ({ label: b.label, href: priceHref(b), count: b.count })) },
    { key: "year", label: "Year", links: YEAR_OPTIONS.map((y) => ({ label: `${y} & above`, href: exploreHref({ minYear: y }) })) },
    { key: "km", label: "KM Driven", links: KM_OPTIONS.map((km) => ({ label: `${km.toLocaleString("en-IN")} kms or less`, href: exploreHref({ maxKm: km }) })) },
    { key: "body", label: "Body Type", links: BODY_TYPES.map((b) => ({ label: b.label, href: bodyTypeHref(b), image: b.image })) },
    { key: "range", label: "Range", links: RANGE_OPTIONS.map((r) => ({ label: `${r}+ km per charge`, href: exploreHref({ minRange: r }) })) },
  ];
  return { simple, makes: makes.length > 0 ? makes : FALLBACK_MAKES };
}

// ── Small building blocks ─────────────────────────────────────

/**
 * Header dropdowns share one "open menu" key owned by <Navbar>, so only one can be
 * open at a time across both rows. They open on click/tap only (never on hover);
 * outside click and Escape close them.
 */
type MenuControl = { id: string; open: boolean; toggle: () => void; close: () => void };

const triggerId = (id: string) => `menu-${id}-trigger`;
const panelId = (id: string) => `menu-${id}`;

function DropdownLink({ href, children, count }: { href: string; children: ReactNode; count?: number }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-6 px-5 py-3 rounded-xl text-[15px] font-semibold text-cream hover:bg-white/10 transition-colors"
    >
      <span className="flex items-center gap-3">{children}</span>
      <span className="flex items-center gap-2">
        {count !== undefined && <span className="rounded-full bg-lime/20 px-2 py-0.5 text-[11px] font-bold text-lime">{count}</span>}
        <ChevronRight className="w-4 h-4 text-cream/70 group-hover:translate-x-0.5 transition-transform" aria-hidden />
      </span>
    </Link>
  );
}

function ExploreItem({ menu, label, children }: { menu: MenuControl; label: string; children: ReactNode }) {
  const { id, open, toggle, close } = menu;
  return (
    <div className="relative h-full flex items-center" data-menu-root={id}>
      <button
        type="button"
        id={triggerId(id)}
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId(id)}
        className={`flex items-center gap-1.5 h-full px-1 text-[15px] font-medium transition-colors ${open ? "text-white" : "text-cream/90 hover:text-white"}`}
      >
        {label}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      <span className={`absolute left-0 right-0 bottom-0 h-[3px] rounded-t bg-lime transition-opacity ${open ? "opacity-100" : "opacity-0"}`} />
      <div
        id={panelId(id)}
        data-open={open}
        aria-labelledby={triggerId(id)}
        // Choosing a destination closes the menu (also when only the query string changes).
        onClick={(e) => { if ((e.target as HTMLElement).closest("a")) close(); }}
        className="dropdown-panel absolute top-full -left-6 z-50"
      >
        <div className="rounded-b-2xl bg-forest shadow-2xl shadow-forest/30 p-3 ring-1 ring-black/10">
          {children}
        </div>
      </div>
    </div>
  );
}

type TopItem = { label: string; href?: string; onClick?: () => void; desc?: string };

function TopMenu({ menu, label, items }: { menu: MenuControl; label: string; items: TopItem[] }) {
  const { id, open, toggle, close } = menu;

  return (
    <div className="relative" data-menu-root={id}>
      <button
        type="button"
        id={triggerId(id)}
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId(id)}
        className="flex items-center gap-1 py-2 text-[15px] font-semibold text-forest hover:text-primary transition-colors"
      >
        {label}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      <div id={panelId(id)} data-open={open} className="dropdown-panel absolute right-0 top-full pt-2 z-50">
        <div className="w-64 rounded-2xl bg-white border border-ink/10 shadow-xl p-2">
          {items.map((it) =>
            it.href ? (
              <Link key={it.label} href={it.href} onClick={close} className="block px-4 py-2.5 rounded-xl hover:bg-tint transition-colors">
                <span className="block text-sm font-semibold text-forest">{it.label}</span>
                {it.desc && <span className="block text-xs text-ink/65 mt-0.5">{it.desc}</span>}
              </Link>
            ) : (
              <button key={it.label} type="button" onClick={() => { close(); it.onClick?.(); }} className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-tint transition-colors">
                <span className="block text-sm font-semibold text-forest">{it.label}</span>
                {it.desc && <span className="block text-xs text-ink/65 mt-0.5">{it.desc}</span>}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function CitySelector({ menu }: { menu: MenuControl }) {
  const { id, open, toggle, close } = menu;
  const [city, setCity] = useState<string | null>(null);

  useEffect(() => {
    try { setCity(localStorage.getItem(CITY_KEY)); } catch { /* storage unavailable */ }
  }, []);

  const choose = (c: string) => {
    setCity(c);
    close();
    document.getElementById(triggerId(id))?.focus();
    try { localStorage.setItem(CITY_KEY, c); } catch { /* storage unavailable */ }
  };

  return (
    <div className="relative" data-menu-root={id}>
      <button
        type="button"
        id={triggerId(id)}
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId(id)}
        aria-haspopup="listbox"
        className="flex items-center gap-1.5 rounded-full border border-ink/20 bg-white/60 px-4 py-2 text-sm font-semibold text-forest hover:border-primary hover:text-primary transition-colors whitespace-nowrap"
      >
        <MapPin className="w-4 h-4 text-leaf" aria-hidden />
        {city ?? "Select city"}
        <ChevronDown className="w-3.5 h-3.5" aria-hidden />
      </button>
      {open && (
        <div id={panelId(id)} role="listbox" aria-label="Select your city" className="absolute left-0 top-full mt-2 w-56 rounded-2xl bg-white border border-ink/10 shadow-xl p-2 z-50">
          <p className="px-3 pt-1 pb-2 text-[11px] font-bold uppercase tracking-wider text-ink/65">We serve in</p>
          {CITIES.map((c) => (
            <button
              key={c}
              type="button"
              role="option"
              aria-selected={city === c}
              onClick={() => choose(c)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-forest hover:bg-tint"
            >
              {c}
              {city === c && <Check className="w-4 h-4 text-primary" aria-hidden />}
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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setHint((h) => (h + 1) % SEARCH_HINTS.length), 2400);
    return () => clearInterval(id);
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    router.push(exploreHref({ q: value.trim() }));
    onSubmitted?.();
  };

  return (
    <form onSubmit={submit} role="search" className={`relative flex items-center ${className}`}>
      <Search className="absolute left-4 w-4 h-4 text-ink/60 pointer-events-none" aria-hidden />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Search EVs by make, model or body type"
        className="peer w-full rounded-full bg-white border border-ink/15 focus:border-primary pl-11 pr-4 py-2.5 text-sm text-forest outline-none transition-colors"
      />
      {!value && (
        <span aria-hidden className="absolute left-11 text-sm text-ink/60 pointer-events-none overflow-hidden whitespace-nowrap">
          Search by <span key={hint} className="inline-block font-semibold text-forest animate-[fadeIn_.3s_ease]">{SEARCH_HINTS[hint]}</span>
        </span>
      )}
    </form>
  );
}

function CompareLink({ className = "" }: { className?: string }) {
  const { items, count } = useCompare();
  return (
    <Link
      href={compareHref(items.map((i) => i.id))}
      className={`relative flex flex-col items-center text-forest hover:text-primary transition-colors ${className}`}
      aria-label={count ? `Compare vehicles (${count} selected)` : "Compare vehicles"}
    >
      <ArrowLeftRight className="w-5 h-5" aria-hidden />
      <span className="text-[11px] font-semibold mt-0.5 max-sm:sr-only">Compare</span>
      {count > 0 && (
        <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] rounded-full bg-lime text-forest text-[11px] font-black flex items-center justify-center px-1">
          {count}
        </span>
      )}
    </Link>
  );
}

// ── Main component ────────────────────────────────────────────

export default function Navbar({ makes = [], priceBuckets = DEFAULT_PRICE_BUCKETS }: { makes?: MakeWithModels[]; priceBuckets?: PriceBucket[] }) {
  const [modal, setModal] = useState<null | "leasing" | "buying" | "rent">(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [testDriveOpen, setTestDriveOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const openMenuRef = useRef<string | null>(null);
  openMenuRef.current = openMenu;
  const drawerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const menus = buildExploreMenus(makes, priceBuckets);

  // Closed drawer is removed from the tab order / accessibility tree.
  useEffect(() => {
    drawerRef.current?.toggleAttribute("inert", !isMobileMenuOpen);
    if (!isMobileMenuOpen) setOpenMenu((m) => (m === "city-mobile" ? null : m));
  }, [isMobileMenuOpen]);

  // Close menus on navigation
  useEffect(() => {
    setOpenMenu(null);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Escape closes the open menu (returning focus to its trigger) or the drawer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const current = openMenuRef.current;
      if (current) {
        setOpenMenu(null);
        document.getElementById(triggerId(current))?.focus();
      } else {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // A press anywhere outside the open menu (trigger + panel) closes it. Pressing another
  // trigger therefore closes this one first, and its own click then opens it.
  useEffect(() => {
    if (!openMenu) return;
    const onDown = (e: PointerEvent) => {
      const root = document.querySelector(`[data-menu-root="${openMenu}"]`);
      if (!root || !root.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [openMenu]);

  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const menu = (id: string): MenuControl => ({
    id,
    open: openMenu === id,
    toggle: () => setOpenMenu((m) => (m === id ? null : id)),
    close: () => setOpenMenu((m) => (m === id ? null : m)),
  });

  const openTestDrive = () => {
    setIsMobileMenuOpen(false);
    setTestDriveOpen(true);
  };

  const handleContactClick = () => {
    setIsMobileMenuOpen(false);
    if (pathname === "/") {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/#contact");
    }
  };

  const buyItems: TopItem[] = [
    { label: "Buy Pre-owned EV", desc: "Browse certified used EVs", href: exploreHref() },
    { label: "Buy by Category", desc: "2W, 3W & 4W electric vehicles", onClick: () => setModal("buying") },
    { label: "Lease an EV", desc: "Flexible monthly plans", onClick: () => setModal("leasing") },
    { label: "Rent an EV", desc: "Daily, weekly & monthly", onClick: () => setModal("rent") },
    { label: "Compare EVs", desc: "Side-by-side, up to 3 vehicles", href: "/compare" },
  ];
  const moreItems: TopItem[] = [
    { label: "Warranty & Ownership", desc: "Warranty, RC transfer, NOC, insurance, buyback", href: "/warranty-ownership" },
    { label: "Press & Media", href: "/press" },
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
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-forest focus:px-4 focus:py-2 focus:text-cream">
        Skip to content
      </a>
      <header className="fixed top-0 inset-x-0 z-50">
        {/* ── Top bar (Cream) ── */}
        {/* backdrop-blur creates a stacking context: z-20 keeps its city / Buy EV / More
            panels above the Explore-by ribbon below instead of underneath it. */}
        <div className="relative z-20 bg-cream/95 backdrop-blur border-b border-ink/10">
          <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3 lg:gap-5 px-3 sm:px-4 md:px-6 h-[72px] lg:h-[84px]">
            <Link href="/" className="shrink-0 flex items-center" aria-label="ZMR Mobility home">
              <Image
                src="/zmr-logo-full.png"
                alt="ZMR Mobility"
                width={579}
                height={361}
                sizes="(min-width: 1024px) 122px, 103px"
                quality={80}
                className="h-11 max-[359px]:h-9 sm:h-16 lg:h-[76px] w-auto"
                priority
              />
            </Link>

            <div className="hidden lg:block"><CitySelector menu={menu("city")} /></div>

            <SearchBar className="hidden md:flex flex-1 max-w-md" />

            <nav aria-label="Main" className="hidden lg:flex items-center gap-5 ml-auto">
              <TopMenu menu={menu("buy")} label="Buy EV" items={buyItems} />
              <Link href="/sell-ev" className="text-[15px] font-semibold text-forest hover:text-primary transition-colors">Sell EV</Link>
              <TopMenu menu={menu("more")} label="More" items={moreItems} />
              <CompareLink />
            </nav>

            <div className="flex items-center gap-1.5 max-[359px]:gap-1 sm:gap-2 ml-auto lg:ml-0">
              <CompareLink className="lg:hidden mr-0.5 max-[359px]:hidden" />
              <button type="button" onClick={openTestDrive} aria-haspopup="dialog" className={CTA_CLASS}>
                Test Drive
              </button>
              <button type="button" onClick={handleContactClick} className={CTA_CLASS}>
                Contact Us
              </button>
              <button
                onClick={() => setIsMobileMenuOpen((o) => !o)}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
                className="lg:hidden p-2 sm:p-2.5 rounded-lg border border-ink/15 text-forest hover:bg-white transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Explore-by bar (desktop, Forest) ── */}
        <nav aria-label="Explore by" className="relative z-10 hidden lg:block bg-forest shadow-md shadow-forest/20 focus-on-dark">
          <div className="max-w-7xl mx-auto px-6 h-12 flex items-stretch gap-9">
            <span className="flex items-center text-[15px] font-semibold text-lime">Explore By</span>

            <ExploreItem menu={menu("price")} label="Price Range">
              <div className="w-72 py-1">
                {menus.simple[0].links.map((l) => <DropdownLink key={l.label} href={l.href} count={l.count}>{l.label}</DropdownLink>)}
                <Link href={exploreHref({ sort: "price_asc" })} className="mt-1 mx-2 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 py-2.5 text-sm font-bold text-cream">
                  All prices, lowest first
                </Link>
              </div>
            </ExploreItem>

            <ExploreItem menu={menu("make")} label="Make and Model">
              <div className="grid grid-cols-5 w-[min(820px,calc(100vw-22rem))] gap-1 p-2">
                {menus.makes.map((m) => (
                  <div key={m.make} className="py-1 min-w-0">
                    <Link
                      href={exploreHref({ make: m.make })}
                      className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-base font-bold text-white hover:bg-white/10"
                    >
                      {m.make}
                      <ChevronRight className="w-4 h-4 text-cream/70 group-hover:translate-x-0.5 transition-transform" aria-hidden />
                    </Link>
                    {m.models.slice(0, 5).map((model) => (
                      <Link
                        key={model}
                        href={exploreHref({ make: m.make, model })}
                        className="block px-3 py-2.5 rounded-xl text-[15px] font-medium text-cream/90 hover:bg-white/10 hover:text-white"
                      >
                        {model}
                      </Link>
                    ))}
                    {m.models.length === 0 && m.count === 0 && (
                      <p className="px-3 py-2.5 text-sm text-cream/75">None listed right now</p>
                    )}
                  </div>
                ))}
              </div>
              <Link href={ALL_BRANDS_HREF} className="mx-2 mb-1 mt-1 flex items-center justify-center gap-1 rounded-xl bg-white/10 hover:bg-white/15 py-2.5 text-sm font-bold text-cream">
                View all brands <ChevronRight className="w-4 h-4" aria-hidden />
              </Link>
            </ExploreItem>

            {menus.simple.slice(1).map((group) => (
              <ExploreItem key={group.key} menu={menu(group.key)} label={group.label}>
                <div className={`${group.key === "km" || group.key === "body" ? "w-72" : "w-60"} py-1`}>
                  {group.links.map((l) => (
                    <DropdownLink key={l.label} href={l.href}>
                      {l.image && (
                        <span className="relative w-10 h-8 rounded-md overflow-hidden bg-cream shrink-0">
                          <Image src={l.image} alt="" fill sizes="40px" className="object-cover" loading="lazy" />
                        </span>
                      )}
                      {l.label}
                    </DropdownLink>
                  ))}
                </div>
              </ExploreItem>
            ))}
          </div>
        </nav>
      </header>

      {/* ── Mobile drawer ── */}
      <div
        className={`fixed inset-0 z-40 bg-forest/40 lg:hidden transition-opacity ${isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden
      />
      <aside
        ref={drawerRef}
        aria-label="Mobile menu"
        className={`fixed top-[72px] right-0 bottom-0 z-50 w-[88vw] max-w-sm bg-cream shadow-2xl overflow-y-auto lg:hidden transition-transform duration-200 ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-4 space-y-4">
          <SearchBar onSubmitted={() => setIsMobileMenuOpen(false)} />
          <CitySelector menu={menu("city-mobile")} />

          <div className="rounded-2xl bg-forest p-1 focus-on-dark">
            <p className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-widest text-lime">Explore By</p>
            {allExploreKeys.map(({ key, label }) => {
              const isOpen = mobileSection === key;
              const links: MenuLink[] = key === "make"
                ? menus.makes.map((m) => ({ label: m.make, href: exploreHref({ make: m.make }) }))
                : menus.simple.find((m) => m.key === key)?.links ?? [];
              return (
                <div key={key} className="border-t border-white/10 first-of-type:border-t-0">
                  <button
                    type="button"
                    onClick={() => setMobileSection(isOpen ? null : key)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between px-3 py-3 text-sm font-semibold text-cream"
                  >
                    {label}
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden />
                  </button>
                  {isOpen && (
                    <div className="pb-2 grid grid-cols-2 gap-1 px-2">
                      {links.map((l) => (
                        <Link
                          key={l.label}
                          href={l.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="rounded-lg bg-white/10 px-3 py-2.5 text-xs font-semibold text-cream hover:bg-white/20"
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

          <nav aria-label="Mobile main" className="flex flex-col text-[15px] font-semibold text-forest">
            <Link href={exploreHref()} className="px-2 py-3 border-b border-ink/10 hover:text-primary">Buy Pre-owned EV</Link>
            <button onClick={() => { setModal("leasing"); setIsMobileMenuOpen(false); }} className="text-left px-2 py-3 border-b border-ink/10 hover:text-primary">Leasing</button>
            <button onClick={() => { setModal("buying"); setIsMobileMenuOpen(false); }} className="text-left px-2 py-3 border-b border-ink/10 hover:text-primary">Buy by Category</button>
            <button onClick={() => { setModal("rent"); setIsMobileMenuOpen(false); }} className="text-left px-2 py-3 border-b border-ink/10 hover:text-primary">Rent</button>
            <Link href="/sell-ev" className="px-2 py-3 border-b border-ink/10 hover:text-primary">Sell EV</Link>
            <Link href="/compare" className="px-2 py-3 border-b border-ink/10 hover:text-primary">Compare</Link>
            <Link href="/warranty-ownership" className="px-2 py-3 border-b border-ink/10 hover:text-primary">Warranty & Ownership</Link>
            <Link href="/press" className="px-2 py-3 border-b border-ink/10 hover:text-primary">Press & Media</Link>
            <Link href="/blogs" className="px-2 py-3 border-b border-ink/10 hover:text-primary">Blog</Link>
            <Link href="/about" className="px-2 py-3 hover:text-primary">About</Link>
          </nav>

          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={openTestDrive} aria-haspopup="dialog" className={`${CTA_CLASS} py-3`}>Test Drive</button>
            <button type="button" onClick={handleContactClick} className={`${CTA_CLASS} py-3`}>Contact Us</button>
          </div>

          <a href="tel:+919045222999" className="flex items-center gap-3 rounded-2xl bg-white p-4">
            <span className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center"><Phone className="w-4 h-4" aria-hidden /></span>
            <span className="leading-tight">
              <span className="block text-xs text-ink/70">Call us at</span>
              <span className="block font-extrabold text-primary">+91 90452 22999</span>
            </span>
          </a>
        </div>
      </aside>

      {testDriveOpen && <TestDriveModal open={testDriveOpen} onClose={() => setTestDriveOpen(false)} />}

      {modal && (
        <>
          <CategoryModal isOpen={modal === "leasing"} onClose={() => setModal(null)} />
          <CategoryModal isOpen={modal === "buying"} onClose={() => setModal(null)} mode="buying" />
          <CategoryModal isOpen={modal === "rent"} onClose={() => setModal(null)} mode="rent" />
        </>
      )}
    </>
  );
}

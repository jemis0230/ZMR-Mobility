import Link from "next/link";
import Image from "next/image";
import { Linkedin, Instagram, Mail, MapPin, Phone } from "lucide-react";
import {
  BODY_TYPES, YEAR_OPTIONS, DEFAULT_PRICE_BUCKETS, priceHref, bodyTypeHref, exploreHref, type PriceBucket,
} from "@/lib/explore";

const footerLinks = {
  categories: [
    { name: "2 Wheeler", href: "/leasing/vehicles/2-wheeler" },
    { name: "3 Wheeler (Cargo)", href: "/leasing/vehicles/3-wheeler-cargo" },
    { name: "3 Wheeler (Passenger)", href: "/leasing/vehicles/3-wheeler-passenger" },
    { name: "4 Wheeler (Passenger)", href: "/leasing/vehicles/4-wheeler-passenger" },
    { name: "4 Wheeler (Cargo)", href: "/leasing/vehicles/4-wheeler-cargo" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Press & Media", href: "/press" },
    { name: "Blog", href: "/blogs" },
    { name: "Contact Us", href: "/#contact" },
    { name: "Our Impact", href: "/about#impact" },
  ],
  help: [
    { name: "Warranty & Ownership", href: "/warranty-ownership" },
    { name: "Compare EVs", href: "/compare" },
    { name: "Sell Your EV", href: "/sell-ev" },
    { name: "FAQs", href: "/#faq" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms-and-conditions" },
  ],
};

function LinkColumn({ title, links }: { title: string; links: { name: string; href: string }[] }) {
  return (
    <div>
      <h2 className="font-bold text-lime mb-5 uppercase text-xs tracking-widest">{title}</h2>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.name}>
            <Link href={link.href} className="text-sm text-cream/85 hover:text-white hover:underline underline-offset-4 transition-colors">
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer({ priceBuckets = DEFAULT_PRICE_BUCKETS }: { priceBuckets?: PriceBucket[] }) {
  const popularSearches = [
    { title: "By Budget", links: priceBuckets.map((b) => ({ name: `EVs ${b.label.replace(/^Under/, "under")}`, href: priceHref(b) })) },
    { title: "By Body Type", links: BODY_TYPES.map((b) => ({ name: `Used ${b.label}`, href: bodyTypeHref(b.category) })) },
    { title: "By Year", links: YEAR_OPTIONS.slice(0, 5).map((y) => ({ name: `${y} & newer EVs`, href: exploreHref({ minYear: y }) })) },
  ];

  return (
    <footer className="bg-green-900 text-cream pt-16 pb-10 px-6 focus-on-dark">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="inline-block rounded-2xl bg-cream px-4 py-2" aria-label="ZMR Mobility home">
              <Image src="/zmr-logo-full.png" alt="ZMR Mobility" width={579} height={361} sizes="128px" quality={80} className="h-20 w-auto" />
            </Link>
            <p className="text-cream/85 text-sm leading-relaxed max-w-sm">
              India&apos;s technology-first EV asset management company — making electric mobility accessible,
              affordable and reliable through IoT-driven solutions.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Linkedin, href: "https://www.linkedin.com/company/zmr-mobility", label: "ZMR Mobility on LinkedIn" },
                { Icon: Instagram, href: "https://www.instagram.com/p/DIijiOgtuAv/", label: "ZMR Mobility on Instagram" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center hover:bg-lime hover:text-forest transition-colors"
                >
                  <item.Icon className="w-5 h-5" aria-hidden />
                </a>
              ))}
            </div>
          </div>

          <LinkColumn title="Fleet Categories" links={footerLinks.categories} />
          <LinkColumn title="Company" links={footerLinks.company} />
          <LinkColumn title="Help" links={footerLinks.help} />

          <div>
            <h2 className="font-bold text-lime mb-5 uppercase text-xs tracking-widest">Contact Us</h2>
            <ul className="space-y-4 text-sm text-cream/85">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-lime mt-0.5 shrink-0" aria-hidden />
                <span>Lucknow &amp; Dehradun, Uttar Pradesh &amp; Uttarakhand · Chennai &amp; Bangalore</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-lime shrink-0" aria-hidden />
                <a href="mailto:info@zmrmobility.in" className="hover:text-white hover:underline">info@zmrmobility.in</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-lime shrink-0" aria-hidden />
                <a href="tel:+919045222999" className="hover:text-white hover:underline">+91 90452 22999</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Popular searches */}
        <div className="py-8 border-t border-white/10 grid md:grid-cols-3 gap-8">
          {popularSearches.map((group) => (
            <div key={group.title}>
              <h2 className="font-bold text-cream mb-3 uppercase text-xs tracking-widest">Popular Searches · {group.title}</h2>
              <div className="flex flex-wrap gap-2">
                {group.links.map((l) => (
                  <Link key={l.name} href={l.href} className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-cream/85 hover:border-lime hover:text-white transition-colors">
                    {l.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-cream/75 text-xs font-medium tracking-wider uppercase">
            © {new Date().getFullYear()} ZMR Mobility Private Limited. All rights reserved.
          </p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <Link key={link.name} href={link.href} className="text-xs font-bold text-cream/80 hover:text-white uppercase tracking-widest">
                {link.name}
              </Link>
            ))}
          </div>
        </div>
        <p className="mt-6 text-center text-cream/65 text-[11px] tracking-wider">
          Powered by{" "}
          <a href="https://planxlabs.com" target="_blank" rel="noopener noreferrer" className="hover:text-white underline-offset-2 hover:underline">
            PlanxLabs
          </a>
        </p>
      </div>
    </footer>
  );
}

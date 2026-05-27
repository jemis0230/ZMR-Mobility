"use client";

import Link from "next/link";
import Image from "next/image";
import { Linkedin, Instagram, Mail, MapPin, Phone, ArrowRight } from "lucide-react";

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
    { name: "Blog", href: "/blogs" },
    { name: "Contact Us", href: "/#contact" },
    { name: "Our Impact", href: "/about#impact" },
  ],
  services: [
    { name: "EV Leasing", href: "/leasing/vehicles/2-wheeler" },
    { name: "IoT Monitoring", href: "/about#tech" },
    { name: "Aftersales Support", href: "/about#solutions" },
    { name: "Vehicle Procurement", href: "/#procurement" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms-and-conditions" },
  ]
};

export default function Footer() {
  return (
    <footer className="bg-background border-t border-white/5 pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-8">
            <Link href="/" className="inline-block">
              <div className="rounded-xl overflow-hidden">
                <Image
                  src="/companyLogo.webp"
                  alt="ZMR Mobility"
                  width={260}
                  height={72}
                  className="h-20 w-auto object-contain"
                />
              </div>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm">
              India's technology-first EV asset management company. 
              Making electric mobility accessible, affordable, and reliable 
              for a sustainable Bharat through IoT-driven solutions.
            </p>
            <div className="flex gap-4">
              {[
                { Icon: Linkedin, href: "https://www.linkedin.com/company/zmr-mobility" },
                { Icon: Instagram, href: "https://www.instagram.com/p/DIijiOgtuAv/" },
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all border border-white/10 group"
                >
                  <item.Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-bold text-white mb-8 uppercase text-xs tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Fleet Categories
            </h4>
            <ul className="space-y-4">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-white/40 hover:text-primary transition-colors flex items-center gap-2 group">
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-8 uppercase text-xs tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Company
            </h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-white/40 hover:text-primary transition-colors flex items-center gap-2 group">
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-8 uppercase text-xs tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Contact Us
            </h4>
            <ul className="space-y-5 text-sm text-white/40">
              <li className="flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <span className="pt-1">Lucknow & Dehradun,<br />Uttar Pradesh & Uttarakhand<br />Chennai & Bangalore</span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <a href="mailto:info@zmrmobility.in" className="hover:text-primary transition-colors">info@zmrmobility.in</a>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <a href="tel:+919045222999" className="hover:text-primary transition-colors">+91 90452 22999</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-white/20 text-[11px] font-medium tracking-wider uppercase">
            © 2026 ZMR Mobility Private Limited. All rights reserved.
          </p>
          <div className="flex gap-8">
            {footerLinks.legal.map((link) => (
              <Link key={link.name} href={link.href} className="text-[11px] font-bold text-white/20 hover:text-primary transition-colors uppercase tracking-widest">
                {link.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-white/10 text-[10px] tracking-wider">
            Powered by{' '}
            <a href="https://planxlabs.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              PlanxLabs
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import GoogleAnalytics from "@/presentation/components/GoogleAnalytics";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_PHONE, SITE_EMAIL, SITE_SOCIALS } from "@/lib/site";

// Self-hosted, preloaded variable Inter (Latin) with metric-matched fallback to avoid layout shift.
const inter = localFont({
  src: "./fonts/InterVariable-latin.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-inter",
  fallback: ["system-ui", "Segoe UI", "Arial", "sans-serif"],
});

export const viewport: Viewport = {
  themeColor: "#F4EFE9",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "ZMR Mobility | Buy, Lease & Rent Certified Electric Vehicles in India",
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "ZMR Mobility", "zmr mobility", "EV leasing India", "used electric vehicles", "pre-owned EV",
    "electric scooter", "e-rickshaw", "electric cargo loader", "EV fleet", "Lucknow", "Dehradun", "Chennai", "Bangalore",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    url: SITE_URL,
    title: "ZMR Mobility | Buy, Lease & Rent Certified Electric Vehicles",
    description: SITE_DESCRIPTION,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ZMR Mobility — Certified Electric Vehicles" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZMR Mobility | Certified Electric Vehicles",
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
  // Optional: HTML-tag verification for Google Search Console (DNS verification needs no code).
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
  // Small, correctly sized icons (the 500×500 source was 83 KB and fetched on every visit).
  icons: {
    icon: [
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
};

// Structured data so search engines recognise the brand ("ZMR Mobility") and its site search.
const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    legalName: "ZMR Mobility Private Limited",
    url: SITE_URL,
    logo: `${SITE_URL}/zmr-logo-official.png`,
    email: SITE_EMAIL,
    telephone: SITE_PHONE,
    sameAs: SITE_SOCIALS,
    areaServed: ["Lucknow", "Dehradun", "Chennai", "Bangalore"].map((name) => ({ "@type": "City", name })),
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/explore?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}

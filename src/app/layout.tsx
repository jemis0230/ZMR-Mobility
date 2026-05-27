import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
import GoogleAnalytics from "@/presentation/components/GoogleAnalytics";

export const metadata: Metadata = {
  title: "ZMR Mobility | India's Leading EV Leasing",
  description: "Flexible EV leasing solutions for a cleaner future.",
  icons: {
    icon: "/favIcon.png",
    apple: "/favIcon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}

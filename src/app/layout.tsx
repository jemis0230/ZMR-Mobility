import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZMR Mobility | India's Leading EV Leasing",
  description: "Flexible EV leasing solutions for a cleaner future.",
  icons: {
    icon: "/compnay_logo..webp",
    apple: "/compnay_logo..webp",
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
        {children}
      </body>
    </html>
  );
}

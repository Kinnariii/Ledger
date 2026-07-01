import type { Metadata } from "next";
import "./globals.css";

/**
 * Ledger Root Layout
 * ==================
 * Loads the three-tiered font stack from DESIGN.md:
 * 1. Newsreader (serif) — headlines, editorial moments
 * 2. Inter (sans) — body text, functional content
 * 3. IBM Plex Mono — system metadata, timestamps, labels
 *
 * CSS custom properties (--font-headline, --font-body, --font-mono)
 * are defined in globals.css.
 */

export const metadata: Metadata = {
  title: {
    default: "Ledger — AI Business Operations",
    template: "%s | Ledger",
  },
  description:
    "Ledger is your AI business operations platform. Manage customers, opportunities, conversations, and automated workflows through an intelligent assistant.",
  // SEO: proper meta tags for every page
  openGraph: {
    title: "Ledger — AI Business Operations",
    description:
      "Manage your business with an intelligent AI assistant. CRM, unified inbox, WhatsApp integration, and automated workflows.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

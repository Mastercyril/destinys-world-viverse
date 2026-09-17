import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { BRAND, BRAND_TAGLINE } from "@/lib/brand";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  title: `${BRAND} | VIVERSE`,
  description: `${BRAND_TAGLINE}. Explore four zones, temporal fragments, and the alien AI.`,
};

export const viewport: Viewport = { themeColor: "#0a0a0f" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={inter.variable}><body>{children}</body></html>;
}

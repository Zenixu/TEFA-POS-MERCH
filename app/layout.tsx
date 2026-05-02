import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import AuthProvider from "@/components/providers/AuthProvider";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "TEFA Merch POS — Point of Sale",
  description:
    "Sistem Point of Sale untuk toko merchandise pakaian. Cepat, modern, dan responsif.",
  keywords: ["POS", "point of sale", "merchandise", "kasir", "toko baju"],
  icons: {
    icon: "/logo_zielabs_kotak.png",
    shortcut: "/logo_zielabs_kotak.png",
    apple: "/logo_zielabs_kotak.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${dmSans.variable} ${dmMono.variable} h-full`}>
      <body className="min-h-full bg-background text-foreground font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

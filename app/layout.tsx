import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Calculator Nilai UT — Hitung Nilai Akhir & IPK Universitas Terbuka",
  description:
    "Kalkulator nilai Universitas Terbuka: hitung skor UAS, nilai akhir, dan estimasi IPK untuk UAS+Tuton, UAS+TMK, dan UAS+TUWEB. Simpan banyak mata kuliah sekaligus.",
  keywords: [
    "kalkulator nilai UT",
    "nilai akhir Universitas Terbuka",
    "hitung UAS UT",
    "IPK UT",
    "Tuton",
    "TMK",
    "TUWEB",
  ],
  openGraph: {
    title: "Calculator Nilai UT",
    description:
      "Hitung nilai akhir & estimasi IPK untuk mata kuliah Universitas Terbuka.",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Calculator Nilai UT",
    description:
      "Hitung nilai akhir & estimasi IPK untuk mata kuliah Universitas Terbuka.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HakiPDF — Upload Dokumen, Jadi PDF",
  description: "Upload foto dokumen lamaran kerja, urutkan, langsung jadi PDF. Gratis, tanpa upload ke server.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={`${inter.variable} antialiased bg-[#0a0a0a]`}>
        {children}
      </body>
    </html>
  );
}
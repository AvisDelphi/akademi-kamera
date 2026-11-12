// app/layout.js — root layout shared by every page (tema Ink & Sprout).
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import { AuthProvider } from "@/lib/auth";

export const metadata = {
  title: "Akademi Kamera",
  description: "Belajar segitiga exposure dengan kamera virtual dan analisis EXIF foto sendiri.",
};

export const viewport = { themeColor: "#F6F8F3" };

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="min-h-screen font-instrument text-tinta-900">
        <AuthProvider>
          <SiteHeader />
          {/* pb-24 di mobile memberi ruang untuk navigasi bawah (§9.3) */}
          <main className="mx-auto max-w-[1200px] px-4 pb-24 sm:px-6 md:pb-16 lg:px-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}

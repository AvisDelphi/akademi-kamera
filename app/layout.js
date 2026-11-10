// app/layout.js — root layout shared by every page.
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import { AuthProvider } from "@/lib/auth";

export const metadata = {
  title: "Akademi Kamera",
  description: "Belajar segitiga exposure dengan kamera virtual dan analisis EXIF foto sendiri.",
};

export const viewport = { themeColor: "#262626" };

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Semi+Condensed:wght@500;600;700&display=swap"
        />
      </head>
      <body className="min-h-screen">
        <AuthProvider>
          <SiteHeader />
          <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}

// app/layout.js — root layout: font, tema, dan sesi. Navbar ada di app/(app)/layout.js;
// landing page (/) sengaja tanpa navbar.
import "./globals.css";
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
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

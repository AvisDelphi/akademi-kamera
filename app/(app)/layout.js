// app/(app)/layout.js — kerangka untuk semua halaman aplikasi (kursus, simulator, analisis, akun, dasbor).
import SiteHeader from "@/components/SiteHeader";

export default function AppLayout({ children }) {
  return (
    <>
      <SiteHeader />
      {/* pb-24 di mobile memberi ruang untuk navigasi bawah (§9.3) */}
      <main className="mx-auto max-w-[1200px] px-4 pb-24 sm:px-6 md:pb-16 lg:px-8">{children}</main>
    </>
  );
}

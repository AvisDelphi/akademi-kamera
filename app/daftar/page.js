// app/daftar/page.js
import { Suspense } from "react";
import RegisterForm from "@/components/auth/RegisterForm";
import { Loading } from "@/components/lms/ui";

export const metadata = { title: "Daftar | Akademi Kamera" };

export default function DaftarPage() {
  return (
    <div className="max-w-xl py-12">
      <h1 className="font-display text-4xl font-semibold">Buat akun siswa</h1>
      <p className="mt-2 max-w-prose text-muted">
        Satu akun untuk mengikuti kursus, menyimpan progres, dan merekam hasil latihan simulator serta analisis foto.
      </p>
      <div className="mt-8">
        <Suspense fallback={<Loading label="Memuat formulir…" />}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}

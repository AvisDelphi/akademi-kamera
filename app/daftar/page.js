// app/daftar/page.js
import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";
import { Loading } from "@/components/lms/ui";

export const metadata = { title: "Daftar | Akademi Kamera" };

export default function DaftarPage() {
  return (
    <AuthShell
      title="Buat akun"
      description="Satu akun untuk mengikuti kursus, menyimpan progres, dan merekam hasil latihan simulator serta analisis foto."
    >
      <Suspense fallback={<Loading label="Memuat formulir…" />}>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}

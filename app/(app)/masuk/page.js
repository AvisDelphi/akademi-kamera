// app/masuk/page.js
import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";
import { Loading } from "@/components/lms/ui";

export const metadata = { title: "Masuk | Akademi Kamera" };

export default function MasukPage() {
  return (
    <AuthShell
      title="Masuk"
      description="Masuk untuk melanjutkan kursus, menandai materi yang selesai, menyimpan nilai kuis, dan melihat riwayat latihan."
    >
      <Suspense fallback={<Loading label="Memuat formulir…" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}

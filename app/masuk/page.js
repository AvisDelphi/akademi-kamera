// app/masuk/page.js
import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import { Loading } from "@/components/lms/ui";

export const metadata = { title: "Masuk | Akademi Kamera" };

export default function MasukPage() {
  return (
    <div className="max-w-xl py-12">
      <h1 className="font-display text-4xl font-semibold">Masuk</h1>
      <p className="mt-2 max-w-prose text-muted">
        Masuk untuk mendaftar kursus, menandai materi yang selesai, menyimpan nilai kuis, dan melihat riwayat latihan.
      </p>
      <div className="mt-8">
        <Suspense fallback={<Loading label="Memuat formulir…" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

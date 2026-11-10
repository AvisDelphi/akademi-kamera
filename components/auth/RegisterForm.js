"use client";
// components/auth/RegisterForm.js
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { SupabaseNotice } from "@/components/lms/ui";

function safeNext(value) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/kursus";
}

export default function RegisterForm() {
  const { enabled, loading, user, signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState(null);

  useEffect(() => {
    if (!loading && user && !confirmationEmail) router.replace(next);
  }, [loading, user, next, router, confirmationEmail]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    if (!fullName.trim()) {
      setError("Isi nama lengkapmu.");
      return;
    }
    if (!email.trim()) {
      setError("Isi email.");
      return;
    }
    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi kata sandi belum sama.");
      return;
    }

    setBusy(true);
    const result = await signUp({ email: email.trim(), password, fullName: fullName.trim() });
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.needsConfirmation) {
      setConfirmationEmail(email.trim());
      return;
    }
    router.replace(next);
  }

  if (!enabled) return <SupabaseNotice />;

  if (confirmationEmail) {
    return (
      <div className="max-w-md rounded border border-rule bg-panel p-6" role="status">
        <h2 className="font-display text-xl font-semibold">Cek email konfirmasi</h2>
        <p className="mt-2 text-muted">
          Kami mengirim tautan konfirmasi ke <span className="text-ink">{confirmationEmail}</span>. Buka tautan itu
          lebih dulu, lalu masuk.
        </p>
        <Link href="/masuk" className="mt-4 inline-block text-amber underline">
          Ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4" noValidate>
      <label className="block text-sm text-muted">
        Nama lengkap
        <input
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          autoComplete="name"
          className="mt-1 block w-full rounded border border-rule bg-panel px-3 py-2 text-ink"
          required
        />
      </label>
      <label className="block text-sm text-muted">
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          className="mt-1 block w-full rounded border border-rule bg-panel px-3 py-2 text-ink"
          required
        />
      </label>
      <label className="block text-sm text-muted">
        Kata sandi
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          minLength={6}
          className="mt-1 block w-full rounded border border-rule bg-panel px-3 py-2 text-ink"
          required
        />
      </label>
      <label className="block text-sm text-muted">
        Ulangi kata sandi
        <input
          type="password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          autoComplete="new-password"
          minLength={6}
          className="mt-1 block w-full rounded border border-rule bg-panel px-3 py-2 text-ink"
          required
        />
      </label>

      {error && (
        <p className="rounded border border-over/50 bg-panel p-3 text-sm text-over" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="rounded-full bg-amber px-6 py-2 font-display text-lg font-semibold text-surround disabled:opacity-60"
      >
        {busy ? "Mendaftar…" : "Buat akun siswa"}
      </button>

      <p className="text-xs text-muted">
        Akun baru otomatis berperan siswa. Instruktur dan admin dinaikkan perannya oleh admin melalui Supabase.
      </p>
      <p className="text-sm text-muted">
        Sudah punya akun?{" "}
        <Link href={`/masuk?next=${encodeURIComponent(next)}`} className="text-amber underline">
          Masuk
        </Link>
      </p>
    </form>
  );
}

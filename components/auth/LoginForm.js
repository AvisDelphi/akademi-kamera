"use client";
// components/auth/LoginForm.js
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { SupabaseNotice } from "@/components/lms/ui";

function safeNext(value) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/kursus";
}

export default function LoginForm() {
  const { enabled, loading, user, signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  // Already signed in (or just signed in): continue where the user was going.
  useEffect(() => {
    if (!loading && user) router.replace(next);
  }, [loading, user, next, router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Isi email dan kata sandi.");
      return;
    }
    setBusy(true);
    const result = await signIn(email.trim(), password);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.replace(next);
  }

  if (!enabled) return <SupabaseNotice />;

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4" noValidate>
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
          autoComplete="current-password"
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
        {busy ? "Memeriksa…" : "Masuk"}
      </button>

      <p className="text-sm text-muted">
        Belum punya akun?{" "}
        <Link href={`/daftar?next=${encodeURIComponent(next)}`} className="text-amber underline">
          Daftar sebagai siswa
        </Link>
      </p>
    </form>
  );
}

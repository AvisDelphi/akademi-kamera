"use client";
// components/auth/LoginForm.js
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Banner, SupabaseNotice, btn } from "@/components/lms/ui";
import Field from "./Field";
import PasswordField from "./PasswordField";

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
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  // Sudah masuk (atau baru masuk): lanjut ke tujuan semula.
  useEffect(() => {
    if (!loading && user) router.replace(next);
  }, [loading, user, next, router]);

  const validators = {
    email: (value) => (value.trim() ? null : "Isi email yang kamu pakai saat mendaftar."),
    password: (value) => (value ? null : "Isi kata sandimu."),
  };
  const checkField = (name, value) => setFieldErrors((prev) => ({ ...prev, [name]: validators[name](value) }));

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    const errors = { email: validators.email(email), password: validators.password(password) };
    setFieldErrors(errors);
    if (errors.email || errors.password) return;
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
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <Banner tone="danger" role="alert">
          {error}
        </Banner>
      )}

      <Field
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        onBlur={() => checkField("email", email)}
        autoComplete="email"
        error={fieldErrors.email}
      />
      <PasswordField
        id="password"
        label="Kata sandi"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        onBlur={() => checkField("password", password)}
        autoComplete="current-password"
        error={fieldErrors.password}
      />

      <button type="submit" disabled={busy} className={`${btn("primary", "l")} w-full`}>
        {busy ? "Memeriksa…" : "Masuk"}
      </button>

      <p className="text-center text-sm text-tinta-500">
        Belum punya akun?{" "}
        <Link href={`/daftar?next=${encodeURIComponent(next)}`} className="font-semibold text-sprout-700 hover:underline">
          Daftar
        </Link>
      </p>
    </form>
  );
}

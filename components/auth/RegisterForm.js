"use client";
// components/auth/RegisterForm.js
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

/** Kekuatan kata sandi 0–4: panjang, huruf besar+kecil, angka, simbol. */
function passwordStrength(value) {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 6) score += 1;
  if (value.length >= 10) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score += 1;
  return score;
}

const STRENGTH = [
  { label: "", bar: "bg-tinta-100" },
  { label: "Lemah", bar: "bg-danger-fg" },
  { label: "Cukup", bar: "bg-warn-fg" },
  { label: "Baik", bar: "bg-sprout-500" },
  { label: "Kuat", bar: "bg-sprout-600" },
];

function StrengthMeter({ value }) {
  const score = passwordStrength(value);
  if (!value) return null;
  return (
    <div className="-mt-2" aria-live="polite">
      <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
        {[1, 2, 3, 4].map((step) => (
          <span key={step} className={`h-1.5 rounded-full ${step <= score ? STRENGTH[score].bar : "bg-tinta-100"}`} />
        ))}
      </div>
      <p className="mt-1 text-xs font-medium text-tinta-500">Kekuatan kata sandi: {STRENGTH[score].label}</p>
    </div>
  );
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState(null);

  useEffect(() => {
    if (!loading && user && !confirmationEmail) router.replace(next);
  }, [loading, user, next, router, confirmationEmail]);

  const validators = {
    fullName: (value) => (value.trim() ? null : "Isi nama lengkapmu."),
    email: (value) => (value.trim() ? null : "Isi alamat email."),
    password: (value) => (value.length >= 6 ? null : "Kata sandi minimal 6 karakter. Tambahkan beberapa karakter lagi."),
    confirm: (value) => (value === password ? null : "Konfirmasi belum sama dengan kata sandi di atas."),
  };
  const checkField = (name, value) => setFieldErrors((prev) => ({ ...prev, [name]: validators[name](value) }));

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    const errors = {
      fullName: validators.fullName(fullName),
      email: validators.email(email),
      password: validators.password(password),
      confirm: validators.confirm(confirm),
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

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
      <div role="status" className="space-y-4">
        <Banner tone="success">
          <p className="font-semibold">Cek email konfirmasi</p>
          <p className="mt-1">
            Kami mengirim tautan konfirmasi ke <span className="font-semibold">{confirmationEmail}</span>. Buka tautan
            itu lebih dulu, lalu masuk.
          </p>
        </Banner>
        <Link href="/masuk" className={`${btn("primary", "l")} w-full`}>
          Ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <Banner tone="danger" role="alert">
          {error}
        </Banner>
      )}

      <Field
        id="nama"
        label="Nama lengkap"
        type="text"
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
        onBlur={() => checkField("fullName", fullName)}
        autoComplete="name"
        error={fieldErrors.fullName}
      />
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
        autoComplete="new-password"
        error={fieldErrors.password}
        hint="Minimal 6 karakter."
      />
      <StrengthMeter value={password} />
      <PasswordField
        id="konfirmasi"
        label="Ulangi kata sandi"
        value={confirm}
        onChange={(event) => setConfirm(event.target.value)}
        onBlur={() => checkField("confirm", confirm)}
        autoComplete="new-password"
        error={fieldErrors.confirm}
      />

      <button type="submit" disabled={busy} className={`${btn("primary", "l")} w-full`}>
        {busy ? "Mendaftar…" : "Buat akun"}
      </button>

      <p className="text-xs font-medium leading-4 text-tinta-500">
        Akun baru otomatis berperan siswa. Instruktur dan admin dinaikkan perannya oleh admin.
      </p>
      <p className="text-center text-sm text-tinta-500">
        Sudah punya akun?{" "}
        <Link href={`/masuk?next=${encodeURIComponent(next)}`} className="font-semibold text-sprout-700 hover:underline">
          Masuk
        </Link>
      </p>
    </form>
  );
}

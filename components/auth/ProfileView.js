"use client";
// components/auth/ProfileView.js — profil akun: identitas, peran, dan ubah nama tampilan.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { LogoutIcon } from "@/components/icons";
import { AuthPrompt, Banner, Loading, PageHeader, Pill, SupabaseNotice, Toast, btn } from "@/components/lms/ui";
import { useToast } from "@/components/lms/useToast";
import Field from "./Field";

const ROLE_LABEL = { student: "Siswa", instructor: "Instruktur", admin: "Admin" };

function initials(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export default function ProfileView() {
  const { enabled, loading, user, profile, role, displayName, updateDisplayName, signOut } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [fieldError, setFieldError] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Isi form setelah profil terbaca.
  useEffect(() => {
    setName(profile?.full_name ?? "");
  }, [profile?.full_name]);

  if (!enabled) {
    return (
      <>
        <PageHeader title="Profil" description="Kelola nama tampilan dan lihat peran akunmu." />
        <SupabaseNotice />
      </>
    );
  }
  if (loading) return <Loading label="Memeriksa sesi…" />;
  if (!user) return <AuthPrompt next="/profil" message="Masuk untuk melihat dan mengubah profilmu." />;

  const trimmed = name.trim();
  const changed = trimmed !== (profile?.full_name ?? "");

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    if (!trimmed) {
      setFieldError("Nama tampilan tidak boleh kosong. Isi nama lengkapmu.");
      return;
    }
    setFieldError(null);
    setSaving(true);
    const result = await updateDisplayName(trimmed);
    setSaving(false);
    if (result.error) {
      setError(`Perubahan gagal disimpan: ${result.error}`);
      return;
    }
    toast.show("Perubahan disimpan");
  }

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <div className="pb-4">
      <Toast message={toast.message} onClose={toast.close} />
      <PageHeader title="Profil" description="Kelola nama tampilan dan lihat peran akunmu." />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <form onSubmit={handleSubmit} noValidate className="rounded-3xl border border-tinta-100 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-semibold leading-7">Data akun</h2>

          <div className="mt-6 space-y-5">
            {error && (
              <Banner tone="danger" role="alert">
                {error}
              </Banner>
            )}
            <Field
              id="nama-tampilan"
              label="Nama lengkap"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onBlur={() => setFieldError(trimmed ? null : "Nama tampilan tidak boleh kosong. Isi nama lengkapmu.")}
              autoComplete="name"
              error={fieldError}
              hint="Nama ini tampil di sapaan dasbor dan menu akun."
            />
            <Field
              id="email-akun"
              label="Email"
              type="email"
              value={user.email ?? ""}
              readOnly
              disabled
              hint="Email dipakai untuk masuk dan belum bisa diubah dari sini."
            />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button type="submit" disabled={saving || !changed} className={btn("primary", "l")}>
              {saving ? "Menyimpan…" : "Simpan perubahan"}
            </button>
            {changed && !saving && (
              <button
                type="button"
                onClick={() => {
                  setName(profile?.full_name ?? "");
                  setFieldError(null);
                }}
                className={btn("ghost", "l")}
              >
                Batal
              </button>
            )}
          </div>
        </form>

        <aside className="space-y-6">
          <section aria-label="Ringkasan akun" className="rounded-3xl border border-tinta-100 bg-white p-6">
            <div className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className="grid size-16 shrink-0 place-items-center rounded-full bg-sprout-100 text-xl font-semibold text-sprout-800"
              >
                {initials(displayName)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold leading-6">{displayName}</p>
                <p className="truncate text-xs font-medium text-tinta-500">{user.email}</p>
                <div className="mt-2">
                  <Pill tone={role && role !== "student" ? "role" : "neutral"}>{ROLE_LABEL[role] ?? "Siswa"}</Pill>
                </div>
              </div>
            </div>
            <p className="mt-5 border-t border-tinta-100 pt-4 text-xs font-medium leading-4 text-tinta-500">
              Peran instruktur dan admin diberikan oleh admin. Akun baru otomatis berperan siswa.
            </p>
          </section>

          <section className="rounded-3xl border border-tinta-100 bg-white p-6">
            <h2 className="text-base font-semibold leading-6">Pintasan</h2>
            <div className="mt-4 flex flex-col gap-2">
              <Link href="/dasbor" className={btn("secondary", "m")}>
                Buka dasbor
              </Link>
              <button type="button" onClick={handleSignOut} className={`${btn("ghost", "m")} !text-danger-fg hover:!bg-danger-bg`}>
                <LogoutIcon size={20} /> Keluar
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

"use client";
// components/admin/UserManager.js — "Pengguna & peran" (UIUX_GUIDELINE §15, FR-25/26):
// pencarian nama atau email, filter peran, dan ubah peran lewat select + modal konfirmasi.
import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { ROLES, ROLE_LABEL, listProfiles, updateUserRole } from "@/lib/admin";
import { SearchIcon, UsersIcon } from "@/components/icons";
import { EmptyNote, ErrorNote, Loading, PageHeader, Pill, Toast, btn, inputClass } from "@/components/lms/ui";
import { useToast } from "@/components/lms/useToast";
import ConfirmModal from "@/components/instructor/ConfirmModal";
import { useLoad } from "@/components/instructor/useLoad";

const dateFormat = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });
const PAGE_SIZE = 20;

const IMPACT = {
  student: "Akun kehilangan akses ke Area Instruktur. Kursus yang sudah dibuat tetap tercatat atas namanya.",
  instructor: "Akun bisa membuat dan menerbitkan kursus serta melihat progres siswa.",
  admin: "Akun bisa mengelola semua pengguna, peran, dan kursus.",
};

export default function UserManager() {
  const { user } = useAuth();
  const toast = useToast();
  const { data, status, error, reload } = useLoad(listProfiles, []);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState(null); // { profile, role }
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);

  const counts = useMemo(() => {
    const result = { student: 0, instructor: 0, admin: 0 };
    (data ?? []).forEach((profile) => {
      result[profile.role] = (result[profile.role] ?? 0) + 1;
    });
    return result;
  }, [data]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (data ?? []).filter((profile) => {
      if (roleFilter && profile.role !== roleFilter) return false;
      return !needle || profile.full_name.toLowerCase().includes(needle) || (profile.email ?? "").toLowerCase().includes(needle);
    });
  }, [data, query, roleFilter]);

  if (status === "loading") return <Loading label="Memuat pengguna…" />;
  if (status === "error") {
    return (
      <div className="py-8">
        <ErrorNote onRetry={reload}>Daftar pengguna gagal dimuat: {error}. Periksa koneksi lalu coba lagi.</ErrorNote>
      </div>
    );
  }

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  async function confirmChange() {
    setBusy(true);
    setActionError(null);
    try {
      await updateUserRole(pending.profile.id, pending.role);
      toast.show("Peran diperbarui");
      setPending(null);
      reload();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <Toast message={toast.message} onClose={toast.close} />
      <PageHeader title="Pengguna & peran" description="Cari pengguna dan atur perannya. Akun baru selalu berperan siswa sampai kamu menaikkannya." />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        {ROLES.map((role) => (
          <Pill key={role} tone={role === "student" ? "neutral" : "role"}>
            {ROLE_LABEL[role]}: {counts[role]}
          </Pill>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative w-full sm:w-80">
          <label htmlFor="cari-pengguna" className="sr-only">Cari pengguna</label>
          <SearchIcon size={20} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tinta-400" />
          <input id="cari-pengguna" type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Cari nama atau email" className={`${inputClass} pl-10`} />
        </div>
        <div role="group" aria-label="Filter peran" className="inline-flex max-w-full overflow-x-auto rounded-xl bg-tinta-100 p-1">
          {[["", "Semua"], ...ROLES.map((role) => [role, ROLE_LABEL[role]])].map(([value, label]) => (
            <button
              key={value || "semua"}
              type="button"
              aria-pressed={roleFilter === value}
              onClick={() => { setRoleFilter(value); setPage(1); }}
              className={`h-9 rounded-lg px-4 text-sm font-semibold transition-colors duration-[120ms] ${roleFilter === value ? "bg-white text-tinta-900 shadow-e1" : "text-tinta-500 hover:text-tinta-900"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-sm font-medium text-tinta-500 sm:ml-auto" aria-live="polite">{filtered.length} pengguna</p>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-tinta-200 bg-white px-6 py-10 text-center">
          <p className="text-sm text-tinta-500">{(data ?? []).length === 0 ? "Belum ada pengguna terdaftar." : "Tidak ada pengguna yang cocok dengan pencarian atau filter ini."}</p>
          {(query || roleFilter) && (
            <button type="button" onClick={() => { setQuery(""); setRoleFilter(""); }} className={btn("secondary", "s")}>Tampilkan semua</button>
          )}
        </div>
      ) : (
        <>
          <div className="relative overflow-x-auto rounded-3xl border border-tinta-100 bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-tinta-50 text-xs font-semibold uppercase tracking-[0.06em] text-tinta-500">
                <tr>
                  <th scope="col" className="px-5 py-3">Nama</th>
                  <th scope="col" className="px-5 py-3">Email</th>
                  <th scope="col" className="px-5 py-3">Peran</th>
                  <th scope="col" className="px-5 py-3">Bergabung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tinta-100">
                {rows.map((profile) => {
                  const self = profile.id === user?.id;
                  return (
                    <tr key={profile.id} className="h-[52px] hover:bg-sprout-50">
                      <td className="px-5 py-3 font-semibold">
                        {profile.full_name || <span className="font-normal text-tinta-400">Tanpa nama</span>}
                        {self && <span className="ml-2 align-middle"><Pill tone="neutral">Kamu</Pill></span>}
                      </td>
                      <td className="px-5 py-3 text-tinta-600">{profile.email ?? <span className="text-tinta-400">Tidak tercatat</span>}</td>
                      <td className="px-5 py-3">
                        <label htmlFor={`peran-${profile.id}`} className="sr-only">Peran {profile.full_name || profile.email}</label>
                        <select
                          id={`peran-${profile.id}`}
                          value={profile.role}
                          disabled={self}
                          title={self ? "Kamu tidak bisa mengubah perannya sendiri" : undefined}
                          onChange={(event) => { setActionError(null); setPending({ profile, role: event.target.value }); }}
                          className={`${inputClass} h-10 !w-40`}
                        >
                          {ROLES.map((role) => (
                            <option key={role} value={role}>{ROLE_LABEL[role]}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3 text-tinta-500">{dateFormat.format(new Date(profile.created_at))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pageCount > 1 && (
            <nav aria-label="Halaman" className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
                <button
                  key={number}
                  type="button"
                  aria-current={number === current ? "page" : undefined}
                  onClick={() => setPage(number)}
                  className={`size-9 rounded-xl text-sm font-semibold tabular ${number === current ? "bg-tinta-900 text-white" : "border border-tinta-200 bg-white hover:bg-tinta-50"}`}
                >
                  {number}
                </button>
              ))}
            </nav>
          )}
        </>
      )}

      <ConfirmModal
        open={Boolean(pending)}
        busy={busy}
        danger={pending?.role === "admin" || pending?.profile.role === "admin"}
        title={pending ? `Ubah peran ${pending.profile.full_name || pending.profile.email} menjadi ${ROLE_LABEL[pending.role]}?` : ""}
        description={pending ? `${IMPACT[pending.role]}${actionError ? ` Gagal: ${actionError}` : ""}` : ""}
        confirmLabel="Ubah peran"
        onCancel={() => { setPending(null); setActionError(null); }}
        onConfirm={confirmChange}
      />
    </div>
  );
}

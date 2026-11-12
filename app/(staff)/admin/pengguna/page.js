// app/(staff)/admin/pengguna/page.js — kelola pengguna dan peran (khusus admin)
import RequireRole from "@/components/auth/RequireRole";
import UserManager from "@/components/admin/UserManager";

export const metadata = { title: "Pengguna & peran | Admin | Akademi Kamera" };

export default function PenggunaPage() {
  return (
    <RequireRole roles={["admin"]} nextPath="/admin/pengguna" message="Halaman ini khusus admin. Peran admin diberikan oleh admin lain atau lewat SQL Editor Supabase.">
      <UserManager />
    </RequireRole>
  );
}

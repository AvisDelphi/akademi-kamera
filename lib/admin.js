// lib/admin.js
// Data access for the admin area. RLS ("read own profile", "admin manages profiles") decides what
// is allowed, so a non-admin calling these functions simply gets nothing or an error.
import { supabase } from "./supabase.js";

const CONFIG_ERROR = "Supabase belum dikonfigurasi. Ikuti langkah pada README untuk mengaktifkan LMS.";
export const ROLES = ["student", "instructor", "admin"];
export const ROLE_LABEL = { student: "Siswa", instructor: "Instruktur", admin: "Admin" };

function client() {
  if (!supabase) throw new Error(CONFIG_ERROR);
  return supabase;
}

export async function listProfiles() {
  const { data, error } = await client()
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function updateUserRole(userId, role) {
  if (!ROLES.includes(role)) throw new Error("Peran tidak valid.");
  const { data, error } = await client().from("profiles").update({ role }).eq("id", userId).select("id").maybeSingle();
  if (error) throw new Error(error.message);
  // RLS hides rows the caller may not change, which shows up as "no row updated".
  if (!data) throw new Error("Perubahan ditolak. Hanya admin yang boleh mengubah peran.");
}

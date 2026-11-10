"use client";
// lib/auth.js
// Session and profile state for the whole app. Supabase Auth stores the session in
// the browser, so the LMS pages are client components too. When Supabase is not
// configured, `enabled` is false and the UI shows setup instructions instead.
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseEnabled } from "./supabase.js";

const AuthContext = createContext(null);

const AUTH_ERRORS = [
  ["Invalid login credentials", "Email atau kata sandi salah."],
  ["Email not confirmed", "Email belum dikonfirmasi. Buka tautan konfirmasi di kotak masukmu."],
  ["User already registered", "Email sudah terdaftar. Coba masuk."],
  ["Password should be at least 6 characters", "Kata sandi minimal 6 karakter."],
  ["Unable to validate email address", "Format email tidak valid."],
  ["Email rate limit exceeded", "Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi."],
  ["For security purposes", "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi."],
  ["Signups not allowed", "Pendaftaran akun baru sedang dinonaktifkan di proyek Supabase ini."],
];

/** Turn Supabase's English auth errors into short Indonesian messages. */
export function translateAuthError(message) {
  if (!message) return null;
  const match = AUTH_ERRORS.find(([needle]) => message.toLowerCase().includes(needle.toLowerCase()));
  return match ? match[1] : message;
}

const CONFIG_ERROR = "Supabase belum dikonfigurasi. Ikuti langkah pada README untuk mengaktifkan LMS.";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(isSupabaseEnabled);

  // Keep the session in sync with Supabase (login, logout, token refresh, other tabs).
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session ?? null);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setLoading(false);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const userId = session?.user?.id ?? null;

  // The database trigger creates the profile row on sign-up; read it once per user.
  useEffect(() => {
    if (!supabase || !userId) {
      setProfile(null);
      return;
    }
    let active = true;
    supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setProfile(data ?? null);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const value = useMemo(() => {
    const email = session?.user?.email ?? "";
    return {
      enabled: isSupabaseEnabled,
      loading,
      user: session?.user ?? null,
      profile,
      role: profile?.role ?? null,
      displayName: profile?.full_name || email.split("@")[0] || "",

      async signIn(emailAddress, password) {
        if (!supabase) return { error: CONFIG_ERROR };
        const { error } = await supabase.auth.signInWithPassword({ email: emailAddress, password });
        return { error: translateAuthError(error?.message) };
      },

      async signUp({ email: emailAddress, password, fullName }) {
        if (!supabase) return { error: CONFIG_ERROR };
        const { data, error } = await supabase.auth.signUp({
          email: emailAddress,
          password,
          options: { data: { full_name: fullName } },
        });
        return {
          error: translateAuthError(error?.message),
          // Supabase returns no session when the project requires email confirmation.
          needsConfirmation: Boolean(!error && !data.session),
        };
      },

      async signOut() {
        if (supabase) await supabase.auth.signOut();
      },

      async refreshProfile() {
        if (!supabase || !userId) return null;
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name, role")
          .eq("id", userId)
          .maybeSingle();
        setProfile(data ?? null);
        return data ?? null;
      },
    };
  }, [session, profile, loading, userId]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth harus dipakai di dalam AuthProvider.");
  return context;
}

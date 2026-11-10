// lib/supabase.js
// Optional Supabase client. The prototype works WITHOUT Supabase: if the two
// environment variables are empty, `supabase` is null and data stays in the browser.
// Only the public "anon" key is used here; Row Level Security in
// supabase/schema.sql decides what each logged-in user may read or write.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
export const isSupabaseEnabled = Boolean(supabase);

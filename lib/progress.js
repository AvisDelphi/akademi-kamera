// lib/progress.js
// Repository for exercise results and photo analyses.
// Strategy: if Supabase is configured AND a user is logged in, save to the database;
// otherwise keep a copy in localStorage so the prototype is usable without an account.
// The UI only talks to these functions, so swapping storage later does not touch components.
import { supabase } from "./supabase.js";

const KEY = "akademi-kamera:exercise-results";

function readLocal() {
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writeLocal(data) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Storage full or blocked (private mode): progress simply is not remembered.
  }
}

async function currentUserId() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data?.user?.id ?? null;
}

/** Map of exerciseId -> { passed, at } for showing ticks in the exercise list. */
export function loadLocalResults() {
  if (typeof window === "undefined") return {};
  return readLocal();
}

export async function saveExerciseResult({ exerciseId, settings, metrics, passed }) {
  const local = readLocal();
  const previous = local[exerciseId];
  local[exerciseId] = { passed: passed || Boolean(previous?.passed), at: new Date().toISOString() };
  writeLocal(local);

  const userId = await currentUserId();
  if (!userId) return { stored: "local" };

  const { error } = await supabase.from("exercise_attempts").insert({
    user_id: userId,
    exercise_id: exerciseId,
    settings,
    metrics,
    passed,
  });
  return error ? { stored: "local", error: error.message } : { stored: "database" };
}

export async function savePhotoAnalysis({ exif, imageMetrics, firedRuleIds }) {
  const userId = await currentUserId();
  if (!userId) return { stored: "none" };
  // Only metadata and numbers are stored, never the photo itself.
  const { error } = await supabase.from("photo_analyses").insert({
    user_id: userId,
    exif,
    image_metrics: imageMetrics,
    fired_rules: firedRuleIds,
  });
  return error ? { stored: "none", error: error.message } : { stored: "database" };
}

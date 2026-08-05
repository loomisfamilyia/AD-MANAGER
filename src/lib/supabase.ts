import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(url && anonKey);

if (!isConfigured) {
  // Fail loudly in dev rather than silently rendering an empty dashboard that
  // looks like "no ad spend yet".
  console.error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill them in."
  );
}

export const supabase = createClient(url ?? "", anonKey ?? "");

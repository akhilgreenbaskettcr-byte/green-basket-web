import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ntrzjndirogtbpzugxmu.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_siaC0gN3kNgDNgi6kYWekg_1Sxd8TQa";

export const createClient = () =>
  createBrowserClient(supabaseUrl, supabaseKey);

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lbugditshniyphdzgjad.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_mVDJmsOrdpjAtIC93mp5pg_4IItOwQt";

export const supabase =
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("your-project")
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Server-only Supabase client with service_role key (bypasses RLS)
// Do NOT use this on the client side!
export const supabaseAdmin =
  supabaseUrl && serviceRoleKey && !supabaseUrl.includes("your-project")
    ? createClient(supabaseUrl, serviceRoleKey)
    : null;
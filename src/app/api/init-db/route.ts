import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const PROJECT_REF = "lbugditshniyphdzgjad";

const CREATE_TABLES_SQL = `CREATE TABLE IF NOT EXISTS bot_registrations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT,
  name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  email TEXT,
  bot_type TEXT DEFAULT 'customer-service',
  description TEXT,
  status TEXT DEFAULT 'pending',
  webhook_url TEXT,
  welcome_message TEXT,
  auto_reply TEXT,
  operating_hours TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  bot_id TEXT NOT NULL REFERENCES bot_registrations(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  detail TEXT,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT ALL ON bot_registrations TO anon, authenticated, service_role;
GRANT ALL ON audit_logs TO anon, authenticated, service_role;`;

export async function GET() {
  // Check if tables already exist via REST API
  if (supabaseAdmin) {
    const { error } = await supabaseAdmin
      .from("bot_registrations")
      .select("id")
      .limit(1);
    if (!error) {
      return NextResponse.json({ success: true, message: "Tables already exist!" });
    }
  }

  // Try Management API with access token
  const mgmtToken = process.env.SUPABASE_MANAGEMENT_TOKEN;
  if (mgmtToken) {
    try {
      const res = await fetch(
        `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${mgmtToken}`,
          },
          body: JSON.stringify({ query: CREATE_TABLES_SQL }),
          signal: AbortSignal.timeout(15000),
        }
      );
      if (res.ok) {
        return NextResponse.json({ success: true, message: "Database initialized!" });
      }
    } catch {
      // Fall through
    }
  }

  return NextResponse.json(
    {
      success: false,
      error: "Tables not found. Set SUPABASE_MANAGEMENT_TOKEN env var or create tables manually.",
    },
    { status: 500 }
  );
}
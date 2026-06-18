import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const PROJECT_REF = "lbugditshniyphdzgjad";

// SQL to create all tables
const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS bot_registrations (
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

ALTER TABLE bot_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on bot_registrations" ON bot_registrations
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on audit_logs" ON audit_logs
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_bot_regs_user_id ON bot_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_regs_status ON bot_registrations(status);
CREATE INDEX IF NOT EXISTS idx_bot_regs_created_at ON bot_registrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_bot_id ON audit_logs(bot_id);

GRANT ALL ON bot_registrations TO anon, authenticated, service_role;
GRANT ALL ON audit_logs TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
`;

export async function GET() {
  // Method 1: Try using Supabase Management API with service_role key
  const managementResults: { method: string; success: boolean; error?: string }[] = [];

  // Try Supabase Management API (SQL execution endpoint)
  try {
    const mgmtRes = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ query: CREATE_TABLES_SQL }),
        signal: AbortSignal.timeout(15000),
      }
    );
    const mgmtData = await mgmtRes.json();
    if (mgmtRes.ok) {
      managementResults.push({ method: "management-api", success: true });
    } else {
      managementResults.push({
        method: "management-api",
        success: false,
        error: mgmtData.message || mgmtData.error || JSON.stringify(mgmtData),
      });
    }
  } catch (e) {
    managementResults.push({
      method: "management-api",
      success: false,
      error: e instanceof Error ? e.message : String(e),
    });
  }

  // Method 2: Try using pg module (direct TCP)
  let pgResult: { method: string; success: boolean; error?: string } = {
    method: "pg-direct",
    success: false,
  };

  try {
    const pg = (await import("pg")).default;
    const pw = encodeURIComponent(process.env.SUPABASE_DB_PASSWORD || "");

    const connectionStrings = [
      `postgresql://postgres:${pw}@db.${PROJECT_REF}.supabase.co:5432/postgres`,
      `postgresql://postgres.${PROJECT_REF}:${pw}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`,
      `postgresql://postgres.${PROJECT_REF}:${pw}@aws-0-ap-east-1.pooler.supabase.com:6543/postgres`,
      `postgresql://postgres.${PROJECT_REF}:${pw}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
      `postgresql://postgres.${PROJECT_REF}:${pw}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`,
    ];

    let client = null;
    for (const cs of connectionStrings) {
      try {
        const c = new pg.Client({
          connectionString: cs,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 8000,
        });
        await c.connect();
        client = c;
        pgResult = { method: "pg-direct", success: true };
        break;
      } catch (connErr) {
        pgResult.error = connErr instanceof Error ? connErr.message : String(connErr);
      }
    }

    if (client) {
      try {
        await client.query(CREATE_TABLES_SQL);
        pgResult.success = true;
        delete pgResult.error;
      } catch (qErr) {
        pgResult.success = false;
        pgResult.error = qErr instanceof Error ? qErr.message : String(qErr);
      } finally {
        await client.end();
      }
    }
  } catch (e) {
    pgResult.error = e instanceof Error ? e.message : String(e);
  }

  managementResults.push(pgResult);

  // Check if any method succeeded
  const anySuccess = managementResults.some((r) => r.success);

  // Verify tables exist via REST API
  let tablesExist = false;
  if (supabaseAdmin) {
    const { error } = await supabaseAdmin
      .from("bot_registrations")
      .select("id")
      .limit(1);
    tablesExist = !error;
  }

  if (anySuccess || tablesExist) {
    return NextResponse.json({
      success: true,
      message: tablesExist ? "Tables already exist!" : "Database initialized!",
      tablesExist,
      methods: managementResults,
    });
  }

  return NextResponse.json(
    {
      success: false,
      error: "All connection methods failed",
      methods: managementResults,
      sql: CREATE_TABLES_SQL,
      sqlEditorUrl: `https://supabase.com/dashboard/project/${PROJECT_REF}/sql`,
      hint: "Open the SQL Editor URL above, paste the SQL below, and click Run",
    },
    { status: 500 }
  );
}
import { NextResponse } from "next/server";
import pg from "pg";

const PROJECT_REF = "lbugditshniyphdzgjad";
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || "";

// Multiple connection string formats to try
function getConnectionStrings(): string[] {
  const pw = encodeURIComponent(DB_PASSWORD);
  return [
    // Direct connection (IPv6 - works on Vercel)
    `postgresql://postgres:${pw}@db.${PROJECT_REF}.supabase.co:5432/postgres`,
    // Transaction pooler - various regions
    `postgresql://postgres.${PROJECT_REF}:${pw}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${PROJECT_REF}:${pw}@aws-0-ap-east-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${PROJECT_REF}:${pw}@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${PROJECT_REF}:${pw}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${PROJECT_REF}:${pw}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${PROJECT_REF}:${pw}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`,
    // Session pooler fallback
    `postgresql://postgres.${PROJECT_REF}:${pw}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`,
  ];
}

const CREATE_TABLES_SQL = `
-- Create bot_registrations table
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

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  bot_id TEXT NOT NULL REFERENCES bot_registrations(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  detail TEXT,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE bot_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow all operations for authenticated users via service_role
-- Since we use service_role key on the server, these policies allow anon read
-- and service_role full access

-- Allow anyone to read bot registrations (for public listing)
CREATE POLICY "Public read access on bot_registrations"
  ON bot_registrations FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow service_role full access on bot_registrations
CREATE POLICY "Service role full access on bot_registrations"
  ON bot_registrations FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow anyone to read audit logs
CREATE POLICY "Public read access on audit_logs"
  ON audit_logs FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow service_role full access on audit_logs
CREATE POLICY "Service role full access on audit_logs"
  ON audit_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_bot_registrations_user_id ON bot_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_registrations_status ON bot_registrations(status);
CREATE INDEX IF NOT EXISTS idx_bot_registrations_created_at ON bot_registrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_bot_id ON audit_logs(bot_id);

-- Grant permissions
GRANT ALL ON bot_registrations TO anon, authenticated, service_role;
GRANT ALL ON audit_logs TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
`;

async function tryConnect(connectionString: string): Promise<pg.Client | null> {
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
    statement_timeout: 30000,
  });
  try {
    await client.connect();
    return client;
  } catch {
    try { client.end(); } catch { /* ignore */ }
    return null;
  }
}

export async function GET() {
  if (!DB_PASSWORD) {
    return NextResponse.json(
      { error: "SUPABASE_DB_PASSWORD not set" },
      { status: 500 }
    );
  }

  const connectionStrings = getConnectionStrings();
  let client: pg.Client | null = null;
  let usedIndex = -1;

  // Try each connection string
  for (let i = 0; i < connectionStrings.length; i++) {
    client = await tryConnect(connectionStrings[i]);
    if (client) {
      usedIndex = i;
      break;
    }
  }

  if (!client) {
    return NextResponse.json(
      {
        error: "Could not connect to Supabase PostgreSQL",
        tried: connectionStrings.length,
        hint: "Check project region and database password in Supabase Dashboard > Settings > Database",
      },
      { status: 500 }
    );
  }

  try {
    // Execute the SQL
    await client.query(CREATE_TABLES_SQL);

    // Verify tables were created
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name IN ('bot_registrations', 'audit_logs')
      ORDER BY table_name
    `);

    // Verify RLS policies
    const policies = await client.query(`
      SELECT schemaname, tablename, policyname
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename IN ('bot_registrations', 'audit_logs')
      ORDER BY tablename, policyname
    `);

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully!",
      connectionIndex: usedIndex,
      tables: tables.rows.map((r) => r.table_name),
      policies: policies.rows.map((r) => `${r.tablename}.${r.policyname}`),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to create tables", detail: msg, connectionIndex: usedIndex },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}
import { NextResponse } from "next/server";

const SQL = `CREATE TABLE IF NOT EXISTS bot_registrations (
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
  return new NextResponse(SQL, {
    headers: {
      "Content-Type": "application/sql",
      "Content-Disposition": 'attachment; filename="setup-wabot-hub.sql"',
    },
  });
}
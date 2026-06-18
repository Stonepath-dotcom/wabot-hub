import pg from "pg";

const password = "BT7C7h?GvKq6J+2";
const encoded = encodeURIComponent(password);
const ref = "lbugditsdniyphdzgjad";

const regions = [
  "ap-southeast-1", "ap-southeast-2", "ap-northeast-1", "ap-northeast-2",
  "ap-south-1", "us-east-1", "us-west-1", "us-west-2",
  "eu-west-1", "eu-west-2", "eu-central-1", "sa-east-1",
];

async function tryConnect(region: string) {
  const connStr = `postgresql://postgres.${ref}:${encoded}@aws-0-${region}.pooler.supabase.com:6543/postgres`;
  const client = new pg.Client({ connectionString: connStr, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    console.log(`✅ CONNECTED! Region: ${region}`);
    
    await client.query(`
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
    `);
    console.log("✅ bot_registrations OK");

    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        bot_id TEXT NOT NULL REFERENCES bot_registrations(id) ON DELETE CASCADE,
        action TEXT NOT NULL,
        detail TEXT,
        user_id TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("✅ audit_logs OK");

    try { await client.query(`ALTER TABLE bot_registrations ENABLE ROW LEVEL SECURITY;`); } catch {}
    try { await client.query(`ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;`); } catch {}
    try { await client.query(`DROP POLICY IF EXISTS "allow_all" ON bot_registrations;`); } catch {}
    try { await client.query(`DROP POLICY IF EXISTS "allow_all" ON audit_logs;`); } catch {}
    await client.query(`CREATE POLICY "allow_all" ON bot_registrations FOR ALL USING (true) WITH CHECK (true);`);
    await client.query(`CREATE POLICY "allow_all" ON audit_logs FOR ALL USING (true) WITH CHECK (true);`);
    console.log("✅ RLS + policies OK");

    const res = await client.query(`SELECT tablename FROM pg_tables WHERE schemaname='public';`);
    console.log("📋 Tables:", res.rows.map((r: any) => r.tablename));
    await client.end();
    return true;
  } catch (err: any) {
    const msg = err.message?.substring(0, 80);
    console.log(`❌ ${region}: ${msg}`);
    try { await client.end(); } catch {}
    return false;
  }
}

for (const region of regions) {
  console.log(`\n--- ${region} ---`);
  if (await tryConnect(region)) break;
}
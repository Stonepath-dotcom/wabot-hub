import pg from "pg";

const password = "BT7C7h?GvKq6J+2";
const encoded = encodeURIComponent(password);

const hosts = [
  `postgresql://postgres.lbugditsdniyphdzgjad:${encoded}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.lbugditsdniyphdzgjad:${encoded}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres:${encoded}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres:${encoded}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`,
];

async function tryConnect(connStr: string, label: string) {
  const client = new pg.Client({ connectionString: connStr, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 8000 });
  try {
    await client.connect();
    console.log(`✅ CONNECTED with: ${label}`);
    
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
    console.log("✅ Table bot_registrations created!");

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
    console.log("✅ Table audit_logs created!");

    try { await client.query(`ALTER TABLE bot_registrations ENABLE ROW LEVEL SECURITY;`); } catch {}
    try { await client.query(`ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;`); } catch {}
    console.log("✅ RLS enabled!");

    try { await client.query(`DROP POLICY IF EXISTS "allow_all" ON bot_registrations;`); } catch {}
    try { await client.query(`DROP POLICY IF EXISTS "allow_all" ON audit_logs;`); } catch {}
    await client.query(`CREATE POLICY "allow_all" ON bot_registrations FOR ALL USING (true) WITH CHECK (true);`);
    await client.query(`CREATE POLICY "allow_all" ON audit_logs FOR ALL USING (true) WITH CHECK (true);`);
    console.log("✅ Policies created!");

    const res = await client.query(`SELECT tablename FROM pg_tables WHERE schemaname = 'public';`);
    console.log("📋 Tables:", res.rows.map((r: { tablename: string }) => r.tablename));

    await client.end();
    return true;
  } catch (err: unknown) {
    const e = err as Error;
    console.log(`❌ ${label}: ${e.message}`);
    try { await client.end(); } catch {}
    return false;
  }
}

for (const [i, connStr] of hosts.entries()) {
  console.log(`\n--- Trying option ${i + 1} ---`);
  const ok = await tryConnect(connStr, `option ${i + 1}`);
  if (ok) break;
}
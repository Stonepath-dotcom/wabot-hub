-- ============================================
-- WaBot Hub - Database Setup
-- Paste ini di Supabase SQL Editor, lalu klik Run
-- ============================================

-- Tabel utama: bot_registrations
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

-- Tabel audit log
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  bot_id TEXT NOT NULL REFERENCES bot_registrations(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  detail TEXT,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aktifkan Row Level Security
ALTER TABLE bot_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: izinkan semua akses (karena server pakai service_role key)
CREATE POLICY "Allow all on bot_registrations" ON bot_registrations
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on audit_logs" ON audit_logs
  FOR ALL USING (true) WITH CHECK (true);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_bot_regs_user_id ON bot_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_regs_status ON bot_registrations(status);
CREATE INDEX IF NOT EXISTS idx_bot_regs_created_at ON bot_registrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_bot_id ON audit_logs(bot_id);

-- Grant permissions
GRANT ALL ON bot_registrations TO anon, authenticated, service_role;
GRANT ALL ON audit_logs TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
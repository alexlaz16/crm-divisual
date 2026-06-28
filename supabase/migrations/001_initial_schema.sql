-- ============================================================
-- Laguna CRM — Initial Schema
-- Run this in the Supabase SQL Editor or via CLI:
--   supabase db push
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── companies ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  industry    TEXT,
  website     TEXT,
  email       TEXT,
  phone       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── contacts ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  estado      TEXT DEFAULT 'lead' CHECK (estado IN ('lead', 'prospect', 'customer')),
  interes     TEXT,
  valor       NUMERIC DEFAULT 0,
  agente      TEXT,
  fuente      TEXT,
  recency     INTEGER DEFAULT 10,
  ultima      TEXT DEFAULT 'Nuevo',
  company_id  UUID REFERENCES companies(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── deals ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cliente     TEXT NOT NULL,
  propiedad   TEXT,
  valor       NUMERIC DEFAULT 0,
  etapa       TEXT DEFAULT 'Nuevo Lead',
  prob        INTEGER DEFAULT 0 CHECK (prob >= 0 AND prob <= 100),
  agente      TEXT,
  contact_id  UUID REFERENCES contacts(id) ON DELETE SET NULL,
  position    INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── activities ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_id  UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id     UUID REFERENCES deals(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  type        TEXT DEFAULT 'nota' CHECK (type IN ('nota','llamada','email','visita','propuesta','movimiento')),
  gold        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── RLS ────────────────────────────────────────────────────
ALTER TABLE companies  ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals      ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_companies"  ON companies  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_contacts"   ON contacts   FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_deals"      ON deals      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_activities" ON activities FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── updated_at trigger ────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_contacts_updated_at   BEFORE UPDATE ON contacts   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_companies_updated_at  BEFORE UPDATE ON companies  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_deals_updated_at      BEFORE UPDATE ON deals      FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Realtime ──────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE contacts, deals, activities, companies;

-- ── Seed sample data for demo (runs only if contacts is empty) ──
DO $$
BEGIN
  -- seed skipped in production; run manually if needed
END $$;

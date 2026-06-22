-- SaleTracker Supabase Schema
-- Run this in the Supabase SQL editor for project wbqzlxdyjdmbzifhsyil

-- ============================================
-- AUTHORIZED USERS
-- ============================================
CREATE TABLE IF NOT EXISTS authorized_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ADMIN EMAILS
-- ============================================
CREATE TABLE IF NOT EXISTS admin_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- NOTE TEMPLATES
-- ============================================
CREATE TABLE IF NOT EXISTS note_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- LOCATIONS (current state — one row per place)
-- ============================================
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_name TEXT NOT NULL,
  business_address TEXT NOT NULL,
  contact_person TEXT DEFAULT '',
  contact_title TEXT DEFAULT '',
  direct_phone TEXT DEFAULT '',
  direct_email TEXT DEFAULT '',
  business_types TEXT DEFAULT '',
  interest_level TEXT DEFAULT '',
  visit_notes TEXT DEFAULT '',
  timestamp TEXT DEFAULT '',
  follow_up_date TEXT DEFAULT '',
  sample_given TEXT DEFAULT '',
  sales_rep TEXT DEFAULT '',
  direct_link TEXT DEFAULT '',
  business_phone TEXT DEFAULT '',
  business_email TEXT DEFAULT '',
  business_website TEXT DEFAULT '',
  archived TEXT DEFAULT '',
  pipeline_stage TEXT DEFAULT 'new_visit',
  follow_up_count TEXT DEFAULT '0',
  last_follow_up_date TEXT DEFAULT '',
  next_action_date TEXT DEFAULT '',
  next_action_type TEXT DEFAULT '',
  automation_status TEXT DEFAULT '',
  materials_sent TEXT DEFAULT '',
  notes_internal TEXT DEFAULT '',
  language TEXT DEFAULT '',
  uses_microgreens BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(location_name, business_address)
);

-- ============================================
-- VISIT HISTORY (append-only log)
-- ============================================
CREATE TABLE IF NOT EXISTS visit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_name TEXT NOT NULL,
  business_address TEXT NOT NULL,
  contact_person TEXT DEFAULT '',
  contact_title TEXT DEFAULT '',
  direct_phone TEXT DEFAULT '',
  direct_email TEXT DEFAULT '',
  business_types TEXT DEFAULT '',
  interest_level TEXT DEFAULT '',
  visit_notes TEXT DEFAULT '',
  timestamp TEXT DEFAULT '',
  follow_up_date TEXT DEFAULT '',
  sample_given TEXT DEFAULT '',
  sales_rep TEXT DEFAULT '',
  direct_link TEXT DEFAULT '',
  business_phone TEXT DEFAULT '',
  business_email TEXT DEFAULT '',
  business_website TEXT DEFAULT '',
  archived TEXT DEFAULT '',
  pipeline_stage TEXT DEFAULT '',
  follow_up_count TEXT DEFAULT '0',
  last_follow_up_date TEXT DEFAULT '',
  next_action_date TEXT DEFAULT '',
  next_action_type TEXT DEFAULT '',
  automation_status TEXT DEFAULT '',
  materials_sent TEXT DEFAULT '',
  notes_internal TEXT DEFAULT '',
  language TEXT DEFAULT '',
  uses_microgreens BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TO VISIT / PROSPECTS
-- ============================================
CREATE TABLE IF NOT EXISTS prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_name TEXT NOT NULL,
  business_address TEXT NOT NULL DEFAULT '',
  prospect_notes TEXT DEFAULT '',
  date_added TEXT DEFAULT '',
  lat FLOAT,
  lng FLOAT,
  uses_microgreens BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(location_name, business_address)
);

-- ============================================
-- AUTO-UPDATE updated_at on locations
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON locations;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- RLS POLICIES (enable row-level security)
-- ============================================
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorized_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_templates ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated anon key (app handles auth via Google OAuth)
CREATE POLICY "allow_all_locations" ON locations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_history" ON visit_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_prospects" ON prospects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authorized_users" ON authorized_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_admin_emails" ON admin_emails FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_note_templates" ON note_templates FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- SEED DEFAULT NOTE TEMPLATES
-- ============================================
INSERT INTO note_templates (template) VALUES
  ('Owner was not at the place, spoke with worker, got the owners email'),
  ('Not interested at all')
ON CONFLICT DO NOTHING;

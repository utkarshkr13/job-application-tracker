-- Job Application Tracker — Supabase Schema
CREATE TABLE IF NOT EXISTS applications (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  company       TEXT        NOT NULL,
  position      TEXT        NOT NULL,
  applied_date  DATE        NOT NULL DEFAULT CURRENT_DATE,
  status        TEXT        NOT NULL DEFAULT 'applied'
                            CHECK (status IN ('applied', 'confirmed', 'rejected', 'no_response')),
  source        TEXT        NOT NULL DEFAULT 'manual'
                            CHECK (source IN ('gmail', 'outlook', 'manual')),
  email_id      TEXT        UNIQUE,
  job_url       TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON applications;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_applications_status       ON applications (status);
CREATE INDEX IF NOT EXISTS idx_applications_source       ON applications (source);
CREATE INDEX IF NOT EXISTS idx_applications_applied_date ON applications (applied_date DESC);

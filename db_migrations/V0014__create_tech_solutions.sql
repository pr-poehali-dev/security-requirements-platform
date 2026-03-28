CREATE TABLE IF NOT EXISTS tech_solutions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'В разработке',
  author TEXT DEFAULT '',
  version TEXT DEFAULT '1.0.0',
  tags JSONB DEFAULT '[]',
  technology_ids JSONB DEFAULT '[]',
  tech_domain TEXT DEFAULT '',
  approved_ib BOOLEAN DEFAULT FALSE,
  approved_it BOOLEAN DEFAULT FALSE,
  related_solution_ids JSONB DEFAULT '[]',
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tech_solutions_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO tech_solutions_settings (key, value)
VALUES ('section_description', 'Реестр технических решений — архитектурные и проектные решения, согласованные с ИБ и ИТ')
ON CONFLICT (key) DO NOTHING;

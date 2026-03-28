
CREATE TABLE IF NOT EXISTS arch_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'В разработке',
  author TEXT NOT NULL DEFAULT '',
  version TEXT NOT NULL DEFAULT '1.0.0',
  tags TEXT[] NOT NULL DEFAULT '{}',
  tech_solution_ids TEXT[] NOT NULL DEFAULT '{}',
  approved_ib BOOLEAN NOT NULL DEFAULT FALSE,
  approved_it BOOLEAN NOT NULL DEFAULT FALSE,
  diagrams JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS arch_templates_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

INSERT INTO arch_templates_settings (key, value)
VALUES ('section_description', 'Реестр типовых архитектур безопасности — шаблоны для проектирования защищённых систем')
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'В разработке',
  author TEXT NOT NULL DEFAULT '',
  version TEXT NOT NULL DEFAULT '1.0.0',
  cmdb_mnemonic TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  arch_template_ids TEXT[] NOT NULL DEFAULT '{}',
  approved_ib BOOLEAN NOT NULL DEFAULT FALSE,
  approved_it BOOLEAN NOT NULL DEFAULT FALSE,
  image_url TEXT NOT NULL DEFAULT '',
  diagrams JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

INSERT INTO products_settings (key, value)
VALUES ('section_description', 'Реестр бизнес-продуктов — привязка к типовым архитектурам безопасности и требованиям')
ON CONFLICT (key) DO NOTHING;

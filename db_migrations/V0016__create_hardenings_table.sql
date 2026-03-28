CREATE TABLE IF NOT EXISTS t_p90536134_security_requirement.hardenings (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  tech_solution_id TEXT NOT NULL DEFAULT '',
  deploy_hardening TEXT NOT NULL DEFAULT '',
  functional_hardening TEXT NOT NULL DEFAULT '',
  status           TEXT NOT NULL DEFAULT 'В разработке',
  author           TEXT NOT NULL DEFAULT '',
  version          TEXT NOT NULL DEFAULT '1.0.0',
  tags             TEXT[] NOT NULL DEFAULT '{}',
  approved_ib      BOOLEAN NOT NULL DEFAULT FALSE,
  approved_it      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS t_p90536134_security_requirement.hardenings_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);
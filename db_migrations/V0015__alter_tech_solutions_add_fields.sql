ALTER TABLE t_p90536134_security_requirement.tech_solutions
  ADD COLUMN IF NOT EXISTS author TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS tech_domain TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS related_solution_ids JSONB NOT NULL DEFAULT '[]';

CREATE TABLE IF NOT EXISTS t_p90536134_security_requirement.tech_solutions_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO t_p90536134_security_requirement.tech_solutions_settings (key, value)
VALUES ('section_description', 'Реестр технических решений — архитектурные и проектные решения, согласованные с ИБ и ИТ')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE t_p90536134_security_requirement.org_domains
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

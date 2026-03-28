ALTER TABLE t_p90536134_security_requirement.tech_solutions
  ADD COLUMN IF NOT EXISTS approved_ib    boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS approved_it    boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tech_domain_ids text[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS attachments    jsonb   NOT NULL DEFAULT '[]';

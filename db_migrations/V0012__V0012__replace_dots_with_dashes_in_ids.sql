-- V0012: Replace dots with dashes in all IDs and references

-- 1. Update array references in tech_domains.org_domain_ids
UPDATE t_p90536134_security_requirement.tech_domains
SET org_domain_ids = ARRAY(
    SELECT REPLACE(unnest_val, '.', '-')
    FROM unnest(org_domain_ids) AS unnest_val
);

-- 2. Update org_domains PK
UPDATE t_p90536134_security_requirement.org_domains SET id = REPLACE(id, '.', '-');

-- 3. Update references in requirements.tech_domain_id
UPDATE t_p90536134_security_requirement.requirements SET tech_domain_id = REPLACE(tech_domain_id, '.', '-') WHERE tech_domain_id IS NOT NULL AND tech_domain_id != '';

-- 4. Update tech_domains PK
UPDATE t_p90536134_security_requirement.tech_domains SET id = REPLACE(id, '.', '-');

-- 5. Update references in requirements.technology_id
UPDATE t_p90536134_security_requirement.requirements SET technology_id = REPLACE(technology_id, '.', '-') WHERE technology_id IS NOT NULL AND technology_id != '';

-- 6. Update references in tech_solutions.technology_ids (array)
UPDATE t_p90536134_security_requirement.tech_solutions
SET technology_ids = ARRAY(
    SELECT REPLACE(unnest_val, '.', '-')
    FROM unnest(technology_ids) AS unnest_val
);

-- 7. Update references in tech_solutions.tech_domain_ids (array)
UPDATE t_p90536134_security_requirement.tech_solutions
SET tech_domain_ids = ARRAY(
    SELECT REPLACE(unnest_val, '.', '-')
    FROM unnest(tech_domain_ids) AS unnest_val
);

-- 8. Update technologies PK
UPDATE t_p90536134_security_requirement.technologies SET id = REPLACE(id, '.', '-');

-- 9. Update requirements PK
UPDATE t_p90536134_security_requirement.requirements SET id = REPLACE(id, '.', '-');

-- 10. Update tech_solutions PK
UPDATE t_p90536134_security_requirement.tech_solutions SET id = REPLACE(id, '.', '-');

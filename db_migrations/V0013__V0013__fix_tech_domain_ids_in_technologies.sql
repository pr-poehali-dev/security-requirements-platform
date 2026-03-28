-- V0013: Fix remaining dot-formatted IDs inside array fields of technologies table
-- Replace tech.dom.NNN → tech-dom-NNN inside tech_domain_ids array

UPDATE t_p90536134_security_requirement.technologies
SET tech_domain_ids = ARRAY(
    SELECT REPLACE(val, '.', '-')
    FROM unnest(tech_domain_ids) AS val
)
WHERE tech_domain_ids::text LIKE '%tech.dom.%';

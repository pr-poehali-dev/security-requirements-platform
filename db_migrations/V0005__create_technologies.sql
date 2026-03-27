CREATE TABLE IF NOT EXISTS t_p90536134_security_requirement.technologies (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'В разработке',
    description     TEXT NOT NULL DEFAULT '',
    versions        TEXT[] NOT NULL DEFAULT '{}',
    tech_domain_ids TEXT[] NOT NULL DEFAULT '{}',
    tags            TEXT[] NOT NULL DEFAULT '{}',
    attachments     JSONB NOT NULL DEFAULT '[]',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE t_p90536134_security_requirement.technologies IS 'Технологии ИБ: JWT, OAuth 2.0, шифрование, контейнеризация и т.д.';
COMMENT ON COLUMN t_p90536134_security_requirement.technologies.versions IS 'Список версий технологии';
COMMENT ON COLUMN t_p90536134_security_requirement.technologies.tech_domain_ids IS 'Привязка к техническим доменам';
COMMENT ON COLUMN t_p90536134_security_requirement.technologies.attachments IS 'JSON-массив вложений: [{type: file|mermaid|link, name, content|url}]';

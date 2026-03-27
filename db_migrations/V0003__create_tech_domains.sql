CREATE TABLE IF NOT EXISTS t_p90536134_security_requirement.tech_domains (
    id           VARCHAR(50)   PRIMARY KEY,
    name         TEXT          NOT NULL,
    version      VARCHAR(20)   NOT NULL DEFAULT '1.0.0',
    owner        TEXT          NOT NULL DEFAULT '',
    status       VARCHAR(30)   NOT NULL DEFAULT 'В разработке'
                               CHECK (status IN ('Активен','Не активен','В разработке','Архив')),
    tags         TEXT[]        NOT NULL DEFAULT '{}',
    description  TEXT          NOT NULL DEFAULT '',
    org_domain_ids TEXT[]      NOT NULL DEFAULT '{}',
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

INSERT INTO t_p90536134_security_requirement.section_settings (key, value)
VALUES ('tech_domains_section_description', 'Реестр технических доменов безопасности — создание, редактирование и управление архитектурными компонентами')
ON CONFLICT (key) DO NOTHING;

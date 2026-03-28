-- ============================================================
-- SecureArch Platform — инициализация БД для Docker
-- Объединяет все миграции V0001–V0018 в один файл
-- ============================================================

CREATE SCHEMA IF NOT EXISTS t_p90536134_security_requirement;

SET search_path TO t_p90536134_security_requirement;

-- ── section_settings ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS section_settings (
    key   VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
);

-- ── org_domains ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS org_domains (
    id          VARCHAR(50)  PRIMARY KEY,
    name        TEXT         NOT NULL,
    version     VARCHAR(20)  NOT NULL DEFAULT '1.0.0',
    owner       TEXT         NOT NULL DEFAULT '',
    status      VARCHAR(30)  NOT NULL DEFAULT 'В разработке'
                             CHECK (status IN ('Активен','Не активен','В разработке','Архив')),
    description TEXT         NOT NULL DEFAULT '',
    section_description TEXT NOT NULL DEFAULT '',
    tags        TEXT[]       NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── tech_domains ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tech_domains (
    id             VARCHAR(50)  PRIMARY KEY,
    name           TEXT         NOT NULL,
    version        VARCHAR(20)  NOT NULL DEFAULT '1.0.0',
    owner          TEXT         NOT NULL DEFAULT '',
    status         VARCHAR(30)  NOT NULL DEFAULT 'В разработке'
                                CHECK (status IN ('Активен','Не активен','В разработке','Архив')),
    tags           TEXT[]       NOT NULL DEFAULT '{}',
    description    TEXT         NOT NULL DEFAULT '',
    org_domain_ids TEXT[]       NOT NULL DEFAULT '{}',
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── technologies ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS technologies (
    id              TEXT        PRIMARY KEY,
    name            TEXT        NOT NULL,
    status          TEXT        NOT NULL DEFAULT 'В разработке',
    description     TEXT        NOT NULL DEFAULT '',
    versions        TEXT[]      NOT NULL DEFAULT '{}',
    tech_domain_ids TEXT[]      NOT NULL DEFAULT '{}',
    tags            TEXT[]      NOT NULL DEFAULT '{}',
    attachments     JSONB       NOT NULL DEFAULT '[]',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── requirements ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS requirements (
    id                  TEXT        PRIMARY KEY,
    name                TEXT        NOT NULL,
    technology_id       TEXT        REFERENCES technologies(id) ON DELETE SET NULL,
    tech_domain_id      TEXT        REFERENCES tech_domains(id) ON DELETE SET NULL,
    description         TEXT        NOT NULL DEFAULT '',
    req_type            TEXT        NOT NULL DEFAULT 'Техническое',
    criticality         TEXT        NOT NULL DEFAULT 'Средний',
    control_metric      TEXT        NOT NULL DEFAULT '',
    control_description TEXT        NOT NULL DEFAULT '',
    tags                TEXT[]      NOT NULL DEFAULT '{}',
    version             TEXT        NOT NULL DEFAULT '1.0.0',
    status              TEXT        NOT NULL DEFAULT 'В разработке',
    norm_doc_link       TEXT        NOT NULL DEFAULT '',
    environments        TEXT[]      NOT NULL DEFAULT '{}',
    stages              TEXT[]      NOT NULL DEFAULT '{}',
    procurement         TEXT        NOT NULL DEFAULT '',
    ext_with_iod        TEXT        NOT NULL DEFAULT 'Не требуется',
    ext_without_iod     TEXT        NOT NULL DEFAULT 'Не требуется',
    int_with_iod        TEXT        NOT NULL DEFAULT 'Не требуется',
    int_without_iod     TEXT        NOT NULL DEFAULT 'Не требуется',
    score_value         INTEGER     NOT NULL DEFAULT 1,
    score_weight        INTEGER     NOT NULL DEFAULT 1,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── tech_solutions ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tech_solutions (
    id                  TEXT        PRIMARY KEY,
    name                TEXT        NOT NULL,
    version             TEXT        NOT NULL DEFAULT '',
    owner               TEXT        NOT NULL DEFAULT '',
    status              TEXT        NOT NULL DEFAULT 'В разработке',
    description         TEXT        NOT NULL DEFAULT '',
    tags                TEXT[]      NOT NULL DEFAULT '{}',
    technology_ids      TEXT[]      NOT NULL DEFAULT '{}',
    tech_domain         TEXT        NOT NULL DEFAULT '',
    tech_domain_ids     TEXT[]      NOT NULL DEFAULT '{}',
    approved_ib         BOOLEAN     NOT NULL DEFAULT false,
    approved_it         BOOLEAN     NOT NULL DEFAULT false,
    related_solution_ids JSONB      NOT NULL DEFAULT '[]',
    attachments         JSONB       NOT NULL DEFAULT '[]',
    author              TEXT        NOT NULL DEFAULT '',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tech_solutions_settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
);

-- ── hardenings ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hardenings (
    id              TEXT        PRIMARY KEY,
    name            TEXT        NOT NULL,
    status          TEXT        NOT NULL DEFAULT 'В разработке',
    description     TEXT        NOT NULL DEFAULT '',
    technology_id   TEXT        REFERENCES technologies(id) ON DELETE SET NULL,
    tech_domain_id  TEXT        REFERENCES tech_domains(id) ON DELETE SET NULL,
    tags            TEXT[]      NOT NULL DEFAULT '{}',
    version         TEXT        NOT NULL DEFAULT '1.0.0',
    author          TEXT        NOT NULL DEFAULT '',
    steps           JSONB       NOT NULL DEFAULT '[]',
    attachments     JSONB       NOT NULL DEFAULT '[]',
    approved_ib     BOOLEAN     NOT NULL DEFAULT false,
    approved_it     BOOLEAN     NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hardenings_settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
);

-- ── arch_templates ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS arch_templates (
    id               TEXT        PRIMARY KEY,
    name             TEXT        NOT NULL,
    description      TEXT        NOT NULL DEFAULT '',
    status           TEXT        NOT NULL DEFAULT 'В разработке',
    author           TEXT        NOT NULL DEFAULT '',
    version          TEXT        NOT NULL DEFAULT '1.0.0',
    tags             TEXT[]      NOT NULL DEFAULT '{}',
    tech_solution_ids TEXT[]     NOT NULL DEFAULT '{}',
    approved_ib      BOOLEAN     NOT NULL DEFAULT false,
    approved_it      BOOLEAN     NOT NULL DEFAULT false,
    diagrams         JSONB       NOT NULL DEFAULT '[]',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS arch_templates_settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
);

-- ── products ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id                TEXT        PRIMARY KEY,
    name              TEXT        NOT NULL,
    description       TEXT        NOT NULL DEFAULT '',
    status            TEXT        NOT NULL DEFAULT 'В разработке',
    owner             TEXT        NOT NULL DEFAULT '',
    version           TEXT        NOT NULL DEFAULT '1.0.0',
    tags              TEXT[]      NOT NULL DEFAULT '{}',
    arch_template_ids TEXT[]      NOT NULL DEFAULT '{}',
    image_url         TEXT        NOT NULL DEFAULT '',
    diagrams          JSONB       NOT NULL DEFAULT '[]',
    attachments       JSONB       NOT NULL DEFAULT '[]',
    approved_ib       BOOLEAN     NOT NULL DEFAULT false,
    approved_it       BOOLEAN     NOT NULL DEFAULT false,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products_settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
);

-- ── Начальные данные section_settings ────────────────────────
INSERT INTO section_settings (key, value) VALUES
  ('domains_section_description',        'Реестр организационных доменов безопасности'),
  ('tech_domains_section_description',   'Реестр технических доменов безопасности'),
  ('technologies_section_description',   'Реестр технологий информационной безопасности'),
  ('requirements_section_description',   'Реестр требований безопасности'),
  ('tech_solutions_section_description', 'Реестр технических решений'),
  ('hardenings_section_description',     'Реестр харденингов'),
  ('arch_templates_section_description', 'Реестр типовых архитектур безопасности'),
  ('products_section_description',       'Реестр бизнес-продуктов')
ON CONFLICT (key) DO NOTHING;

INSERT INTO tech_solutions_settings (key, value)
  VALUES ('section_description', 'Реестр технических решений')
  ON CONFLICT (key) DO NOTHING;

INSERT INTO hardenings_settings (key, value)
  VALUES ('section_description', 'Реестр харденингов')
  ON CONFLICT (key) DO NOTHING;

INSERT INTO arch_templates_settings (key, value)
  VALUES ('section_description', 'Реестр типовых архитектур безопасности')
  ON CONFLICT (key) DO NOTHING;

INSERT INTO products_settings (key, value)
  VALUES ('section_description', 'Реестр бизнес-продуктов')
  ON CONFLICT (key) DO NOTHING;

-- ── Демо-данные: org_domains ─────────────────────────────────
INSERT INTO org_domains (id, name, version, owner, status, description, tags) VALUES
  ('org-dom-001', 'Управление идентификацией', '1.2.0', 'Отдел ИБ', 'Активен', 'Домен охватывает процессы управления учётными записями, ролями и привилегиями пользователей.', ARRAY['iam','identity']),
  ('org-dom-002', 'Сетевая безопасность',      '2.0.1', 'Сетевой отдел', 'Активен', 'Домен включает требования к сегментации сети, межсетевым экранам, VPN и мониторингу трафика.', ARRAY['network','firewall']),
  ('org-dom-003', 'Управление инцидентами',    '1.0.0', 'SOC', 'В разработке', 'Процессы обнаружения, регистрации, расследования и устранения инцидентов ИБ.', ARRAY['incident','soc']),
  ('org-dom-004', 'Криптографическая защита',  '1.1.3', 'Отдел ИБ', 'Активен', 'Требования к применению криптографических алгоритмов, управлению ключами и PKI.', ARRAY['crypto','pki']),
  ('org-dom-005', 'Физическая безопасность',   '0.9.0', 'АХО', 'Архив', 'Устаревший домен требований к физической защите серверных помещений.', ARRAY['physical'])
ON CONFLICT (id) DO NOTHING;

-- ── Демо-данные: tech_domains ────────────────────────────────
INSERT INTO tech_domains (id, name, version, owner, status, tags, description, org_domain_ids) VALUES
  ('tech-dom-001', 'Управление доступом',           '1.0.0', 'Отдел ИБ', 'Активен', ARRAY['access','iam'], 'Механизмы управления доступом, разграничения прав и ролевой модели.', ARRAY['org-dom-001','org-dom-002']),
  ('tech-dom-007', 'Идентификация и аутентификация','1.0.0', 'Отдел ИБ', 'Активен', ARRAY['authn','mfa','identity'], 'Механизмы идентификации и аутентификации, включая МФА.', ARRAY['org-dom-001']),
  ('tech-dom-018', 'Защита систем и коммуникаций',  '1.0.0', 'Отдел ИБ', 'Активен', ARRAY['network','comms'], 'Защита информации при передаче: шифрование каналов, сегментация сети.', ARRAY['org-dom-002','org-dom-004'])
ON CONFLICT (id) DO NOTHING;

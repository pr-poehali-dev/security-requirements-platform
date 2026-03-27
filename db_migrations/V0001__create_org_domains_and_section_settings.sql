CREATE TABLE IF NOT EXISTS t_p90536134_security_requirement.org_domains (
    id          VARCHAR(50)  PRIMARY KEY,
    name        TEXT         NOT NULL,
    version     VARCHAR(20)  NOT NULL DEFAULT '1.0.0',
    owner       TEXT         NOT NULL DEFAULT '',
    status      VARCHAR(30)  NOT NULL DEFAULT 'В разработке'
                             CHECK (status IN ('Активен','Не активен','В разработке','Архив')),
    description TEXT         NOT NULL DEFAULT '',
    section_description TEXT NOT NULL DEFAULT 'Реестр организационных доменов безопасности — создание, редактирование и управление статусами',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p90536134_security_requirement.section_settings (
    key   VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
);

INSERT INTO t_p90536134_security_requirement.section_settings (key, value)
VALUES ('domains_section_description', 'Реестр организационных доменов безопасности — создание, редактирование и управление статусами')
ON CONFLICT (key) DO NOTHING;

INSERT INTO t_p90536134_security_requirement.org_domains
    (id, name, version, owner, status, description)
VALUES
    ('org.dom.001', 'Управление идентификацией',   '1.2.0', 'Отдел ИБ',       'Активен',      'Домен охватывает процессы управления учётными записями, ролями и привилегиями пользователей в информационных системах организации.'),
    ('org.dom.002', 'Сетевая безопасность',         '2.0.1', 'Сетевой отдел',  'Активен',      'Домен включает требования к сегментации сети, межсетевым экранам, VPN и мониторингу сетевого трафика.'),
    ('org.dom.003', 'Управление инцидентами',       '1.0.0', 'SOC',            'В разработке', 'Процессы обнаружения, регистрации, расследования и устранения инцидентов информационной безопасности.'),
    ('org.dom.004', 'Криптографическая защита',     '1.1.3', 'Отдел ИБ',       'Активен',      'Требования к применению криптографических алгоритмов, управлению ключами и PKI-инфраструктуре.'),
    ('org.dom.005', 'Физическая безопасность',      '0.9.0', 'АХО',            'Архив',        'Устаревший домен требований к физической защите серверных помещений. Заменён стандартом ISO 27001 A.11.')
ON CONFLICT (id) DO NOTHING;

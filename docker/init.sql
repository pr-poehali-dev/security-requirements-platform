-- ============================================================
-- SecureArch Platform — инициализация БД для Docker
-- Содержит актуальную схему + тестовые данные из prod-БД
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
    id                  VARCHAR(50)  PRIMARY KEY,
    name                TEXT         NOT NULL,
    version             VARCHAR(20)  NOT NULL DEFAULT '1.0.0',
    owner               TEXT         NOT NULL DEFAULT '',
    status              VARCHAR(30)  NOT NULL DEFAULT 'В разработке'
                                     CHECK (status IN ('Активен','Не активен','В разработке','Архив')),
    description         TEXT         NOT NULL DEFAULT '',
    section_description TEXT         NOT NULL DEFAULT '',
    tags                TEXT[]       NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
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
    id                   TEXT        PRIMARY KEY,
    name                 TEXT        NOT NULL,
    version              TEXT        NOT NULL DEFAULT '',
    owner                TEXT        NOT NULL DEFAULT '',
    status               TEXT        NOT NULL DEFAULT 'В разработке',
    description          TEXT        NOT NULL DEFAULT '',
    tags                 TEXT[]      NOT NULL DEFAULT '{}',
    technology_ids       TEXT[]      NOT NULL DEFAULT '{}',
    tech_domain          TEXT        NOT NULL DEFAULT '',
    tech_domain_ids      TEXT[]      NOT NULL DEFAULT '{}',
    approved_ib          BOOLEAN     NOT NULL DEFAULT false,
    approved_it          BOOLEAN     NOT NULL DEFAULT false,
    related_solution_ids JSONB       NOT NULL DEFAULT '[]',
    attachments          JSONB       NOT NULL DEFAULT '[]',
    author               TEXT        NOT NULL DEFAULT '',
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tech_solutions_settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
);

-- ── hardenings ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hardenings (
    id             TEXT        PRIMARY KEY,
    name           TEXT        NOT NULL,
    status         TEXT        NOT NULL DEFAULT 'В разработке',
    description    TEXT        NOT NULL DEFAULT '',
    technology_id  TEXT        REFERENCES technologies(id) ON DELETE SET NULL,
    tech_domain_id TEXT        REFERENCES tech_domains(id) ON DELETE SET NULL,
    tags           TEXT[]      NOT NULL DEFAULT '{}',
    version        TEXT        NOT NULL DEFAULT '1.0.0',
    author         TEXT        NOT NULL DEFAULT '',
    steps          JSONB       NOT NULL DEFAULT '[]',
    attachments    JSONB       NOT NULL DEFAULT '[]',
    approved_ib    BOOLEAN     NOT NULL DEFAULT false,
    approved_it    BOOLEAN     NOT NULL DEFAULT false,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hardenings_settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
);

-- ── arch_templates ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS arch_templates (
    id                TEXT        PRIMARY KEY,
    name              TEXT        NOT NULL,
    description       TEXT        NOT NULL DEFAULT '',
    status            TEXT        NOT NULL DEFAULT 'В разработке',
    author            TEXT        NOT NULL DEFAULT '',
    version           TEXT        NOT NULL DEFAULT '1.0.0',
    tags              TEXT[]      NOT NULL DEFAULT '{}',
    tech_solution_ids TEXT[]      NOT NULL DEFAULT '{}',
    approved_ib       BOOLEAN     NOT NULL DEFAULT false,
    approved_it       BOOLEAN     NOT NULL DEFAULT false,
    diagrams          JSONB       NOT NULL DEFAULT '[]',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
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

-- ════════════════════════════════════════════════════════════
-- ДАННЫЕ
-- ════════════════════════════════════════════════════════════

-- ── section_settings ─────────────────────────────────────────
INSERT INTO section_settings (key, value) VALUES
  ('domains_section_description',      'Реестр организационных доменов безопасности — создание, редактирование и управление статусами'),
  ('tech_domains_section_description', 'Реестр технических доменов безопасности — создание, редактирование и управление архитектурными компонентами')
ON CONFLICT (key) DO NOTHING;

INSERT INTO tech_solutions_settings (key, value) VALUES
  ('section_description', 'Техническое решение это инструмент которым мы решаем задачу')
ON CONFLICT (key) DO NOTHING;

INSERT INTO arch_templates_settings (key, value) VALUES
  ('section_description', 'Реестр типовых архитектур безопасности — шаблоны для проектирования защищённых систем')
ON CONFLICT (key) DO NOTHING;

INSERT INTO hardenings_settings  (key, value) VALUES ('section_description', 'Реестр харденингов') ON CONFLICT (key) DO NOTHING;
INSERT INTO products_settings    (key, value) VALUES ('section_description', 'Реестр бизнес-продуктов') ON CONFLICT (key) DO NOTHING;

-- ── org_domains ──────────────────────────────────────────────
INSERT INTO org_domains (id, name, version, owner, status, description, tags) VALUES
  ('org-dom-001', 'Управление идентификацией', '1.2.0', 'Отдел ИБ',    'Активен',      'Домен охватывает процессы управления учётными записями, ролями и привилегиями пользователей в информационных системах организации.', '{}'),
  ('org-dom-002', 'Сетевая безопасность',      '2.0.1', 'Сетевой отдел','Активен',     'Домен включает требования к сегментации сети, межсетевым экранам, VPN и мониторингу сетевого трафика.', '{}'),
  ('org-dom-003', 'Управление инцидентами',    '1.0.0', 'SOC',          'В разработке', 'Процессы обнаружения, регистрации, расследования и устранения инцидентов информационной безопасности.', '{}'),
  ('org-dom-004', 'Криптографическая защита',  '1.1.3', 'Отдел ИБ',    'Активен',      'Требования к применению криптографических алгоритмов, управлению ключами и PKI-инфраструктуре.', '{}'),
  ('org-dom-005', 'Физическая безопасность',   '0.9.0', 'АХО',          'Архив',        'Устаревший домен требований к физической защите серверных помещений. Заменён стандартом ISO 27001 A.11.', '{}')
ON CONFLICT (id) DO NOTHING;

-- ── tech_domains ─────────────────────────────────────────────
INSERT INTO tech_domains (id, name, version, owner, status, tags, description, org_domain_ids) VALUES
  ('tech-dom-001','Управление доступом',                 '1.0.0','Отдел ИБ',  'Активен',      ARRAY['access','iam'],            'Механизмы управления доступом к информационным системам и ресурсам организации, включая разграничение прав и ролевую модель.', ARRAY['org-dom-001','org-dom-002']),
  ('tech-dom-002','Осведомлённость и обучение',          '1.0.0','HR / ИБ',   'Активен',      ARRAY['training','awareness'],    'Программы повышения осведомлённости персонала в области информационной безопасности и обязательного обучения.', ARRAY['org-dom-001']),
  ('tech-dom-003','Аудит и подотчётность',               '1.0.0','SOC',       'Активен',      ARRAY['audit','logging'],         'Ведение журналов аудита, контроль действий пользователей и формирование отчётности по событиям безопасности.', ARRAY['org-dom-003','org-dom-004']),
  ('tech-dom-004','Оценка, авторизация и мониторинг',    '1.0.0','Отдел ИБ',  'В разработке', ARRAY['assessment','monitoring'], 'Процессы оценки рисков, авторизации систем и непрерывного мониторинга состояния безопасности.', ARRAY['org-dom-004']),
  ('tech-dom-005','Управление конфигурациями',           '1.0.0','ИТ-отдел',  'Активен',      ARRAY['config','hardening'],      'Стандарты конфигурирования и процессы управления изменениями конфигурации информационных систем.', ARRAY['org-dom-002']),
  ('tech-dom-006','Планирование непрерывности',          '1.0.0','Отдел ИБ',  'Активен',      ARRAY['bcp','dr','continuity'],   'Планирование обеспечения непрерывности бизнес-процессов и восстановления после сбоев и катастроф.', ARRAY['org-dom-005']),
  ('tech-dom-007','Идентификация и аутентификация',      '1.0.0','Отдел ИБ',  'Активен',      ARRAY['authn','mfa','identity'],  'Механизмы идентификации субъектов и аутентификации, включая многофакторную аутентификацию и управление учётными данными.', ARRAY['org-dom-001']),
  ('tech-dom-008','Реагирование на инциденты',           '1.0.0','SOC',       'Активен',      ARRAY['incident','ir','response'],'Процедуры обнаружения, регистрации, расследования и устранения инцидентов информационной безопасности.', ARRAY['org-dom-003']),
  ('tech-dom-009','Обслуживание',                        '1.0.0','ИТ-отдел',  'Активен',      ARRAY['maintenance','patching'],  'Процессы технического обслуживания информационных систем, управления патчами и устранения уязвимостей.', ARRAY['org-dom-002']),
  ('tech-dom-010','Защита носителей',                    '1.0.0','Отдел ИБ',  'Активен',      ARRAY['media','storage','dlp'],   'Контроль жизненного цикла носителей информации: учёт, использование, передача, санитизация и утилизация.', ARRAY['org-dom-004']),
  ('tech-dom-011','Физическая и экологическая защита',   '1.0.0','АХО',       'Активен',      ARRAY['physical','environmental'],'Требования к физической безопасности объектов, серверных помещений и защите от экологических угроз.', ARRAY['org-dom-005']),
  ('tech-dom-012','Планирование',                        '1.0.0','Отдел ИБ',  'В разработке', ARRAY['planning','strategy'],     'Стратегическое и оперативное планирование мероприятий по обеспечению информационной безопасности.', ARRAY['org-dom-001']),
  ('tech-dom-013','Управление программой ИБ',            '1.0.0','CISO',      'Активен',      ARRAY['governance','program'],    'Корпоративное управление программой информационной безопасности: политики, процессы и организационная структура.', ARRAY['org-dom-001','org-dom-003']),
  ('tech-dom-014','Кадровая безопасность',               '1.0.0','HR / ИБ',   'Активен',      ARRAY['personnel','hr-security'], 'Проверка персонала, процедуры найма и увольнения, соглашения о конфиденциальности и управление привилегированным доступом.', ARRAY['org-dom-001']),
  ('tech-dom-015','Обработка и прозрачность PII',        '1.0.0','DPO',       'В разработке', ARRAY['privacy','pii','gdpr'],    'Требования к обработке персональных данных, обеспечению прозрачности и соблюдению требований законодательства о защите ПДн.', ARRAY['org-dom-004']),
  ('tech-dom-016','Оценка рисков',                       '1.0.0','Отдел ИБ',  'Активен',      ARRAY['risk','assessment','rm'],  'Методология идентификации, анализа и оценки рисков информационной безопасности.', ARRAY['org-dom-004']),
  ('tech-dom-017','Приобретение систем и услуг',         '1.0.0','Закупки',   'В разработке', ARRAY['procurement','sa'],        'Требования безопасности при закупке, разработке и внедрении информационных систем и услуг.', ARRAY['org-dom-002']),
  ('tech-dom-018','Защита систем и коммуникаций',        '1.0.0','Отдел ИБ',  'Активен',      ARRAY['network','comms','sc'],    'Защита информации при передаче и обработке: шифрование каналов, сегментация сети и контроль периметра.', ARRAY['org-dom-002','org-dom-004']),
  ('tech-dom-019','Целостность системы и информации',    '1.0.0','SOC',       'Активен',      ARRAY['integrity','si','antivirus'],'Механизмы обеспечения целостности программного обеспечения, данных и защиты от вредоносного кода.', ARRAY['org-dom-003','org-dom-004']),
  ('tech-dom-020','Управление рисками цепочки поставок', '1.0.0','Закупки',   'В разработке', ARRAY['supply-chain','scrm'],     'Управление рисками информационной безопасности, связанными с поставщиками, подрядчиками и третьими сторонами.', ARRAY['org-dom-004'])
ON CONFLICT (id) DO NOTHING;

-- ── technologies ─────────────────────────────────────────────
INSERT INTO technologies (id, name, status, description, versions, tech_domain_ids, tags) VALUES
  ('tech-001','JWT (JSON Web Token)',             'Активен',      'Стандарт открытого формата токенов доступа на основе JSON. Используется для передачи утверждений между сторонами в виде подписанного объекта, обеспечивая аутентификацию и авторизацию без сохранения состояния на сервере.',       ARRAY['RFC 7519','9.0'],             ARRAY['tech-dom-007','tech-dom-001'], ARRAY['authn','token','stateless','oauth']),
  ('tech-002','OAuth 2.0',                        'Активен',      'Протокол авторизации, позволяющий сторонним приложениям получать ограниченный доступ к ресурсам пользователя без раскрытия учётных данных. Используется для делегированного доступа через access/refresh-токены.',                 ARRAY['RFC 6749','2.1 draft'],       ARRAY['tech-dom-007','tech-dom-001'], ARRAY['authz','protocol','delegation','token']),
  ('tech-003','OpenID Connect (OIDC)',             'Активен',      'Уровень идентификации поверх OAuth 2.0. Предоставляет стандартный способ проверки личности конечного пользователя через ID-токен (JWT), выданный провайдером идентификации.',                                                       ARRAY['1.0','Core 1.0'],             ARRAY['tech-dom-007','tech-dom-001'], ARRAY['authn','oidc','sso','federation']),
  ('tech-004','RBAC (Role-Based Access Control)', 'Активен',      'Модель управления доступом, где права назначаются пользователям через роли. Позволяет централизованно управлять разрешениями, снижая сложность администрирования и риск избыточных привилегий.',                                      ARRAY['1.0'],                        ARRAY['tech-dom-001','tech-dom-007'], ARRAY['access','authorization','model','rbac']),
  ('tech-005','ABAC (Attribute-Based Access Control)','В разработке','Модель управления доступом на основе атрибутов субъекта, ресурса и среды. Обеспечивает гибкую политику доступа через XACML-правила, подходит для сложных контекстно-зависимых сценариев.',                                        ARRAY['XACML 3.0'],                  ARRAY['tech-dom-001'],               ARRAY['access','policy','attribute','xacml']),
  ('tech-006','TLS/SSL (Transport Layer Security)','Активен',      'Криптографический протокол, обеспечивающий шифрование данных при передаче между клиентом и сервером. TLS 1.3 является актуальной версией. Защищает от атак перехвата и подмены данных.',                                          ARRAY['TLS 1.2','TLS 1.3'],          ARRAY['tech-dom-018','tech-dom-006'], ARRAY['encryption','tls','ssl','transport']),
  ('tech-007','AES (Advanced Encryption Standard)','Активен',      'Симметричный алгоритм блочного шифрования. AES-256 является стандартом де-факто для защиты данных в покое. Применяется для шифрования БД, дисков, файлов и резервных копий.',                                                     ARRAY['AES-128','AES-192','AES-256'],ARRAY['tech-dom-018','tech-dom-010'], ARRAY['encryption','symmetric','aes','at-rest']),
  ('tech-008','RSA',                              'Активен',      'Асимметричный криптографический алгоритм. Используется для шифрования ключей, цифровой подписи и обмена ключами. Рекомендуемый размер ключа — 2048 бит и выше.',                                                                     ARRAY['PKCS#1','2048-bit','4096-bit'],ARRAY['tech-dom-018'],              ARRAY['encryption','asymmetric','pki','signature']),
  ('tech-009','MFA / 2FA',                        'Активен',      'Многофакторная аутентификация — требование предоставить два или более независимых фактора для подтверждения личности. Критически снижает риск компрометации при утечке паролей.',                                                     ARRAY['TOTP RFC 6238','FIDO2'],      ARRAY['tech-dom-007','tech-dom-001'], ARRAY['authn','mfa','totp','fido2']),
  ('tech-010','SIEM',                             'Активен',      'Система управления событиями безопасности и информацией. Агрегирует, коррелирует и анализирует логи из различных источников в реальном времени для обнаружения угроз и расследования инцидентов.',                                  ARRAY['1.0'],                        ARRAY['tech-dom-003','tech-dom-008'], ARRAY['monitoring','logging','soc','detection']),
  ('tech-011','WAF (Web Application Firewall)',   'Активен',      'Межсетевой экран для веб-приложений. Анализирует HTTP-трафик и блокирует атаки класса OWASP Top 10: SQL-инъекции, XSS, CSRF, обход каталогов и другие веб-угрозы.',                                                              ARRAY['1.0'],                        ARRAY['tech-dom-018','tech-dom-019'], ARRAY['network','waf','firewall','owasp']),
  ('tech-012','Контейнеризация (Docker)',         'Активен',      'Технология упаковки приложения со всеми зависимостями в изолированный контейнер. С точки зрения ИБ — изоляция процессов, неизменяемость образов, принцип минимальных привилегий.',                                                  ARRAY['20.10','24.0','25.0'],        ARRAY['tech-dom-005','tech-dom-019'], ARRAY['container','docker','isolation','immutable']),
  ('tech-013','Kubernetes (K8s)',                 'Активен',      'Оркестратор контейнеров с встроенными механизмами безопасности: RBAC, Pod Security Standards, Network Policies, Secrets management. Обеспечивает безопасное развёртывание и масштабирование сервисов.',                             ARRAY['1.28','1.29','1.30'],         ARRAY['tech-dom-005','tech-dom-001'], ARRAY['k8s','orchestration','container','rbac']),
  ('tech-014','HashiCorp Vault',                  'Активен',      'Централизованное хранилище секретов и управление PKI. Обеспечивает динамическое управление учётными данными, шифрование как услугу и ротацию секретов без изменения кода приложений.',                                              ARRAY['1.14','1.15'],                ARRAY['tech-dom-001','tech-dom-007'], ARRAY['secrets','vault','pki','dynamic-creds']),
  ('tech-015','Балансировщик нагрузки',           'Активен',      'Распределение входящего трафика между несколькими серверами. С точки зрения ИБ — устранение SPOF, защита от DDoS, SSL-терминация, централизованное применение политик доступа.',                                                   ARRAY['L4','L7'],                    ARRAY['tech-dom-018','tech-dom-006'], ARRAY['network','ha','ddos','traffic']),
  ('tech-016','PKI (Public Key Infrastructure)',  'Активен',      'Инфраструктура открытых ключей для управления цифровыми сертификатами. Включает удостоверяющие центры, политики выдачи сертификатов, списки отзыва (CRL/OCSP). Основа TLS и цифровых подписей.',                                  ARRAY['X.509 v3'],                   ARRAY['tech-dom-018','tech-dom-007'], ARRAY['pki','certificate','ca','x509']),
  ('tech-017','EDR (Endpoint Detection & Response)','Активен',    'Решение для мониторинга конечных точек, обнаружения и реагирования на угрозы. Собирает телеметрию с рабочих станций и серверов, анализирует поведение процессов и файловой системы.',                                             ARRAY['1.0'],                        ARRAY['tech-dom-019','tech-dom-008'], ARRAY['edr','endpoint','detection','threat']),
  ('tech-018','Zero Trust Network Access (ZTNA)', 'В разработке', 'Архитектурная концепция: явная верификация каждого запроса независимо от сетевого расположения. Заменяет периметральную модель безопасности — «никогда не доверяй, всегда проверяй».',                                            ARRAY['1.0'],                        ARRAY['tech-dom-001','tech-dom-018'], ARRAY['zero-trust','ztna','sase','identity']),
  ('tech-019','LDAP / Active Directory',          'Активен',      'Протокол и служба каталогов для централизованного управления учётными записями, группами и политиками. Основа корпоративной IAM-инфраструктуры в большинстве организаций.',                                                          ARRAY['v3','AD 2019','AD 2022'],     ARRAY['tech-dom-007','tech-dom-001'], ARRAY['ldap','ad','directory','iam']),
  ('tech-020','SOAR',                             'В разработке', 'Платформа оркестрации, автоматизации и реагирования на инциденты безопасности. Автоматизирует рутинные задачи SOC: обогащение алертов, блокировку угроз, уведомления и формирование отчётов.',                                     ARRAY['1.0'],                        ARRAY['tech-dom-008','tech-dom-003'], ARRAY['soar','automation','incident','soc']),
  ('tech-021','Honeypot / Deception',             'В разработке', 'Технология обмана атакующих через развёртывание ложных ресурсов (honeypot, honeytoken, honeycredential). Позволяет обнаружить внутренние угрозы и продвижение атакующего в сети.',                                                 ARRAY['1.0'],                        ARRAY['tech-dom-019','tech-dom-003'], ARRAY['deception','honeypot','threat-intel']),
  ('tech-022','DLP (Data Loss Prevention)',       'Активен',      'Системы предотвращения утечки данных. Контролируют каналы передачи информации (почта, USB, принтеры, веб) и блокируют несанкционированную передачу конфиденциальных данных.',                                                      ARRAY['1.0'],                        ARRAY['tech-dom-010','tech-dom-018'], ARRAY['dlp','data-loss','privacy','classification']),
  ('tech-023','PAM (Privileged Access Management)','Активен',     'Управление привилегированным доступом: хранение, ротация и контроль использования паролей привилегированных учётных записей, запись сессий администраторов.',                                                                        ARRAY['1.0'],                        ARRAY['tech-dom-001','tech-dom-007'], ARRAY['pam','privilege','admin','session']),
  ('tech-024','IDS/IPS',                          'Активен',      'Системы обнаружения и предотвращения вторжений. Анализируют сетевой трафик на сигнатуры атак и аномальное поведение, автоматически блокируя подозрительные соединения.',                                                          ARRAY['Snort 3','Suricata 7'],       ARRAY['tech-dom-018','tech-dom-019'], ARRAY['ids','ips','network','intrusion']),
  ('tech-025','HSM (Hardware Security Module)',   'Активен',      'Аппаратный модуль безопасности для защищённого хранения криптографических ключей и выполнения операций шифрования. Обеспечивает физическую защиту ключей от извлечения.',                                                         ARRAY['FIPS 140-2','FIPS 140-3'],    ARRAY['tech-dom-018','tech-dom-001'], ARRAY['hsm','hardware','key-management','fips'])
ON CONFLICT (id) DO NOTHING;

-- ── requirements ─────────────────────────────────────────────
INSERT INTO requirements (id,name,technology_id,tech_domain_id,description,req_type,criticality,control_metric,control_description,tags,version,status,norm_doc_link,environments,stages,procurement,ext_with_iod,ext_without_iod,int_with_iod,int_without_iod,score_value,score_weight) VALUES
('req-001','Многофакторная аутентификация для привилегированных пользователей','tech-001','tech-dom-007','Все привилегированные пользователи (администраторы, DevOps, SRE) обязаны использовать MFA при каждом входе в критические системы. Исключения возможны только при наличии компенсирующих мер, согласованных с CISO.','Безопасность','Критический','% привилегированных учёток с MFA ≥ 100%','Автоматизированная проверка через Identity Provider — выгрузка учётных записей без MFA раз в неделю',ARRAY['mfa','authn','privileged','identity'],'1.2.0','Активен','ГОСТ Р 57580.1-2017, п.7.3',ARRAY['Prod','ProdLike'],ARRAY['Стадия рантайм'],'Решения класса MFA/2FA (FIDO2, TOTP): наличие действующего сертификата ФСТЭК или ФСБ','Обязательный','Обязательный','Обязательный','Рекомендуемый',4,9),
('req-002','Шифрование персональных данных при хранении (AES-256)','tech-001','tech-dom-018','Все персональные данные и конфиденциальная информация в БД и файловых хранилищах должны шифроваться алгоритмом AES-256 с управлением ключами через HSM или Vault. Ключи шифрования ротируются не реже 1 раза в год.','Техническое','Критический','% БД с включённым шифрованием TDE = 100%','Ежеквартальный аудит конфигурации СУБД, проверка через скрипт настроек TDE/Column-Level Encryption',ARRAY['encryption','aes','pii','at-rest','gost'],'2.0.0','Активен','ГОСТ Р 34.12-2015, 152-ФЗ',ARRAY['Prod','ProdLike','Stage'],ARRAY['Стадия дизайн','Стадия деплоя'],'Криптографические модули: сертификация ФСБ России по классу КС1 и выше','Обязательный','Обязательный','Обязательный','Обязательный',4,10),
('req-003','Шифрование трафика TLS 1.3 для всех внешних соединений','tech-001','tech-dom-018','Все внешние HTTP-соединения должны использовать TLS 1.3 (минимум TLS 1.2). Устаревшие протоколы SSL 3.0, TLS 1.0, TLS 1.1 должны быть отключены на всех балансировщиках, API-шлюзах и веб-серверах.','Техническое','Высокий','% endpoints с TLS 1.3 ≥ 95%; TLS < 1.2 = 0','Автосканирование через SSL Labs API или внутренний сканер раз в месяц',ARRAY['tls','encryption','transport','https'],'1.1.0','Активен','NIST SP 800-52 Rev.2, RFC 8446',ARRAY['Prod','ProdLike','Stage','Test'],ARRAY['Стадия деплоя','Стадия рантайм'],'Балансировщики нагрузки с поддержкой TLS 1.3 и механизмом обновления сертификатов','Обязательный','Обязательный','Рекомендуемый','Не требуется',3,8),
('req-004','Централизованное управление секретами через Vault','tech-001','tech-dom-001','Все секреты приложений (пароли БД, API-ключи, сертификаты) хранятся в HashiCorp Vault. Жёстко закодированные секреты в коде и конфигурационных файлах запрещены. Динамические секреты с TTL ≤ 24 часа для критических систем.','Техническое','Критический','% секретов в репозитории = 0; % сервисов с Vault-интеграцией ≥ 90%','Автоматическое сканирование репозиториев через GitLeaks/TruffleHog в CI/CD, еженедельная проверка',ARRAY['secrets','vault','credentials','hardcoded'],'1.3.0','Активен','OWASP ASVS 4.0, Level 2',ARRAY['Prod','ProdLike','Stage','Test','Dev'],ARRAY['Стадия дизайн','Стадия деплоя'],'Решения управления секретами класса PAM/Vault с поддержкой динамических учётных данных','Обязательный','Обязательный','Обязательный','Обязательный',4,9),
('req-005','RBAC для разграничения доступа к микросервисам','tech-004','tech-dom-001','В Kubernetes и сервисной сетке должны быть настроены RBAC-политики по принципу минимальных привилегий. Каждый сервис имеет отдельный ServiceAccount. Запрещено использование cluster-admin роли для прикладных сервисов.','Организационное','Высокий','% namespace без wildcard-разрешений в RBAC = 100%','Автоматизированная проверка через kube-bench и Polaris при каждом деплое',ARRAY['rbac','k8s','least-privilege','access-control'],'1.0.0','Активен','CIS Kubernetes Benchmark v1.8',ARRAY['Prod','ProdLike','Stage'],ARRAY['Стадия дизайн','Стадия деплоя','Стадия рантайм'],'Оркестраторы контейнеров с развитыми встроенными RBAC-механизмами и аудитом','Рекомендуемый','Не требуется','Обязательный','Обязательный',3,8),
('req-006','Централизованное журналирование событий безопасности (SIEM)','tech-010','tech-dom-003','Все события безопасности (аутентификация, авторизация, изменение конфигурации, сетевые аномалии) централизованно отправляются в SIEM. Срок хранения логов — не менее 12 месяцев. Целостность логов обеспечивается WORM-хранилищем.','Функциональное','Высокий','% систем с отправкой логов в SIEM ≥ 98%; задержка доставки < 60 сек','Мониторинг gaps в потоке событий через dashboard SIEM, алерт при отсутствии событий от источника > 5 мин',ARRAY['siem','logging','monitoring','audit','worm'],'2.1.0','Активен','PCI DSS 4.0 Req.10, ГОСТ Р 57580',ARRAY['Prod','ProdLike'],ARRAY['Стадия деплоя','Стадия рантайм'],'SIEM-платформы с поддержкой корреляции событий, хранение логов в WORM-хранилище','Обязательный','Обязательный','Обязательный','Обязательный',3,9),
('req-007','WAF перед всеми публичными веб-приложениями','tech-011','tech-dom-019','Все веб-приложения, доступные из интернета, защищаются WAF-решением с правилами OWASP Core Rule Set (CRS). WAF работает в режиме блокировки (не только детектирования). Исключения из правил согласуются с командой безопасности.','Техническое','Высокий','% публичных приложений за WAF = 100%; режим блокировки = 100%','Инвентаризация приложений ежеквартально; проверка режима WAF через API конфигурации',ARRAY['waf','owasp','web','firewall','injection'],'1.0.0','Активен','OWASP CRS 4.0, PCI DSS 4.0 Req.6',ARRAY['Prod','ProdLike'],ARRAY['Стадия деплоя','Стадия рантайм'],'WAF-решения с поддержкой OWASP CRS, managed-правил и встроенного DDoS-защиты','Обязательный','Обязательный','Не требуется','Не требуется',3,7),
('req-008','Ротация ключей шифрования не реже 1 раза в год','tech-016','tech-dom-018','Все криптографические ключи (симметричные и асимметричные) должны ротироваться с максимальным периодом 12 месяцев для ключей шифрования данных и 24 месяца для корневых CA-ключей. Ротация автоматизирована через PKI/Vault.','Организационное','Средний','% ключей, созданных более 12 месяцев назад = 0','Ежемесячный аудит срока жизни ключей в Vault и HSM через API',ARRAY['pki','key-rotation','certificate','lifecycle'],'1.1.0','Активен','NIST SP 800-57 Part 1',ARRAY['Prod','ProdLike'],ARRAY['Стадия рантайм'],'PKI-система с автоматической ротацией сертификатов и интеграцией с Vault','Обязательный','Обязательный','Обязательный','Обязательный',2,6),
('req-009','Изоляция контейнеров и запрет privileged mode','tech-012','tech-dom-005','Запрещён запуск контейнеров с флагом --privileged, capabilities SYS_ADMIN и hostNetwork/hostPID. Контейнеры запускаются под непривилегированным пользователем (не root). Seccomp и AppArmor профили обязательны для производственных контейнеров.','Техническое','Высокий','% контейнеров без privileged mode = 100%; % с seccomp = 100%','Автоматическая проверка через OPA Gatekeeper/Kyverno при каждом деплое, отклонение нарушающих политик',ARRAY['docker','container','isolation','seccomp','apparmor'],'1.2.0','Активен','CIS Docker Benchmark, K8s PSS Restricted',ARRAY['Prod','ProdLike','Stage','Test'],ARRAY['Стадия дизайн','Стадия деплоя'],'Container Runtime с поддержкой seccomp/AppArmor; admission controller для проверки политик','Рекомендуемый','Не требуется','Обязательный','Обязательный',3,8),
('req-010','DLP-контроль исходящего трафика для конфиденциальных данных','tech-022','tech-dom-010','Весь исходящий трафик, содержащий ПДн, коммерческую тайну или данные платёжных карт, проходит DLP-инспекцию. Попытки несанкционированной передачи блокируются и создают инциденты в системе управления инцидентами. Покрытие: email, web, мессенджеры.','Функциональное','Критический','% каналов передачи данных под DLP-контролем ≥ 95%','Ежеквартальный тест-контроль отправки тестовых ПДн, проверка срабатывания DLP и создания инцидента',ARRAY['dlp','data-loss','pii','confidential','egress'],'2.0.0','Активен','ГОСТ Р 57580, 152-ФЗ, PCI DSS Req.3',ARRAY['Prod','ProdLike'],ARRAY['Стадия рантайм'],'DLP-решение с агентами для endpoints и network DLP для inline-инспекции трафика','Запрещено','Запрещено','Обязательный','Обязательный',4,8),
('req-011','Управление привилегированным доступом через PAM','tech-023','tech-dom-001','Все административные сессии (SSH, RDP, консоли) выполняются через PAM-систему. Прямой доступ к продуктивным серверам без PAM запрещён. Все сессии записываются и хранятся не менее 6 месяцев. Пароли администраторов управляются через PAM.','Организационное','Критический','% административных доступов через PAM = 100%; % с записью сессии = 100%','Проверка логов сетевого оборудования на прямые подключения в обход PAM (ежемесячно)',ARRAY['pam','privileged','admin','session-recording'],'1.0.0','Активен','ГОСТ Р 57580, CIS Controls v8 #5',ARRAY['Prod','ProdLike'],ARRAY['Стадия рантайм'],'PAM-решение с записью привилегированных сессий, single sign-on и ротацией паролей','Обязательный','Обязательный','Обязательный','Обязательный',4,10),
('req-012','Проверка образов контейнеров на уязвимости перед деплоем','tech-001','tech-dom-005','Все контейнерные образы сканируются на CVE в CI/CD-пайплайне. Образы с критическими уязвимостями (CVSS ≥ 9.0) не деплоятся в Prod/ProdLike. Образы из неверифицированных реестров запрещены. Используется только подписанные (cosign) образы.','Техническое','Высокий','% образов без критических CVE в Prod = 100%; % подписанных образов = 100%','Автоматическая блокировка деплоя в CI через Trivy/Snyk при CVSS >= 9.0; отчёт еженедельно',ARRAY['container','vulnerability','scanning','ci-cd','supply-chain'],'1.1.0','В разработке','SLSA Level 2, NIST SSDF',ARRAY['Prod','ProdLike','Stage','Test','Dev'],ARRAY['Стадия деплоя'],'Container security scanner (Trivy/Snyk) и инструмент подписи образов (cosign/Notary v2)','Обязательный','Рекомендуемый','Обязательный','Рекомендуемый',3,7),
('req-013','Сетевая сегментация и Zero Trust межсервисное взаимодействие','tech-001','tech-dom-018','Микросервисы взаимодействуют только по явно разрешённым маршрутам через service mesh (mTLS). Неявное взаимодействие между namespace и между зонами безопасности запрещено. Network Policies Kubernetes настроены по принципу deny-by-default.','Техническое','Высокий','% межсервисного трафика через mTLS = 100%; % namespace с default-deny = 100%','Автоматическая проверка Network Policies через kube-bench; трафик-анализ через service mesh dashboard',ARRAY['zero-trust','network','segmentation','mtls','service-mesh'],'1.0.0','В разработке','NIST SP 800-207, CIS K8s Benchmark',ARRAY['Prod','ProdLike','Stage'],ARRAY['Стадия дизайн','Стадия деплоя'],'Service mesh с поддержкой mTLS (Istio/Linkerd) и управлением сертификатами','Обязательный','Обязательный','Обязательный','Обязательный',3,9),
('req-014','Политика паролей: минимальные требования к сложности','tech-001','tech-dom-007','Пароли пользователей должны содержать не менее 12 символов, включать буквы верхнего/нижнего регистра, цифры и спецсимволы. Запрещено повторное использование последних 12 паролей. Максимальный срок действия пароля — 90 дней для пользователей, 30 дней для сервисных учёток.','Организационное','Средний','% учётных записей, соответствующих политике паролей = 100%','Автоматическая проверка через Identity Provider API еженедельно; анализ отчёта AD/LDAP',ARRAY['password','policy','identity','ldap'],'1.0.0','Активен','NIST SP 800-63B, CIS Controls #5',ARRAY['Prod','ProdLike','Stage','Test'],ARRAY['Стадия рантайм'],'IAM-система с настраиваемой политикой паролей и историей паролей','Обязательный','Обязательный','Обязательный','Обязательный',2,5),
('req-015','Защита API от несанкционированного доступа через OAuth 2.0 + OIDC','tech-001','tech-dom-007','Все внешние и внутренние API-endpoints с доступом к данным пользователей или бизнес-логике защищены OAuth 2.0 access-токенами. Токены имеют срок жизни ≤ 15 минут для access-tokens. OIDC используется для аутентификации end-users. Публичные endpoints задокументированы и явно разрешены.','Безопасность','Критический','% API-endpoints с OAuth-защитой ≥ 100%; TTL access_token ≤ 15 мин','Автосканирование API-спецификации (OpenAPI) на наличие защиты; проверка TTL через интроспекцию токенов',ARRAY['oauth2','oidc','api','token','authz'],'2.0.0','Активен','OAuth 2.1 draft, OWASP API Security Top 10',ARRAY['Prod','ProdLike','Stage'],ARRAY['Стадия дизайн','Стадия деплоя','Стадия рантайм'],'Authorization Server с поддержкой OAuth 2.0/OIDC; API Gateway для централизованной аутентификации','Обязательный','Обязательный','Обязательный','Рекомендуемый',4,9),
('req-016','test_1','tech-001',NULL,'Test','Техническое','Средний','','',ARRAY[]::text[],'1.0.0','В разработке','',ARRAY['Prod'],ARRAY['Стадия рантайм'],'','Не требуется','Не требуется','Не требуется','Не требуется',1,1)
ON CONFLICT (id) DO NOTHING;

-- ── tech_solutions ───────────────────────────────────────────
INSERT INTO tech_solutions (id,name,version,owner,status,description,tags,technology_ids,approved_ib,approved_it,related_solution_ids,attachments,author) VALUES
('tech-prod-001','Аутентификация микросервисов через JWT + OAuth 2.0','2.1.0','Отдел ИБ','В разработке','Комплексное решение для аутентификации и авторизации в микросервисной архитектуре. Использует JWT для stateless токенов и OAuth 2.0 для делегирования прав доступа между сервисами.',ARRAY['аутентификация','микросервисы','jwt','oauth'],ARRAY['tech-022','tech-009','tech-002','tech-001','tech-003','tech-004'],true,false,'[]','[]',''),
('tech-prod-002','Шифрование данных в покое — AES + HSM','1.3.0','Команда платформы','Активен','Решение для шифрования чувствительных данных на уровне хранилища. AES-256 для данных, HSM для управления ключами шифрования и операций подписи.',ARRAY['шифрование','hsm','aes','ключи'],ARRAY['tech-007','tech-025'],false,false,'[]','[]',''),
('tech-prod-003','Контроль привилегированного доступа (PAM + HashiCorp Vault)','1.0.0','SOC','В разработке','Централизованное решение для управления привилегированными учётными записями. PAM для сессионного контроля, Vault для динамических секретов и временных токенов.',ARRAY['pam','vault','привилегированный-доступ','секреты'],ARRAY['tech-023','tech-014'],false,false,'[]','[]',''),
('tech-prod-004','Федеративная идентификация LDAP + OIDC','3.0.1','Отдел ИБ','Активен','Единая точка аутентификации через корпоративный LDAP/AD с поддержкой современного протокола OIDC для интеграции с облачными приложениями.',ARRAY['ldap','oidc','sso','федерация'],ARRAY['tech-019','tech-003'],false,false,'[]','[]',''),
('tech-prod-005','Обнаружение угроз — EDR + IDS/IPS + SIEM','1.5.0','SOC','Активен','Многоуровневое решение для обнаружения и реагирования на угрозы. EDR на конечных точках, IDS/IPS на периметре сети, централизованный SIEM для корреляции событий.',ARRAY['edr','ids','ips','siem','угрозы'],ARRAY['tech-017','tech-024'],false,false,'[]','[]',''),
('tech-prod-006','Защита от утечек данных — DLP + PAM','2.0.0','Отдел ИБ','Активен','Комплексная защита от несанкционированного выноса данных. DLP-система контролирует исходящие потоки, PAM ограничивает привилегированный доступ к критичным хранилищам.',ARRAY['dlp','данные','утечки','контроль'],ARRAY['tech-022','tech-023'],false,false,'[]','[]',''),
('tech-prod-007','Безопасная контейнеризация — Kubernetes + MFA','1.2.0','DevSecOps','В разработке','Политики безопасности для контейнерной инфраструктуры Kubernetes: RBAC, сетевые политики, сканирование образов, а также MFA для доступа к кластеру.',ARRAY['kubernetes','k8s','контейнеры','devsecops'],ARRAY['tech-013','tech-009'],false,false,'[]','[]',''),
('tech-prod-008','Ролевое управление доступом — RBAC + ABAC','2.2.0','Архитектурный комитет','Активен','Гибридная модель управления доступом: RBAC для стандартных ролей, ABAC для тонкой настройки политик на основе атрибутов пользователя, ресурса и контекста.',ARRAY['rbac','abac','доступ','политики'],ARRAY['tech-005','tech-009'],false,false,'[]','[]',''),
('tech-prod-009','Honeypot-ловушки и обманные технологии','0.9.0','Red Team','Архив','Устаревшее решение на основе honeypot-ловушек для выявления внутренних угроз и атак нулевого дня. Заменено современной платформой Deception.',ARRAY['honeypot','deception','red-team','ловушки'],ARRAY['tech-021'],false,false,'[]','[]',''),
('tech-prod-010','Многофакторная аутентификация для пользователей','4.0.0','Отдел ИБ','Активен','Стандартизированное решение MFA для всех внутренних пользователей и подрядчиков. Поддержка TOTP, FIDO2/WebAuthn и push-уведомлений. Обязательно для доступа к production.',ARRAY['mfa','2fa','totp','webauthn','аутентификация'],ARRAY['tech-009','tech-001'],false,false,'[]','[]',''),
('tech-prod-011','ввввв','1.0.0','ввв','В разработке','ввв',ARRAY[]::text[],ARRAY['tech-009','tech-019','tech-013'],true,true,'[]','[]','')
ON CONFLICT (id) DO NOTHING;

-- ── arch_templates ───────────────────────────────────────────
INSERT INTO arch_templates (id,name,description,status,author,version,tags,tech_solution_ids,approved_ib,approved_it,diagrams) VALUES
('ArchSec-001','цуцу','цуцуц','В разработке','цуцу','1.0.0',ARRAY['цу'],ARRAY['tech-prod-007','tech-prod-001'],true,true,'[{"id":"diag-1774687783368","name":"Диаграмма 1","content":"pie title NETFLIX\n         \"Time spent looking for movie\" : 90\n         \"Time spent watching it\" : 10"},{"id":"diag-1774687834601","name":"Диаграмма 2","content":"sequenceDiagram\n    Alice ->> Bob: Hello Bob, how are you?\n    Bob-->>John: How about you John?\n    Bob--x Alice: I am good thanks!\n    Bob-x John: I am good thanks!\n    Note right of John: Bob thinks a long<br/>long time, so long<br/>that the text does<br/>not fit on a row.\n\n    Bob-->Alice: Checking with John...\n    Alice->John: Yes... John, how are you?"}]'::jsonb),
('ArchSec-002','tttt','tttt','В разработке','tttt','1.0.0',ARRAY[]::text[],ARRAY['tech-prod-001'],true,false,'[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- SecureArch Platform — начальная схема БД
-- Выполняется автоматически при первом старте PostgreSQL-контейнера

CREATE TABLE IF NOT EXISTS requirements (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(20)  NOT NULL UNIQUE,
    title       TEXT         NOT NULL,
    category    VARCHAR(100),
    level       VARCHAR(20)  CHECK (level IN ('Критический','Высокий','Средний','Низкий')),
    standard    VARCHAR(100),
    description TEXT,
    status      VARCHAR(30)  DEFAULT 'Новый',
    created_at  TIMESTAMPTZ  DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
    id           SERIAL PRIMARY KEY,
    requirement_id INT REFERENCES requirements(id) ON DELETE SET NULL,
    event_type   VARCHAR(50),
    description  TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Тестовые данные
INSERT INTO requirements (code, title, category, level, standard, description) VALUES
  ('ИБ-001', 'Управление доступом и идентификация',  'Аутентификация',    'Критический', 'ГОСТ Р 57580', 'МФА для привилегированных пользователей'),
  ('ИБ-002', 'Шифрование данных при хранении',       'Криптография',      'Высокий',     'ГОСТ Р 34.12', 'ГОСТ-шифрование для ПДн'),
  ('ИБ-003', 'Мониторинг и журналирование событий',  'Мониторинг',        'Высокий',     'PCI DSS 4.0',  'Хранение журналов не менее 12 месяцев'),
  ('ИБ-004', 'Сегментация сети',                     'Сетевая безопасность','Высокий',   'ISO 27001',    'Разделение на сегменты с контролем трафика'),
  ('ИБ-005', 'Управление уязвимостями',               'Патч-менеджмент',   'Средний',     'NIST CSF',     'Устранение критических уязвимостей за 30 дней'),
  ('ИБ-006', 'Резервное копирование данных',          'Непрерывность',     'Средний',     'ГОСТ Р 57580', 'Резервные копии с проверкой восстановления')
ON CONFLICT (code) DO NOTHING;

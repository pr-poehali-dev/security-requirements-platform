-- tech_solutions: Технические решения (привязаны к нескольким технологиям)
CREATE TABLE IF NOT EXISTS t_p90536134_security_requirement.tech_solutions (
    id           text NOT NULL PRIMARY KEY,
    name         text NOT NULL,
    version      text NOT NULL DEFAULT '',
    owner        text NOT NULL DEFAULT '',
    status       text NOT NULL DEFAULT 'В разработке',
    description  text NOT NULL DEFAULT '',
    tags         text[] NOT NULL DEFAULT '{}',
    technology_ids text[] NOT NULL DEFAULT '{}',
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now()
);

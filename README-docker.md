# SecureArch — локальная разработка

Полный стек запускается одной командой через Docker Compose: PostgreSQL + Backend API + Frontend с hot-reload.

---

## Требования

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — установлен и запущен
- Свободные порты: **5173** (фронтенд), **8000** (API), **5432** (БД)

---

## Быстрый старт

```bash
# 1. Склонируй или скачай код (Скачать → Скачать код) и распакуй
git clone <repo-url>
cd <project-folder>

# 2. Собери и запусти всё
docker compose up --build
```

Открой браузер: **http://localhost:5173**

> Первый запуск: 3–5 минут (сборка образов + инициализация БД).
> Повторный запуск без изменений — 20–30 секунд.

---

## Адреса сервисов

| Сервис   | Адрес                    | Описание                                  |
|----------|--------------------------|-------------------------------------------|
| Frontend | http://localhost:5173    | React SPA с hot-reload (Vite dev server)  |
| Backend  | http://localhost:8000    | Python FastAPI, все API-эндпоинты         |
| Database | localhost:5432           | PostgreSQL 16, БД `securearch`            |

---

## Переключение в локальный режим в браузере

По умолчанию приложение обращается к **облачному API** (poehali.dev).
Чтобы переключить на локальный Docker-бэкенд — открой в браузере консоль (F12) и выполни:

```js
localStorage.setItem('sa_apiMode', 'local');
localStorage.setItem('sa_localBase', 'http://localhost:8000');
location.reload();
```

Чтобы вернуться к облаку:

```js
localStorage.removeItem('sa_apiMode');
localStorage.removeItem('sa_localBase');
location.reload();
```

---

## Тестовые данные

БД инициализируется автоматически при первом запуске из миграций в `db_migrations/`:

| Раздел                    | Примерное количество |
|---------------------------|----------------------|
| Организационные домены    | 5                    |
| Технические домены        | 20                   |
| Технологии ИБ             | 25                   |
| Требования безопасности   | 16                   |
| Технические решения       | 11                   |
| Типовые архитектуры       | 2 (с Mermaid-диаграммами) |

---

## Структура файлов

```
docker-compose.yml        — оркестрация: db → api → frontend
Dockerfile.frontend       — Vite dev server (Node 20 + bun)
backend/Dockerfile        — Python 3.11 + uvicorn --reload
backend/main.py           — FastAPI-роутер
db_migrations/            — SQL-миграции (применяются при старте)
docker/init-schema.sql    — начальная схема БД
docker/run-migrations.sh  — скрипт применения миграций
src/config/endpoints.ts   — конфигурация API URL (cloud / local)
```

---

## Полезные команды

```bash
# Запустить в фоновом режиме
docker compose up -d --build

# Логи всех сервисов
docker compose logs -f

# Логи конкретного сервиса
docker compose logs -f api
docker compose logs -f frontend
docker compose logs -f db

# Остановить (данные сохраняются)
docker compose down

# Полный сброс — удалить контейнеры И данные БД
docker compose down -v

# Пересобрать после изменений кода
docker compose up --build
```

---

## Hot-reload

Frontend перезагружается автоматически при изменении файлов в `src/` и `public/` — тома примонтированы как read-only внутрь контейнера.

Backend перезапускается автоматически при изменении файлов в `backend/` — uvicorn запущен с флагом `--reload`, том примонтирован как `/app`.

---

## Возможные проблемы

**Порт уже занят**
```bash
# Найти что занимает порт (macOS/Linux)
lsof -i :5173
lsof -i :8000

# Альтернатива — изменить порт в docker-compose.yml:
# ports: "3000:5173"  → фронтенд откроется на http://localhost:3000
```

**БД пустая / миграции не применились**
```bash
docker compose down -v   # удалить volume с данными БД
docker compose up --build
```

**Бэкенд не стартует — ошибка подключения к БД**
```bash
docker compose logs api
# Обычно причина: db ещё не готова. Попробуй:
docker compose restart api
```

**Изменения в src/ не подхватываются**

Убедись, что используешь `docker compose up --build` (не просто `up`) после изменений в `Dockerfile.frontend` или `package.json`.
Изменения в `src/` применяются автоматически без пересборки.

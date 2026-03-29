# Локальная разработка — SecureArch Platform

Полное руководство по запуску всего стека (Frontend + Backend + PostgreSQL) на локальной машине.

---

## Архитектура локального стека

```
Browser (localhost:5173)
    └── Vite Dev Server  [Frontend / React]
            │
            └── HTTP запросы → FastAPI (localhost:8000)
                    │   /domains
                    │   /tech-domains
                    │   /technologies
                    │   /requirements
                    │   /tech-solutions
                    │   /hardening
                    │   /arch-templates
                    │   /products
                    │   /db-check
                    │
                    └── PostgreSQL (localhost:5432)
                            database: securearch
                            schema:   t_p90536134_security_requirement
```

---

## Способ 1 — Docker Compose (рекомендуется)

Запускает сразу всё: БД + миграции + бэкенд + фронтенд.

### Требования
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ≥ 24.x
- docker-compose ≥ 2.x (входит в Docker Desktop)

### Запуск

```bash
# Клонируем / переходим в папку проекта
cd securearch

# Собираем образы и запускаем все сервисы
docker compose up --build
```

После старта:
| Сервис | URL |
|---|---|
| Frontend (React) | http://localhost:5173 |
| Backend API (FastAPI) | http://localhost:8000 |
| API docs (Swagger) | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |

### Остановка

```bash
docker compose down          # остановить, данные БД сохраняются
docker compose down -v       # остановить + удалить данные БД (volume pg_data)
```

### Пересборка после изменений в зависимостях

```bash
# При изменении package.json, requirements.txt, Dockerfile
docker compose up --build
```

Изменения в `src/` и `backend/` подхватываются автоматически (hot-reload, volume mount).

---

## Способ 2 — Ручной запуск (без Docker)

Подходит, если Docker нет или нужен более гибкий контроль.

### Требования
- Node.js ≥ 20.x + [bun](https://bun.sh) (или npm)
- Python 3.11
- PostgreSQL 15–16 (локально или в Docker)

---

### Шаг 1 — PostgreSQL

Вариант А — запустить только БД через Docker:

```bash
docker run -d \
  --name securearch_db \
  -e POSTGRES_DB=securearch \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16-alpine
```

Вариант Б — использовать уже установленный PostgreSQL:

```bash
psql -U postgres -c "CREATE DATABASE securearch;"
```

---

### Шаг 2 — Применить миграции

```bash
# Создаём схему
psql -U postgres -d securearch \
  -c "CREATE SCHEMA IF NOT EXISTS t_p90536134_security_requirement;"

# Применяем все миграции по порядку
for f in $(ls db_migrations/*.sql | sort); do
  echo "Applying $f..."
  psql -U postgres -d securearch -f "$f"
done
```

На Windows (PowerShell):

```powershell
psql -U postgres -d securearch -c "CREATE SCHEMA IF NOT EXISTS t_p90536134_security_requirement;"

Get-ChildItem db_migrations\*.sql | Sort-Object Name | ForEach-Object {
    Write-Host "Applying $_"
    psql -U postgres -d securearch -f $_.FullName
}
```

---

### Шаг 3 — Backend (FastAPI)

```bash
cd backend

# Создаём виртуальное окружение
python3.11 -m venv .venv
source .venv/bin/activate        # Linux/macOS
# .venv\Scripts\activate         # Windows

# Устанавливаем зависимости
pip install -r requirements.txt

# Прописываем переменную окружения для подключения к БД
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/securearch"
# Windows PowerShell: $env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/securearch"

# Запускаем сервер с hot-reload
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Проверка работы:
```bash
curl http://localhost:8000/
# → {"status":"ok","mode":"local",...}

curl http://localhost:8000/api/health/db
# → {"connected":true,"version":"PostgreSQL 16..."}
```

Swagger UI с описанием всех эндпоинтов: http://localhost:8000/docs

---

### Шаг 4 — Frontend (Vite + React)

```bash
cd ..   # возвращаемся в корень проекта

# Устанавливаем зависимости
bun install      # или: npm install

# Запускаем dev-сервер
bun run dev      # или: npm run dev
```

Frontend будет доступен на http://localhost:5173

---

## Переключение режима API (Cloud ↔ Local)

Фронтенд поддерживает два режима работы, переключаемых в настройках приложения:

| Режим | Где работает | URL бэкенда |
|---|---|---|
| `local` | локальная машина | `http://localhost:8000/<функция>` |
| `cloud` | production (poehali.dev) | `https://functions.poehali.dev/...` |

Режим хранится в `localStorage` (ключ `sa_apiMode`). По умолчанию — `local`.

Изменить базовый URL локального бэкенда можно через настройки в UI или напрямую в браузере:
```js
// В консоли браузера (F12)
localStorage.setItem("sa_apiMode", "local")
localStorage.setItem("sa_localBase", "http://localhost:8000")
```

---

## Переменные окружения

### Backend (`backend/.env.example`)

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/securearch
APP_ENV=local
SECRET_KEY=change_me_in_production
```

Для запуска вне Docker создайте файл `backend/.env` на основе примера:
```bash
cp backend/.env.example backend/.env
```

При запуске через Docker переменные уже прописаны в `docker-compose.yml` и `.env` создавать не нужно.

---

## Структура проекта

```
securearch/
├── src/                        # Frontend (React + TypeScript + Vite)
│   ├── App.tsx
│   ├── pages/Index.tsx         # главная страница
│   └── config/endpoints.ts     # конфигурация API URL
│
├── backend/                    # Backend (Python 3.11 + FastAPI)
│   ├── main.py                 # точка входа, регистрирует все роуты
│   ├── requirements.txt        # зависимости Python
│   ├── Dockerfile              # образ для Docker
│   ├── domains/index.py        # функция /domains
│   ├── tech-domains/index.py   # функция /tech-domains
│   ├── technologies/index.py   # функция /technologies
│   ├── requirements/index.py   # функция /requirements
│   ├── tech-solutions/index.py # функция /tech-solutions
│   ├── hardening/index.py      # функция /hardening
│   ├── arch-templates/index.py # функция /arch-templates
│   ├── products/index.py       # функция /products
│   └── db-check/index.py       # функция /db-check
│
├── db_migrations/              # SQL-миграции (Flyway-стиль, V0001–V0018)
│
├── docker/
│   ├── init-schema.sql         # создание схемы БД
│   └── run-migrations.sh       # скрипт применения миграций при старте контейнера
│
├── docker-compose.yml          # оркестрация всего стека
├── Dockerfile.frontend         # образ для фронтенда
└── localDEV.md                 # этот файл
```

---

## Добавление новой миграции

```bash
# Узнать последний номер
ls db_migrations/ | sort | tail -1
# → V0018__create_products.sql

# Создать новый файл с инкрементированным номером
touch db_migrations/V0019__my_change.sql
```

Применить миграцию вручную (без пересоздания контейнера):
```bash
psql -U postgres -d securearch -f db_migrations/V0019__my_change.sql
```

При следующем `docker compose up` от нуля миграция применится автоматически.

---

## Добавление новой backend-функции

1. Создать папку `backend/<название>/`
2. Создать `index.py` с функцией `handler(event: dict, context) -> dict`
3. При необходимости добавить `requirements.txt` в папку функции
4. Добавить название функции в список `FUNCTIONS` в `backend/main.py`
5. Добавить URL в `src/config/endpoints.ts` (тип `EndpointKey` и объект `CLOUD_URLS`)

---

## Типичные проблемы

### Порт 5432 уже занят

```bash
# Найти процесс
lsof -i :5432        # macOS/Linux
netstat -ano | findstr 5432   # Windows

# Или изменить порт в docker-compose.yml
ports:
  - "5433:5432"   # локальный порт 5433 → контейнер 5432
# и обновить DATABASE_URL: ...@localhost:5433/securearch
```

### Контейнер бэкенда стартует раньше БД

Docker Compose настроен с `healthcheck` — бэкенд ждёт готовности PostgreSQL (`pg_isready`). Если всё равно падает, увеличьте `retries` в `docker-compose.yml`.

### Фронтенд не видит бэкенд (CORS, сетевые ошибки)

Убедитесь, что в UI выставлен режим `local` и базовый URL совпадает с адресом бэкенда:
```
http://localhost:8000
```

### Сброс базы данных

```bash
docker compose down -v          # удалить volume с данными
docker compose up --build       # пересоздать с чистыми миграциями
```

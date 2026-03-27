# SecureArch Platform — Локальный запуск через Docker

## Требования

| Инструмент | Версия |
|---|---|
| Docker Desktop | 4.x+ |
| Docker Compose | v2.x+ (входит в Docker Desktop) |
| Git | любая |

---

## Структура проекта

```
securearch/
├── docker-compose.yml        # оркестрация всех сервисов
├── Dockerfile.frontend       # сборка React-приложения
├── backend/
│   ├── Dockerfile            # сборка Python-бэкенда
│   ├── main.py               # точка входа FastAPI
│   ├── requirements.txt      # зависимости Python
│   ├── .env.example          # пример переменных окружения
│   └── migrations/
│       └── 001_init.sql      # начальная схема БД (применяется автоматически)
└── src/                      # React-фронтенд
```

---

## Быстрый старт

### 1. Клонировать репозиторий

```bash
git clone <url-репозитория>
cd securearch
```

### 2. Запустить все сервисы

```bash
docker compose up --build
```

Первый запуск займёт 2–4 минуты (скачивание образов и установка зависимостей).

### 3. Открыть приложение

| Сервис | URL |
|---|---|
| Фронтенд | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |

---

## Подключение к базе данных

### Через интерфейс платформы

В правом верхнем углу нажмите кнопку со статусом БД и введите:

| Поле | Значение |
|---|---|
| Хост | `localhost` |
| Порт | `5432` |
| База данных | `securearch` |
| Пользователь | `postgres` |
| Пароль | `postgres` |

### Внешняя PostgreSQL (облако / продакшн)

Замените значение `DATABASE_URL` в `docker-compose.yml`:

```yaml
environment:
  DATABASE_URL: postgresql://user:password@your-host:5432/your-db
```

Или создайте файл `backend/.env` (скопируйте из `backend/.env.example`) и укажите реальные данные.

---

## Управление сервисами

```bash
# Запуск в фоне
docker compose up -d --build

# Остановка
docker compose down

# Остановка с удалением данных БД
docker compose down -v

# Просмотр логов
docker compose logs -f

# Логи конкретного сервиса
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# Пересборка одного сервиса
docker compose up --build frontend
```

---

## Подключение к БД через pgAdmin или DBeaver

```
Host:     localhost
Port:     5432
Database: securearch
User:     postgres
Password: postgres
```

---

## Переменные окружения

### Backend (`backend/.env`)

| Переменная | По умолчанию | Описание |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@db:5432/securearch` | Строка подключения к БД |
| `APP_ENV` | `local` | Окружение (`local`, `staging`, `production`) |
| `SECRET_KEY` | `change_me_in_production` | Секретный ключ приложения |

### Frontend

| Переменная | По умолчанию | Описание |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | URL Backend API |

---

## Миграции БД

Файлы в `backend/migrations/*.sql` выполняются **автоматически** при первом старте PostgreSQL-контейнера.

Для ручного применения миграций:

```bash
docker compose exec db psql -U postgres -d securearch -f /docker-entrypoint-initdb.d/001_init.sql
```

---

## Решение проблем

**Порт уже занят**
```bash
# Найти процесс на порту
lsof -i :5432
# или
netstat -ano | findstr :5432   # Windows
```

**Контейнер не запускается — проблема с зависимостями**
```bash
docker compose down
docker compose build --no-cache
docker compose up
```

**Сбросить базу данных**
```bash
docker compose down -v
docker compose up --build
```

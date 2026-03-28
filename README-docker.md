# SecureArch — запуск в Docker Desktop

## Требования

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) установлен и запущен
- Порты **80** и **8000** свободны на локальной машине

---

## Быстрый старт

```bash
# 1. Скачай код проекта (Скачать → Скачать код) и распакуй, или клонируй репозиторий
git clone <repo-url>
cd <project-folder>

# 2. Собери и запусти
docker compose up --build
```

Открой браузер: **http://localhost**

> Первый запуск занимает 2–3 минуты: собирается фронтенд и бэкенд, инициализируется БД.

---

## Что разворачивается

| Сервис   | Адрес                 | Описание                               |
|----------|-----------------------|----------------------------------------|
| Frontend | http://localhost      | React SPA (nginx, собранный бандл)     |
| Backend  | http://localhost:8000 | Python FastAPI + все API-хендлеры      |
| Database | localhost:5432        | PostgreSQL 16 с тестовыми данными      |

### Тестовые данные в базе

БД инициализируется автоматически при первом запуске (`docker/init.sql`):

| Раздел                | Количество |
|-----------------------|------------|
| Организационные домены | 5         |
| Технические домены    | 20         |
| Технологии ИБ         | 25         |
| Требования безопасности | 16       |
| Технические решения   | 11         |
| Типовые архитектуры   | 2 (с Mermaid-диаграммами) |

---

## Структура Docker-файлов

```
docker-compose.yml      — оркестрация: db → backend → frontend
Dockerfile.frontend     — multistage: bun build → nginx serve
backend/Dockerfile      — Python 3.11 + uvicorn
backend/main.py         — FastAPI-роутер Lambda-хендлеров
docker/init.sql         — схема БД + все тестовые данные
```

---

## Полезные команды

```bash
# Запустить в фоне
docker compose up -d --build

# Логи всех сервисов
docker compose logs -f

# Логи конкретного сервиса
docker compose logs -f backend
docker compose logs -f frontend

# Остановить
docker compose down

# Полный сброс (включая данные БД)
docker compose down -v

# Пересобрать после изменений кода
docker compose up --build
```

---

## Переключение между локальным и облачным режимами

По умолчанию в Docker приложение использует **локальную БД**.

`VITE_API_BASE` встраивается в JS-бандл на этапе `docker build`.
Чтобы изменить адрес API — отредактируй `args` в `docker-compose.yml`:

```yaml
frontend:
  build:
    args:
      VITE_API_BASE: http://localhost:8000   # ← адрес бэкенда
```

Если `VITE_API_BASE` не задан (запуск без Docker, `bun run dev`) —
приложение автоматически использует облако (poehali.dev).

---

## Возможные проблемы

**Порт 80 занят**
```bash
# Найти что занимает порт (macOS/Linux)
lsof -i :80
# Изменить порт в docker-compose.yml:
#   ports: "8080:80"   → открывать на http://localhost:8080
```

**БД не инициализировалась (пустые данные)**
```bash
docker compose down -v   # удалить volume с данными
docker compose up --build
```

**Бэкенд не стартует**
```bash
docker compose logs backend
```

# Запуск SecureArch в Docker Desktop

## Требования
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) установлен и запущен

## Быстрый старт

```bash
# 1. Клонируй репозиторий (или скачай через Скачать → Скачать код)
git clone <repo-url>
cd <project-folder>

# 2. Собери и запусти все сервисы
docker compose up --build
```

Открой браузер: **http://localhost:5173**

---

## Что запускается

| Сервис    | Адрес                  | Описание                        |
|-----------|------------------------|---------------------------------|
| Frontend  | http://localhost:5173  | React-приложение (Vite)         |
| Backend   | http://localhost:8000  | Python API (FastAPI)            |
| Database  | localhost:5432         | PostgreSQL 16                   |

---

## Структура Docker

```
docker-compose.yml        — оркестрация сервисов
Dockerfile.frontend       — сборка фронтенда
backend/Dockerfile        — сборка бэкенда
backend/main.py           — HTTP-роутер Lambda-хендлеров
docker/init.sql           — начальная схема и демо-данные БД
```

---

## Полезные команды

```bash
# Запустить в фоне
docker compose up -d --build

# Посмотреть логи
docker compose logs -f

# Остановить
docker compose down

# Удалить данные БД (сброс)
docker compose down -v
```

---

## Переключение между облаком и локальным режимом

Приложение автоматически выбирает источник данных:
- **Без `VITE_API_BASE`** → данные берутся из облака (poehali.dev)
- **С `VITE_API_BASE=http://localhost:8000`** → данные берутся из локальной БД

В Docker это настроено автоматически через `docker-compose.yml`.

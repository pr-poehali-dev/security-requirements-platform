#!/bin/bash
# Применяем все SQL-миграции из /docker-entrypoint-initdb.d/migrations/ в порядке имён

set -e

MIGRATIONS_DIR="/docker-entrypoint-initdb.d/migrations"

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "[migrations] Папка $MIGRATIONS_DIR не найдена, пропускаем"
  exit 0
fi

echo "[migrations] Применяю миграции из $MIGRATIONS_DIR ..."

for file in $(ls "$MIGRATIONS_DIR"/*.sql 2>/dev/null | sort); do
  echo "[migrations] --> $file"
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$file"
done

echo "[migrations] Готово."

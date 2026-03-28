FROM python:3.11-slim

WORKDIR /app

# Системные зависимости для psycopg2
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем зависимости Python
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Копируем исходники
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

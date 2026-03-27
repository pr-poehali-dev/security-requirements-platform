"""
SecureArch Platform — Backend API
Точка входа для локального запуска через Docker или напрямую.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(
    title="SecureArch API",
    description="Платформа управления требованиями ИБ",
    version="0.1.0-MVP",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health():
    return {
        "status": "ok",
        "version": "0.1.0-MVP",
        "db": os.environ.get("DATABASE_URL", "not configured").split("@")[-1],
    }


@app.get("/api/health/db")
def db_health():
    import psycopg2
    dsn = os.environ.get("DATABASE_URL")
    if not dsn:
        return {"connected": False, "error": "DATABASE_URL not set"}
    try:
        conn = psycopg2.connect(dsn)
        conn.close()
        return {"connected": True}
    except Exception as e:
        return {"connected": False, "error": str(e)}

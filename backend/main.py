"""
SecureArch Platform — Backend API
Точка входа для локального запуска через Docker.

Каждая cloud-функция (handler) оборачивается в FastAPI-роут.
Все маршруты: /<function-name>  (GET / POST / PUT / DELETE / PATCH / OPTIONS)
"""
import importlib.util
import os
import sys

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

# ── Список функций ─────────────────────────────────────────────────
FUNCTIONS = [
    "domains",
    "tech-domains",
    "technologies",
    "requirements",
    "tech-solutions",
    "hardening",
    "arch-templates",
    "products",
    "db-check",
]

app = FastAPI(
    title="SecureArch API",
    description="Платформа управления требованиями ИБ — локальный режим",
    version="0.1.0-local",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Вспомогательные функции ────────────────────────────────────────

class _FakeContext:
    request_id = "local"

CTX = _FakeContext()


async def to_lambda_event(request: Request) -> dict:
    """Преобразует FastAPI Request в формат AWS Lambda event."""
    body_bytes = await request.body()
    body_str = body_bytes.decode("utf-8") if body_bytes else None
    return {
        "httpMethod": request.method,
        "headers": dict(request.headers),
        "queryStringParameters": dict(request.query_params) or None,
        "body": body_str,
        "isBase64Encoded": False,
    }


def lambda_to_response(result: dict) -> Response:
    """Преобразует Lambda-ответ в FastAPI Response."""
    status = result.get("statusCode", 200)
    headers = {k: v for k, v in (result.get("headers") or {}).items()}
    body = result.get("body", "")
    return Response(content=body, status_code=status, headers=headers, media_type="application/json")


def load_handler(folder: str):
    """Загружает handler из папки с дефисами в имени через importlib."""
    base_dir = os.path.dirname(__file__)
    fn_path = os.path.join(base_dir, folder)
    # Добавляем папку функции в sys.path для корректных внутренних импортов
    if fn_path not in sys.path:
        sys.path.insert(0, fn_path)
    spec = importlib.util.spec_from_file_location(
        f"fn_{folder.replace('-', '_')}",
        os.path.join(fn_path, "index.py"),
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.handler


def make_route(handler_fn):
    """Фабрика: создаёт async endpoint-функцию для FastAPI."""
    async def route(request: Request):
        event = await to_lambda_event(request)
        result = handler_fn(event, CTX)
        return lambda_to_response(result)
    return route


# ── Регистрация роутов ─────────────────────────────────────────────

METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]

for fn_name in FUNCTIONS:
    try:
        _handler = load_handler(fn_name)
        _route = make_route(_handler)
        _route.__name__ = fn_name.replace("-", "_")
        app.add_api_route(f"/{fn_name}", _route, methods=METHODS)
    except Exception as e:
        print(f"[WARN] Не удалось загрузить функцию '{fn_name}': {e}")


# ── Health check ───────────────────────────────────────────────────

@app.get("/")
def health():
    db_url = os.environ.get("DATABASE_URL", "not configured")
    return {
        "status": "ok",
        "mode": "local",
        "version": "0.1.0-local",
        "db": db_url.split("@")[-1] if "@" in db_url else db_url,
        "routes": [f"/{fn}" for fn in FUNCTIONS],
    }


@app.get("/api/health/db")
def db_health():
    import psycopg2
    dsn = os.environ.get("DATABASE_URL")
    if not dsn:
        return {"connected": False, "error": "DATABASE_URL not set"}
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        cur.execute("SELECT version()")
        ver = cur.fetchone()[0]
        conn.close()
        return {"connected": True, "version": ver}
    except Exception as e:
        return {"connected": False, "error": str(e)}
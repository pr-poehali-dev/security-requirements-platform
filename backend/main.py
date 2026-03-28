"""
Локальный HTTP-сервер для запуска Lambda-хендлеров в Docker.
Маршрутизирует запросы к handler() каждого модуля.
Папки с дефисами импортируются через importlib.
"""
import importlib.util
import os
import sys
from pathlib import Path

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

BASE = Path(__file__).parent


def load_handler(folder: str):
    """Загружает handler из папки backend/<folder>/index.py."""
    module_name = folder.replace("-", "_") + "_handler"
    spec = importlib.util.spec_from_file_location(
        module_name, BASE / folder / "index.py"
    )
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    return module.handler


domains_handler      = load_handler("domains")
tech_domains_handler = load_handler("tech-domains")
technologies_handler = load_handler("technologies")
requirements_handler = load_handler("requirements")
tech_solutions_handler = load_handler("tech-solutions")
hardening_handler    = load_handler("hardening")
arch_templates_handler = load_handler("arch-templates")
products_handler     = load_handler("products")
db_check_handler     = load_handler("db-check")

app = FastAPI(title="SecureArch Local API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class FakeContext:
    request_id = "local-dev"


async def invoke(handler_fn, request: Request) -> Response:
    body_bytes = await request.body()
    body_str = body_bytes.decode("utf-8") if body_bytes else None

    event = {
        "httpMethod": request.method,
        "headers": dict(request.headers),
        "queryStringParameters": dict(request.query_params) or None,
        "body": body_str,
        "isBase64Encoded": False,
        "requestContext": {
            "identity": {
                "sourceIp": request.client.host if request.client else "127.0.0.1"
            }
        },
    }

    result = handler_fn(event, FakeContext())

    status_code = result.get("statusCode", 200)
    headers = {
        k: v for k, v in result.get("headers", {}).items()
        if k.lower() != "content-length"
    }
    body = result.get("body", "")

    return Response(
        content=body,
        status_code=status_code,
        headers=headers,
        media_type="application/json",
    )


METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]


@app.api_route("/api/domains", methods=METHODS)
async def route_domains(request: Request):
    return await invoke(domains_handler, request)


@app.api_route("/api/tech-domains", methods=METHODS)
async def route_tech_domains(request: Request):
    return await invoke(tech_domains_handler, request)


@app.api_route("/api/technologies", methods=METHODS)
async def route_technologies(request: Request):
    return await invoke(technologies_handler, request)


@app.api_route("/api/requirements", methods=METHODS)
async def route_requirements(request: Request):
    return await invoke(requirements_handler, request)


@app.api_route("/api/tech-solutions", methods=METHODS)
async def route_tech_solutions(request: Request):
    return await invoke(tech_solutions_handler, request)


@app.api_route("/api/hardening", methods=METHODS)
async def route_hardening(request: Request):
    return await invoke(hardening_handler, request)


@app.api_route("/api/arch-templates", methods=METHODS)
async def route_arch_templates(request: Request):
    return await invoke(arch_templates_handler, request)


@app.api_route("/api/products", methods=METHODS)
async def route_products(request: Request):
    return await invoke(products_handler, request)


@app.api_route("/api/db-check", methods=["GET", "OPTIONS"])
async def route_db_check(request: Request):
    return await invoke(db_check_handler, request)


@app.get("/health")
async def health():
    return {"status": "ok"}

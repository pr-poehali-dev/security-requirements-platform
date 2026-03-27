"""
CRUD для организационных доменов безопасности.
GET /          — список всех доменов + описание раздела
POST /         — создать домен
PUT /          — обновить домен (передать id в теле)
DELETE /       — удалить домен (передать id в теле)
PATCH /settings — обновить настройки раздела (section_description)
"""
import json
import os
import psycopg2

SCHEMA = "t_p90536134_security_requirement"
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def ok(data):
    return {"statusCode": 200, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(data, default=str)}


def err(msg, code=400):
    return {"statusCode": code, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps({"error": msg})}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/").rstrip("/")
    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    conn = get_conn()
    cur = conn.cursor()

    try:
        # GET — список доменов + описание раздела
        if method == "GET":
            cur.execute(
                f"SELECT id, name, version, owner, status, description, created_at, updated_at "
                f"FROM {SCHEMA}.org_domains ORDER BY created_at"
            )
            rows = cur.fetchall()
            cols = ["id", "name", "version", "owner", "status", "description", "created_at", "updated_at"]
            domains = [dict(zip(cols, r)) for r in rows]

            cur.execute(
                f"SELECT value FROM {SCHEMA}.section_settings WHERE key = 'domains_section_description'"
            )
            row = cur.fetchone()
            section_desc = row[0] if row else ""
            return ok({"domains": domains, "section_description": section_desc})

        # PATCH /settings — обновить описание раздела
        if method == "PATCH" and "settings" in path:
            desc = body.get("section_description", "")
            cur.execute(
                f"INSERT INTO {SCHEMA}.section_settings (key, value) VALUES ('domains_section_description', %s) "
                f"ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
                (desc,)
            )
            conn.commit()
            return ok({"section_description": desc})

        # POST — создать домен
        if method == "POST":
            d = body
            if not d.get("id") or not d.get("name"):
                return err("Поля id и name обязательны")
            cur.execute(
                f"INSERT INTO {SCHEMA}.org_domains (id, name, version, owner, status, description) "
                f"VALUES (%s, %s, %s, %s, %s, %s) RETURNING id, name, version, owner, status, description, created_at, updated_at",
                (d["id"], d["name"], d.get("version", "1.0.0"), d.get("owner", ""), d.get("status", "В разработке"), d.get("description", ""))
            )
            row = cur.fetchone()
            conn.commit()
            cols = ["id", "name", "version", "owner", "status", "description", "created_at", "updated_at"]
            return ok(dict(zip(cols, row)))

        # PUT — обновить домен
        if method == "PUT":
            d = body
            if not d.get("id"):
                return err("Поле id обязательно")
            cur.execute(
                f"UPDATE {SCHEMA}.org_domains SET name=%s, version=%s, owner=%s, status=%s, description=%s, updated_at=NOW() "
                f"WHERE id=%s RETURNING id, name, version, owner, status, description, created_at, updated_at",
                (d["name"], d.get("version", "1.0.0"), d.get("owner", ""), d.get("status", "В разработке"), d.get("description", ""), d["id"])
            )
            row = cur.fetchone()
            if not row:
                return err("Домен не найден", 404)
            conn.commit()
            cols = ["id", "name", "version", "owner", "status", "description", "created_at", "updated_at"]
            return ok(dict(zip(cols, row)))

        # DELETE — удалить домен
        if method == "DELETE":
            domain_id = body.get("id")
            if not domain_id:
                return err("Поле id обязательно")
            cur.execute(f"DELETE FROM {SCHEMA}.org_domains WHERE id=%s RETURNING id", (domain_id,))
            row = cur.fetchone()
            if not row:
                return err("Домен не найден", 404)
            conn.commit()
            return ok({"deleted": domain_id})

        return err("Метод не поддерживается", 405)

    finally:
        cur.close()
        conn.close()

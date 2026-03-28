"""
Technologies API — CRUD для технологий ИБ (JWT, OAuth 2.0, шифрование и т.д.)

GET    /            — список технологий + список tech_domains + section_description
POST   /            — создать технологию
PUT    /            — обновить технологию (id в теле)
DELETE /            — удалить технологию (id в теле)
PATCH  /settings    — обновить section_description
GET    /names       — список всех названий технологий (для валидации)
"""

import json
import os
import psycopg2

SCHEMA = "t_p90536134_security_requirement"
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Auth-Token, X-Session-Id",
}
COLS = ["id", "name", "status", "description", "versions", "tech_domain_ids", "tags", "attachments", "created_at", "updated_at"]


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def ok(data):
    return {"statusCode": 200, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(data, default=str)}


def err(msg, code=400):
    return {"statusCode": code, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps({"error": msg})}


def row_to_dict(row):
    d = dict(zip(COLS, row))
    d["versions"] = d.get("versions") or []
    d["tech_domain_ids"] = d.get("tech_domain_ids") or []
    d["tags"] = d.get("tags") or []
    d["attachments"] = d.get("attachments") or []
    return d


def handler(event: dict, context) -> dict:
    """CRUD технологий ИБ."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/").rstrip("/")
    body = json.loads(event.get("body") or "{}")

    conn = get_conn()
    cur = conn.cursor()

    try:
        # GET ?mode=names — список имён для валидации
        qs = event.get("queryStringParameters") or {}
        if method == "GET" and (qs.get("mode") == "names" or "names" in path):
            cur.execute(f"SELECT id, name FROM {SCHEMA}.technologies ORDER BY name")
            rows = [{"id": r[0], "name": r[1]} for r in cur.fetchall()]
            return ok({"names": rows})

        # PATCH ?mode=settings
        if method == "PATCH" and (qs.get("mode") == "settings" or "settings" in path):
            desc = body.get("section_description", "")
            cur.execute(
                f"INSERT INTO {SCHEMA}.section_settings (key, value) VALUES ('technologies_section_description', %s) "
                f"ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
                (desc,)
            )
            conn.commit()
            return ok({"section_description": desc})

        # GET /
        if method == "GET":
            cur.execute(
                f"SELECT id, name, status, description, versions, tech_domain_ids, tags, attachments, created_at, updated_at "
                f"FROM {SCHEMA}.technologies ORDER BY created_at"
            )
            items = [row_to_dict(r) for r in cur.fetchall()]

            cur.execute(f"SELECT id, name FROM {SCHEMA}.tech_domains ORDER BY name")
            tech_domains = [{"id": r[0], "name": r[1]} for r in cur.fetchall()]

            cur.execute(f"SELECT value FROM {SCHEMA}.section_settings WHERE key = 'technologies_section_description'")
            row = cur.fetchone()
            section_description = row[0] if row else ""

            return ok({"items": items, "tech_domains": tech_domains, "section_description": section_description})

        # POST /
        if method == "POST":
            d = body
            if not d.get("id") or not d.get("name"):
                return err("Поля id и name обязательны")

            cur.execute(f"SELECT id FROM {SCHEMA}.technologies WHERE LOWER(name) = LOWER(%s)", (d["name"],))
            if cur.fetchone():
                return err(f"Технология «{d['name']}» уже существует")

            cur.execute(
                f"INSERT INTO {SCHEMA}.technologies (id, name, status, description, versions, tech_domain_ids, tags, attachments) "
                f"VALUES (%s, %s, %s, %s, %s, %s, %s, %s) "
                f"RETURNING id, name, status, description, versions, tech_domain_ids, tags, attachments, created_at, updated_at",
                (
                    d["id"], d["name"],
                    d.get("status", "В разработке"),
                    d.get("description", ""),
                    d.get("versions", []),
                    d.get("tech_domain_ids", []),
                    d.get("tags", []),
                    json.dumps(d.get("attachments", [])),
                )
            )
            conn.commit()
            return ok(row_to_dict(cur.fetchone()))

        # PUT /
        if method == "PUT":
            d = body
            if not d.get("id"):
                return err("Поле id обязательно")

            cur.execute(
                f"SELECT id FROM {SCHEMA}.technologies WHERE LOWER(name) = LOWER(%s) AND id != %s",
                (d["name"], d["id"])
            )
            if cur.fetchone():
                return err(f"Технология «{d['name']}» уже существует")

            cur.execute(
                f"UPDATE {SCHEMA}.technologies SET "
                f"name=%s, status=%s, description=%s, versions=%s, tech_domain_ids=%s, tags=%s, attachments=%s, updated_at=NOW() "
                f"WHERE id=%s "
                f"RETURNING id, name, status, description, versions, tech_domain_ids, tags, attachments, created_at, updated_at",
                (
                    d["name"],
                    d.get("status", "В разработке"),
                    d.get("description", ""),
                    d.get("versions", []),
                    d.get("tech_domain_ids", []),
                    d.get("tags", []),
                    json.dumps(d.get("attachments", [])),
                    d["id"],
                )
            )
            row = cur.fetchone()
            if not row:
                return err("Технология не найдена", 404)
            conn.commit()
            return ok(row_to_dict(row))

        # DELETE /
        if method == "DELETE":
            tech_id = body.get("id")
            if not tech_id:
                return err("Поле id обязательно")
            cur.execute(f"DELETE FROM {SCHEMA}.technologies WHERE id=%s RETURNING id", (tech_id,))
            if not cur.fetchone():
                return err("Технология не найдена", 404)
            conn.commit()
            return ok({"deleted": tech_id})

        return err("Метод не поддерживается", 405)

    finally:
        cur.close()
        conn.close()
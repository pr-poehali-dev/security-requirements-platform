"""
Tech Solutions API — CRUD для технических решений.

GET    /            — список + section_description
POST   /            — создать
PUT    /            — обновить (id в теле)
DELETE /            — удалить (id в теле)
PATCH  /?mode=settings — обновить section_description
"""

import json
import os
import psycopg2

SCHEMA = os.environ.get("DB_SCHEMA", "t_p90536134_security_requirement")
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Auth-Token, X-Session-Id",
}
COLS = [
    "id", "name", "description", "status", "author", "version",
    "tags", "technology_ids", "tech_domain", "approved_ib", "approved_it",
    "related_solution_ids", "attachments", "created_at", "updated_at",
]


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def ok(data):
    return {"statusCode": 200, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(data, default=str)}


def err(msg, code=400):
    return {"statusCode": code, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps({"error": msg})}


def row_to_dict(row):
    d = dict(zip(COLS, row))
    d["tags"] = d.get("tags") or []
    d["technology_ids"] = d.get("technology_ids") or []
    d["related_solution_ids"] = d.get("related_solution_ids") or []
    d["attachments"] = d.get("attachments") or []
    d["approved_ib"] = bool(d.get("approved_ib"))
    d["approved_it"] = bool(d.get("approved_it"))
    return d


def handler(event: dict, context) -> dict:
    """CRUD технических решений."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    qs = event.get("queryStringParameters") or {}
    body = json.loads(event.get("body") or "{}")

    conn = get_conn()
    cur = conn.cursor()

    try:
        sel = (
            "id, name, description, status, author, version, tags, technology_ids, "
            "tech_domain, approved_ib, approved_it, related_solution_ids, attachments, "
            "created_at, updated_at"
        )

        # PATCH ?mode=settings
        if method == "PATCH" and qs.get("mode") == "settings":
            desc = body.get("section_description", "")
            cur.execute(
                f"INSERT INTO {SCHEMA}.tech_solutions_settings (key, value) VALUES ('section_description', %s) "
                f"ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
                (desc,)
            )
            conn.commit()
            return ok({"section_description": desc})

        # GET /
        if method == "GET":
            cur.execute(f"SELECT {sel} FROM {SCHEMA}.tech_solutions ORDER BY created_at")
            items = [row_to_dict(r) for r in cur.fetchall()]

            cur.execute(f"SELECT value FROM {SCHEMA}.tech_solutions_settings WHERE key = 'section_description'")
            row = cur.fetchone()
            section_description = row[0] if row else ""

            return ok({"items": items, "section_description": section_description})

        # POST /
        if method == "POST":
            d = body
            if not d.get("id") or not d.get("name"):
                return err("Поля id и name обязательны")

            cur.execute(f"SELECT id FROM {SCHEMA}.tech_solutions WHERE id = %s", (d["id"],))
            if cur.fetchone():
                return err(f"Решение с ID «{d['id']}» уже существует")

            cur.execute(
                f"INSERT INTO {SCHEMA}.tech_solutions "
                f"(id, name, description, status, author, version, tags, technology_ids, tech_domain, "
                f"approved_ib, approved_it, related_solution_ids, attachments) "
                f"VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) "
                f"RETURNING {sel}",
                (
                    d["id"], d["name"],
                    d.get("description", ""),
                    d.get("status", "В разработке"),
                    d.get("author", ""),
                    d.get("version", "1.0.0"),
                    d.get("tags", []),
                    d.get("technology_ids", []),
                    d.get("tech_domain", ""),
                    bool(d.get("approved_ib", False)),
                    bool(d.get("approved_it", False)),
                    d.get("related_solution_ids", []),
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
                f"UPDATE {SCHEMA}.tech_solutions SET "
                f"name=%s, description=%s, status=%s, author=%s, version=%s, tags=%s, "
                f"technology_ids=%s, tech_domain=%s, approved_ib=%s, approved_it=%s, "
                f"related_solution_ids=%s, attachments=%s, updated_at=NOW() "
                f"WHERE id=%s RETURNING {sel}",
                (
                    d["name"],
                    d.get("description", ""),
                    d.get("status", "В разработке"),
                    d.get("author", ""),
                    d.get("version", "1.0.0"),
                    d.get("tags", []),
                    d.get("technology_ids", []),
                    d.get("tech_domain", ""),
                    bool(d.get("approved_ib", False)),
                    bool(d.get("approved_it", False)),
                    d.get("related_solution_ids", []),
                    json.dumps(d.get("attachments", [])),
                    d["id"],
                )
            )
            row = cur.fetchone()
            conn.commit()
            if not row:
                return err("Решение не найдено", 404)
            return ok(row_to_dict(row))

        # DELETE /
        if method == "DELETE":
            sol_id = body.get("id")
            if not sol_id:
                return err("Поле id обязательно")
            cur.execute(f"DELETE FROM {SCHEMA}.tech_solutions WHERE id = %s", (sol_id,))
            conn.commit()
            return ok({"deleted": sol_id})

        return err("Метод не поддерживается", 405)

    finally:
        cur.close()
        conn.close()
"""
CRUD для технических доменов безопасности.
GET /          — список tech_domains + org_domains + описание раздела
POST /         — создать tech domain
PUT /          — обновить tech domain (id в теле)
DELETE /       — удалить tech domain (id в теле)
PATCH /settings — обновить section_description
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
COLS = ["id", "name", "version", "owner", "status", "tags", "description",
        "org_domain_ids", "created_at", "updated_at"]


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def ok(data):
    return {
        "statusCode": 200,
        "headers": {**CORS, "Content-Type": "application/json"},
        "body": json.dumps(data, default=str),
    }


def err(msg, code=400):
    return {
        "statusCode": code,
        "headers": {**CORS, "Content-Type": "application/json"},
        "body": json.dumps({"error": msg}),
    }


def row_to_dict(row):
    d = dict(zip(COLS, row))
    d["tags"] = d.get("tags") or []
    d["org_domain_ids"] = d.get("org_domain_ids") or []
    return d


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
        # GET — все tech_domains + все org_domains для связки + описание раздела
        if method == "GET":
            cur.execute(
                f"SELECT id, name, version, owner, status, tags, description, "
                f"org_domain_ids, created_at, updated_at "
                f"FROM {SCHEMA}.tech_domains ORDER BY created_at"
            )
            tech_domains = [row_to_dict(r) for r in cur.fetchall()]

            cur.execute(
                f"SELECT id, name, status FROM {SCHEMA}.org_domains ORDER BY name"
            )
            org_domains = [{"id": r[0], "name": r[1], "status": r[2]} for r in cur.fetchall()]

            cur.execute(
                f"SELECT value FROM {SCHEMA}.section_settings "
                f"WHERE key = 'tech_domains_section_description'"
            )
            row = cur.fetchone()
            section_desc = row[0] if row else ""

            return ok({
                "tech_domains": tech_domains,
                "org_domains": org_domains,
                "section_description": section_desc,
            })

        # PATCH ?mode=settings
        qs = event.get("queryStringParameters") or {}
        if method == "PATCH" and (qs.get("mode") == "settings" or "settings" in path):
            desc = body.get("section_description", "")
            cur.execute(
                f"INSERT INTO {SCHEMA}.section_settings (key, value) "
                f"VALUES ('tech_domains_section_description', %s) "
                f"ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
                (desc,)
            )
            conn.commit()
            return ok({"section_description": desc})

        # POST — создать
        if method == "POST":
            d = body
            if not d.get("id") or not d.get("name"):
                return err("Поля id и name обязательны")

            # Проверка уникальности имени
            cur.execute(
                f"SELECT id FROM {SCHEMA}.tech_domains WHERE LOWER(name) = LOWER(%s)",
                (d["name"],)
            )
            if cur.fetchone():
                return err(f"Технический домен с названием «{d['name']}» уже существует")

            cur.execute(
                f"INSERT INTO {SCHEMA}.tech_domains "
                f"(id, name, version, owner, status, tags, description, org_domain_ids) "
                f"VALUES (%s, %s, %s, %s, %s, %s, %s, %s) "
                f"RETURNING id, name, version, owner, status, tags, description, "
                f"org_domain_ids, created_at, updated_at",
                (
                    d["id"], d["name"],
                    d.get("version", "1.0.0"),
                    d.get("owner", ""),
                    d.get("status", "В разработке"),
                    d.get("tags", []),
                    d.get("description", ""),
                    d.get("org_domain_ids", []),
                )
            )
            conn.commit()
            return ok(row_to_dict(cur.fetchone()))

        # PUT — обновить
        if method == "PUT":
            d = body
            if not d.get("id"):
                return err("Поле id обязательно")

            # Проверка уникальности имени (исключаем текущую запись)
            cur.execute(
                f"SELECT id FROM {SCHEMA}.tech_domains "
                f"WHERE LOWER(name) = LOWER(%s) AND id != %s",
                (d["name"], d["id"])
            )
            if cur.fetchone():
                return err(f"Технический домен с названием «{d['name']}» уже существует")

            cur.execute(
                f"UPDATE {SCHEMA}.tech_domains SET "
                f"name=%s, version=%s, owner=%s, status=%s, tags=%s, "
                f"description=%s, org_domain_ids=%s, updated_at=NOW() "
                f"WHERE id=%s "
                f"RETURNING id, name, version, owner, status, tags, description, "
                f"org_domain_ids, created_at, updated_at",
                (
                    d["name"], d.get("version", "1.0.0"), d.get("owner", ""),
                    d.get("status", "В разработке"), d.get("tags", []),
                    d.get("description", ""), d.get("org_domain_ids", []),
                    d["id"],
                )
            )
            row = cur.fetchone()
            if not row:
                return err("Домен не найден", 404)
            conn.commit()
            return ok(row_to_dict(row))

        # DELETE
        if method == "DELETE":
            domain_id = body.get("id")
            if not domain_id:
                return err("Поле id обязательно")
            cur.execute(
                f"DELETE FROM {SCHEMA}.tech_domains WHERE id=%s RETURNING id",
                (domain_id,)
            )
            if not cur.fetchone():
                return err("Домен не найден", 404)
            conn.commit()
            return ok({"deleted": domain_id})

        return err("Метод не поддерживается", 405)

    finally:
        cur.close()
        conn.close()
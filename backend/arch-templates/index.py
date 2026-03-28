"""Управление шаблонами типовых архитектур безопасности — CRUD + настройки раздела."""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Auth-Token",
        "Content-Type": "application/json",
    }


def handler(event: dict, context) -> dict:
    """Обработчик CRUD для шаблонов типовых архитектур."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": ""}

    method = event.get("httpMethod", "GET")
    qs = event.get("queryStringParameters") or {}
    mode = qs.get("mode", "")
    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # ── Settings mode ────────────────────────────────────────────────────
    if mode == "settings":
        if method == "PATCH":
            desc = body.get("section_description", "")
            cur.execute(
                "UPDATE arch_templates_settings SET value = %s WHERE key = 'section_description'",
                (desc,)
            )
            conn.commit()
            cur.close(); conn.close()
            return {"statusCode": 200, "headers": cors_headers(),
                    "body": json.dumps({"section_description": desc})}

    # ── List ─────────────────────────────────────────────────────────────
    if method == "GET":
        cur.execute("SELECT * FROM arch_templates ORDER BY created_at DESC")
        items = [dict(r) for r in cur.fetchall()]
        for item in items:
            item["created_at"] = item["created_at"].isoformat() if item.get("created_at") else None
            item["updated_at"] = item["updated_at"].isoformat() if item.get("updated_at") else None
            item["diagrams"] = item.get("diagrams") or []
            item["tech_solution_ids"] = item.get("tech_solution_ids") or []
            item["tags"] = item.get("tags") or []

        cur.execute("SELECT value FROM arch_templates_settings WHERE key = 'section_description'")
        row = cur.fetchone()
        section_description = row["value"] if row else ""
        cur.close(); conn.close()
        return {"statusCode": 200, "headers": cors_headers(),
                "body": json.dumps({"items": items, "section_description": section_description})}

    # ── Create ───────────────────────────────────────────────────────────
    if method == "POST":
        tid = body.get("id", "").strip()
        name = body.get("name", "").strip()
        if not tid or not name:
            cur.close(); conn.close()
            return {"statusCode": 400, "headers": cors_headers(),
                    "body": json.dumps({"error": "ID и название обязательны"})}

        cur.execute("SELECT id FROM arch_templates WHERE name = %s", (name,))
        if cur.fetchone():
            cur.close(); conn.close()
            return {"statusCode": 400, "headers": cors_headers(),
                    "body": json.dumps({"error": "Шаблон с таким названием уже существует"})}

        cur.execute(
            """INSERT INTO arch_templates
               (id, name, description, status, author, version, tags,
                tech_solution_ids, approved_ib, approved_it, diagrams)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
               RETURNING *""",
            (
                tid, name,
                body.get("description", ""),
                body.get("status", "В разработке"),
                body.get("author", ""),
                body.get("version", "1.0.0"),
                body.get("tags", []),
                body.get("tech_solution_ids", []),
                body.get("approved_ib", False),
                body.get("approved_it", False),
                json.dumps(body.get("diagrams", [])),
            )
        )
        conn.commit()
        item = dict(cur.fetchone())
        item["created_at"] = item["created_at"].isoformat() if item.get("created_at") else None
        item["updated_at"] = item["updated_at"].isoformat() if item.get("updated_at") else None
        item["diagrams"] = item.get("diagrams") or []
        cur.close(); conn.close()
        return {"statusCode": 200, "headers": cors_headers(), "body": json.dumps(item)}

    # ── Update ───────────────────────────────────────────────────────────
    if method == "PUT":
        tid = body.get("id", "").strip()
        name = body.get("name", "").strip()
        if not tid or not name:
            cur.close(); conn.close()
            return {"statusCode": 400, "headers": cors_headers(),
                    "body": json.dumps({"error": "ID и название обязательны"})}

        cur.execute("SELECT id FROM arch_templates WHERE name = %s AND id != %s", (name, tid))
        if cur.fetchone():
            cur.close(); conn.close()
            return {"statusCode": 400, "headers": cors_headers(),
                    "body": json.dumps({"error": "Шаблон с таким названием уже существует"})}

        cur.execute(
            """UPDATE arch_templates SET
               name=%s, description=%s, status=%s, author=%s, version=%s,
               tags=%s, tech_solution_ids=%s, approved_ib=%s, approved_it=%s,
               diagrams=%s, updated_at=NOW()
               WHERE id=%s RETURNING *""",
            (
                name,
                body.get("description", ""),
                body.get("status", "В разработке"),
                body.get("author", ""),
                body.get("version", "1.0.0"),
                body.get("tags", []),
                body.get("tech_solution_ids", []),
                body.get("approved_ib", False),
                body.get("approved_it", False),
                json.dumps(body.get("diagrams", [])),
                tid,
            )
        )
        conn.commit()
        item = dict(cur.fetchone())
        item["created_at"] = item["created_at"].isoformat() if item.get("created_at") else None
        item["updated_at"] = item["updated_at"].isoformat() if item.get("updated_at") else None
        item["diagrams"] = item.get("diagrams") or []
        cur.close(); conn.close()
        return {"statusCode": 200, "headers": cors_headers(), "body": json.dumps(item)}

    # ── Delete ───────────────────────────────────────────────────────────
    if method == "DELETE":
        tid = qs.get("id", "").strip()
        if not tid:
            cur.close(); conn.close()
            return {"statusCode": 400, "headers": cors_headers(),
                    "body": json.dumps({"error": "ID обязателен"})}
        cur.execute("DELETE FROM arch_templates WHERE id = %s", (tid,))
        conn.commit()
        cur.close(); conn.close()
        return {"statusCode": 200, "headers": cors_headers(), "body": json.dumps({"ok": True})}

    cur.close(); conn.close()
    return {"statusCode": 405, "headers": cors_headers(), "body": json.dumps({"error": "Method not allowed"})}

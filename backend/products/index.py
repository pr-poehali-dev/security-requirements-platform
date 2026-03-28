"""Управление бизнес-продуктами — CRUD + настройки раздела."""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def cors():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Auth-Token",
        "Content-Type": "application/json",
    }


def serialize(item: dict) -> dict:
    item["created_at"] = item["created_at"].isoformat() if item.get("created_at") else None
    item["updated_at"] = item["updated_at"].isoformat() if item.get("updated_at") else None
    item["diagrams"] = item.get("diagrams") or []
    item["arch_template_ids"] = item.get("arch_template_ids") or []
    item["tags"] = item.get("tags") or []
    return item


def handler(event: dict, context) -> dict:
    """Обработчик CRUD для бизнес-продуктов."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors(), "body": ""}

    method = event.get("httpMethod", "GET")
    qs = event.get("queryStringParameters") or {}
    body = json.loads(event["body"]) if event.get("body") else {}

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # ── Settings ─────────────────────────────────────────────────────
    if qs.get("mode") == "settings":
        if method == "PATCH":
            desc = body.get("section_description", "")
            cur.execute("UPDATE products_settings SET value=%s WHERE key='section_description'", (desc,))
            conn.commit()
            cur.close(); conn.close()
            return {"statusCode": 200, "headers": cors(), "body": json.dumps({"section_description": desc})}

    # ── List ─────────────────────────────────────────────────────────
    if method == "GET":
        cur.execute("SELECT * FROM products ORDER BY created_at DESC")
        items = [serialize(dict(r)) for r in cur.fetchall()]
        cur.execute("SELECT value FROM products_settings WHERE key='section_description'")
        row = cur.fetchone()
        desc = row["value"] if row else ""
        cur.close(); conn.close()
        return {"statusCode": 200, "headers": cors(),
                "body": json.dumps({"items": items, "section_description": desc})}

    # ── Create ───────────────────────────────────────────────────────
    if method == "POST":
        pid = body.get("id", "").strip()
        name = body.get("name", "").strip()
        if not pid or not name:
            cur.close(); conn.close()
            return {"statusCode": 400, "headers": cors(), "body": json.dumps({"error": "ID и название обязательны"})}
        cur.execute("SELECT id FROM products WHERE name=%s", (name,))
        if cur.fetchone():
            cur.close(); conn.close()
            return {"statusCode": 400, "headers": cors(), "body": json.dumps({"error": "Продукт с таким названием уже существует"})}
        cur.execute(
            """INSERT INTO products (id,name,description,status,author,version,cmdb_mnemonic,
               tags,arch_template_ids,approved_ib,approved_it,image_url,diagrams)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING *""",
            (pid, name,
             body.get("description",""), body.get("status","В разработке"),
             body.get("author",""), body.get("version","1.0.0"),
             body.get("cmdb_mnemonic",""),
             body.get("tags",[]), body.get("arch_template_ids",[]),
             body.get("approved_ib",False), body.get("approved_it",False),
             body.get("image_url",""), json.dumps(body.get("diagrams",[])))
        )
        conn.commit()
        item = serialize(dict(cur.fetchone()))
        cur.close(); conn.close()
        return {"statusCode": 200, "headers": cors(), "body": json.dumps(item)}

    # ── Update ───────────────────────────────────────────────────────
    if method == "PUT":
        pid = body.get("id", "").strip()
        name = body.get("name", "").strip()
        if not pid or not name:
            cur.close(); conn.close()
            return {"statusCode": 400, "headers": cors(), "body": json.dumps({"error": "ID и название обязательны"})}
        cur.execute("SELECT id FROM products WHERE name=%s AND id!=%s", (name, pid))
        if cur.fetchone():
            cur.close(); conn.close()
            return {"statusCode": 400, "headers": cors(), "body": json.dumps({"error": "Продукт с таким названием уже существует"})}
        cur.execute(
            """UPDATE products SET name=%s,description=%s,status=%s,author=%s,version=%s,
               cmdb_mnemonic=%s,tags=%s,arch_template_ids=%s,approved_ib=%s,approved_it=%s,
               image_url=%s,diagrams=%s,updated_at=NOW() WHERE id=%s RETURNING *""",
            (name, body.get("description",""), body.get("status","В разработке"),
             body.get("author",""), body.get("version","1.0.0"),
             body.get("cmdb_mnemonic",""),
             body.get("tags",[]), body.get("arch_template_ids",[]),
             body.get("approved_ib",False), body.get("approved_it",False),
             body.get("image_url",""), json.dumps(body.get("diagrams",[])), pid)
        )
        conn.commit()
        item = serialize(dict(cur.fetchone()))
        cur.close(); conn.close()
        return {"statusCode": 200, "headers": cors(), "body": json.dumps(item)}

    # ── Delete ───────────────────────────────────────────────────────
    if method == "DELETE":
        pid = qs.get("id","").strip()
        if not pid:
            cur.close(); conn.close()
            return {"statusCode": 400, "headers": cors(), "body": json.dumps({"error": "ID обязателен"})}
        cur.execute("DELETE FROM products WHERE id=%s", (pid,))
        conn.commit()
        cur.close(); conn.close()
        return {"statusCode": 200, "headers": cors(), "body": json.dumps({"ok": True})}

    cur.close(); conn.close()
    return {"statusCode": 405, "headers": cors(), "body": json.dumps({"error": "Method not allowed"})}

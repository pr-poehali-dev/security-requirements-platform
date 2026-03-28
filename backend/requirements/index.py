"""
Requirements API — CRUD для требований безопасности.

GET    /            — список требований + технологии + тех.домены + section_description
POST   /            — создать требование
PUT    /            — обновить требование (id в теле)
DELETE /            — удалить требование (id в теле)
PATCH  /settings    — обновить section_description
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
    "id", "name", "technology_id", "tech_domain_id", "description",
    "req_type", "criticality", "control_metric", "control_description",
    "tags", "version", "status", "norm_doc_link", "environments", "stages",
    "procurement", "ext_with_iod", "ext_without_iod", "int_with_iod", "int_without_iod",
    "score_value", "score_weight", "created_at", "updated_at",
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
    d["environments"] = d.get("environments") or []
    d["stages"] = d.get("stages") or []
    return d


def handler(event: dict, context) -> dict:
    """CRUD требований безопасности."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    qs = event.get("queryStringParameters") or {}
    body = json.loads(event.get("body") or "{}")

    conn = get_conn()
    cur = conn.cursor()

    try:
        # PATCH ?mode=settings
        if method == "PATCH" and qs.get("mode") == "settings":
            desc = body.get("section_description", "")
            cur.execute(
                f"INSERT INTO {SCHEMA}.section_settings (key, value) VALUES ('requirements_section_description', %s) "
                f"ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
                (desc,)
            )
            conn.commit()
            return ok({"section_description": desc})

        # GET /
        if method == "GET":
            cur.execute(
                f"SELECT {', '.join(COLS)} FROM {SCHEMA}.requirements ORDER BY created_at"
            )
            items = [row_to_dict(r) for r in cur.fetchall()]

            cur.execute(f"SELECT id, name FROM {SCHEMA}.technologies ORDER BY name")
            technologies = [{"id": r[0], "name": r[1]} for r in cur.fetchall()]

            cur.execute(f"SELECT id, name FROM {SCHEMA}.tech_domains ORDER BY name")
            tech_domains = [{"id": r[0], "name": r[1]} for r in cur.fetchall()]

            cur.execute(f"SELECT value FROM {SCHEMA}.section_settings WHERE key = 'requirements_section_description'")
            row = cur.fetchone()
            section_description = row[0] if row else ""

            return ok({
                "items": items,
                "technologies": technologies,
                "tech_domains": tech_domains,
                "section_description": section_description,
            })

        # POST /
        if method == "POST":
            d = body
            if not d.get("id") or not d.get("name"):
                return err("Поля id и name обязательны")

            cur.execute(
                f"INSERT INTO {SCHEMA}.requirements "
                f"(id, name, technology_id, tech_domain_id, description, req_type, criticality, "
                f"control_metric, control_description, tags, version, status, norm_doc_link, "
                f"environments, stages, procurement, ext_with_iod, ext_without_iod, "
                f"int_with_iod, int_without_iod, score_value, score_weight) "
                f"VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) "
                f"RETURNING {', '.join(COLS)}",
                (
                    d["id"], d["name"],
                    d.get("technology_id") or None,
                    d.get("tech_domain_id") or None,
                    d.get("description", ""),
                    d.get("req_type", "Техническое"),
                    d.get("criticality", "Средний"),
                    d.get("control_metric", ""),
                    d.get("control_description", ""),
                    d.get("tags", []),
                    d.get("version", "1.0.0"),
                    d.get("status", "В разработке"),
                    d.get("norm_doc_link", ""),
                    d.get("environments", []),
                    d.get("stages", []),
                    d.get("procurement", ""),
                    d.get("ext_with_iod", "Не требуется"),
                    d.get("ext_without_iod", "Не требуется"),
                    d.get("int_with_iod", "Не требуется"),
                    d.get("int_without_iod", "Не требуется"),
                    int(d.get("score_value", 1)),
                    int(d.get("score_weight", 1)),
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
                f"UPDATE {SCHEMA}.requirements SET "
                f"name=%s, technology_id=%s, tech_domain_id=%s, description=%s, req_type=%s, "
                f"criticality=%s, control_metric=%s, control_description=%s, tags=%s, version=%s, "
                f"status=%s, norm_doc_link=%s, environments=%s, stages=%s, procurement=%s, "
                f"ext_with_iod=%s, ext_without_iod=%s, int_with_iod=%s, int_without_iod=%s, "
                f"score_value=%s, score_weight=%s, updated_at=NOW() "
                f"WHERE id=%s "
                f"RETURNING {', '.join(COLS)}",
                (
                    d["name"],
                    d.get("technology_id") or None,
                    d.get("tech_domain_id") or None,
                    d.get("description", ""),
                    d.get("req_type", "Техническое"),
                    d.get("criticality", "Средний"),
                    d.get("control_metric", ""),
                    d.get("control_description", ""),
                    d.get("tags", []),
                    d.get("version", "1.0.0"),
                    d.get("status", "В разработке"),
                    d.get("norm_doc_link", ""),
                    d.get("environments", []),
                    d.get("stages", []),
                    d.get("procurement", ""),
                    d.get("ext_with_iod", "Не требуется"),
                    d.get("ext_without_iod", "Не требуется"),
                    d.get("int_with_iod", "Не требуется"),
                    d.get("int_without_iod", "Не требуется"),
                    int(d.get("score_value", 1)),
                    int(d.get("score_weight", 1)),
                    d["id"],
                )
            )
            row = cur.fetchone()
            if not row:
                return err("Требование не найдено", 404)
            conn.commit()
            return ok(row_to_dict(row))

        # DELETE /
        if method == "DELETE":
            req_id = body.get("id")
            if not req_id:
                return err("Поле id обязательно")
            cur.execute(f"DELETE FROM {SCHEMA}.requirements WHERE id=%s RETURNING id", (req_id,))
            if not cur.fetchone():
                return err("Требование не найдено", 404)
            conn.commit()
            return ok({"deleted": req_id})

        return err("Метод не поддерживается", 405)

    finally:
        cur.close()
        conn.close()
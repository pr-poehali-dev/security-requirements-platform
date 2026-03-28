"""
Tech Solutions API — CRUD для технических решений

GET    /            — список технических решений + список технологий + список tech_domains
POST   /            — создать техническое решение
PUT    /            — обновить техническое решение (id в теле)
DELETE /            — удалить техническое решение (id в теле)
GET    /full/{id}   — полные данные решения + связанные технологии + требования от них
"""

import json
import os
import psycopg2

SCHEMA = "t_p90536134_security_requirement"
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Auth-Token, X-Session-Id",
}
COLS = [
    "id", "name", "version", "owner", "status", "description",
    "tags", "technology_ids", "tech_domain_ids", "attachments",
    "approved_ib", "approved_it", "created_at", "updated_at"
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
    d["tech_domain_ids"] = d.get("tech_domain_ids") or []
    d["attachments"] = d.get("attachments") or []
    d["approved_ib"] = bool(d.get("approved_ib"))
    d["approved_it"] = bool(d.get("approved_it"))
    return d


def handler(event: dict, context) -> dict:
    """CRUD технических решений."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/").rstrip("/")
    body = json.loads(event.get("body") or "{}")

    conn = get_conn()
    cur = conn.cursor()

    try:
        # GET /full/{id}
        if method == "GET" and "/full/" in path:
            sol_id = path.split("/full/")[-1]

            cur.execute(
                f"SELECT id, name, version, owner, status, description, tags, technology_ids, "
                f"tech_domain_ids, attachments, approved_ib, approved_it, created_at, updated_at "
                f"FROM {SCHEMA}.tech_solutions WHERE id = %s",
                (sol_id,)
            )
            row = cur.fetchone()
            if not row:
                return err("Техническое решение не найдено", 404)
            solution = row_to_dict(row)

            tech_ids = solution.get("technology_ids") or []

            # Технологии
            technologies = []
            if tech_ids:
                placeholders = ",".join(["%s"] * len(tech_ids))
                cur.execute(
                    f"SELECT id, name, status, versions, tags, tech_domain_ids FROM {SCHEMA}.technologies "
                    f"WHERE id IN ({placeholders})",
                    tech_ids
                )
                technologies = [
                    {"id": r[0], "name": r[1], "status": r[2], "versions": r[3] or [], "tags": r[4] or [], "tech_domain_ids": r[5] or []}
                    for r in cur.fetchall()
                ]

            # Требования от связанных технологий
            requirements = []
            if tech_ids:
                placeholders = ",".join(["%s"] * len(tech_ids))
                cur.execute(
                    f"SELECT id, name, technology_id, tech_domain_id, description, req_type, criticality, "
                    f"control_metric, control_description, tags, version, status, norm_doc_link, "
                    f"environments, stages, procurement, "
                    f"ext_with_iod, ext_without_iod, int_with_iod, int_without_iod, "
                    f"score_value, score_weight "
                    f"FROM {SCHEMA}.requirements WHERE technology_id IN ({placeholders}) "
                    f"ORDER BY req_type, criticality",
                    tech_ids
                )
                req_cols = [
                    "id", "name", "technology_id", "tech_domain_id", "description",
                    "req_type", "criticality", "control_metric", "control_description",
                    "tags", "version", "status", "norm_doc_link",
                    "environments", "stages", "procurement",
                    "ext_with_iod", "ext_without_iod", "int_with_iod", "int_without_iod",
                    "score_value", "score_weight"
                ]
                for r in cur.fetchall():
                    d2 = dict(zip(req_cols, r))
                    d2["tags"] = d2.get("tags") or []
                    d2["environments"] = d2.get("environments") or []
                    d2["stages"] = d2.get("stages") or []
                    requirements.append(d2)

            # Технические домены из solution.tech_domain_ids
            sol_domain_ids = solution.get("tech_domain_ids") or []
            sol_domains = []
            if sol_domain_ids:
                placeholders = ",".join(["%s"] * len(sol_domain_ids))
                cur.execute(
                    f"SELECT id, name FROM {SCHEMA}.tech_domains WHERE id IN ({placeholders})",
                    sol_domain_ids
                )
                sol_domains = [{"id": r[0], "name": r[1]} for r in cur.fetchall()]

            return ok({
                "solution": solution,
                "technologies": technologies,
                "requirements": requirements,
                "sol_domains": sol_domains,
            })

        # GET /
        if method == "GET":
            cur.execute(
                f"SELECT id, name, version, owner, status, description, tags, technology_ids, "
                f"tech_domain_ids, attachments, approved_ib, approved_it, created_at, updated_at "
                f"FROM {SCHEMA}.tech_solutions ORDER BY created_at"
            )
            items = [row_to_dict(r) for r in cur.fetchall()]

            cur.execute(f"SELECT id, name, status, versions FROM {SCHEMA}.technologies ORDER BY name")
            technologies = [{"id": r[0], "name": r[1], "status": r[2], "versions": r[3] or []} for r in cur.fetchall()]

            cur.execute(f"SELECT id, name FROM {SCHEMA}.tech_domains ORDER BY name")
            tech_domains = [{"id": r[0], "name": r[1]} for r in cur.fetchall()]

            return ok({"items": items, "technologies": technologies, "tech_domains": tech_domains})

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
                f"(id, name, version, owner, status, description, tags, technology_ids, tech_domain_ids, attachments, approved_ib, approved_it) "
                f"VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) "
                f"RETURNING id, name, version, owner, status, description, tags, technology_ids, "
                f"tech_domain_ids, attachments, approved_ib, approved_it, created_at, updated_at",
                (
                    d["id"], d["name"],
                    d.get("version", ""),
                    d.get("owner", ""),
                    d.get("status", "В разработке"),
                    d.get("description", ""),
                    d.get("tags", []),
                    d.get("technology_ids", []),
                    d.get("tech_domain_ids", []),
                    json.dumps(d.get("attachments", [])),
                    bool(d.get("approved_ib", False)),
                    bool(d.get("approved_it", False)),
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
                f"name=%s, version=%s, owner=%s, status=%s, description=%s, tags=%s, "
                f"technology_ids=%s, tech_domain_ids=%s, attachments=%s, approved_ib=%s, approved_it=%s, updated_at=NOW() "
                f"WHERE id=%s "
                f"RETURNING id, name, version, owner, status, description, tags, technology_ids, "
                f"tech_domain_ids, attachments, approved_ib, approved_it, created_at, updated_at",
                (
                    d["name"],
                    d.get("version", ""),
                    d.get("owner", ""),
                    d.get("status", "В разработке"),
                    d.get("description", ""),
                    d.get("tags", []),
                    d.get("technology_ids", []),
                    d.get("tech_domain_ids", []),
                    json.dumps(d.get("attachments", [])),
                    bool(d.get("approved_ib", False)),
                    bool(d.get("approved_it", False)),
                    d["id"],
                )
            )
            row = cur.fetchone()
            if not row:
                return err("Техническое решение не найдено", 404)
            conn.commit()
            return ok(row_to_dict(row))

        # DELETE /
        if method == "DELETE":
            sol_id = body.get("id")
            if not sol_id:
                return err("Поле id обязательно")
            cur.execute(f"DELETE FROM {SCHEMA}.tech_solutions WHERE id=%s RETURNING id", (sol_id,))
            if not cur.fetchone():
                return err("Техническое решение не найдено", 404)
            conn.commit()
            return ok({"deleted": sol_id})

        return err("Метод не поддерживается", 405)

    finally:
        cur.close()
        conn.close()

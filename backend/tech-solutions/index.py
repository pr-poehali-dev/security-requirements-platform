"""
Tech Solutions API — CRUD для технических решений

GET    /            — список технических решений + список технологий
POST   /            — создать техническое решение
PUT    /            — обновить техническое решение (id в теле)
DELETE /            — удалить техническое решение (id в теле)
GET    /full/{id}   — полные данные решения + требования от связанных технологий
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
COLS = ["id", "name", "version", "owner", "status", "description", "tags", "technology_ids", "created_at", "updated_at"]


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
        # GET /full/{id} — полная карточка решения с требованиями
        if method == "GET" and "/full/" in path:
            sol_id = path.split("/full/")[-1]

            cur.execute(
                f"SELECT id, name, version, owner, status, description, tags, technology_ids, created_at, updated_at "
                f"FROM {SCHEMA}.tech_solutions WHERE id = %s",
                (sol_id,)
            )
            row = cur.fetchone()
            if not row:
                return err("Техническое решение не найдено", 404)
            solution = row_to_dict(row)

            tech_ids = solution.get("technology_ids") or []

            # Получаем данные технологий
            technologies = []
            if tech_ids:
                placeholders = ",".join(["%s"] * len(tech_ids))
                cur.execute(
                    f"SELECT id, name, status, versions, tags FROM {SCHEMA}.technologies "
                    f"WHERE id IN ({placeholders})",
                    tech_ids
                )
                technologies = [
                    {"id": r[0], "name": r[1], "status": r[2], "versions": r[3] or [], "tags": r[4] or []}
                    for r in cur.fetchall()
                ]

            # Получаем требования от связанных технологий
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
                    d = dict(zip(req_cols, r))
                    d["tags"] = d.get("tags") or []
                    d["environments"] = d.get("environments") or []
                    d["stages"] = d.get("stages") or []
                    requirements.append(d)

            return ok({
                "solution": solution,
                "technologies": technologies,
                "requirements": requirements,
            })

        # GET /
        if method == "GET":
            cur.execute(
                f"SELECT id, name, version, owner, status, description, tags, technology_ids, created_at, updated_at "
                f"FROM {SCHEMA}.tech_solutions ORDER BY created_at"
            )
            items = [row_to_dict(r) for r in cur.fetchall()]

            cur.execute(f"SELECT id, name, status, versions FROM {SCHEMA}.technologies ORDER BY name")
            technologies = [{"id": r[0], "name": r[1], "status": r[2], "versions": r[3] or []} for r in cur.fetchall()]

            return ok({"items": items, "technologies": technologies})

        # POST /
        if method == "POST":
            d = body
            if not d.get("id") or not d.get("name"):
                return err("Поля id и name обязательны")

            cur.execute(f"SELECT id FROM {SCHEMA}.tech_solutions WHERE id = %s", (d["id"],))
            if cur.fetchone():
                return err(f"Решение с ID «{d['id']}» уже существует")

            cur.execute(
                f"INSERT INTO {SCHEMA}.tech_solutions (id, name, version, owner, status, description, tags, technology_ids) "
                f"VALUES (%s, %s, %s, %s, %s, %s, %s, %s) "
                f"RETURNING id, name, version, owner, status, description, tags, technology_ids, created_at, updated_at",
                (
                    d["id"], d["name"],
                    d.get("version", ""),
                    d.get("owner", ""),
                    d.get("status", "В разработке"),
                    d.get("description", ""),
                    d.get("tags", []),
                    d.get("technology_ids", []),
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
                f"name=%s, version=%s, owner=%s, status=%s, description=%s, tags=%s, technology_ids=%s, updated_at=NOW() "
                f"WHERE id=%s "
                f"RETURNING id, name, version, owner, status, description, tags, technology_ids, created_at, updated_at",
                (
                    d["name"],
                    d.get("version", ""),
                    d.get("owner", ""),
                    d.get("status", "В разработке"),
                    d.get("description", ""),
                    d.get("tags", []),
                    d.get("technology_ids", []),
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

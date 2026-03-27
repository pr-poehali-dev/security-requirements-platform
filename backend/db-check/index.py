"""
Проверка подключения к внешней PostgreSQL базе данных.
Принимает параметры подключения и возвращает статус соединения.
"""
import json
import os


def handler(event: dict, context) -> dict:
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    try:
        body = json.loads(event.get("body") or "{}")
        host = body.get("host", "localhost")
        port = body.get("port", "5432")
        name = body.get("name", "postgres")
        user = body.get("user", "postgres")
        password = body.get("password", "")

        import psycopg2

        dsn = f"host={host} port={port} dbname={name} user={user} password={password} connect_timeout=5"
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        cursor.close()
        conn.close()

        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({
                "connected": True,
                "version": version,
                "host": host,
                "port": port,
                "database": name,
            }),
        }

    except Exception as e:
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({
                "connected": False,
                "error": str(e),
            }),
        }

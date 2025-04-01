import os
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime, timedelta
from typing import List, Dict

load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("❌ Проверь .env файл: SUPABASE_URL и VITE_SUPABASE_ANON_KEY должны быть указаны.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def insert_parser_results_batch(items: List[Dict]) -> None:
    if not items:
        print("⚠️ Нет данных для вставки.")
        return

    response = supabase.table("parserresults").insert(items).execute()

    if getattr(response, "error", None):
        print("❌ Ошибка при вставке:", response.error)
    else:
        print(f"✅ Успешно вставлено: {len(items)} записей.")


def insert_trending_idea(idea: Dict) -> None:
    response = supabase.table("trendingideas").insert(idea).execute()

    if getattr(response, "error", None):
        print("❌ Ошибка при вставке идеи:", response.error)
    else:
        print("✅ Идея успешно добавлена.")


def insert_many(table: str, items: List[Dict]) -> None:
    if not items:
        print(f"⚠️ Нет данных для вставки в таблицу {table}.")
        return

    response = supabase.table(table).insert(items).execute()

    if getattr(response, "error", None):
        print(f"❌ Ошибка при вставке в {table}:", response.error)
    else:
        print(f"✅ Успешно вставлено: {len(items)} записей в {table}.")


def fetch_existing_links() -> List[str]:
    response = supabase.table("trendingideas").select("title").execute()

    if getattr(response, "error", None):
        print("❌ Ошибка при выборке ссылок:", response.error)
        return []

    return [row["title"] for row in response.data or []]


def fetch_recent_raw_articles(days=14) -> List[Dict]:
    cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()

    response = supabase.table("parserresults") \
        .select("parse_id, extra_info, raw_content, parsed_at") \
        .gte("parsed_at", cutoff) \
        .execute()

    if getattr(response, "error", None):
        print("❌ Ошибка при выборке статей:", response.error)
        return []

    return response.data or []

def fetch_used_parse_ids() -> List[int]:
    response = supabase.table("trendingideas").select("source_parse_id").execute()

    if getattr(response, "error", None):
        print("❌ Ошибка при выборке source_parse_id:", response.error)
        return []

    return [row["source_parse_id"] for row in response.data if row.get("source_parse_id") is not None]

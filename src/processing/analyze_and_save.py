import asyncio
from datetime import datetime
from utils.db import (
    fetch_recent_raw_articles,
    fetch_used_parse_ids,
    insert_many
)
from utils.gpt import process_articles_with_gpt

async def analyze_and_save_trending_ideas():
    print("📊 Начинаем анализ новостей из parserresults...")

    # 1️⃣ Получаем свежие статьи
    raw_articles = fetch_recent_raw_articles()
    print(f"📥 Получено {len(raw_articles)} статей за последние 14 дней")

    # 2️⃣ Получаем уже обработанные parse_id
    used_ids = set(fetch_used_parse_ids())

    # 3️⃣ Оставляем только необработанные
    new_articles = [
        {
            "title": row["extra_info"],
            "raw_content": row["raw_content"],
            "link": row["raw_content"],
            "source_parse_id": row["parse_id"]
        }
        for row in raw_articles
        if row["parse_id"] not in used_ids
    ]

    print(f"🧠 GPT будет обрабатывать {len(new_articles)} новых статей")

    if not new_articles:
        print("✅ Новых статей нет.")
        return

    # 4️⃣ GPT-анализ
    enriched = await process_articles_with_gpt(new_articles)

    # 5️⃣ Подготовка к сохранению
    to_save = [
        {
            "title": idea["title"],
            "description": idea["summary"],
            "tags": [],  # можно генерировать в будущем
            "popularity_score": idea["score"],
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "source_parse_id": idea["source_parse_id"]
        }
        for idea in enriched
        if idea["summary"] and idea["score"] is not None
    ]

    if not to_save:
        print("⚠️ Нет валидных результатов от GPT.")
        return

    # 6️⃣ Сохраняем
    insert_many("trendingideas", to_save)
    print(f"✅ Сохранено в trendingideas: {len(to_save)} идей.")

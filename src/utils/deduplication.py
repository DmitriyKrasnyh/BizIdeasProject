from typing import List, Dict
from utils.db import supabase

def is_duplicate(link: str) -> bool:
    """
    Проверяет, существует ли запись с таким raw_content (точное совпадение).
    """
    response = (
        supabase.table("parserresults")
        .select("parse_id")
        .eq("raw_content", link)
        .limit(1)
        .execute()
    )

    return bool(response.data)

def filter_duplicates(articles: List[Dict]) -> List[Dict]:
    """
    Убирает дубликаты из списка, проверяя точное совпадение по raw_content.
    """
    unique_articles = []

    for article in articles:
        link = article.get("raw_content", "").strip()

        if not link:
            continue

        if not is_duplicate(link):
            unique_articles.append(article)
        else:
            print(f"⛔ Дубликат: {link}")

    return unique_articles

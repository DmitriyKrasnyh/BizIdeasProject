import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

import aiohttp
from bs4 import BeautifulSoup
from datetime import datetime
from utils.db import insert_parser_results_batch
from utils.deduplication import filter_duplicates

BASE_URL = "https://vc.ru"
SECTIONS = ["tag/бизнес", "tag/стартапы"]

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}


async def fetch_section(session: aiohttp.ClientSession, section: str):
    url = f"{BASE_URL}/{section}"
    async with session.get(url, headers=HEADERS) as response:
        if response.status != 200:
            print(f"❌ Ошибка загрузки страницы {url} (статус: {response.status})")
            return []

        text = await response.text()
        soup = BeautifulSoup(text, "html.parser")
        articles = soup.find_all("div", class_="content content--short")
        results = []

        for article in articles:
            try:
                title_tag = article.find("h2", class_="content-title")
                title = title_tag.get_text(strip=True) if title_tag else None

                link_tag = article.find("a", class_="content__link") or article.find("a", class_="link-button")
                link = BASE_URL + link_tag.get("href") if link_tag and link_tag.get("href") else None

                if not title or not link:
                    continue

                results.append({
                    "source_name": "vc.ru",
                    "data_type": "news",
                    "raw_content": link,
                    "parsed_at": datetime.utcnow().isoformat(),
                    "extra_info": title
                })

            except Exception as e:
                print(f"⚠️ Ошибка парсинга: {e}")

        return results


async def run_parser():
    all_results = []

    async with aiohttp.ClientSession() as session:
        for section in SECTIONS:
            print(f"📂 Раздел: {section}")
            section_results = await fetch_section(session, section)
            all_results.extend(section_results)

    print(f"🔎 Найдено всего: {len(all_results)} статей")
    unique_articles = filter_duplicates(all_results)
    print(f"🆕 Уникальных: {len(unique_articles)}")

    insert_parser_results_batch(unique_articles)

if __name__ == "__main__":
    import asyncio
    asyncio.run(run_parser())

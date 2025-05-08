import os
from utils.llm_client import chat
from dotenv import load_dotenv
from typing import List, Dict
import asyncio

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

ALLOWED_TAGS = [
    "IT", "AI", "Marketing", "Eco", "FoodTech",
    "Sustainability", "Health", "Fitness", "Automation", "Retail"
]

PROMPT_TEMPLATE = """
Ты — аналитик в стартап-студии. Вот идея или бизнес-новость:

"{content}"

Твоя задача:
1. Придумай короткое название бизнес-идеи на английском (1 строка).
2. Кратко переформулируй суть идеи (1-2 строки, на английском).
3. Оцени её потенциал по 100-бальной шкале — честно, без завышений.
4. Присвой подходящие теги (на английском, выбирай только из: {allowed_tags})

Ответ строго в этом формате:
---
Название: {название на английском}
Описание: {описание на английском}
Оценка: {число от 0 до 100}
Теги: [tag1, tag2, ...]
---
""".replace("{allowed_tags}", ", ".join(ALLOWED_TAGS))


async def analyze_article(content: str) -> Dict:
    try:
        prompt = PROMPT_TEMPLATE.replace("{content}", content.strip())
        response = await openai.ChatCompletion.acreate(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        result = response.choices[0].message.content.strip()

        lines = result.splitlines()
        title = next((line.replace("Название:", "").strip() for line in lines if line.lower().startswith("название")), "")
        summary = next((line.replace("Описание:", "").strip() for line in lines if line.lower().startswith("описание")), "")
        score_line = next((line.replace("Оценка:", "").strip() for line in lines if line.lower().startswith("оценка")), "")
        score = int(score_line) if score_line.isdigit() else None
        tags_line = next((line.replace("Теги:", "").strip() for line in lines if line.lower().startswith("теги")), "")
        tags = [tag.strip().strip('"').strip("'") for tag in tags_line.strip("[]").split(",") if tag.strip() in ALLOWED_TAGS]

        return {
            "title": title,
            "summary": summary,
            "score": score,
            "tags": tags
        }

    except Exception as e:
        print(f"❌ Ошибка при обработке GPT: {e}")
        return {"title": "", "summary": "", "score": None, "tags": []}


async def process_articles_with_gpt(articles: List[Dict]) -> List[Dict]:
    results = []

    tasks = [
        analyze_article(article["raw_content"])
        for article in articles
    ]
    gpt_outputs = await asyncio.gather(*tasks)

    for article, gpt_result in zip(articles, gpt_outputs):
        results.append({
            "title": gpt_result["title"],
            "description": gpt_result["summary"],
            "score": gpt_result["score"],
            "tags": gpt_result["tags"],
            "source_parse_id": article["source_parse_id"]
        })

    return results

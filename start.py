import sys
import os
import asyncio

print("🚀 Старт запуска...")

# Добавляем src в PYTHONPATH
sys.path.append(os.path.join(os.path.dirname(__file__), "src"))
print("📁 sys.path:", sys.path)

# ✅ Импорты теперь корректные
from parsers.vc import run_parser
from processing.analyze_and_save import analyze_and_save_trending_ideas

async def main():
    await run_parser()
    await analyze_and_save_trending_ideas()

if __name__ == "__main__":
    asyncio.run(main())

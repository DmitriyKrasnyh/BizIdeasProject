import httpx, os, asyncio

LLM_HOST = os.getenv("LLM_URL", "http://localhost:8080")

async def chat(messages, temperature=0.7):
    # llama.cpp server ожидает другой payload → конвертируем
    prompt = "\n".join([m["content"] for m in messages])
    data = {
        "prompt": prompt,
        "temperature": temperature,
        "stream": False
    }
    async with httpx.AsyncClient(timeout=120) as c:
        r = await c.post(f"{LLM_HOST}/completion", json=data)
        r.raise_for_status()
        return r.json()["content"]

"""
FastAPI-обёртка вокруг llama-cpp-python
--------------------------------------
GET  /health         -> {"status":"ok"}
POST /v1/completions -> OpenAI-совместимый ответ (text-completion)
POST /run            -> удобный «быстрый» энд-пойнт для старого фронта
"""

import argparse, os, uuid, pathlib
from fastapi import FastAPI
from pydantic import BaseModel
from llama_cpp import Llama

# ─────────── CLI ────────────────────────────────────────────────
ap = argparse.ArgumentParser()
ap.add_argument("--model", required=True, help="GGUF file")
ap.add_argument("--host", default="127.0.0.1")
ap.add_argument("--port", type=int, default=8000)
args = ap.parse_args()

CTX_LEN   = int(os.getenv("LLM_CTX",     4096))
N_THREADS = int(os.getenv("LLM_THREADS", os.cpu_count() or 4))

# ─────────── Model load (один раз) ─────────────────────────────
if "llm_singleton" not in globals():          # защита от двойного импорта
    print("⏳ Загружаю модель …")
    globals()["llm_singleton"] = Llama(
        model_path=args.model,
        n_ctx     =CTX_LEN,
        n_threads =N_THREADS,
        n_gpu_layers=0,      # CPU-only
    )
    print(f"✅ Модель готова ({CTX_LEN} ctx)")

llm = globals()["llm_singleton"]

# ─────────── FastAPI ───────────────────────────────────────────
app = FastAPI(title="BizIdeas-LLM", docs_url="/docs")


class CompletionReq(BaseModel):
    prompt: str
    max_tokens: int = 512
    temperature: float = 0.7
    stream: bool = False   # игнорируем, всегда False
    # поля OpenAI-spec, которые нам не нужны, но могут прилететь
    model: str | None = None
    top_p: float | None = None
    n: int | None = None
    stop: list[str] | None = None


@app.get("/health")
def health():
    return {"status": "ok"}


def _generate(prompt: str,
              max_tokens: int = 512,
              temperature: float = 0.7,
              stop: list[str] | None = None,
              **_) -> str:                       # ← принимаем все лишние kw-args
    """
    Один унифицированный вызов модели: text-completion.
    """
    out = llm.create_completion(
        prompt       = prompt,
        max_tokens   = max_tokens,
        temperature  = temperature,
        stop         = stop or ["###"],   # дефолтный stop-токен
    )
    return out["choices"][0]["text"].lstrip()


@app.post("/v1/completions")
def completions(req: CompletionReq):
    txt = _generate(**req.dict())
    return {
        "id":     f"cmpl-{uuid.uuid4()}",
        "object": "text_completion",
        "choices": [{"text": txt, "index": 0, "finish_reason": "stop"}],
        "model":  "local",
    }


# ------- «быстрый» энд-пойнт для старого фронта ----------------
class RunReq(BaseModel):
    question: str
    profile : dict | None = None
    locale  : str | None = "ru"

PROMPT_TMPL = """
Ты — опытный бизнес-консультант.  
Отвечай лаконично, только на русском, но с цифрами и примерами.

**Контекст клиента**
- Регион: {region}
- Отрасль: {sector}
- Опыт: {exp}
- Цель перехода: {goal}

**Выбранная идея**  
«{idea_title}» — {idea_descr}

**Запрос клиента**  
{question}

**Формат ответа (_строго придерживайся_)**  
1. 🔍 Короткий «диагноз» (1–2 предложения, зачем эта идея полезна в его ситуации).  
2. ✅ Три быстрых шага (⪅ 40 слов каждый).  
3. 💡 Что может пойти не так — 2 риск-фактора и способ их снизить.  
4. 📈 Дальнейшие действия на 3-месяца (таблица: шаг → метрика успеха).  
5. ⏭ «Хочешь подробный план?» — задай вопрос клиенту одним предложением.

### Ответ
"""


@app.post("/run")
def run(req: RunReq):
    prompt = PROMPT_TMPL.format(**req.dict())
    return {"answer": _generate(prompt)}


# ─────────── Entrypoint ────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,                         # ← передаём объект, чтобы не было второго импорта
        host=args.host,
        port=args.port,
        log_level="info"
    )

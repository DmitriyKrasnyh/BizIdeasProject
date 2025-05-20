# backend/llm/serve.py
from fastapi import FastAPI
from pydantic import BaseModel
from llama_cpp import Llama
import os, pathlib

# ─── конфигурация ───
MODEL_PATH = pathlib.Path(__file__).parent / "models" / \
             "mistral-7b-instruct-v0.2.Q4_K_M.gguf"
CTX_LEN    = int(os.getenv("LLM_CTX", 4096))
N_THREADS  = int(os.getenv("LLM_THREADS", os.cpu_count() or 4))

# ─── инициализируем Llama.cpp ───
print("⏳ Загружаю модель…")
llm = Llama(model_path=str(MODEL_PATH),
            n_ctx=CTX_LEN,
            n_threads=N_THREADS,
            n_gpu_layers=0)         # =0 → полностью CPU

print("✅ Модель готова ({} токенов контекста)".format(CTX_LEN))

# ─── FastAPI ───
app = FastAPI(title="BizIdeas-LLM", docs_url="/docs")

class Req(BaseModel):
    question: str
    profile : dict | None = None
    locale  : str = "ru"

PROMPT_TMPL = """### Инструкция
Ты консультант по развитию бизнеса.
Профиль клиента: {profile}
Вопрос: {question}
### Ответ
"""

@app.post("/run")
def run(req: Req):
    prompt = PROMPT_TMPL.format(**req.dict())
    out = llm.create(prompt=prompt,
                     max_tokens=512,
                     temperature=0.7,
                     stop=["###"])
    return {"answer": out["choices"][0]["text"].strip()}

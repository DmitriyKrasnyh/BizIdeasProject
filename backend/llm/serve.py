from fastapi import FastAPI
from llama_cpp import Llama
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # или конкретный домен фронта
    allow_methods=["POST","GET"],
    allow_headers=["*"],
)


MODEL_PATH = "/models/mistral-7b-instruct-v0.2.Q4_K_M.gguf"

llm = Llama(model_path=MODEL_PATH, n_ctx=4096, n_threads=4)

app = FastAPI(title="BizIdeas-LLM")

@app.get("/")
def root():
    return {"ok": True}

@app.post("/recommend")
def recommend(payload: dict):
    system_prompt = (
        "Ты консультант по бизнес-трансформации. "
        "Отвечай дружелюбно и по пунктам."
    )
    profile_txt = "\n".join(f"{k}: {v}" for k, v in (payload.get("profile") or {}).items() if v)
    prompt = f"<s>[INST] <<SYS>>{system_prompt} {profile_txt}<</SYS>> {payload['question']} [/INST]"

    text = llm(prompt, max_tokens=512, temperature=0.7)["choices"][0]["text"]
    return {"answer": text.strip()}

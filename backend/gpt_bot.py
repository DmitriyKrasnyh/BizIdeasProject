# backend/gpt_bot.py
"""
Телеграм-бот для BizIdeas: общается с локальным LLM (serve.py)
и хранит весь диалог в Supabase.

● автоподнимает LLM, если он ещё не запущен;
● добавляет сообщения в chat_sessions / chat_messages;
● даёт структурированный ответ, удобный для чтения клиентом;
● поддерживает дополнительную кнопку «🗂 Чек-лист».
"""

import os, sys, subprocess, time, textwrap, psutil, requests
from pathlib  import Path
from uuid     import uuid4
from datetime import datetime, timezone

from aiogram import Bot, Dispatcher, types
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.utils import executor
from dotenv  import load_dotenv
from supabase import create_client, Client, AuthError

# ─────────────────────── ENV ──────────────────────────────────
load_dotenv()

TG_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
SB_URL   = os.getenv("VITE_SUPABASE_URL")
SB_KEY   = os.getenv("VITE_SUPABASE_ANON_KEY")

MODEL_PATH = Path(
    os.getenv("LLM_MODEL_PATH",
              r"backend\llm\models\mistral-7b-instruct-v0.2.Q4_K_M.gguf")
).resolve()

LLM_HOST  = os.getenv("LLM_HOST", "127.0.0.1")
LLM_PORT  = int(os.getenv("LLM_PORT", 8000))
SERVE_PY  = Path(__file__).parent / "llm" / "serve.py"
HEALTH_URL= f"http://{LLM_HOST}:{LLM_PORT}/health"
LLM_URL   = f"http://{LLM_HOST}:{LLM_PORT}/v1/completions"

# ───────────────── PROMPT ШАБЛОН ──────────────────────────────
PROMPT_TMPL = """
Ты — опытный бизнес-консультант.
Отвечай лаконично и по-делу, только на русском, цифры и примеры приветствуются.

◾ Регион клиента: {region}
◾ Отрасль:        {sector}
◾ Опыт:           {exp}
◾ Цель перехода:  {goal}

💡 Выбранная идея
«{idea_title}» — {idea_descr}

❓ Запрос
{question}

===== Формат ответа (соблюдай строго) =====
1. 🔍 Короткий «диагноз» (1–2 предложения).
2. ✅ 3 быстрых шага (⪅ 40 слов каждый).
3. ⚠️ 2 риска + как их снять.
4. 📈 План на 3 мес: таблица “шаг → метрика”.
5. ⏭ Вопрос клиенту одним предложением (CTA).
=========================================

### Ответ
"""

# ─────────────────── HELPERS ───────────────────────────────────
def _sb_exec(req):
    """Выполняем запрос к Supabase, сразу бросаем исключение при ошибке."""
    try:
        res = req.execute()
    except AuthError as e:
        raise RuntimeError(f"Supabase AuthError: {e}") from None

    data  = res.get("data")  if isinstance(res, dict) else getattr(res, "data", None)
    error = res.get("error") if isinstance(res, dict) else getattr(res, "error", None)
    if error:
        raise RuntimeError(error["message"])
    return data


def llm_running() -> bool:
    for p in psutil.process_iter(["cmdline"]):
        if "serve.py" in " ".join(p.info["cmdline"] or []) and str(LLM_PORT) in p.info["cmdline"]:
            return True
    return False


def start_llm() -> None:
    """Запускаем backend/llm/serve.py как detached-процесс (если он не поднят)."""
    if llm_running():
        print("✅  LLM уже запущен"); return

    if not SERVE_PY.exists():
        sys.exit("⛔  backend/llm/serve.py не найден")

    cmd = [sys.executable, str(SERVE_PY),
           "--host", LLM_HOST, "--port", str(LLM_PORT),
           "--model", str(MODEL_PATH)]
    print("▶️  Стартую LLM:", " ".join(cmd))
    subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    for _ in range(30):
        try:
            if requests.get(HEALTH_URL, timeout=1).ok:
                print("✅  LLM поднят"); return
        except requests.RequestException:
            time.sleep(1)
    sys.exit("⛔  LLM не поднялся за 30 сек")


def send_to_llm(prompt: str) -> str:
    r = requests.post(
        LLM_URL,
        json={"prompt": prompt, "max_tokens": 512, "temperature": 0.7},
        timeout=180
    )
    r.raise_for_status()
    return r.json()["choices"][0]["text"].strip()


# ─────────────── SUPABASE-УТИЛЫ ────────────────────────────────
def get_or_create_session(sb: Client, user_id: int, idea_id: int) -> str:
    row = _sb_exec(
        sb.table("chat_sessions")
          .select("session_id")
          .eq("user_id", user_id)
          .eq("idea_id", idea_id)
          .limit(1)
          .maybe_single()
    )
    if row:
        return row["session_id"]

    sid = str(uuid4())
    _sb_exec(sb.table("chat_sessions").insert({
        "session_id": sid,
        "user_id":    user_id,
        "idea_id":    idea_id,
        "title":      "Telegram chat"
    }))
    return sid


def log_chat(sb: Client, session_id: str, user_id: int,
             role: str, text: str) -> None:
    _sb_exec(sb.table("chat_messages").insert({
        "message_id": str(uuid4()),
        "session_id": session_id,
        "user_id":    user_id,
        "role":       role,
        "content":    text,
        "created_at": datetime.now(timezone.utc).isoformat()
    }))

# ─────────────────── INIT ──────────────────────────────────────
if not all([TG_TOKEN, SB_URL, SB_KEY]):
    sys.exit("⛔  .env неполный (TG_TOKEN / SB_URL / SB_KEY)")

start_llm()
bot        = Bot(TG_TOKEN, parse_mode="HTML")
dp         = Dispatcher(bot)
supabase: Client = create_client(SB_URL, SB_KEY)

# ─────────────── /start /help ──────────────────────────────────
@dp.message_handler(commands=["start"])
async def cmd_start(m: types.Message):
    await m.reply(
        "👋 <b>Привет!</b>\n"
        "Опиши свой бизнес — я подскажу, как адаптировать его под выбранную идею."
    )

@dp.message_handler(commands=["help"])
async def cmd_help(m: types.Message):
    await m.reply(
        "ℹ️ Просто отправь краткое описание бизнеса.\n"
        "Не выбрал идею? Сделай это на сайте во вкладке «Идеи»."
    )

# ─────────────── CORE HANDLER ──────────────────────────────────
def _build_prompt(user: dict, idea: dict, question: str) -> str:
    return PROMPT_TMPL.format(
        region      = user.get("region")            or "—",
        sector      = user.get("business_sector")   or "—",
        exp         = user.get("experience_level")  or "—",
        goal        = user.get("transition_goal")   or "—",
        idea_title  = idea["title"],
        idea_descr  = idea["description"],
        question    = question.strip()
    )

@dp.message_handler(lambda ms: ms.text and not ms.text.startswith("/"))
async def biz_question(ms: types.Message):

    tg_tag = f"@{ms.from_user.username}" if ms.from_user.username else None
    if not tg_tag:
        await ms.reply("❌ Добавь username в Telegram и укажи его в профиле на сайте."); return

    user = _sb_exec(
        supabase.table("users").select("*")
                .eq("telegram", tg_tag)
                .limit(1).maybe_single()
    )
    if not user:
        await ms.reply("❌ Telegram не привязан к пользователю сайта."); return

    missing = [k for k in ("region", "business_sector") if not user.get(k)]
    if missing:
        await ms.reply("ℹ️ Заполни профиль на сайте (регион и сферу) — советы будут точнее.")

    idea_link = _sb_exec(
        supabase.table("userideas").select("idea_id")
                .eq("user_id", user["user_id"])
                .limit(1).maybe_single()
    )
    if not idea_link:
        await ms.reply("❗ Сначала выбери идею на сайте во вкладке «Идеи»."); return

    idea = _sb_exec(
        supabase.table("trendingideas")
                .select("title, description")
                .eq("idea_id", idea_link["idea_id"])
                .single()
    )

    session_id = get_or_create_session(supabase, user["user_id"], idea_link["idea_id"])
    prompt     = _build_prompt(user, idea, ms.text)

    log_chat(supabase, session_id, user["user_id"], "user", ms.text)

    try:
        answer = send_to_llm(prompt)
    except Exception as e:
        await ms.reply(f"❌ LLM не ответил: {e}"); return

    log_chat(supabase, session_id, user["user_id"], "assistant", answer)

    kb = InlineKeyboardMarkup(row_width=2).add(
        InlineKeyboardButton("🗂 Чек-лист",      callback_data=f"todo:{session_id}"),
        InlineKeyboardButton("🔄 Другая идея",   callback_data="new_idea")
    )
    await ms.reply(answer, reply_markup=kb)

    _sb_exec(supabase.table("userhistory").insert({
        "user_id":     user["user_id"],
        "action_type": "llm_recommendation",
        "action_time": datetime.now(timezone.utc).isoformat(),
        "details":     f"prompt_len={len(ms.text)}"
    }))

# ─────────────── CALLBACKS ─────────────────────────────────────
@dp.callback_query_handler(lambda c: c.data == "new_idea")
async def new_idea(cb: types.CallbackQuery):
    await cb.message.answer("🔁 Перейди на сайт и выбери новую идею — я подстроюсь!")
    await cb.answer()

@dp.callback_query_handler(lambda c: c.data.startswith("todo:"))
async def todo_list(cb: types.CallbackQuery):
    session_id = cb.data.split(":", 1)[1]
    last_q = _sb_exec(
        supabase.table("chat_messages")
                .select("content")
                .eq("session_id", session_id)
                .eq("role", "user")
                .order("created_at", desc=True)
                .limit(1).single()
    )["content"]

    # достаём идею и профиль, чтобы отдать в prompt
    sess = _sb_exec(supabase.table("chat_sessions")
                    .select("user_id, idea_id")
                    .eq("session_id", session_id).single())
    user = _sb_exec(supabase.table("users")
                    .select("*").eq("user_id", sess["user_id"]).single())
    idea = _sb_exec(supabase.table("trendingideas")
                    .select("title, description")
                    .eq("idea_id", sess["idea_id"]).single())

    todo_prompt = _build_prompt(user, idea, last_q) + "\n\nСформируй чек-лист к плану выше."
    answer      = send_to_llm(todo_prompt)

    log_chat(supabase, session_id, user["user_id"], "assistant", answer)
    await cb.message.answer(answer)
    await cb.answer()

# ───────────────────── RUN ─────────────────────────────────────
if __name__ == "__main__":
    executor.start_polling(dp, skip_updates=True)

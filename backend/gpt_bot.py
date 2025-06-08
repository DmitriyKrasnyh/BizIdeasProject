# ────────────────────────────────────────────────────────────────
#  BizIdeas  ✦  Telegram-бот                              08-Jun-2025
# ────────────────────────────────────────────────────────────────
import os, sys, time, logging, textwrap, subprocess, psutil, requests, asyncio
from datetime      import datetime, timezone
from pathlib        import Path
from typing         import Set
from uuid           import uuid4

from aiogram        import Bot, Dispatcher, types, utils, exceptions
from aiogram.types  import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.utils  import executor
from dotenv         import load_dotenv, find_dotenv
from supabase       import create_client, Client, AuthError


# ╭─────────────────────────  LOGGING  ─────────────────────────╮
logging.basicConfig(
    level  = logging.INFO,
    format = "%(asctime)s %(levelname)-8s %(name)s: %(message)s",
)
log = logging.getLogger("gpt_bot")
dbg = log.info
# ╰──────────────────────────────────────────────────────────────╯


# ╭──────────────────────  ENV + CONSTANTS  ────────────────────╮
load_dotenv(find_dotenv(".env", raise_error_if_not_found=True))

TG_TOKEN, SB_URL, SB_KEY = (
    os.getenv("TELEGRAM_BOT_TOKEN"),
    os.getenv("VITE_SUPABASE_URL"),
    os.getenv("VITE_SUPABASE_ANON_KEY"),
)
if not all([TG_TOKEN, SB_URL, SB_KEY]):
    sys.exit("⛔  .env отсутствует TELEGRAM_BOT_TOKEN / VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY")

MODEL_PATH = Path(os.getenv(
    "LLM_MODEL_PATH", "backend/llm/models/mistral-7b-instruct-v0.2.Q4_K_M.gguf")
).resolve()
LLM_HOST  = os.getenv("LLM_HOST", "127.0.0.1")
LLM_PORT  = int(os.getenv("LLM_PORT", 8000))
SERVE_PY  = Path(__file__).parent / "llm" / "serve.py"
HEALTH    = f"http://{LLM_HOST}:{LLM_PORT}/health"
LLM_URL   = f"http://{LLM_HOST}:{LLM_PORT}/v1/completions"

# ───────── PROMPT ─────────────────────────────────────────────
PROMPT_TMPL = textwrap.dedent("""
    Ты — опытный бизнес-консультант.

    ◾ Регион: {region}
    ◾ Отрасль: {sector}
    ◾ Опыт:   {exp}
    ◾ Цель:   {goal}

    💡 «{idea_title}» — {idea_descr}

    ❓ {question}

    ===== Формат ответа (строго соблюдай) =====
    1. 🔍 Диагноз (⩽ 2 предложения).
    2. ✅ Три шага (каждый ≤ 40 слов, маркируй «* »).
    3. ⚠️ 2 риска + снятие (формат «Risk → Solution»).
    4. 📈 План 3 мес — без таблиц! Просто список вида  
       • Месяц 1 — …  
       • Месяц 2 — …  
       • Месяц 3 — …
    ============================================
    ### Ответ
""").strip()

# ╰──────────────────────────────────────────────────────────────╯


# ╭────────────────────────  LLM helpers  ──────────────────────╮
def _llm_running() -> bool:
    return any(
        "serve.py" in " ".join(p.info["cmdline"] or []) and str(LLM_PORT) in p.info["cmdline"]
        for p in psutil.process_iter(["cmdline"])
    )

def _start_llm() -> None:
    if _llm_running():
        dbg("✅  LLM already running"); return

    cmd = [sys.executable, str(SERVE_PY),
           "--host", LLM_HOST, "--port", str(LLM_PORT),
           "--model", str(MODEL_PATH)]
    subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)   # detach

    for _ in range(30):
        try:
            if requests.get(HEALTH, timeout=1).ok:
                dbg("✅  LLM is up"); return
        except requests.RequestException:
            time.sleep(1)
    sys.exit("⛔  LLM didn’t start (30 s timeout)")

def _ask_llm(prompt: str) -> str:
    r = requests.post(
        LLM_URL,
        json={"prompt": prompt, "max_tokens": 512, "temperature": 0.7},
        timeout=180
    )
    r.raise_for_status()
    return r.json()["choices"][0]["text"].strip()
# ╰──────────────────────────────────────────────────────────────╯


# ╭──────────────────  Supabase mini-SDK wrapper  ──────────────╮
def _sb(req):
    """
    Унифицированный wrapper:
    • dict-ответы старого SDK и объекты SingleAPIResponse нового.
    • Поглощает 403/406 (RLS) → возвращает [].
    • Любую другую ошибку поднимает как RuntimeError.
    """
    try:
        res = req.execute()
    except AuthError as e:
        raise RuntimeError(e) from None
    except Exception as e:
        if "403" in str(e) or "406" in str(e):
            return []
        raise

    data  = res.get("data")  if isinstance(res, dict) else getattr(res, "data", None)
    error = res.get("error") if isinstance(res, dict) else getattr(res, "error", None)
    if error:
        raise RuntimeError(str(error))
    return data

def _session(sb: Client, user_id: int, idea_id: int) -> str:
    row = _sb(sb.table("chat_sessions")
                .select("session_id")
                .eq("user_id", user_id)
                .eq("idea_id", idea_id)
                .limit(1).maybe_single())
    if row:
        return row["session_id"]

    sid = str(uuid4())
    _sb(sb.table("chat_sessions").insert({
        "session_id": sid,
        "user_id":    user_id,
        "idea_id":    idea_id,
        "title":      "Telegram chat"
    }))
    return sid

def _log(sb: Client, sess: str, uid: int, role: str, text: str):
    _sb(sb.table("chat_messages").insert({
        "message_id": str(uuid4()),
        "session_id": sess,
        "user_id":    uid,
        "role":       role,
        "content":    text,
        "created_at": datetime.now(timezone.utc).isoformat()
    }))
# ╰──────────────────────────────────────────────────────────────╯


# ╭─────────────────────────  INIT  ────────────────────────────╮
_start_llm()
bot = Bot(TG_TOKEN, parse_mode="HTML")
dp  = Dispatcher(bot)
sb  = create_client(SB_URL, SB_KEY)
PENDING: Set[int] = set()
# ╰──────────────────────────────────────────────────────────────╯


# ╭────────────────────────  HANDLERS  ─────────────────────────╮
WELCOME = ("👋 <b>Привет!</b>\n"
           "Опиши свой бизнес — подскажу, как адаптировать его под идею.\n"
           "Справка /help")

@dp.message_handler(commands=["start"])
async def cmd_start(m: types.Message):
    await m.answer(WELCOME)

@dp.message_handler(commands=["help"])
async def cmd_help(m: types.Message):
    await m.answer("ℹ️  Отправь краткое описание бизнеса.\n"
                   "Не выбрал идею — сделай это на сайте в разделе «Идеи».")

def _prompt(user, idea, q):       # plain helper
    return PROMPT_TMPL.format(
        region=user.get("region","—"),
        sector=user.get("business_sector","—"),
        exp   =user.get("experience_level","—"),
        goal  =user.get("transition_goal","—"),
        idea_title=idea["title"],
        idea_descr=idea["description"],
        question=q)

@dp.message_handler(lambda m: m.text and not m.text.startswith("/"))
async def handle_question(m: types.Message):
    if m.from_user.id in PENDING:
        return await m.reply("⏳ Подождите текущий ответ.")
    if not m.from_user.username:
        return await m.reply("❌ Укажите username в Telegram и профиле сайта.")

    tg_tag = "@"+m.from_user.username
    dbg("⇢ вопрос от %s: %s", tg_tag, m.text.strip()[:60])

    user = _sb(sb.table("users").select("*").eq("telegram", tg_tag).limit(1).maybe_single())
    if not user:
        return await m.reply("❌ Этот Telegram не привязан к аккаунту.")

    idea_link = _sb(sb.table("userideas")
                     .select("idea_id")
                     .eq("user_id", user["user_id"]).limit(1).maybe_single())
    if not idea_link:
        return await m.reply("⚠️  Сначала выберите идею на сайте.")

    idea = _sb(sb.table("trendingideas")
                 .select("title,description")
                 .eq("idea_id", idea_link["idea_id"]).single())

    try:
        sess = _session(sb, user["user_id"], idea_link["idea_id"])
    except RuntimeError as e:
        return await m.reply(str(e))

    text = m.text.strip()
    _log(sb, sess, user["user_id"], "user", text)

    # Индикатор «печатает…» (UX)
    await types.ChatActions.typing()

    ack = await m.reply("💬 Думаю… (до 2 мин)", disable_notification=True)
    PENDING.add(m.from_user.id)

    try:
        answer = await asyncio.get_event_loop().run_in_executor(
            None, _ask_llm, _prompt(user, idea, text)
        )
    except Exception as e:
        dbg("LLM error: %s", e)
        await ack.edit_text("❌ LLM не ответил, попробуйте позже.")
        PENDING.remove(m.from_user.id)
        return

    _log(sb, sess, user["user_id"], "assistant", answer)

    kb = InlineKeyboardMarkup(row_width=2).add(
        InlineKeyboardButton("🗂 Чек-лист", callback_data=f"todo:{sess}"),
        InlineKeyboardButton("🔄 Другая идея", callback_data="new_idea"),
        InlineKeyboardButton("👍", callback_data=f"fb:+:{sess}"),
        InlineKeyboardButton("👎", callback_data=f"fb:-:{sess}")
    )
    await ack.edit_text(answer, reply_markup=kb)
    PENDING.remove(m.from_user.id)

@dp.callback_query_handler(lambda c: c.data.startswith("todo:"))
async def todo(cb: types.CallbackQuery):
    sess_id = cb.data.split(":",1)[1]
    last_q = _sb(sb.table("chat_messages")
                  .select("content")
                  .eq("session_id", sess_id)
                  .eq("role", "user")
                  .order("created_at", desc=True)
                  .limit(1).single())["content"]

    sess  = _sb(sb.table("chat_sessions").select("user_id,idea_id")
                 .eq("session_id", sess_id).single())
    user  = _sb(sb.table("users").select("*").eq("user_id", sess["user_id"]).single())
    idea  = _sb(sb.table("trendingideas").select("title,description")
                 .eq("idea_id", sess["idea_id"]).single())

    answer = _ask_llm(_prompt(user, idea, last_q) + "\n\nСформируй чек-лист.")
    await cb.message.answer(answer)
    await cb.answer()

@dp.callback_query_handler(lambda c: c.data.startswith("fb:"))
async def feedback(cb: types.CallbackQuery):
    val, sess_id = cb.data.split(":",2)[1:]
    _sb(sb.table("userhistory").insert({
        "user_id": _sb(sb.table("chat_sessions")
                         .select("user_id")
                         .eq("session_id", sess_id).single())["user_id"],
        "action_type": "llm_feedback",
        "action_time": datetime.now(timezone.utc).isoformat(),
        "details": f"value={val}"
    }))
    await cb.answer("Спасибо за обратную связь!")

@dp.callback_query_handler(lambda c: c.data == "new_idea")
async def new_idea(cb: types.CallbackQuery):
    await cb.message.answer("🔄  Перейдите на сайт и выберите новую идею.")
    await cb.answer()
# ╰──────────────────────────────────────────────────────────────╯


# ╭───────────────────  GLOBAL EXCEPTIONS  ─────────────────────╮
@dp.errors_handler()
async def global_errors(_, err):
    log.exception("🔴 Unhandled: %s", err)
    return True
# ╰──────────────────────────────────────────────────────────────╯


# ╭────────────────────  RUN with auto-retry  ──────────────────╮
if __name__ == "__main__":
    dbg("🚀 Bot starting…")
    while True:
        try:
            executor.start_polling(dp, skip_updates=True)
        except exceptions.NetworkError as e:
            log.warning("🌐  NetworkError: %s — перезапускаю через 15 с", e)
            time.sleep(15)
        except Exception:
            log.exception("🔴  Fatal error — перезапуск через 30 с")
            time.sleep(30)

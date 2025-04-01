import os
from aiogram import Bot, Dispatcher, types
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.utils import executor
from supabase import create_client
from dotenv import load_dotenv
import openai
from datetime import datetime

load_dotenv()

# Инициализация
bot = Bot(token=os.getenv("TELEGRAM_BOT_TOKEN"))
dp = Dispatcher(bot)
openai.api_key = os.getenv("OPENAI_API_KEY")

supabase = create_client(os.getenv("VITE_SUPABASE_URL"), os.getenv("VITE_SUPABASE_ANON_KEY"))

# /start
@dp.message_handler(commands=['start'])
async def start(msg: types.Message):
    await msg.reply("👋 Привет! Расскажи немного о своём бизнесе, и я подскажу, как его адаптировать под современные тренды.")

# /help
@dp.message_handler(commands=['help'])
async def help_command(msg: types.Message):
    await msg.reply("ℹ️ Отправь мне краткое описание своего бизнеса — я подскажу, как адаптировать его под выбранную идею. Если ты хочешь сменить идею, нажми 'Попробовать другую идею'.")

# Ответ на сообщение пользователя
@dp.message_handler()
async def handle_biz_question(msg: types.Message):
    username = f"@{msg.from_user.username}"

    # Найдём пользователя по telegram
    user_response = supabase.table("users").select("*").eq("telegram", username).single().execute()

    if not user_response.data:
        await msg.reply("❌ Ты не зарегистрирован. Укажи свой Telegram в профиле на сайте.")
        return

    user = user_response.data
    user_id = user["user_id"]

    # Найдём выбранную идею
    idea_response = supabase.table("userideas").select("idea_id").eq("user_id", user_id).single().execute()
    if not idea_response.data:
        await msg.reply("❗ Ты пока не выбрал бизнес-идею на сайте.")
        return

    idea_id = idea_response.data["idea_id"]
    idea_info = supabase.table("trendingideas").select("title, description").eq("idea_id", idea_id).single().execute().data

    # GPT-запрос
    gpt_prompt = f"""
Ты — эксперт по стартапам. У пользователя бизнес: "{msg.text}".
Вот идея, которую он выбрал: "{idea_info['title']} — {idea_info['description']}".

Подскажи, как адаптировать его бизнес под эту идею.
Ответ верни на русском языке, кратко, полезно и по делу.
"""

    try:
        gpt_reply = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": gpt_prompt}],
            temperature=0.7,
        )
        answer = gpt_reply.choices[0].message.content.strip()

        # Логирование действия
        supabase.table("userhistory").insert({
            "user_id": user_id,
            "action_type": "gpt_recommendation",
            "action_time": datetime.utcnow().isoformat(),
            "details": f"input: {msg.text}"
        }).execute()

        # Ответ с кнопкой
        kb = InlineKeyboardMarkup().add(
            InlineKeyboardButton("🔄 Попробовать другую идею", callback_data="try_other")
        )
        await msg.reply(answer, reply_markup=kb)

    except Exception as e:
        await msg.reply(f"❌ Ошибка при обработке: {e}")

# Обработка кнопки "Попробовать другую идею"
@dp.callback_query_handler(lambda c: c.data == "try_other")
async def handle_other_idea(callback: types.CallbackQuery):
    await callback.message.answer("🔁 Хорошо! Зайди на сайт и выбери другую идею — я подстроюсь.")
    await callback.answer()

# Запуск
if __name__ == "__main__":
    executor.start_polling(dp, skip_updates=True)

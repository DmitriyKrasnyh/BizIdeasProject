# 💡 BizIdeasProject

Платформа для поиска и анализа актуальных бизнес-идей с использованием нейросетей и данных с популярных ресурсов.

## 🚀 Возможности

- 🔍 Парсинг свежих идей с VC.ru, Хабра, РБК Трендов и других источников
- 🧠 Генерация идей на основе GPT
- 🏷 Автоматическая категоризация: IT, AI, Эко, FoodTech и др.
- 👤 Профили пользователей, выбор идеи, история действий
- 💬 Telegram-бот с советами по адаптации идеи под твой бизнес
- 🦾 Интерактивный маскот на главной странице с подсказками
- 📊 Админ-панель с редактированием базы и просмотром ER-диаграммы

## 🛠️ Технологии

- **Frontend:** React + TypeScript + TailwindCSS + Framer Motion
- **Backend / DB:** Supabase (PostgreSQL + Auth)
- **AI:** OpenAI GPT API
- **3D:** Spline
- **Интеграция:** Telegram Bot API

## 📦 Установка

```bash
git clone https://github.com/Iam3tonn/BizIdeasProject.git
cd BizIdeasProject
npm install
npm run dev
```

## 🧠 Архитектура

- `src/pages/`: Главные страницы (Home, Ideas, Profile и т.д.)
- `src/contexts/`: Авторизация и глобальные состояния
- `supabase/`: Взаимодействие с базой
- `public/`: Логотипы, маскот и т.д.

## ⚙️ Деплой

Проект можно легко задеплоить на [Railway](https://railway.app):

1. Подключи GitHub репозиторий
2. Railway сам установит зависимости и запустит `vite preview`
3. Укажи в `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "start": "vite preview"
}
```

## 📬 Связь

Если хочешь внести вклад, задать вопрос или предложить идею:
- Telegram: [@BizIdeasTrendsBot](https://t.me/@BizIdeasTrendsBot)
- Email: dimathedevoloper@gmail.com

---

**BizIdeasProject — идеи, которые двигают бизнес.**
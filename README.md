# 🚀 BizIdeas 2.1

**BizIdeas** — платформа, которая помогает предпринимателям быстро адаптировать бизнес‑модель к актуальным трендам и технологиям.

Новая версия 2.1 добавляет:

* избранные идеи 💙 с офлайн‑хранением;
* более чистую UI‑схему без «скачков» при фильтрации;
* пустые состояния и toast‑подсказки;
* расширенный модуль модерации идей;
* улучшенную доступность (клавиши ← / →, Esc).

---

## ✨ Основные разделы

| Модуль                | URL               | Возможности |
|-----------------------|-------------------|-------------|
| Главная               | `/`               | 3‑D фон (Spline), hero‑блок, маскот |
| Идеи                  | `/ideas`          | **Фильтры, избранное, выбор основной идеи, прогресс‑бар популярности** |
| AI‑Ассистент          | `/assistant`      | Персональные рекомендации (OpenAI / локальный LLM) |
| Аналитика             | `/analytics`      | Recharts: динамика, топ‑теги, KPI |
| Подписки              | `/plans`          | Stripe Checkout (*Standard / Plus*) |
| Профиль               | `/profile`        | Region / Goal / Experience + progress |
| Предложить идею       | `/suggest-idea`   | Form → Preview → Toast «Отправлено» |
| Модерация идей        | `/moderate-ideas` | Live поиск, approve / reject |
| Админ‑панель          | `/admin`          | CRUD для всех таблиц, ER‑диаграмма |

---

## 🏗️ Стек

| Front‑end              | Back‑end / BaaS         | Данные / AI       | Dev‑tooling |
|------------------------|-------------------------|-------------------|-------------|
| React 18 + Vite        | **Supabase**: PostgreSQL, Storage, Auth, Edge Functions | OpenAI API (или Mistral LLM), Recharts | TypeScript, TailwindCSS, ESLint + Prettier, Husky |

---

## ⚡ Быстрый старт

```bash
git clone https://github.com/<you>/bizideas.git
cd bizideas
pnpm i                       # или yarn / npm
cp .env.example .env.local    # добавьте ключи Supabase / Stripe / OpenAI
pnpm dev                     # http://localhost:5173
```

> **ℹ️ Supabase CLI** автоматически разворачивает `sql/01_init.sql` и public‑bucket при `supabase start`.

---

## 🔑 Переменные окружения

| Переменная               | Описание                          |
|--------------------------|-----------------------------------|
| `VITE_SUPABASE_URL`      | URL проекта Supabase              |
| `VITE_SUPABASE_ANON`     | anon‑ключ                         |
| `VITE_OPENAI_API_KEY`    | ключ OpenAI / собственный LLM     |
| `VITE_STRIPE_PK`         | публичный ключ Stripe             |
| `VITE_SITE_URL`          | базовый URL сайта                 |

---

## 📂 Структура проекта

```
.
├─ public/
├─ src/
│  ├─ components/     # UI‑компоненты
│  ├─ contexts/       # React‑контексты (Auth, Lang …)
│  ├─ lib/            # Supabase client, helpers
│  ├─ pages/          # Страницы‑роуты
│  ├─ sql/            # миграции для Supabase CLI
│  └─ styles/         # Tailwind base + animations
└─ README.md
```

---

## 🧪 Скрипты npm

| Команда       | Описание                      |
|---------------|------------------------------|
| `dev`         | Vite dev‑сервер              |
| `build`       | Production‑сборка            |
| `preview`     | Preview из `/dist`           |
| `lint`        | ESLint + Prettier            |
| `format`      | Запуск Prettier              |
| `supabase start` | Локальный Supabase Dev      |

---

## 💳 Stripe Flow

1. Products: **plan_standard**, **plan_plus**  
2. `/api/stripe/create-session` → redirect to Checkout  
3. Webhook `/api/stripe/webhook` → таблица **subscription**  
4. Edge Function `subscription_expire.ts` отрубает просроченные планы

---

## 📜 Лицензия

MIT © 2025 BizIdeas Team  
*«Помогаем бизнесу меняться вместе с трендами»*

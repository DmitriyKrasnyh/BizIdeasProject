# 📈 BizIdeas

**BizIdeas** — веб‑платформа, которая помогает предпринимателям быстро адаптировать свой бизнес к актуальным трендам.  
Проект написан на **React + TypeScript** и использует **Supabase** как единую back‑end платформу (PostgreSQL + Storage + Auth + Edge Functions).

---

## ✨ Основные возможности

| Модуль | Что делает |
|--------|------------|
| **Главная** | Анимированный 3‑D‑фон (Spline), hero‑блок, ссылки на актуальные ресурсы, маскот‑помощник с подсказками. |
| **Идеи** `/ideas` | Лента популярных бизнес‑идей. Фильтрация по тегам, пагинация, выбор «своей» идеи (1 на пользователя) для дальнейшей аналитики. |
| **AI‑Assistant** `/assistant` | Генерирует персональные рекомендации по трансформации бизнеса.<br>• **1 запрос** в плане *Standard*.<br>• **Безлимит** в планах *Plus* и *Admin*. |
| **Analytics** `/analytics` | Графики Recharts: динамика идей, средний score, donut + bar по топ‑тегам, KPI‑карточки, live‑данные из Supabase `trendingideas`. |
| **Подписки** `/plans` | Описание тарифов (*Standard / Plus*), CTA на оплату. |
| **Профиль** `/profile` | Данные пользователя (регион, сектор, цель, опыт, Telegram, описание). Интерактивный flip‑edit с progress‑bar заполненности. |
| **Админ‑панель** `/admin` | CRUD для всех таблиц, поиск, inline‑редактирование, SQL ER‑диаграмма с zoom. |
| **Auth** | Email + password. Reset password. Роут‑гварды (*ProtectedRoute*, *AdminRoute*). |

---

## 🏗️ Технологический стек

| Группа | Стек |
|--------|------|
| UI / Front‑end | React 18 • Vite • TypeScript • TailwindCSS • Framer Motion • Lucide icons • Spline web‑viewer |
| Charts / Data | Recharts |
| Back‑end BaaS | Supabase (PostgreSQL • Storage • Auth • Edge Functions) |
| AI / LLM | OpenAI API (можно заменить / дополнить локальным Mistral LLM) |
| Payments | Stripe Checkout (планы *standard* / *plus*) |
| Tooling | ESLint + Prettier • Husky • Commitlint • Vite preview |

---

## 🚀 Запуск локально

```bash
# 1 – клонируем
git clone https://github.com/<you>/bizideas.git
cd bizideas

# 2 – устанавливаем зависимости
pnpm i          # или yarn / npm

# 3 – переменные среды
cp .env.example .env.local
# добавьте SUPABASE_URL, SUPABASE_ANON_KEY, OPENAI_API_KEY, STRIPE_PK …

# 4 – dev‑сервер
pnpm dev        # http://localhost:5173
```

> **Важно:** Supabase‑schema (`sql/01_init.sql`) и `storage/bucket_public` автоматически разворачиваются при создании проекта через Supabase CLI.

---

## 🔑 Переменные окружения

| Переменная | Описание |
|------------|----------|
| `VITE_SUPABASE_URL` | URL Supabase‑проекта |
| `VITE_SUPABASE_ANON` | anon‑ключ |
| `VITE_OPENAI_API_KEY` | ключ OpenAI |
| `VITE_STRIPE_PK` | публичный ключ Stripe |
| `VITE_SITE_URL` | базовый URL |

---

## 📄 Структура проекта

```
.
├─ public/
├─ src/
│  ├─ components/
│  ├─ contexts/
│  ├─ lib/
│  ├─ pages/
│  ├─ sql/
│  └─ styles/
└─ README.md
```

---

## 🧪 Скрипты npm

| Скрипт | Действие |
|--------|----------|
| `dev` | Vite dev‑сервер |
| `build` | production‑сборка |
| `preview` | локальный preview `/dist` |
| `lint` | ESLint + Prettier |
| `format` | Применить Prettier |
| `supabase start` | локальный Supabase (CLI) |

---

## 💳 Подписки и оплата

1. **Stripe Product + Price** – создайте `plan_standard`, `plan_plus`.  
2. **Checkout Session** – `/api/stripe/create-session`.  
3. **Webhook** – `/api/stripe/webhook` → таблица `subscription`.  
4. **Edge Function** – `subscription_expire.ts` снимает просроченные планы.

---

## 🤝 Contributing

1. Fork → ветка.  
2. `pnpm lint && pnpm test` должны проходить.  
3. PR с описанием изменений.

---

## © License

MIT © 2025 BizIdeas Team  
«Помогаем бизнесу перестроиться под тренды».

import express from 'express';
import cors from 'cors';
import sql from 'mssql';
import { dbConfig } from './config/db.js';

const app = express();
const PORT = 3000;

// 🔗 Настройки CORS и JSON-парсера
app.use(cors());
app.use(express.json());

// 📌 Подключение к базе данных
async function getPool() {
  try {
    if (!sql.pool) {
      sql.pool = await sql.connect(dbConfig);
      console.log('✅ Подключено к базе данных');
    }
    return sql.pool;
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:', error);
    throw error;
  }
}

// 🔑 Авторизация пользователя
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('📥 Логин:', req.body);

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE email = @email');

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const user = result.recordset[0];

    if (password !== user.password_hash) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    console.log('✅ Вход успешен:', user.email);
    res.status(200).json({ message: 'Успешный вход', user });

  } catch (error) {
    console.error('🔥 Ошибка сервера:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// 🎛 Получение данных для администратора (все таблицы)
app.get('/api/admin/data', async (req, res) => {
  try {
    const pool = await getPool();

    const tables = [
      'Users',
      'ParserResults',
      'TrendingIdeas',
      'UserIdeas',
      'Subscription',
      'UserHistory'
    ];

    const results = {};

    for (const table of tables) {
      try {
        const result = await pool.request().query(`SELECT * FROM ${table}`);
        results[table.toLowerCase()] = result.recordset;
      } catch (error) {
        console.warn(`⚠️ Ошибка загрузки ${table}:`, error.message);
        results[table.toLowerCase()] = [];
      }
    }

    res.json(results);
  } catch (error) {
    console.error('❌ Ошибка загрузки данных:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// 🔄 Обновление данных в таблице (исправлено для POST)
app.post('/api/admin/update', async (req, res) => {
  const { table, primaryKey, primaryValue, column, value } = req.body;

  if (!table || !primaryKey || primaryValue === undefined || !column) {
    return res.status(400).json({ error: 'Неверные параметры запроса' });
  }

  try {
    const pool = await getPool();

    // Динамическое обновление данных в таблице
    const query = `
      UPDATE ${table} 
      SET ${column} = @value 
      WHERE ${primaryKey} = @primaryValue
    `;

    const result = await pool
      .request()
      .input('value', sql.NVarChar, value)
      .input('primaryValue', sql.Int, primaryValue)
      .query(query);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }

    console.log(`✅ Данные обновлены: ${table}.${column} = ${value} WHERE ${primaryKey} = ${primaryValue}`);
    res.json({ message: 'Данные успешно обновлены' });
  } catch (error) {
    console.error('❌ Ошибка обновления данных:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// 🚀 Запуск сервера
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
});

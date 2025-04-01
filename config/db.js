// config/db.js (ESM)
import sql from 'mssql/msnodesqlv8.js';

export const dbConfig = {
  server: 'HOME-PC\\SQLEXPRESS',
  database: 'BizIdeasDB',
  driver: 'msnodesqlv8',
  options: {
    trustedConnection: true
  }
};

export { sql };

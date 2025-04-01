import sql from 'mssql/msnodesqlv8.js';

const dbConfig = {
  server: 'HOME-PC\\SQLEXPRESS',
  database: 'BizIdeasDB',
  driver: 'msnodesqlv8',
  options: {
    trustedConnection: true
  }
};

export { sql, dbConfig };

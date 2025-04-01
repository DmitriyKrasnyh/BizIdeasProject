// dbConnection.js
import { sql, dbConfig } from './src/config/dbConfig.mjs';


let poolPromise = null;

export async function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(dbConfig);
  }
  return poolPromise;
}

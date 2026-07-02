import { Pool } from 'pg';

let pool;

export function db() {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('Falta DATABASE_URL');

  pool = new Pool({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
  });
  return pool;
}

export async function query(text, params = []) {
  return db().query(text, params);
}

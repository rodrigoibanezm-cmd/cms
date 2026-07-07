import { Pool } from 'pg';

let pool;

function normalizedDatabaseUrl(value) {
  const url = new URL(value);
  const sslmode = url.searchParams.get('sslmode');
  if (['prefer', 'require', 'verify-ca'].includes(sslmode)) {
    url.searchParams.set('sslmode', 'verify-full');
  }
  return url.toString();
}

function poolConfig(connectionString) {
  if (connectionString.includes('localhost')) {
    return { connectionString, ssl: false };
  }
  return { connectionString: normalizedDatabaseUrl(connectionString) };
}

export function db() {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('Falta DATABASE_URL');

  pool = new Pool(poolConfig(connectionString));
  return pool;
}

export async function query(text, params = []) {
  return db().query(text, params);
}
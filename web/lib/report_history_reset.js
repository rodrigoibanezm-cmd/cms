import { query } from './db.js';
import { ensureTenantSchema } from './tenant_store.js';

const HISTORY_TABLES = ['report_events', 'report_files', 'reports'];

async function exists(tableName) {
  const res = await query(
    `SELECT to_regclass($1) AS name`,
    [`public.${tableName}`]
  );
  return Boolean(res.rows[0]?.name);
}

export async function resetOtHistory() {
  await ensureTenantSchema();
  const cleared = [];

  for (const tableName of HISTORY_TABLES) {
    if (await exists(tableName)) {
      await query(`TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE`);
      cleared.push(tableName);
    }
  }

  return { cleared };
}

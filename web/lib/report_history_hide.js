import { query } from './db.js';

async function columnExists(tableName, columnName) {
  const res = await query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_name=$1 AND column_name=$2`,
    [tableName, columnName]
  );
  return Boolean(res.rows[0]);
}

export async function hideOtHistory() {
  const hasArchived = await columnExists('reports', 'archived_at');
  if (!hasArchived) throw new Error('Falta columna reports.archived_at');

  const res = await query(
    `UPDATE reports SET archived_at=now() WHERE archived_at IS NULL RETURNING id`
  );
  return { affected: res.rowCount };
}

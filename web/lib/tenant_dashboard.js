import { query } from './db.js';
import { getActiveTenant } from './tenant_store.js';

export async function getDashboardTenant(tenantId) {
  return getActiveTenant(tenantId, 'dashboard');
}

export async function getDashboardMetrics() {
  const sql = `SELECT current_state, count(*)::int AS count
    FROM reports GROUP BY current_state ORDER BY current_state`;
  return (await query(sql)).rows;
}

export async function listDashboardReports() {
  const sql = `SELECT ot, semaforo, current_state, created_at
    FROM reports ORDER BY created_at DESC LIMIT 50`;
  return (await query(sql)).rows;
}

import { query } from './db.js';
import { ensureTenantSchema } from './tenant_store.js';

export async function getDashboardTenant(tenantId) {
  if (!tenantId) return null;
  await ensureTenantSchema();
  const sql = `SELECT * FROM report_tenants
    WHERE id=$1 AND active=true AND mode IN ('dashboard', 'admin', 'super_admin')`;
  return (await query(sql, [tenantId])).rows[0] || null;
}

export async function listDashboardReports() {
  await ensureTenantSchema();
  const sql = `SELECT r.*, t.name AS tenant_name,
      r.extraction_json->>'tecnico' AS technician_name
    FROM reports r
    LEFT JOIN report_tenants t ON t.id::text = r.tenant_id
    ORDER BY r.created_at DESC LIMIT 200`;
  return (await query(sql)).rows;
}

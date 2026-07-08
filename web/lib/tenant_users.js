import { query } from './db.js';
import { ensureReportSchema } from './report_schema.js';
import { ensureTenantSchema } from './tenant_store.js';

export async function listAssignableUsers(tenantId) {
  if (!tenantId) throw new Error('tenantId requerido');
  await ensureReportSchema();
  await ensureTenantSchema();
  const res = await query(
    `SELECT DISTINCT u.*
     FROM report_tenants u
     JOIN tenant_access_tokens a ON a.user_id = u.id::text
     WHERE a.tenant_id=$1
       AND a.active=true
       AND u.active=true
       AND a.role IN ('administrativa', 'secretary')
       AND (a.expires_at IS NULL OR a.expires_at > now())
     ORDER BY u.name`,
    [tenantId]
  );
  return res.rows;
}

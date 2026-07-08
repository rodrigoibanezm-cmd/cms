import { randomUUID } from 'crypto';
import { query } from './db.js';
import { ensureReportSchema } from './report_schema.js';
import { ensureTenantSchema, getTenant } from './tenant_store.js';

async function ensureApprovalSchema() {
  await ensureReportSchema();
  await ensureTenantSchema();
}

async function findApprovalTarget(reportId, tenantId) {
  const res = await query(
    `SELECT id, tenant_id, current_state, current_owner_id,
        secretary_approved_at, approved_at
      FROM reports WHERE id=$1 AND tenant_id=$2`,
    [reportId, tenantId]
  );
  return res.rows[0] || null;
}

function approvalRole(mode) {
  if (mode === 'admin' || mode === 'super_admin') return 'admin';
  if (mode === 'secretary') return 'administrativa';
  throw new Error('Tenant no autorizado para aprobar');
}

function assertCanApprove(report, tenant) {
  if (!report) throw new Error('OT no encontrada');
  if (!tenant) throw new Error('Tenant aprobador requerido');
  if (report.approved_at || report.secretary_approved_at) throw new Error('OT ya aprobada');
  if (!['assigned_to_secretary', 'admin_queue'].includes(report.current_state)) {
    throw new Error('OT no aprobable en su estado actual');
  }
  if (tenant.mode === 'secretary' && ![report.tenant_id, report.current_owner_id].includes(tenant.id)) {
    throw new Error('OT asignada a otra administrativa');
  }
}

async function addApprovalEvent(reportId, tenant, role) {
  await query(
    `INSERT INTO report_events (id, tenant_id, report_id, event, payload_json)
      VALUES ($1, $2, $3, $4, $5)`,
    [randomUUID(), tenant.id, reportId, 'approved', JSON.stringify({
      approved_by_tenant_id: tenant.id,
      approved_by_tenant_mode: tenant.mode,
      approved_by_user_role: role,
    })]
  );
}

export async function approveReportByTenant({ reportId, tenantId }) {
  if (!reportId) throw new Error('reportId requerido');
  if (!tenantId) throw new Error('tenantId requerido');
  await ensureApprovalSchema();

  const report = await findApprovalTarget(reportId, tenantId);
  const tenant = await getTenant(tenantId);
  const role = approvalRole(tenant?.mode);
  assertCanApprove(report, tenant);

  const res = await query(
    `UPDATE reports SET current_state='secretary_approved',
        current_owner_type=$3, current_owner_id=$2,
        approved_at=now(), approved_by_user_id=$2,
        approved_by_user_role=$3, approved_by=$2,
        secretary_approved_at=now(),
        approved_by_secretary_id=CASE WHEN $4='secretary' THEN $2 ELSE approved_by_secretary_id END,
        last_workflow_event_at=now(), updated_at=now()
      WHERE id=$1 AND tenant_id=$2 RETURNING *`,
    [reportId, tenant.id, role, tenant.mode]
  );
  await addApprovalEvent(reportId, tenant, role);

  return { report: res.rows[0] };
}

export async function approveReportBySecretary({ reportId, secretaryId }) {
  return approveReportByTenant({ reportId, tenantId: secretaryId });
}

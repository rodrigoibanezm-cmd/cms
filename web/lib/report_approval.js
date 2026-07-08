import { randomUUID } from 'crypto';
import { query } from './db.js';
import { ensureReportSchema } from './report_schema.js';

async function findApprovalTarget(reportId, tenantId) {
  const res = await query(
    `SELECT id, tenant_id, current_state, current_owner_id,
        secretary_approved_at, approved_at
      FROM reports WHERE id=$1 AND tenant_id=$2`,
    [reportId, tenantId]
  );
  return res.rows[0] || null;
}

function canAdminApprove(role) {
  return ['admin', 'super_admin'].includes(role);
}

function canUserApprove(report, access) {
  if (canAdminApprove(access.role)) return true;
  if (!['administrativa', 'secretary'].includes(access.role)) return false;
  return report.current_owner_id === access.userId;
}

function assertCanApprove(report, access) {
  if (!report) throw new Error('OT no encontrada');
  if (!access?.tenantId) throw new Error('tenantId requerido');
  if (!access?.userId) throw new Error('userId requerido');
  if (report.approved_at || report.secretary_approved_at) throw new Error('OT ya aprobada');
  if (!['assigned_to_secretary', 'admin_queue'].includes(report.current_state)) {
    throw new Error('OT no aprobable en su estado actual');
  }
  if (!canUserApprove(report, access)) throw new Error('OT asignada a otra administrativa');
}

async function addApprovalEvent(reportId, access) {
  await query(
    `INSERT INTO report_events (id, tenant_id, report_id, event, payload_json)
      VALUES ($1, $2, $3, $4, $5)`,
    [randomUUID(), access.tenantId, reportId, 'approved', JSON.stringify({
      approved_by_user_id: access.userId,
      approved_by_user_role: access.role,
    })]
  );
}

export async function approveReportWithAccess({ reportId, access }) {
  if (!reportId) throw new Error('reportId requerido');
  await ensureReportSchema();

  const report = await findApprovalTarget(reportId, access.tenantId);
  assertCanApprove(report, access);

  const res = await query(
    `UPDATE reports SET current_state='secretary_approved',
        current_owner_type=$3, current_owner_id=$4,
        approved_at=now(), approved_by_user_id=$4,
        approved_by_user_role=$3, approved_by=$4,
        secretary_approved_at=now(),
        approved_by_secretary_id=CASE
          WHEN $3 IN ('administrativa', 'secretary') THEN $4
          ELSE approved_by_secretary_id END,
        last_workflow_event_at=now(), updated_at=now()
      WHERE id=$1 AND tenant_id=$2 RETURNING *`,
    [reportId, access.tenantId, access.role, access.userId]
  );
  await addApprovalEvent(reportId, access);

  return { report: res.rows[0] };
}

export async function approveReportByTenant({ reportId, tenantId, userId, role }) {
  return approveReportWithAccess({ reportId, access: { tenantId, userId, role } });
}

export async function approveReportBySecretary({ reportId, secretaryId, tenantId }) {
  return approveReportByTenant({
    reportId,
    tenantId,
    userId: secretaryId,
    role: 'administrativa',
  });
}

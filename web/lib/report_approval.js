import { randomUUID } from 'crypto';
import { query } from './db.js';
import { ensureReportSchema } from './report_schema.js';

function canAdminApprove(role) {
  return ['admin', 'super_admin'].includes(role);
}

function targetSql(access) {
  if (canAdminApprove(access?.role)) return 'id=$1';
  return 'id=$1 AND tenant_id=$2';
}

function targetParams(reportId, access) {
  if (canAdminApprove(access?.role)) return [reportId];
  return [reportId, access.tenantId];
}

async function findApprovalTarget(reportId, access) {
  const res = await query(
    `SELECT id, tenant_id, current_state, current_owner_id,
        secretary_approved_at, approved_at
       FROM reports WHERE ${targetSql(access)}`,
    targetParams(reportId, access)
  );
  return res.rows[0] || null;
}

function canUserApprove(report, access) {
  if (canAdminApprove(access.role)) return true;
  if (!['administrativa', 'secretary'].includes(access.role)) return false;
  return report.current_owner_id === access.userId;
}

function assertIdentity(access) {
  if (!access?.userId) throw new Error('userId requerido');
  if (!canAdminApprove(access.role) && !access?.tenantId) throw new Error('tenantId requerido');
}

function assertCanApprove(report, access) {
  if (!report) throw new Error('OT no encontrada');
  assertIdentity(access);
  if (report.approved_at || report.secretary_approved_at) throw new Error('OT ya aprobada');
  if (!['assigned_to_secretary', 'admin_queue'].includes(report.current_state)) {
    throw new Error('OT no aprobable en su estado actual');
  }
  if (!canUserApprove(report, access)) throw new Error('OT asignada a otra administrativa');
}

async function addApprovalEvent(reportId, access) {
  await query(
    `INSERT INTO report_events (id, tenant_id, report_id, event, payload_json)
       VALUES ($1, (SELECT tenant_id FROM reports WHERE id=$2), $2, $3, $4)`,
    [randomUUID(), reportId, 'approved', JSON.stringify({
      approved_by_user_id: access.userId,
      approved_by_user_role: access.role,
    })]
  );
}

function updateShape(access) {
  if (canAdminApprove(access.role)) {
    return { where: 'WHERE id=$1 RETURNING *', params: [access.role, access.userId] };
  }
  return {
    where: 'WHERE id=$1 AND tenant_id=$4 RETURNING *',
    params: [access.role, access.userId, access.tenantId],
  };
}

export async function approveReportWithAccess({ reportId, access }) {
  if (!reportId) throw new Error('reportId requerido');
  await ensureReportSchema();

  const report = await findApprovalTarget(reportId, access);
  assertCanApprove(report, access);
  const shape = updateShape(access);

  const res = await query(
    `UPDATE reports SET current_state='secretary_approved',
        current_owner_type=$2, current_owner_id=$3,
        approved_at=now(), approved_by_user_id=$3,
        approved_by_user_role=$2, approved_by=$3,
        secretary_approved_at=now(),
        approved_by_secretary_id=CASE
          WHEN $2 IN ('administrativa', 'secretary') THEN $3
          ELSE approved_by_secretary_id END,
        last_workflow_event_at=now(), updated_at=now()
      ${shape.where}`,
    [reportId, ...shape.params]
  );
  await addApprovalEvent(reportId, access);

  return { report: res.rows[0] };
}

export async function approveReportByTenant({ reportId, tenantId, userId, role }) {
  return approveReportWithAccess({ reportId, access: { tenantId, userId, role } });
}

export async function approveReportBySecretary({ reportId, secretaryId, tenantId }) {
  return approveReportByTenant({ reportId, tenantId, userId: secretaryId, role: 'administrativa' });
}

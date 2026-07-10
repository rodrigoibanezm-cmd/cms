import { randomUUID } from 'crypto';
import { query } from './db.js';
import { ensureReportSchema } from './report_schema.js';

function canAdmin(role) {
  return ['admin', 'super_admin'].includes(role);
}

function targetSql(access) {
  if (canAdmin(access?.role)) return 'id=$1 AND (tenant_id=$2 OR tenant_id IS NULL)';
  return 'id=$1 AND tenant_id=$2';
}

async function findTarget(reportId, access) {
  const res = await query(
    `SELECT id, current_state, current_owner_id, approved_at,
        secretary_approved_at, closed_at
       FROM reports WHERE ${targetSql(access)}`,
    [reportId, access.tenantId]
  );
  return res.rows[0] || null;
}

function canUserReject(report, access) {
  if (canAdmin(access.role)) return true;
  if (!['administrativa', 'secretary'].includes(access.role)) return false;
  return report.current_owner_id === access.userId;
}

function assertCanReject(report, access) {
  if (!report) throw new Error('OT no encontrada');
  if (!access?.tenantId) throw new Error('tenantId requerido');
  if (!access?.userId) throw new Error('userId requerido');
  if (report.closed_at || report.approved_at || report.secretary_approved_at) throw new Error('OT ya aprobada o cerrada');
  if (!['assigned_to_secretary', 'admin_queue', 'secretary_review'].includes(report.current_state)) {
    throw new Error('OT no rechazable en su estado actual');
  }
  if (!canUserReject(report, access)) throw new Error('OT asignada a otra administrativa');
}

function cleanReason(reason) {
  return String(reason || '').trim().slice(0, 500) || null;
}

async function attachTenantIfMissing(reportId, tenantId) {
  await query(`UPDATE reports SET tenant_id=COALESCE(tenant_id, $2) WHERE id=$1`, [reportId, tenantId]);
  await query(`UPDATE report_files SET tenant_id=COALESCE(tenant_id, $2) WHERE report_id=$1`, [reportId, tenantId]);
  await query(`UPDATE report_events SET tenant_id=COALESCE(tenant_id, $2) WHERE report_id=$1`, [reportId, tenantId]);
}

async function addRejectEvent(reportId, access, report, reason) {
  await query(
    `INSERT INTO report_events (id, tenant_id, report_id, event, payload_json)
       VALUES ($1, (SELECT tenant_id FROM reports WHERE id=$2), $2, $3, $4)`,
    [randomUUID(), reportId, 'rejected_by_secretary', JSON.stringify({
      reason,
      rejected_by_user_id: access.userId,
      rejected_by_user_role: access.role,
      previous_owner_id: report.current_owner_id,
      previous_state: report.current_state,
    })]
  );
}

export async function rejectReportWithAccess({ reportId, reason, access }) {
  if (!reportId) throw new Error('reportId requerido');
  await ensureReportSchema();
  const report = await findTarget(reportId, access);
  assertCanReject(report, access);
  await attachTenantIfMissing(reportId, access.tenantId);
  const clean = cleanReason(reason);
  const res = await query(
    `UPDATE reports SET current_state='rejected', current_owner_type='admin',
        current_owner_id=NULL, rejected_at=now(), rejected_reason=$2,
        last_workflow_event_at=now(), updated_at=now()
      WHERE id=$1 AND tenant_id=$3 RETURNING *`,
    [reportId, clean, access.tenantId]
  );
  await addRejectEvent(reportId, access, report, clean);
  return { report: res.rows[0] };
}

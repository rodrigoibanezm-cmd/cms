import { randomUUID } from 'crypto';
import { query } from './db.js';
import { ensureReportSchema } from './report_schema.js';
function canAdminApprove(role) {
  return ['admin', 'super_admin'].includes(role);
}
function targetSql(access) {
  if (canAdminApprove(access?.role)) return 'id=$1 AND (tenant_id=$2 OR tenant_id IS NULL)';
  return 'id=$1 AND tenant_id=$2';
}
function targetParams(reportId, access) {
  return [reportId, access.tenantId];
}
async function findApprovalTarget(reportId, access) {
  const res = await query(
    `SELECT id, tenant_id, current_state, current_owner_id,
        secretary_approved_at, transcription_approved_at, approved_at, closed_at
       FROM reports WHERE ${targetSql(access)}`,
    targetParams(reportId, access)
  );
  return res.rows[0] || null;
}
function canUserApprove(report, access) {
  if (canAdminApprove(access.role)) return true;
  if (!['administrativa', 'secretary'].includes(access.role)) return false;
  return report.current_owner_id === access.userId || report.approved_by_secretary_id === access.userId;
}
function assertIdentity(access) {
  if (!access?.userId) throw new Error('userId requerido');
  if (!access?.tenantId) throw new Error('tenantId requerido');
}
function assertCanApprove(report, access) {
  if (!report) throw new Error('OT no encontrada');
  assertIdentity(access);
  if (report.closed_at) throw new Error('OT cerrada');
  if (!['assigned_to_secretary', 'admin_queue', 'secretary_approved'].includes(report.current_state)) {
    throw new Error('OT no aprobable en su estado actual');
  }
  if (!canUserApprove(report, access)) throw new Error('OT asignada a otra administrativa');
}
async function attachTenantIfMissing(reportId, tenantId) {
  await query(`UPDATE reports SET tenant_id=COALESCE(tenant_id, $2) WHERE id=$1`, [reportId, tenantId]);
  await query(`UPDATE report_files SET tenant_id=COALESCE(tenant_id, $2) WHERE report_id=$1`, [reportId, tenantId]);
  await query(`UPDATE report_events SET tenant_id=COALESCE(tenant_id, $2) WHERE report_id=$1`, [reportId, tenantId]);
}
async function addApprovalEvent(reportId, access, previous, approved) {
  await query(
    `INSERT INTO report_events (id, tenant_id, report_id, event, payload_json)
       VALUES ($1, (SELECT tenant_id FROM reports WHERE id=$2), $2, $3, $4)`,
    [randomUUID(), reportId, 'transcription_approved', JSON.stringify({
      approved_by_user_id: access.userId,
      approved_by_user_role: access.role,
      previous_state: previous.current_state,
      repeated: Boolean(previous.transcription_approved_at || previous.secretary_approved_at || previous.approved_at),
      approved_xls_file_id: approved.transcription_approved_xls_file_id,
    })]
  );
}
function updateWhere(access) {
  return canAdminApprove(access.role)
    ? 'WHERE id=$1 AND (tenant_id=$4 OR tenant_id IS NULL)'
    : 'WHERE id=$1 AND tenant_id=$4';
}
export async function approveReportWithAccess({ reportId, access }) {
  if (!reportId) throw new Error('reportId requerido');
  await ensureReportSchema();
  const report = await findApprovalTarget(reportId, access);
  assertCanApprove(report, access);
  await attachTenantIfMissing(reportId, access.tenantId);
  const res = await query(
    `WITH approved_xls AS (
       SELECT f.id FROM report_files f JOIN reports r ON r.id=f.report_id
       WHERE f.report_id=$1 AND f.kind='generated_xls' AND f.drive_file_id=r.drive_file_id
     )
     UPDATE reports SET current_state='secretary_approved',
        current_owner_type=$2, current_owner_id=$3,
        approved_at=now(), approved_by_user_id=$3,
        approved_by_user_role=$2, approved_by=$3,
        secretary_approved_at=now(), transcription_approved_at=now(),
        transcription_approved_xls_file_id=(SELECT id FROM approved_xls),
        approved_by_secretary_id=CASE
          WHEN $2 IN ('administrativa', 'secretary') THEN $3
          ELSE approved_by_secretary_id END,
        last_workflow_event_at=now(), updated_at=now()
      ${updateWhere(access)} AND EXISTS (SELECT 1 FROM approved_xls) RETURNING *`,
    [reportId, access.role, access.userId, access.tenantId]
  );
  if (!res.rows[0]) throw new Error('XLS vigente no registrado; no se puede aprobar');
  await addApprovalEvent(reportId, access, report, res.rows[0]);
  return { report: res.rows[0] };
}
export async function approveReportByTenant({ reportId, tenantId, userId, role }) {
  return approveReportWithAccess({ reportId, access: { tenantId, userId, role } });
}
export async function approveReportBySecretary({ reportId, secretaryId, tenantId }) {
  return approveReportByTenant({ reportId, tenantId, userId: secretaryId, role: 'administrativa' });
}

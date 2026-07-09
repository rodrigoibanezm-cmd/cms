import { query } from './db.js';
import { ensureReportSchema } from './report_schema.js';
import { ensureTenantSchema } from './tenant_store.js';
import { transitionReportWorkflow, WORKFLOW } from './report_workflow.js';

async function ensureAssignmentSchema() {
  await ensureReportSchema();
  await ensureTenantSchema();
}

function isSuperAdmin(access) {
  return access?.role === 'super_admin';
}

async function findReport(reportId, access) {
  await ensureAssignmentSchema();
  const where = isSuperAdmin(access) ? 'id=$1' : '(id=$1 AND (tenant_id=$2 OR tenant_id IS NULL))';
  const params = isSuperAdmin(access) ? [reportId] : [reportId, access.tenantId];
  const res = await query(
    `SELECT id, status, current_state, excel_url FROM reports WHERE ${where}`,
    params
  );
  return res.rows[0] || null;
}

function canAssign(report) {
  if (!report.current_state) return true;
  if (['admin_queue', 'assigned_to_secretary'].includes(report.current_state)) return true;
  return report.current_state === 'processing' && Boolean(report.excel_url || report.status === 'processed');
}

function userSql(access) {
  if (isSuperAdmin(access)) return 'user_id=$1';
  return 'tenant_id=$1 AND user_id=$2';
}

function userParams(access, userId) {
  if (isSuperAdmin(access)) return [userId];
  return [access.tenantId, userId];
}

async function findAssignableUser(access, userId) {
  const res = await query(
    `SELECT tenant_id, user_id FROM tenant_access_tokens
     WHERE ${userSql(access)} AND role IN ('administrativa', 'secretary')
       AND active=true AND (expires_at IS NULL OR expires_at > now())
     LIMIT 1`,
    userParams(access, userId)
  );
  return res.rows[0] || null;
}

async function attachTenant(reportId, tenantId) {
  await query(`UPDATE reports SET tenant_id=$2, updated_at=now() WHERE id=$1`, [reportId, tenantId]);
  await query(`UPDATE report_files SET tenant_id=$2 WHERE report_id=$1`, [reportId, tenantId]);
  await query(`UPDATE report_events SET tenant_id=$2 WHERE report_id=$1`, [reportId, tenantId]);
}

export async function assignReportToSecretary({ reportId, secretaryId, access }) {
  if (!reportId) throw new Error('reportId requerido');
  if (!secretaryId) throw new Error('secretaryId requerido');
  if (!access?.userId) throw new Error('userId requerido');
  if (!isSuperAdmin(access) && !access?.tenantId) throw new Error('tenantId requerido');

  const report = await findReport(reportId, access);
  if (!report) throw new Error('OT no encontrada');
  if (!canAssign(report)) throw new Error('OT no asignable en su estado actual');

  const secretary = await findAssignableUser(access, secretaryId);
  if (!secretary) throw new Error('Administrativa no pertenece al tenant');

  await attachTenant(report.id, secretary.tenant_id);
  await transitionReportWorkflow(report.id, WORKFLOW.ASSIGNED_TO_SECRETARY, {
    secretary_id: secretary.user_id,
    tenant_id: secretary.tenant_id,
    assigned_by_user_id: access.userId,
    assigned_by_user_role: access.role,
    previous_state: report.current_state,
  });

  return { report_id: report.id, secretary_id: secretary.user_id };
}

export async function listSecretaryQueue({ tenantId, userId }) {
  if (!tenantId) throw new Error('tenantId requerido');
  if (!userId) throw new Error('userId requerido');
  await ensureAssignmentSchema();
  const sql = `SELECT r.*, r.extraction_json->>'tecnico' AS technician_name
    FROM reports r
    WHERE r.tenant_id=$1
      AND r.current_owner_id=$2
      AND r.current_state IN ('assigned_to_secretary', 'secretary_approved')
    ORDER BY r.secretary_approved_at NULLS FIRST,
      r.assigned_at DESC NULLS LAST, r.created_at DESC`;
  return (await query(sql, [tenantId, userId])).rows;
}

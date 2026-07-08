import { query } from './db.js';
import { ensureReportSchema } from './report_schema.js';
import { ensureTenantSchema } from './tenant_store.js';
import { transitionReportWorkflow, WORKFLOW } from './report_workflow.js';

async function ensureAssignmentSchema() {
  await ensureReportSchema();
  await ensureTenantSchema();
}

async function findReport(reportId, tenantId) {
  await ensureAssignmentSchema();
  const res = await query(
    `SELECT id, status, current_state, excel_url
     FROM reports WHERE id=$1 AND tenant_id=$2`,
    [reportId, tenantId]
  );
  return res.rows[0] || null;
}

function canAssign(report) {
  if (!report.current_state) return true;
  if (['admin_queue', 'assigned_to_secretary'].includes(report.current_state)) return true;
  return report.current_state === 'processing' && Boolean(report.excel_url || report.status === 'processed');
}

async function findAssignableUser(tenantId, userId) {
  const res = await query(
    `SELECT user_id FROM tenant_access_tokens
     WHERE tenant_id=$1 AND user_id=$2
       AND role IN ('administrativa', 'secretary')
       AND active=true
       AND (expires_at IS NULL OR expires_at > now())
     LIMIT 1`,
    [tenantId, userId]
  );
  return res.rows[0] || null;
}

export async function assignReportToSecretary({ reportId, secretaryId, tenantId }) {
  if (!reportId) throw new Error('reportId requerido');
  if (!secretaryId) throw new Error('secretaryId requerido');
  if (!tenantId) throw new Error('tenantId requerido');

  const report = await findReport(reportId, tenantId);
  if (!report) throw new Error('OT no encontrada');
  if (!canAssign(report)) throw new Error('OT no asignable en su estado actual');

  const secretary = await findAssignableUser(tenantId, secretaryId);
  if (!secretary) throw new Error('Administrativa no pertenece al tenant');

  await transitionReportWorkflow(reportId, WORKFLOW.ASSIGNED_TO_SECRETARY, {
    secretary_id: secretary.user_id,
    tenant_id: tenantId,
    previous_state: report.current_state,
  });

  return { report_id: reportId, secretary_id: secretary.user_id };
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

import { query } from './db.js';
import { ensureReportSchema } from './report_schema.js';
import { getActiveTenant } from './tenant_store.js';
import { transitionReportWorkflow, WORKFLOW } from './report_workflow.js';

const ASSIGNABLE_STATES = [null, 'admin_queue', 'assigned_to_secretary'];

async function findReport(reportId) {
  await ensureReportSchema();
  const res = await query(
    `SELECT id, current_state FROM reports WHERE id=$1`,
    [reportId]
  );
  return res.rows[0] || null;
}

async function setReportTenant(reportId, tenant) {
  await query(
    `UPDATE reports SET tenant_id=$2, updated_at=now() WHERE id=$1`,
    [reportId, tenant.id]
  );
}

export async function assignReportToSecretary({ reportId, secretaryId }) {
  if (!reportId) throw new Error('reportId requerido');
  if (!secretaryId) throw new Error('secretaryId requerido');

  const report = await findReport(reportId);
  if (!report) throw new Error('OT no encontrada');
  if (!ASSIGNABLE_STATES.includes(report.current_state)) {
    throw new Error('OT no asignable en su estado actual');
  }

  const tenant = await getActiveTenant(secretaryId, 'secretary');
  if (!tenant) throw new Error('Tenant secretaria activo no encontrado');

  await transitionReportWorkflow(reportId, WORKFLOW.ASSIGNED_TO_SECRETARY, {
    secretary_id: tenant.id,
    secretary_name: tenant.name,
    tenant_id: tenant.id,
    previous_state: report.current_state,
  });
  await setReportTenant(reportId, tenant);

  return { report_id: reportId, tenant };
}

export async function listSecretaryQueue(secretaryId) {
  if (!secretaryId) throw new Error('secretaryId requerido');
  await ensureReportSchema();
  const sql = `SELECT r.*, t.name AS tenant_name
    FROM reports r
    LEFT JOIN report_tenants t ON t.id::text = r.tenant_id
    WHERE r.tenant_id=$1 AND r.current_state='assigned_to_secretary'
    ORDER BY r.assigned_at DESC NULLS LAST, r.created_at DESC`;
  return (await query(sql, [secretaryId])).rows;
}

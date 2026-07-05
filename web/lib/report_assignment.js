import { query } from './db.js';
import { getActiveSecretary } from './secretary_store.js';
import { transitionReportWorkflow, WORKFLOW } from './report_workflow.js';

const ASSIGNABLE_STATES = ['admin_queue', 'assigned_to_secretary'];

async function findReport(reportId) {
  const res = await query(
    `SELECT id, current_state FROM reports WHERE id=$1`,
    [reportId]
  );
  return res.rows[0] || null;
}

async function setReportTenant(reportId, secretary) {
  await query(
    `UPDATE reports SET tenant_id=$2, updated_at=now() WHERE id=$1`,
    [reportId, secretary.id]
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

  const secretary = await getActiveSecretary(secretaryId);
  if (!secretary) throw new Error('Secretaria activa no encontrada');

  await transitionReportWorkflow(reportId, WORKFLOW.ASSIGNED_TO_SECRETARY, {
    secretary_id: secretary.id,
    secretary_name: secretary.name,
    tenant_id: secretary.id,
    previous_state: report.current_state,
  });
  await setReportTenant(reportId, secretary);

  return { report_id: reportId, tenant: secretary };
}

export async function listSecretaryQueue(secretaryId) {
  if (!secretaryId) throw new Error('secretaryId requerido');
  const sql = `SELECT r.*, s.name AS tenant_name
    FROM reports r
    LEFT JOIN report_secretaries s ON s.id::text = r.tenant_id
    WHERE r.tenant_id=$1 AND r.current_state='assigned_to_secretary'
    ORDER BY r.assigned_at DESC NULLS LAST, r.created_at DESC`;
  return (await query(sql, [secretaryId])).rows;
}

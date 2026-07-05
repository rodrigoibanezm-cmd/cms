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
    previous_state: report.current_state,
  });

  return { report_id: reportId, secretary };
}

export async function listSecretaryQueue(secretaryId) {
  if (!secretaryId) throw new Error('secretaryId requerido');
  const sql = `SELECT r.*, s.name AS current_owner_name
    FROM reports r
    LEFT JOIN report_secretaries s ON s.id::text = r.current_owner_id
    WHERE r.current_owner_type='secretary' AND r.current_owner_id=$1
    ORDER BY r.assigned_at DESC NULLS LAST, r.created_at DESC`;
  return (await query(sql, [secretaryId])).rows;
}

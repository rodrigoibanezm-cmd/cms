import { randomUUID } from 'crypto';
import { query } from './db.js';
import { ensureReportSchema } from './report_schema.js';
import { ensureTenantSchema } from './tenant_store.js';

async function ensureApprovalSchema() {
  await ensureReportSchema();
  await ensureTenantSchema();
}

async function findApprovalTarget(reportId) {
  const res = await query(
    `SELECT id, tenant_id, current_state, current_owner_id, secretary_approved_at
     FROM reports WHERE id=$1`,
    [reportId]
  );
  return res.rows[0] || null;
}

function assertCanApprove(report, secretaryId) {
  if (!report) throw new Error('OT no encontrada');
  if (report.secretary_approved_at) throw new Error('OT ya aprobada');
  if (report.current_state !== 'assigned_to_secretary') {
    throw new Error('OT no está asignada a secretaria');
  }
  if (secretaryId && ![report.tenant_id, report.current_owner_id].includes(secretaryId)) {
    throw new Error('OT asignada a otra secretaria');
  }
}

async function addApprovalEvent(reportId, secretaryId) {
  await query(
    `INSERT INTO report_events (id, report_id, event, payload_json)
     VALUES ($1, $2, $3, $4)`,
    [randomUUID(), reportId, 'secretary_approved', JSON.stringify({ secretary_id: secretaryId })]
  );
}

export async function approveReportBySecretary({ reportId, secretaryId }) {
  if (!reportId) throw new Error('reportId requerido');
  await ensureApprovalSchema();

  const report = await findApprovalTarget(reportId);
  const approverId = secretaryId || report?.current_owner_id || report?.tenant_id || null;
  assertCanApprove(report, approverId);

  const res = await query(
    `UPDATE reports SET current_state='secretary_approved',
       current_owner_type='admin', current_owner_id=NULL,
       secretary_approved_at=now(), approved_by_secretary_id=$2,
       last_workflow_event_at=now(), updated_at=now()
     WHERE id=$1 RETURNING *`,
    [reportId, approverId]
  );
  await addApprovalEvent(reportId, approverId);

  return { report: res.rows[0] };
}

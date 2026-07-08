import { randomUUID } from 'crypto';
import { query } from './db.js';
import { ensureReportSchema } from './report_schema.js';
import { ensureTenantSchema } from './tenant_store.js';

const ROLES = ['administrativa', 'admin'];

async function ensureApprovalSchema() {
  await ensureReportSchema();
  await ensureTenantSchema();
}

async function findApprovalTarget(reportId) {
  const res = await query(
    `SELECT id, tenant_id, current_state, current_owner_id,
       secretary_approved_at, approved_at
     FROM reports WHERE id=$1`,
    [reportId]
  );
  return res.rows[0] || null;
}

function cleanRole(role) {
  return ROLES.includes(role) ? role : 'administrativa';
}

function assertCanApprove(report, approverId, role) {
  if (!report) throw new Error('OT no encontrada');
  if (!approverId) throw new Error('Aprobador requerido');
  if (report.approved_at || report.secretary_approved_at) throw new Error('OT ya aprobada');
  if (!['assigned_to_secretary', 'admin_queue'].includes(report.current_state)) {
    throw new Error('OT no aprobable en su estado actual');
  }
  if (role === 'administrativa' && ![report.tenant_id, report.current_owner_id].includes(approverId)) {
    throw new Error('OT asignada a otra administrativa');
  }
}

async function addApprovalEvent(reportId, approverId, role) {
  await query(
    `INSERT INTO report_events (id, report_id, event, payload_json)
     VALUES ($1, $2, $3, $4)`,
    [randomUUID(), reportId, 'approved', JSON.stringify({
      approved_by_user_id: approverId,
      approved_by_user_role: role,
    })]
  );
}

export async function approveReport({ reportId, approverId, approverRole }) {
  if (!reportId) throw new Error('reportId requerido');
  await ensureApprovalSchema();

  const report = await findApprovalTarget(reportId);
  const role = cleanRole(approverRole);
  const userId = approverId || report?.current_owner_id || report?.tenant_id || null;
  assertCanApprove(report, userId, role);

  const res = await query(
    `UPDATE reports SET current_state='secretary_approved',
       current_owner_type=$3, current_owner_id=$2,
       approved_at=now(), approved_by_user_id=$2,
       approved_by_user_role=$3, approved_by=$2,
       secretary_approved_at=now(),
       approved_by_secretary_id=CASE WHEN $3='administrativa' THEN $2 ELSE approved_by_secretary_id END,
       last_workflow_event_at=now(), updated_at=now()
     WHERE id=$1 RETURNING *`,
    [reportId, userId, role]
  );
  await addApprovalEvent(reportId, userId, role);

  return { report: res.rows[0] };
}

export async function approveReportBySecretary({ reportId, secretaryId }) {
  return approveReport({
    reportId,
    approverId: secretaryId,
    approverRole: 'administrativa',
  });
}

import { randomUUID } from 'crypto';
import { query } from './db.js';
import { ensureReportSchema } from './report_schema.js';
import { initialWorkflowValues, transitionReportWorkflow, WORKFLOW } from './report_workflow.js';

export async function addReportEvent(reportId, event, payload = {}, tenantId = null) {
  await ensureReportSchema();
  await query(
    `INSERT INTO report_events (id, tenant_id, report_id, event, payload_json)
     VALUES ($1, COALESCE($2, (SELECT tenant_id FROM reports WHERE id=$3)), $3, $4, $5)`,
    [randomUUID(), tenantId, reportId, event, JSON.stringify(payload)]
  );
}

export async function createReport({ ot, sourceName, tenantId = null }) {
  await ensureReportSchema();
  const id = randomUUID();
  const workflow = initialWorkflowValues();
  const res = await query(
    `INSERT INTO reports (id, tenant_id, ot, source_name, current_state,
      current_owner_type, current_owner_id, last_workflow_event_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, now()) RETURNING *`,
    [id, tenantId, ot || null, sourceName || null, workflow.current_state,
      workflow.current_owner_type, workflow.current_owner_id]
  );
  await addReportEvent(id, 'uploaded', { sourceName }, tenantId);
  await transitionReportWorkflow(id, WORKFLOW.PROCESSING_STARTED, { sourceName });
  return res.rows[0];
}

export async function addReportFile(reportId, file, tenantId = null) {
  await ensureReportSchema();
  await query(
    `INSERT INTO report_files
     (id, tenant_id, report_id, kind, filename, mime_type, drive_file_id, url)
     VALUES ($1, COALESCE($2, (SELECT tenant_id FROM reports WHERE id=$3)),
       $3, $4, $5, $6, $7, $8)`,
    [randomUUID(), tenantId, reportId, file.kind, file.filename,
      file.mimeType, file.driveFileId, file.url]
  );
}

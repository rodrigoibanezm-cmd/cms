import { randomUUID } from 'crypto';
import { query } from './db.js';
import { ensureReportSchema } from './report_schema.js';
import { initialWorkflowValues, transitionReportWorkflow, WORKFLOW } from './report_workflow.js';

export async function addReportEvent(reportId, event, payload = {}) {
  await ensureReportSchema();
  await query(
    `INSERT INTO report_events (id, report_id, event, payload_json)
     VALUES ($1, $2, $3, $4)`,
    [randomUUID(), reportId, event, JSON.stringify(payload)]
  );
}

export async function createReport({ ot, sourceName }) {
  await ensureReportSchema();
  const id = randomUUID();
  const workflow = initialWorkflowValues();
  const res = await query(
    `INSERT INTO reports (id, ot, source_name, current_state,
      current_owner_type, current_owner_id, last_workflow_event_at)
     VALUES ($1, $2, $3, $4, $5, $6, now()) RETURNING *`,
    [id, ot || null, sourceName || null, workflow.current_state,
      workflow.current_owner_type, workflow.current_owner_id]
  );
  await addReportEvent(id, 'uploaded', { sourceName });
  await transitionReportWorkflow(id, WORKFLOW.PROCESSING_STARTED, { sourceName });
  return res.rows[0];
}

export async function addReportFile(reportId, file) {
  await ensureReportSchema();
  await query(
    `INSERT INTO report_files
     (id, report_id, kind, filename, mime_type, drive_file_id, url)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [randomUUID(), reportId, file.kind, file.filename, file.mimeType, file.driveFileId, file.url]
  );
}
import { randomUUID } from 'crypto';
import { query } from './db.js';
import { initialWorkflowValues } from './report_workflow.js';

let ready;

export async function ensureReportSchema() {
  if (ready) return ready;
  ready = query(`
    CREATE TABLE IF NOT EXISTS reports (
      id uuid PRIMARY KEY,
      ot text,
      source_name text,
      status text NOT NULL DEFAULT 'processing',
      review_status text NOT NULL DEFAULT 'pending',
      semaforo text,
      confidence_score integer,
      template_key text,
      template_filename text,
      excel_url text,
      drive_file_id text,
      extraction_json jsonb,
      admin_corrections jsonb NOT NULL DEFAULT '{}'::jsonb,
      critical_checks jsonb NOT NULL DEFAULT '{}'::jsonb,
      admin_notes text,
      approved_at timestamptz,
      approved_by text,
      rejected_at timestamptz,
      rejected_reason text,
      error_message text,
      current_state text NOT NULL DEFAULT 'processing',
      current_owner_type text NOT NULL DEFAULT 'system',
      current_owner_id text,
      assigned_at timestamptz,
      opened_by_secretary_at timestamptz,
      secretary_approved_at timestamptz,
      closed_at timestamptz,
      priority text,
      sla_due_at timestamptz,
      last_workflow_event_at timestamptz,
      approved_by_secretary_id text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `).then(() => query(`
    ALTER TABLE reports
      ADD COLUMN IF NOT EXISTS admin_corrections jsonb NOT NULL DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS critical_checks jsonb NOT NULL DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS admin_notes text,
      ADD COLUMN IF NOT EXISTS approved_at timestamptz,
      ADD COLUMN IF NOT EXISTS approved_by text,
      ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
      ADD COLUMN IF NOT EXISTS rejected_reason text,
      ADD COLUMN IF NOT EXISTS current_state text NOT NULL DEFAULT 'processing',
      ADD COLUMN IF NOT EXISTS current_owner_type text NOT NULL DEFAULT 'system',
      ADD COLUMN IF NOT EXISTS current_owner_id text,
      ADD COLUMN IF NOT EXISTS assigned_at timestamptz,
      ADD COLUMN IF NOT EXISTS opened_by_secretary_at timestamptz,
      ADD COLUMN IF NOT EXISTS secretary_approved_at timestamptz,
      ADD COLUMN IF NOT EXISTS closed_at timestamptz,
      ADD COLUMN IF NOT EXISTS priority text,
      ADD COLUMN IF NOT EXISTS sla_due_at timestamptz,
      ADD COLUMN IF NOT EXISTS last_workflow_event_at timestamptz,
      ADD COLUMN IF NOT EXISTS approved_by_secretary_id text
  `)).then(() => query(`
    CREATE TABLE IF NOT EXISTS report_files (
      id uuid PRIMARY KEY,
      report_id uuid NOT NULL REFERENCES reports(id),
      kind text NOT NULL,
      filename text,
      mime_type text,
      drive_file_id text,
      url text,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `)).then(() => query(`
    CREATE TABLE IF NOT EXISTS report_events (
      id uuid PRIMARY KEY,
      report_id uuid NOT NULL REFERENCES reports(id),
      event text NOT NULL,
      payload_json jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `));
  return ready;
}
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
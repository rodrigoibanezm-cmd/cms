import { query } from './db.js';

let ready;

const reportColumns = `
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
`;

async function createReportsTable() {
  await query(`CREATE TABLE IF NOT EXISTS reports (
    id uuid PRIMARY KEY, ot text, source_name text,
    status text NOT NULL DEFAULT 'processing',
    review_status text NOT NULL DEFAULT 'pending',
    semaforo text, confidence_score integer,
    template_key text, template_filename text,
    excel_url text, drive_file_id text, extraction_json jsonb,
    error_message text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`);
  await query(`ALTER TABLE reports ${reportColumns}`);
}

async function createReportFilesTable() {
  await query(`CREATE TABLE IF NOT EXISTS report_files (
    id uuid PRIMARY KEY,
    report_id uuid NOT NULL REFERENCES reports(id),
    kind text NOT NULL,
    filename text,
    mime_type text,
    drive_file_id text,
    url text,
    created_at timestamptz NOT NULL DEFAULT now()
  )`);
}

async function createReportEventsTable() {
  await query(`CREATE TABLE IF NOT EXISTS report_events (
    id uuid PRIMARY KEY,
    report_id uuid NOT NULL REFERENCES reports(id),
    event text NOT NULL,
    payload_json jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
  )`);
}

export async function ensureReportSchema() {
  if (ready) return ready;
  ready = Promise.all([
    createReportsTable(),
    createReportFilesTable(),
    createReportEventsTable(),
  ]);
  return ready;
}
import { query } from './db.js';
let ready;
const proposalColumns = `ADD COLUMN IF NOT EXISTS final_report_proposal jsonb, ADD COLUMN IF NOT EXISTS final_report_proposal_generated_at timestamptz, ADD COLUMN IF NOT EXISTS final_report_proposal_model text, ADD COLUMN IF NOT EXISTS final_report_proposal_spec_version text, ADD COLUMN IF NOT EXISTS final_report_proposal_source_file_id uuid`;
const reportColumns = `
  ADD COLUMN IF NOT EXISTS tenant_id text,
  ADD COLUMN IF NOT EXISTS admin_corrections jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS critical_checks jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS admin_notes text,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by text,
  ADD COLUMN IF NOT EXISTS approved_by_user_id text,
  ADD COLUMN IF NOT EXISTS approved_by_user_role text,
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejected_reason text,
  ADD COLUMN IF NOT EXISTS current_state text NOT NULL DEFAULT 'processing',
  ADD COLUMN IF NOT EXISTS current_owner_type text NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS current_owner_id text,
  ADD COLUMN IF NOT EXISTS assigned_at timestamptz,
  ADD COLUMN IF NOT EXISTS opened_by_secretary_at timestamptz,
  ADD COLUMN IF NOT EXISTS secretary_approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS transcription_approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS final_report_approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS closed_at timestamptz,
  ADD COLUMN IF NOT EXISTS priority text,
  ADD COLUMN IF NOT EXISTS sla_due_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_workflow_event_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by_secretary_id text
`;
async function createReportsTable() {
  await query(`CREATE TABLE IF NOT EXISTS reports (
    id uuid PRIMARY KEY, tenant_id text, ot text, source_name text,
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
  await query(`ALTER TABLE reports ${proposalColumns}`);
  await query(`CREATE INDEX IF NOT EXISTS idx_reports_tenant_id ON reports(tenant_id)`);
}
async function createReportFilesTable() {
  await query(`CREATE TABLE IF NOT EXISTS report_files (
    id uuid PRIMARY KEY,
    tenant_id text,
    report_id uuid NOT NULL REFERENCES reports(id),
    kind text NOT NULL,
    filename text,
    mime_type text,
    drive_file_id text,
    url text,
    created_at timestamptz NOT NULL DEFAULT now()
  )`);
  await query(`ALTER TABLE report_files ADD COLUMN IF NOT EXISTS tenant_id text`);
  await query(`CREATE INDEX IF NOT EXISTS idx_report_files_tenant_id ON report_files(tenant_id)`);
}

async function createReportEventsTable() {
  await query(`CREATE TABLE IF NOT EXISTS report_events (
    id uuid PRIMARY KEY,
    tenant_id text,
    report_id uuid NOT NULL REFERENCES reports(id),
    event text NOT NULL,
    payload_json jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
  )`);
  await query(`ALTER TABLE report_events ADD COLUMN IF NOT EXISTS tenant_id text`);
  await query(`CREATE INDEX IF NOT EXISTS idx_report_events_tenant_id ON report_events(tenant_id)`);
}

async function createTenantAccessTokensTable() {
  await query(`CREATE TABLE IF NOT EXISTS tenant_access_tokens (
    tenant_id text NOT NULL,
    role text NOT NULL,
    user_id text,
    token_hash text PRIMARY KEY,
    token_plain text,
    active boolean NOT NULL DEFAULT true,
    expires_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    last_used_at timestamptz
  )`);
  await query(`ALTER TABLE tenant_access_tokens ADD COLUMN IF NOT EXISTS token_plain text`);
  await query(`CREATE INDEX IF NOT EXISTS idx_tenant_access_active ON tenant_access_tokens(active)`);
}

export async function ensureReportSchema() {
  if (ready) return ready;
  ready = Promise.all([
    createReportsTable(),
    createReportFilesTable(),
    createReportEventsTable(),
    createTenantAccessTokensTable(),
  ]);
  return ready;
}

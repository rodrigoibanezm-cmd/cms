import { randomUUID } from 'crypto';
import { query } from './db.js';

let ready;

async function ensureSchema() {
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
      error_message text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `).then(() => query(`
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
  await ensureSchema();
  await query(
    `INSERT INTO report_events (id, report_id, event, payload_json)
     VALUES ($1, $2, $3, $4)`,
    [randomUUID(), reportId, event, JSON.stringify(payload)]
  );
}

export async function createReport({ ot, sourceName }) {
  await ensureSchema();
  const id = randomUUID();
  const res = await query(
    `INSERT INTO reports (id, ot, source_name)
     VALUES ($1, $2, $3) RETURNING *`,
    [id, ot || null, sourceName || null]
  );
  await addReportEvent(id, 'uploaded', { sourceName });
  return res.rows[0];
}

export async function addReportFile(reportId, file) {
  await ensureSchema();
  await query(
    `INSERT INTO report_files
     (id, report_id, kind, filename, mime_type, drive_file_id, url)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [randomUUID(), reportId, file.kind, file.filename, file.mimeType, file.driveFileId, file.url]
  );
}

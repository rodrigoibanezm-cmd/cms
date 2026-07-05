import { query } from './db.js';
import { ensureSecretarySchema } from './secretary_store.js';

const reportsTable = 'reports';
const filesTable = 'report_files';
const eventsTable = 'report_events';

export async function listReports() {
  await ensureSecretarySchema();
  const sql = `SELECT r.*, s.name AS current_owner_name
    FROM ${reportsTable} r
    LEFT JOIN report_secretaries s ON s.id::text = r.current_owner_id
    ORDER BY r.created_at DESC LIMIT 200`;
  return (await query(sql)).rows;
}

function latestAudit(events) {
  return events
    .slice()
    .reverse()
    .find((event) => event.event === 'audit_completed')?.payload_json || null;
}

export async function getReport(id) {
  const reportSql = `SELECT * FROM ${reportsTable} WHERE id=$1`;
  const filesSql = `SELECT * FROM ${filesTable} WHERE report_id=$1 ORDER BY created_at`;
  const eventsSql = `SELECT * FROM ${eventsTable} WHERE report_id=$1 ORDER BY created_at`;
  const report = await query(reportSql, [id]);
  const files = await query(filesSql, [id]);
  const events = await query(eventsSql, [id]);
  return {
    report: report.rows[0] || null,
    files: files.rows,
    events: events.rows,
    audit: latestAudit(events.rows),
  };
}

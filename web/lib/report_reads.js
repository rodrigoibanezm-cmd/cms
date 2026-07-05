import { query } from './db.js';
import { ensureTenantSchema } from './tenant_store.js';

const reportsTable = 'reports';
const filesTable = 'report_files';
const eventsTable = 'report_events';

export async function listReports() {
  await ensureTenantSchema();
  const sql = `SELECT r.*, t.name AS tenant_name, t.mode AS tenant_mode
    FROM ${reportsTable} r
    LEFT JOIN report_tenants t ON t.id::text = r.tenant_id
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

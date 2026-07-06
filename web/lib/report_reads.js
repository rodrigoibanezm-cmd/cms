import { query } from './db.js';
import { ensureReportSchema } from './report_schema.js';
import { ensureTenantSchema } from './tenant_store.js';

const reportsTable = 'reports';
const filesTable = 'report_files';
const eventsTable = 'report_events';

async function ensureAdminSchema() {
  await ensureReportSchema();
  await ensureTenantSchema();
}

function addLikeFilter(filters, params, fieldSql, value) {
  if (!value?.trim()) return;
  params.push(`%${value.trim()}%`);
  filters.push(`${fieldSql} ILIKE $${params.length}`);
}

function addExactFilter(filters, params, fieldSql, value) {
  if (!value?.trim()) return;
  params.push(value.trim());
  filters.push(`${fieldSql} = $${params.length}`);
}

export async function listReports(filters = {}) {
  await ensureAdminSchema();
  const where = [];
  const params = [];
  addLikeFilter(where, params, 'CAST(r.ot AS text)', filters.ot);
  addExactFilter(where, params, 'r.current_state', filters.state);
  addExactFilter(where, params, 'r.tenant_id', filters.tenant_id);
  addLikeFilter(where, params, `r.extraction_json->>'tecnico'`, filters.tech);
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const sql = `SELECT r.*, t.name AS tenant_name, t.mode AS tenant_mode,
      r.extraction_json->>'tecnico' AS technician_name
    FROM ${reportsTable} r
    LEFT JOIN report_tenants t ON t.id::text = r.tenant_id
    ${whereSql}
    ORDER BY r.created_at DESC LIMIT 200`;
  return (await query(sql, params)).rows;
}

function latestAudit(events) {
  return events
    .slice()
    .reverse()
    .find((event) => event.event === 'audit_completed')?.payload_json || null;
}

export async function getReport(id) {
  await ensureAdminSchema();
  const reportSql = `SELECT r.*, r.extraction_json->>'tecnico' AS technician_name
    FROM ${reportsTable} r WHERE id=$1`;
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

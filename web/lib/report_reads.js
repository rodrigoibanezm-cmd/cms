import { query } from './db.js';
import { ensureReportSchema } from './report_schema.js';
import { ensureTenantSchema } from './tenant_store.js';
import { recalculateReportConfidence } from './recalculate_report_confidence.js';

const reportsTable = 'reports';
const filesTable = 'report_files';
const eventsTable = 'report_events';

async function ensureAdminSchema() {
  await ensureReportSchema();
  await ensureTenantSchema();
}

function isAdmin(access) {
  return ['admin', 'super_admin'].includes(access?.role);
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

function addGlobalFilter(filters, params, value) {
  if (!value?.trim()) return;
  params.push(`%${value.trim()}%`);
  const key = `$${params.length}`;
  filters.push(`(CAST(r.ot AS text) ILIKE ${key} OR r.source_name ILIKE ${key}
    OR r.template_filename ILIKE ${key} OR r.extraction_json->>'tecnico' ILIKE ${key}
    OR r.extraction_json->>'cliente' ILIKE ${key} OR r.extraction_json->>'empresa' ILIKE ${key}
    OR EXISTS (SELECT 1 FROM ${filesTable} sf WHERE sf.report_id=r.id AND sf.filename ILIKE ${key}))`);
}

function addAccessFilter(where, params, access) {
  params.push(access?.tenantId);
  where.push(isAdmin(access)
    ? `(r.tenant_id = $${params.length} OR r.tenant_id IS NULL)`
    : `r.tenant_id = $${params.length}`);
  if (!isAdmin(access)) addExactFilter(where, params, 'r.current_owner_id', access?.userId);
}

export async function listReports(filters = {}, access = {}) {
  await ensureAdminSchema();
  const where = [];
  const params = [];
  addAccessFilter(where, params, access);
  addGlobalFilter(where, params, filters.q);
  addLikeFilter(where, params, 'CAST(r.ot AS text)', filters.ot);
  addExactFilter(where, params, 'r.current_state', filters.state);
  addLikeFilter(where, params, `r.extraction_json->>'tecnico'`, filters.tech);
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const sql = `SELECT r.*, t.name AS tenant_name, t.mode AS tenant_mode,
      r.extraction_json->>'tecnico' AS technician_name,
      COALESCE(r.extraction_json->>'cliente', r.extraction_json->>'empresa') AS client_name,
      EXISTS (SELECT 1 FROM ${filesTable} f WHERE f.report_id=r.id AND f.kind='generated_pdf') AS final_pdf_exists,
      (SELECT e.payload_json FROM ${eventsTable} e WHERE e.report_id=r.id AND e.event='audit_completed' ORDER BY e.created_at DESC LIMIT 1) AS latest_audit
    FROM ${reportsTable} r
    LEFT JOIN report_tenants t ON t.id::text = r.current_owner_id
    ${whereSql}
    ORDER BY r.created_at DESC LIMIT 200`;
  const rows = (await query(sql, params)).rows;
  return rows.map((report) => recalculateReportConfidence(report, report.latest_audit));
}

function latestAudit(events) {
  return events.slice().reverse().find((event) => event.event === 'audit_completed')?.payload_json || null;
}

export async function getReport(id, access) {
  await ensureAdminSchema();
  const where = ['r.id=$1'];
  const params = [id];
  addAccessFilter(where, params, access);
  const whereSql = `WHERE ${where.join(' AND ')}`;
  const reportSql = `SELECT r.*, r.extraction_json->>'tecnico' AS technician_name FROM ${reportsTable} r ${whereSql}`;
  const filesSql = `SELECT f.* FROM ${filesTable} f JOIN ${reportsTable} r ON r.id=f.report_id ${whereSql} ORDER BY f.created_at`;
  const eventsSql = `SELECT e.* FROM ${eventsTable} e JOIN ${reportsTable} r ON r.id=e.report_id ${whereSql} ORDER BY e.created_at`;
  const report = await query(reportSql, params);
  const files = report.rows[0] ? await query(filesSql, params) : { rows: [] };
  const events = report.rows[0] ? await query(eventsSql, params) : { rows: [] };
  const audit = latestAudit(events.rows);
  const current = recalculateReportConfidence(report.rows[0] || null, audit);
  return { report: current, files: files.rows, events: events.rows, audit };
}

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

function addGlobalFilter(filters, params, value) {
  if (!value?.trim()) return;
  params.push(`%${value.trim()}%`);
  const key = `$${params.length}`;
  filters.push(`(CAST(r.ot AS text) ILIKE ${key} OR r.source_name ILIKE ${key}
    OR r.template_filename ILIKE ${key} OR r.extraction_json->>'tecnico' ILIKE ${key}
    OR r.extraction_json->>'cliente' ILIKE ${key} OR r.extraction_json->>'empresa' ILIKE ${key}
    OR EXISTS (SELECT 1 FROM ${filesTable} sf WHERE sf.report_id=r.id AND sf.filename ILIKE ${key}))`);
}

function addTenantFilter(where, params, tenantId) {
  if (!tenantId) throw new Error('tenantId requerido');
  params.push(tenantId);
  where.push(`r.tenant_id = $${params.length}`);
}

function addAccessFilter(where, params, access) {
  if (['admin', 'super_admin'].includes(access.role)) return;
  addExactFilter(where, params, 'r.current_owner_id', access.userId);
}

export async function listReports(filters = {}) {
  await ensureAdminSchema();
  const where = [];
  const params = [];
  addTenantFilter(where, params, filters.tenantId);
  addGlobalFilter(where, params, filters.q);
  addLikeFilter(where, params, 'CAST(r.ot AS text)', filters.ot);
  addExactFilter(where, params, 'r.current_state', filters.state);
  addLikeFilter(where, params, `r.extraction_json->>'tecnico'`, filters.tech);
  const whereSql = `WHERE ${where.join(' AND ')}`;
  const sql = `SELECT r.*, t.name AS tenant_name, t.mode AS tenant_mode,
      r.extraction_json->>'tecnico' AS technician_name,
      COALESCE(r.extraction_json->>'cliente', r.extraction_json->>'empresa') AS client_name,
      EXISTS (SELECT 1 FROM ${filesTable} f WHERE f.report_id=r.id AND f.kind='generated_pdf') AS final_pdf_exists
    FROM ${reportsTable} r
    LEFT JOIN report_tenants t ON t.id::text = r.current_owner_id
    ${whereSql}
    ORDER BY r.created_at DESC LIMIT 200`;
  return (await query(sql, params)).rows;
}

function latestAudit(events) {
  return events.slice().reverse().find((event) => event.event === 'audit_completed')?.payload_json || null;
}

export async function getReport(id, access) {
  await ensureAdminSchema();
  if (!access?.tenantId) throw new Error('tenantId requerido');
  const where = ['r.id=$1'];
  const params = [id];
  addTenantFilter(where, params, access.tenantId);
  addAccessFilter(where, params, access);
  const whereSql = `WHERE ${where.join(' AND ')}`;
  const reportSql = `SELECT r.*, r.extraction_json->>'tecnico' AS technician_name FROM ${reportsTable} r ${whereSql}`;
  const filesSql = `SELECT f.* FROM ${filesTable} f JOIN ${reportsTable} r ON r.id=f.report_id ${whereSql} ORDER BY f.created_at`;
  const eventsSql = `SELECT e.* FROM ${eventsTable} e JOIN ${reportsTable} r ON r.id=e.report_id ${whereSql} ORDER BY e.created_at`;
  const report = await query(reportSql, params);
  const files = report.rows[0] ? await query(filesSql, params) : { rows: [] };
  const events = report.rows[0] ? await query(eventsSql, params) : { rows: [] };
  return { report: report.rows[0] || null, files: files.rows, events: events.rows, audit: latestAudit(events.rows) };
}

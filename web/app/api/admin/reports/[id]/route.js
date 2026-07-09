import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db.js';
import { ensureReportSchema } from '../../../../../lib/report_store.js';
import {
  requireRole,
  requireTenantAccess,
  TenantAccessError,
} from '../../../../../lib/tenant_access.js';

export const runtime = 'nodejs';

const DETAIL_ROLES = ['admin', 'super_admin', 'administrativa', 'secretary'];
const ADMIN_ROLES = ['admin', 'super_admin'];

function latestAudit(events) {
  return events.find((event) => event.event === 'audit_completed')?.payload_json || null;
}

function filesByKind(files) {
  return files.reduce((acc, file) => {
    if (!acc[file.kind]) acc[file.kind] = [];
    acc[file.kind].push(file);
    return acc;
  }, {});
}

function errorResponse(err) {
  const status = err instanceof TenantAccessError ? err.status : 500;
  return NextResponse.json({ ok: false, error: err.message || 'Error cargando revisión.' }, { status });
}

function isAdmin(access) {
  return ADMIN_ROLES.includes(access.role);
}

function ownerSql(access) {
  return isAdmin(access) ? '' : 'AND current_owner_id=$3';
}

function tenantSql(access) {
  return isAdmin(access) ? '(tenant_id=$2 OR tenant_id IS NULL)' : 'tenant_id=$2';
}

function params(id, access) {
  const values = [id, access.tenantId];
  if (!isAdmin(access)) values.push(access.userId);
  return values;
}

async function readReport(id, access) {
  const res = await query(
    `SELECT * FROM reports WHERE id=$1 AND ${tenantSql(access)} ${ownerSql(access)}`,
    params(id, access)
  );
  return res.rows[0] || null;
}

function tenantFileSql(report) {
  return report.tenant_id ? 'AND tenant_id=$2' : 'AND tenant_id IS NULL';
}

async function readFiles(report) {
  const args = report.tenant_id ? [report.id, report.tenant_id] : [report.id];
  const res = await query(
    `SELECT * FROM report_files WHERE report_id=$1 ${tenantFileSql(report)} ORDER BY created_at ASC`,
    args
  );
  return res.rows;
}

async function readEvents(report) {
  const args = report.tenant_id ? [report.id, report.tenant_id] : [report.id];
  const res = await query(
    `SELECT event, payload_json, created_at FROM report_events
     WHERE report_id=$1 ${tenantFileSql(report)} ORDER BY created_at DESC`,
    args
  );
  return res.rows;
}

export async function GET(request, { params: routeParams }) {
  try {
    await ensureReportSchema();
    const access = requireRole(await requireTenantAccess(request), DETAIL_ROLES);
    const { id } = await routeParams;
    const report = await readReport(id, access);
    if (!report) return NextResponse.json({ ok: false, error: 'Reporte no encontrado.' }, { status: 404 });

    const files = await readFiles(report);
    const events = await readEvents(report);
    return NextResponse.json({ ok: true, report, files, files_by_kind: filesByKind(files), audit: latestAudit(events), events });
  } catch (err) {
    console.error(err);
    return errorResponse(err);
  }
}

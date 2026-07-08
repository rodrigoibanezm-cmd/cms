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
  return NextResponse.json(
    { ok: false, error: err.message || 'Error cargando revisión.' },
    { status }
  );
}

async function readReport(id, tenantId) {
  const res = await query(
    'SELECT * FROM reports WHERE id=$1 AND tenant_id=$2',
    [id, tenantId]
  );
  return res.rows[0] || null;
}

async function readFiles(id, tenantId) {
  const res = await query(
    `SELECT * FROM report_files
     WHERE report_id=$1 AND tenant_id=$2
     ORDER BY created_at ASC`,
    [id, tenantId]
  );
  return res.rows;
}

async function readEvents(id, tenantId) {
  const res = await query(
    `SELECT event, payload_json, created_at
     FROM report_events
     WHERE report_id=$1 AND tenant_id=$2
     ORDER BY created_at DESC`,
    [id, tenantId]
  );
  return res.rows;
}

export async function GET(request, { params }) {
  try {
    await ensureReportSchema();
    const access = requireRole(await requireTenantAccess(request), DETAIL_ROLES);
    const { id } = await params;
    const report = await readReport(id, access.tenantId);
    if (!report) {
      return NextResponse.json({ ok: false, error: 'Reporte no encontrado.' }, { status: 404 });
    }

    const files = await readFiles(id, access.tenantId);
    const events = await readEvents(id, access.tenantId);

    return NextResponse.json({
      ok: true,
      report,
      files,
      files_by_kind: filesByKind(files),
      audit: latestAudit(events),
      events,
    });
  } catch (err) {
    console.error(err);
    return errorResponse(err);
  }
}

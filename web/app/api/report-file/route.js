import { NextResponse } from 'next/server';
import { query } from '../../../lib/db.js';
import { downloadDriveFile } from '../../../lib/xls/google_drive.js';
import {
  requireRole,
  requireTenantAccess,
  TenantAccessError,
} from '../../../lib/tenant_access.js';

export const runtime = 'nodejs';

const FILE_ROLES = ['admin', 'super_admin', 'administrativa', 'secretary'];

function ownerSql(access) {
  return ['admin', 'super_admin'].includes(access.role) ? '' : 'AND r.current_owner_id=$3';
}

function params(id, access) {
  const values = [id, access.tenantId];
  if (!['admin', 'super_admin'].includes(access.role)) values.push(access.userId);
  return values;
}

async function findReportFile(id, access) {
  const res = await query(
    `SELECT f.id, f.filename, f.mime_type, f.drive_file_id
     FROM report_files f JOIN reports r ON r.id=f.report_id
     WHERE f.id=$1 AND f.tenant_id=$2 AND r.tenant_id=$2 ${ownerSql(access)}`,
    params(id, access)
  );
  return res.rows[0] || null;
}

function errorResponse(err) {
  const status = err instanceof TenantAccessError ? err.status : 400;
  return NextResponse.json({ ok: false, error: err.message }, { status });
}

export async function GET(request) {
  try {
    const access = requireRole(await requireTenantAccess(request), FILE_ROLES);
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ ok: false, error: 'Falta id.' }, { status: 400 });

    const file = await findReportFile(id, access);
    if (!file?.drive_file_id) {
      return NextResponse.json({ ok: false, error: 'Archivo no encontrado.' }, { status: 404 });
    }

    const buffer = await downloadDriveFile(file.drive_file_id);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': file.mime_type || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${file.filename || 'archivo'}"`,
        'Cache-Control': 'private, max-age=300',
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}

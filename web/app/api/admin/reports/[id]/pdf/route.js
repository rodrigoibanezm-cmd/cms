import { NextResponse } from 'next/server';
import { downloadDriveFile } from '../../../../../../lib/xls/google_drive.js';
import { getOrCreateFinalPdf } from '../../../../../../lib/report_pdf.js';
import {
  requireRole,
  requireTenantAccess,
  TenantAccessError,
} from '../../../../../../lib/tenant_access.js';

export const runtime = 'nodejs';

const PDF_ROLES = ['admin', 'super_admin', 'administrativa', 'secretary'];

function safeName(name) {
  return String(name || 'informe.pdf').replace(/[^a-zA-Z0-9_.-]/g, '_');
}

function pdfResponse(buffer, filename) {
  const headers = new Headers();
  headers.set('Content-Type', 'application/pdf');
  headers.set('Content-Disposition', 'attachment; filename=' + safeName(filename));
  headers.set('Cache-Control', 'no-store');
  return new NextResponse(buffer, { headers });
}

function errorResponse(err) {
  const status = err instanceof TenantAccessError ? err.status : 400;
  return NextResponse.json({ ok: false, error: err.message }, { status });
}

export async function GET(request, { params }) {
  try {
    const access = requireRole(await requireTenantAccess(request), PDF_ROLES);
    const routeParams = await params;
    const result = await getOrCreateFinalPdf(routeParams.id, access.tenantId);
    const buffer = await downloadDriveFile(result.file.drive_file_id);
    return pdfResponse(buffer, result.file.filename);
  } catch (err) {
    return errorResponse(err);
  }
}

import { NextResponse } from 'next/server';
import { assignReportToSecretary } from '../../../../../lib/report_assignment.js';
import {
  requireRole,
  requireTenantAccess,
  TenantAccessError,
} from '../../../../../lib/tenant_access.js';

export const runtime = 'nodejs';

const ASSIGN_ROLES = ['admin', 'super_admin'];

async function readPayload(request) {
  const type = request.headers.get('content-type') || '';
  if (type.includes('application/json')) return request.json();

  const form = await request.formData();
  return {
    report_id: form.get('report_id'),
    secretary_id: form.get('secretary_id'),
    return_to: form.get('return_to'),
  };
}

function redirectBack(request, payload) {
  const target = payload.return_to || '/admin';
  return NextResponse.redirect(new URL(target, request.url), 303);
}

function errorResponse(err) {
  const status = err instanceof TenantAccessError ? err.status : 400;
  return NextResponse.json({ ok: false, error: err.message }, { status });
}

export async function POST(request) {
  try {
    const access = requireRole(await requireTenantAccess(request), ASSIGN_ROLES);
    const payload = await readPayload(request);
    const result = await assignReportToSecretary({
      reportId: payload?.report_id,
      secretaryId: payload?.secretary_id,
      tenantId: access.tenantId,
    });
    if (payload?.return_to) return redirectBack(request, payload);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return errorResponse(err);
  }
}

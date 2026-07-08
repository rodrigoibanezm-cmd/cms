import { NextResponse } from 'next/server';
import { approveReportByTenant } from '../../../../../../lib/report_approval.js';
import {
  requireRole,
  requireTenantAccess,
  TenantAccessError,
} from '../../../../../../lib/tenant_access.js';

export const runtime = 'nodejs';

const APPROVE_ROLES = ['admin', 'super_admin', 'administrativa', 'secretary'];

async function readPayload(request) {
  const type = request.headers.get('content-type') || '';
  if (type.includes('application/json')) return request.json();

  const form = await request.formData();
  return { return_to: form.get('return_to') };
}

function redirectBack(request, payload) {
  const target = payload.return_to || '/admin/secretary';
  return NextResponse.redirect(new URL(target, request.url), 303);
}

function errorResponse(err) {
  const status = err instanceof TenantAccessError ? err.status : 400;
  return NextResponse.json({ ok: false, error: err.message }, { status });
}

export async function POST(request, { params }) {
  try {
    const access = requireRole(await requireTenantAccess(request), APPROVE_ROLES);
    const routeParams = await params;
    const payload = await readPayload(request);
    const result = await approveReportByTenant({
      reportId: routeParams.id,
      tenantId: access.tenantId,
    });
    if (payload?.return_to) return redirectBack(request, payload);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return errorResponse(err);
  }
}

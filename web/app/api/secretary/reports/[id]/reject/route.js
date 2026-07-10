import { NextResponse } from 'next/server';
import { rejectReportWithAccess } from '../../../../../../lib/report_rejection.js';
import {
  requireRole,
  requireTenantAccess,
  TenantAccessError,
} from '../../../../../../lib/tenant_access.js';

export const runtime = 'nodejs';

const REJECT_ROLES = ['admin', 'super_admin', 'administrativa', 'secretary'];

async function readPayload(request) {
  const type = request.headers.get('content-type') || '';
  if (type.includes('application/json')) return request.json();
  const form = await request.formData();
  return { reason: form.get('reason'), return_to: form.get('return_to') };
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
    const access = requireRole(await requireTenantAccess(request), REJECT_ROLES);
    const routeParams = await params;
    const payload = await readPayload(request);
    const result = await rejectReportWithAccess({
      reportId: routeParams.id,
      reason: payload?.reason,
      access,
    });
    if (payload?.return_to) return redirectBack(request, payload);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return errorResponse(err);
  }
}

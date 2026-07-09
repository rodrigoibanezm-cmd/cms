import { NextResponse } from 'next/server';
import { changeReportTemplate } from '../../../../../../lib/report_template_change.js';
import {
  requireRole,
  requireTenantAccess,
  TenantAccessError,
} from '../../../../../../lib/tenant_access.js';

export const runtime = 'nodejs';

const TEMPLATE_ROLES = ['admin', 'super_admin', 'administrativa', 'secretary'];

function errorResponse(err) {
  const status = err instanceof TenantAccessError ? err.status : 400;
  return NextResponse.json({ ok: false, error: err.message }, { status });
}

function redirectTo(form, request) {
  const fallback = new URL('/admin', request.url);
  const rawTarget = String(form.get('return_to') || '');
  const target = rawTarget ? new URL(rawTarget, request.url) : fallback;
  return NextResponse.redirect(target, 303);
}

export async function POST(request, { params }) {
  try {
    const access = requireRole(await requireTenantAccess(request), TEMPLATE_ROLES);
    const routeParams = await params;
    const form = await request.formData();
    await changeReportTemplate({ reportId: routeParams.id, access, form });
    return redirectTo(form, request);
  } catch (err) {
    return errorResponse(err);
  }
}

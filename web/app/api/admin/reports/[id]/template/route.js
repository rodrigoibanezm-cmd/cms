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
  const fallback = new URL(request.url);
  fallback.pathname = '/admin';
  const target = String(form.get('return_to') || fallback.toString());
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
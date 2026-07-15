import { NextResponse } from 'next/server';
import { generateFinalReportWithAccess } from '../../../../../../lib/report_final.js';
import { requireRole, requireTenantAccess, TenantAccessError } from '../../../../../../lib/tenant_access.js';

export const runtime = 'nodejs';
const ROLES = ['admin', 'super_admin', 'administrativa', 'secretary'];

async function payload(request) {
  if ((request.headers.get('content-type') || '').includes('application/json')) return request.json();
  const form = await request.formData();
  return { return_to: form.get('return_to') };
}

export async function POST(request, { params }) {
  try {
    const access = requireRole(await requireTenantAccess(request), ROLES);
    const body = await payload(request);
    const result = await generateFinalReportWithAccess({ reportId: (await params).id, access });
    if (body.return_to) return NextResponse.redirect(new URL(body.return_to, request.url), 303);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const status = err instanceof TenantAccessError ? err.status : 400;
    return NextResponse.json({ ok: false, error: err.message }, { status });
  }
}

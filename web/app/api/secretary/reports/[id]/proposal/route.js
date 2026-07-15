import { NextResponse } from 'next/server';
import { generateProposalWithAccess, saveProposalWithAccess } from '../../../../../../lib/final_proposal/service.js';
import { requireRole, requireTenantAccess, TenantAccessError } from '../../../../../../lib/tenant_access.js';

export const runtime = 'nodejs';
const ROLES = ['admin', 'super_admin', 'administrativa', 'secretary'];

async function bodyOf(request) {
  if ((request.headers.get('content-type') || '').includes('application/json')) return request.json();
  const form = await request.formData();
  return Object.fromEntries(form.entries());
}

function redirect(request, body) {
  return NextResponse.redirect(new URL(body.return_to || '/admin/secretary', request.url), 303);
}

export async function POST(request, { params }) {
  try {
    const access = requireRole(await requireTenantAccess(request), ROLES);
    const body = await bodyOf(request);
    const reportId = (await params).id;
    const result = body.intent === 'save'
      ? await saveProposalWithAccess({ reportId, access, proposal: body })
      : await generateProposalWithAccess({ reportId, access, force: body.intent === 'regenerate' });
    if (body.return_to) return redirect(request, body);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const status = err instanceof TenantAccessError ? err.status : 400;
    return NextResponse.json({ ok: false, error: err.message }, { status });
  }
}

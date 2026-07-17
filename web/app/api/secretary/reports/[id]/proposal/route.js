import { NextResponse } from 'next/server';
import { generateProposalWithAccess } from '../../../../../../lib/final_proposal/service.js';
import { requireRole, requireTenantAccess, TenantAccessError } from '../../../../../../lib/tenant_access.js';

export const runtime = 'nodejs';
const ROLES = ['admin', 'super_admin', 'administrativa', 'secretary'];
const INTENTS = new Set(['generate', 'regenerate']);

async function bodyOf(request) {
  if ((request.headers.get('content-type') || '').includes('application/json')) return request.json();
  const form = await request.formData();
  return Object.fromEntries(form.entries());
}

export async function POST(request, { params }) {
  try {
    const access = requireRole(await requireTenantAccess(request), ROLES);
    const body = await bodyOf(request);
    if (!INTENTS.has(body.intent)) throw new Error('Acción de propuesta inválida');
    const reportId = (await params).id;
    const result = await generateProposalWithAccess({
      reportId, access, force: body.intent === 'regenerate',
    });
    if (body.return_to) {
      return NextResponse.redirect(new URL(body.return_to, request.url), 303);
    }
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const status = err instanceof TenantAccessError ? err.status : 400;
    return NextResponse.json({ ok: false, error: err.message }, { status });
  }
}

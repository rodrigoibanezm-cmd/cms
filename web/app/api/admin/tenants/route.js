import { NextResponse } from 'next/server';
import {
  createTenant,
  listTenants,
  setTenantActive,
} from '../../../../lib/tenant_store.js';

export const runtime = 'nodejs';

async function readPayload(request) {
  const type = request.headers.get('content-type') || '';
  if (type.includes('application/json')) return request.json();

  const form = await request.formData();
  return {
    action: form.get('action'),
    id: form.get('id'),
    name: form.get('name'),
    email: form.get('email'),
    mode: form.get('mode'),
    return_to: form.get('return_to'),
  };
}

function maybeRedirect(request, payload) {
  if (!payload?.return_to) return null;
  return NextResponse.redirect(new URL(payload.return_to, request.url), 303);
}

export async function GET() {
  try {
    const tenants = await listTenants({ activeOnly: false });
    return NextResponse.json({ ok: true, tenants });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const payload = await readPayload(request);
    const result = payload.action === 'deactivate'
      ? await setTenantActive(payload.id, false)
      : await createTenant(payload || {});
    return maybeRedirect(request, payload) || NextResponse.json({ ok: true, tenant: result });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}

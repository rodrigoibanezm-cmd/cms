import { NextResponse } from 'next/server';
import {
  createTenant,
  deleteTenant as removeTenant,
  getTenant,
  setTenantActive,
} from '../../../../lib/tenant_store.js';
import {
  requireRole,
  requireTenantAccess,
  TenantAccessError,
} from '../../../../lib/tenant_access.js';
import { issueTenantAccessToken } from '../../../../lib/tenant_tokens.js';

export const runtime = 'nodejs';

async function readPayload(request) {
  const type = request.headers.get('content-type') || '';
  if (type.includes('application/json')) return request.json();

  const form = await request.formData();
  return {
    intent: form.get('intent'),
    name: form.get('name'),
    email: form.get('email'),
    mode: form.get('mode'),
    user_id: form.get('user_id'),
    active: form.get('active'),
  };
}

function redirectConfig(request) {
  const url = new URL(request.url);
  return NextResponse.redirect(new URL(`/config${url.search}`, request.url), 303);
}

async function createUser(payload, access) {
  const user = await createTenant({ name: payload.name, email: payload.email, mode: payload.mode });
  await issueTenantAccessToken({ tenantId: access.tenantId, userId: user.id, role: user.mode });
  return user;
}

async function createUserLink(payload, access) {
  const user = await getTenant(payload.user_id);
  if (!user) throw new Error('Usuario inválido');
  return issueTenantAccessToken({ tenantId: access.tenantId, userId: user.id, role: user.mode });
}

async function applyIntent(payload, access) {
  if (payload.intent === 'create_user') return createUser(payload, access);
  if (payload.intent === 'create_link') return createUserLink(payload, access);
  if (payload.intent === 'set_active') return setTenantActive(payload.user_id, payload.active === 'true');
  if (payload.intent === 'remove_user') return removeTenant(payload.user_id);
  throw new Error('Acción inválida');
}

function errorStatus(err) {
  return err instanceof TenantAccessError ? err.status : 400;
}

export async function POST(request) {
  try {
    const access = requireRole(await requireTenantAccess(request), ['super_admin']);
    const payload = await readPayload(request);
    const result = await applyIntent(payload, access);
    if (!request.headers.get('content-type')?.includes('application/json')) return redirectConfig(request);
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: errorStatus(err) });
  }
}

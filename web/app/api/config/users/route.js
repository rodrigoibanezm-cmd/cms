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
import { issueTenantAccessToken, tokenLinkForRole } from '../../../../lib/tenant_tokens.js';

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

function fullTokenLink(request, role, token) {
  return new URL(tokenLinkForRole(role, token), request.url).toString();
}

function redirectConfig(request, result) {
  const url = new URL(request.url);
  if (result?.link && result?.user?.id) {
    url.searchParams.set('link_user', result.user.id);
    url.searchParams.set('link_url', result.link);
  }
  return NextResponse.redirect(new URL(`/config${url.search}`, request.url), 303);
}

async function issueUserLink(user, access, request) {
  const token = await issueTenantAccessToken({
    tenantId: access.tenantId,
    userId: user.id,
    role: user.mode,
  });
  return { user, link: fullTokenLink(request, user.mode, token) };
}

async function createUser(payload, access, request) {
  const user = await createTenant({ name: payload.name, email: payload.email, mode: payload.mode });
  return issueUserLink(user, access, request);
}

async function applyIntent(payload, access, request) {
  if (payload.intent === 'create_user') return createUser(payload, access, request);
  if (payload.intent === 'issue_link') {
    const user = await getTenant(payload.user_id);
    if (!user) throw new Error('Usuario inválido');
    return issueUserLink(user, access, request);
  }
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
    const result = await applyIntent(payload, access, request);
    if (!request.headers.get('content-type')?.includes('application/json')) {
      return redirectConfig(request, result);
    }
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: errorStatus(err) });
  }
}

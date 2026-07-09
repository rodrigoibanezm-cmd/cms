import { NextResponse } from 'next/server';
import { listTemplates } from '../../../lib/template_catalog.js';
import {
  requireRole,
  requireTenantAccess,
  TenantAccessError,
} from '../../../lib/tenant_access.js';

export const runtime = 'nodejs';

const TEMPLATE_ROLES = ['admin', 'super_admin', 'administrativa', 'secretary'];

function errorResponse(err) {
  const status = err instanceof TenantAccessError ? err.status : 400;
  return NextResponse.json({ ok: false, error: err.message }, { status });
}

export async function GET(request) {
  try {
    requireRole(await requireTenantAccess(request), TEMPLATE_ROLES);
    return NextResponse.json({ ok: true, templates: await listTemplates() });
  } catch (err) {
    return errorResponse(err);
  }
}
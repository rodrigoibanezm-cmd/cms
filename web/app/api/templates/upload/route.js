import { NextResponse } from 'next/server';
import { uploadTemplateFile } from '../../../../lib/template_catalog.js';
import {
  requireRole,
  requireTenantAccess,
  TenantAccessError,
} from '../../../../lib/tenant_access.js';

export const runtime = 'nodejs';

const TEMPLATE_ROLES = ['admin', 'super_admin', 'administrativa', 'secretary'];

function errorResponse(err) {
  const status = err instanceof TenantAccessError ? err.status : 400;
  return NextResponse.json({ ok: false, error: err.message }, { status });
}

export async function POST(request) {
  try {
    requireRole(await requireTenantAccess(request), TEMPLATE_ROLES);
    const form = await request.formData();
    const template = await uploadTemplateFile(form.get('template_file'));
    if (!template) throw new Error('Falta archivo de plantilla');
    return NextResponse.json({ ok: true, template });
  } catch (err) {
    return errorResponse(err);
  }
}
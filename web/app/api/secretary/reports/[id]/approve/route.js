import { NextResponse } from 'next/server';
import { approveReportByTenant } from '../../../../../../lib/report_approval.js';

export const runtime = 'nodejs';

async function readPayload(request) {
  const type = request.headers.get('content-type') || '';
  if (type.includes('application/json')) return request.json();

  const form = await request.formData();
  return {
    tenant_id: form.get('tenant_id') || form.get('secretary_id'),
    return_to: form.get('return_to'),
  };
}

function redirectBack(request, payload) {
  const target = payload.return_to || '/admin/secretary';
  return NextResponse.redirect(new URL(target, request.url), 303);
}

export async function POST(request, { params }) {
  try {
    const routeParams = await params;
    const payload = await readPayload(request);
    const result = await approveReportByTenant({
      reportId: routeParams.id,
      tenantId: payload?.tenant_id,
    });
    if (payload?.return_to) return redirectBack(request, payload);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}

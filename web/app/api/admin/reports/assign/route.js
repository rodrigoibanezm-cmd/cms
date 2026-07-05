import { NextResponse } from 'next/server';
import { assignReportToSecretary } from '../../../../../lib/report_assignment.js';

export const runtime = 'nodejs';

async function readPayload(request) {
  const type = request.headers.get('content-type') || '';
  if (type.includes('application/json')) return request.json();

  const form = await request.formData();
  return {
    report_id: form.get('report_id'),
    secretary_id: form.get('secretary_id'),
    return_to: form.get('return_to'),
  };
}

function redirectBack(request, payload) {
  const target = payload.return_to || '/admin';
  return NextResponse.redirect(new URL(target, request.url), 303);
}

export async function POST(request) {
  try {
    const payload = await readPayload(request);
    const result = await assignReportToSecretary({
      reportId: payload?.report_id,
      secretaryId: payload?.secretary_id,
    });
    if (payload?.return_to) return redirectBack(request, payload);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}

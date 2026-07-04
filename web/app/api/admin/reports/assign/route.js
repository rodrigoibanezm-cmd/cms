import { NextResponse } from 'next/server';
import { assignReportToSecretary } from '../../../../../lib/report_assignment.js';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await assignReportToSecretary({
      reportId: body?.report_id,
      secretaryId: body?.secretary_id,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}
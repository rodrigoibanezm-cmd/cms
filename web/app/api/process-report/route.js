import { NextResponse } from 'next/server';
import { parseProcessReportRequest } from '../../../lib/process_report/request.js';
import { runProcessReport } from '../../../lib/process_report/run.js';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const input = await parseProcessReportRequest(request);
    if (input.error) return NextResponse.json(input.body, { status: input.status });

    const result = await runProcessReport({ ...input, tenantId: null });
    return NextResponse.json(result.body);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, color: 'red', message: err.message || 'Error procesando informe.' },
      { status: 500 }
    );
  }
}

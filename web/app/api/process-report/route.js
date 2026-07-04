import { NextResponse } from 'next/server';
import { parseProcessReportRequest } from '../../../lib/process_report/request.js';
import { runProcessReport } from '../../../lib/process_report/run.js';
import { markReportError } from '../../../lib/report_updates.js';

export const runtime = 'nodejs';

export async function POST(request) {
  let result = null;

  try {
    const input = await parseProcessReportRequest(request);
    if (input.error) return NextResponse.json(input.body, { status: input.status });

    result = await runProcessReport(input);
    return NextResponse.json(result.body);
  } catch (err) {
    console.error(err);
    if (result?.reportRow?.id) {
      await markReportError(result.reportRow.id, err).catch(console.error);
    }
    return NextResponse.json(
      { ok: false, color: 'red', message: err.message || 'Error procesando informe.' },
      { status: 500 }
    );
  }
}

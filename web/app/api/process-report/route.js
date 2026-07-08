import { NextResponse } from 'next/server';
import { parseProcessReportRequest } from '../../../lib/process_report/request.js';
import { runProcessReport } from '../../../lib/process_report/run.js';
import { requireTenantAccess, TenantAccessError } from '../../../lib/tenant_access.js';

export const runtime = 'nodejs';

function errorStatus(err) {
  return err instanceof TenantAccessError ? err.status : 500;
}

export async function POST(request) {
  try {
    const access = await requireTenantAccess(request);
    const input = await parseProcessReportRequest(request);
    if (input.error) return NextResponse.json(input.body, { status: input.status });

    const result = await runProcessReport({ ...input, tenantId: access.tenantId });
    return NextResponse.json(result.body);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, color: 'red', message: err.message || 'Error procesando informe.' },
      { status: errorStatus(err) }
    );
  }
}

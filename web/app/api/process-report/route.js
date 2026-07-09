import { NextResponse } from 'next/server';
import { parseProcessReportRequest } from '../../../lib/process_report/request.js';
import { runProcessReport } from '../../../lib/process_report/run.js';
import { requireTenantAccess, TenantAccessError } from '../../../lib/tenant_access.js';

export const runtime = 'nodejs';

function errorResponse(err) {
  const status = err instanceof TenantAccessError ? err.status : 500;
  return NextResponse.json(
    { ok: false, color: 'red', message: err.message || 'Error procesando informe.' },
    { status }
  );
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
    return errorResponse(err);
  }
}
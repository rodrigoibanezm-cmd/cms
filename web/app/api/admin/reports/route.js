import { NextResponse } from 'next/server';
import { ensureReportSchema } from '../../../../lib/report_store.js';
import { requireTenantAccess, TenantAccessError } from '../../../../lib/tenant_access.js';
import {
  countReports,
  listReports,
  pageParams,
  whereClause,
} from '../../../../lib/admin_reports_query.js';

export const runtime = 'nodejs';

function errorResponse(err) {
  const status = err instanceof TenantAccessError ? err.status : 500;
  const fallback = status === 500 ? 'Error cargando reportes.' : err.message;
  return NextResponse.json({ ok: false, error: err.message || fallback }, { status });
}

function responseBody(rows, total, page) {
  return {
    ok: true,
    reports: rows,
    pagination: {
      total,
      limit: page.limit,
      offset: page.offset,
      has_more: page.offset + rows.length < total,
    },
  };
}

export async function GET(request) {
  try {
    await ensureReportSchema();
    const access = await requireTenantAccess(request);
    const { searchParams } = new URL(request.url);
    const page = pageParams(searchParams);
    const where = whereClause(searchParams, access.tenantId);
    const total = await countReports(where);
    const rows = await listReports(where, page);

    return NextResponse.json(responseBody(rows, total, page));
  } catch (err) {
    console.error(err);
    return errorResponse(err);
  }
}

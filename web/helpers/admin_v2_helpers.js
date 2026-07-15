import { headers } from 'next/headers';
import { listReports } from '../lib/report_reads.js';
import { requireRole, requireTenantAccess } from '../lib/tenant_access.js';
import { authUserLabel } from '../lib/tenant_store.js';
import { listAssignableUsers } from '../lib/tenant_users.js';

const ADMIN_ROLES = ['admin', 'super_admin'];

function queryString(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null) search.set(key, value);
  }
  return search.toString();
}

function readFilters(params) {
  return { q: params?.q || '', state: params?.state || '', token: params?.token || '' };
}

async function requireAdminV2Access(params) {
  const qs = queryString(params);
  const url = `http://local/admin-v2${qs ? `?${qs}` : ''}`;
  return requireRole(
    await requireTenantAccess({ headers: await headers(), url }),
    ADMIN_ROLES,
  );
}

export async function loadAdminV2Data(params) {
  const access = await requireAdminV2Access(params);
  const filters = readFilters(params);
  const reports = await listReports(filters, access);
  const [secretaries, label] = await Promise.all([
    listAssignableUsers(access.tenantId),
    authUserLabel(access),
  ]);
  return {
    filters,
    reports,
    secretaries,
    label,
    hasProcessing: reports.some((report) => report.current_state === 'processing'),
  };
}

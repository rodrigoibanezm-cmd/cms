import { headers } from 'next/headers';
import OperationFooter from '../../components/admin/OperationFooter.js';
import OperationHeader from '../../components/admin/OperationHeader.js';
import OperationSummary from '../../components/admin/OperationSummary.js';
import OperationTable from '../../components/admin/OperationTable.js';
import { listReports } from '../../lib/report_reads.js';
import { requireRole, requireTenantAccess } from '../../lib/tenant_access.js';
import { authUserLabel } from '../../lib/tenant_store.js';
import { listAssignableUsers } from '../../lib/tenant_users.js';
import styles from './admin.module.css';

export const dynamic = 'force-dynamic';

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

async function requireAdminAccess(params) {
  const qs = queryString(params);
  const request = { headers: await headers(), url: `http://local/admin${qs ? `?${qs}` : ''}` };
  return requireRole(await requireTenantAccess(request), ADMIN_ROLES);
}

export default async function AdminPage({ searchParams }) {
  const params = await searchParams;
  const access = await requireAdminAccess(params);
  const filters = readFilters(params);
  const reports = await listReports(filters, access);
  const secretaries = await listAssignableUsers(access.tenantId);
  const label = await authUserLabel(access);

  return (
    <main className={styles.adminScreen}>
      <OperationHeader filters={filters} label={label} />
      <OperationSummary reports={reports} />
      <OperationTable reports={reports} secretaries={secretaries} token={filters.token} />
      <OperationFooter count={reports.length} />
    </main>
  );
}

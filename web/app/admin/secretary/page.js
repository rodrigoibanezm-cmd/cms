import { headers } from 'next/headers';
import OperationFooter from '../../../components/admin/OperationFooter.js';
import OperationHeader from '../../../components/admin/OperationHeader.js';
import OperationSummary from '../../../components/admin/OperationSummary.js';
import OperationTable from '../../../components/admin/OperationTable.js';
import { listReports } from '../../../lib/report_reads.js';
import { authUserLabel } from '../../../lib/tenant_store.js';
import { requireRole, requireTenantAccess } from '../../../lib/tenant_access.js';
import styles from '../admin.module.css';

export const dynamic = 'force-dynamic';

const SECRETARY_ROLES = ['administrativa', 'secretary'];

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

async function requireSecretaryAccess(params) {
  const qs = queryString(params);
  const request = {
    headers: await headers(),
    url: `http://local/admin/secretary${qs ? `?${qs}` : ''}`,
  };
  return requireRole(await requireTenantAccess(request), SECRETARY_ROLES);
}

async function loadSecretaryPage(params) {
  const access = await requireSecretaryAccess(params);
  const filters = readFilters(params);
  const reports = await listReports(filters, access);
  const label = await authUserLabel(access);
  return { filters, label, reports, error: null };
}

export default async function SecretaryQueuePage({ searchParams }) {
  const params = await searchParams;
  let data;
  try {
    data = await loadSecretaryPage(params);
  } catch (err) {
    data = { filters: readFilters(params), label: null, reports: [], error: err.message };
  }

  return (
    <main className={styles.adminScreen}>
      <OperationHeader
        filters={data.filters}
        label={data.label}
        title="Cola administrativa"
        subtitle={data.error || 'Bandeja de trabajo administrativa'}
        searchAction="/admin/secretary"
      />
      <OperationSummary reports={data.reports} />
      <OperationTable
        reports={data.reports}
        secretaries={[]}
        token={data.filters.token}
        canAssign={false}
        showPdf={false}
        showSecretary={false}
      />
      <OperationFooter count={data.reports.length} />
    </main>
  );
}

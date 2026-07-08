import { headers } from 'next/headers';
import AdminTable from '../../../components/admin/AdminTable.js';
import { listSecretaryQueue } from '../../../lib/report_assignment.js';
import { authUserLabel } from '../../../lib/tenant_store.js';
import {
  requireRole,
  requireTenantAccess,
} from '../../../lib/tenant_access.js';
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

async function requestFromPage(params) {
  const qs = queryString(params);
  return {
    headers: await headers(),
    url: `http://local/admin/secretary${qs ? `?${qs}` : ''}`,
  };
}

async function loadSecretaryPage(params) {
  const request = await requestFromPage(params);
  const access = requireRole(await requireTenantAccess(request), SECRETARY_ROLES);
  const label = await authUserLabel(access);
  const reports = await listSecretaryQueue({
    tenantId: access.tenantId,
    userId: access.userId,
  });
  return { label, reports, error: null };
}

function pendingCount(reports) {
  return reports.filter((report) => report.current_state === 'assigned_to_secretary').length;
}

export default async function SecretaryQueuePage({ searchParams }) {
  const params = await searchParams;
  let data;
  try {
    data = await loadSecretaryPage(params);
  } catch (err) {
    data = { label: null, reports: [], error: err.message };
  }
  const pending = pendingCount(data.reports);

  return (
    <main className={styles.adminScreen}>
      <header className={styles.adminHeader}>
        <p className="eyebrow">CM Services</p>
        <h1>Cola administrativa</h1>
        <p className="subtitle">{data.label?.name || 'Token administrativa requerido'}</p>
      </header>

      <section className={styles.adminSummary}>
        <strong>{data.reports.length}</strong>
        <span>{data.error || `OTs total / ${pending} pendientes`}</span>
      </section>

      <AdminTable reports={data.reports} secretaries={[]} editableSecretary={false} />
    </main>
  );
}

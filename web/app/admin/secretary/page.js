import AdminTable from '../../../components/admin/AdminTable.js';
import { listSecretaryQueue } from '../../../lib/report_assignment.js';
import { getActiveTenant, listTenants } from '../../../lib/tenant_store.js';
import styles from '../admin.module.css';

export const dynamic = 'force-dynamic';

async function loadSecretaryPage(params) {
  const fallback = await listTenants({ activeOnly: true, mode: 'secretary' });
  const secretaryId = params?.id || fallback[0]?.id || null;
  const tenant = secretaryId ? await getActiveTenant(secretaryId, 'secretary') : null;
  const reports = tenant ? await listSecretaryQueue(tenant.id) : [];
  return { tenant, reports, error: null };
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
    data = { tenant: null, reports: [], error: err.message };
  }
  const pending = pendingCount(data.reports);

  return (
    <main className={styles.adminScreen}>
      <header className={styles.adminHeader}>
        <p className="eyebrow">CM Services</p>
        <h1>Cola administrativa</h1>
        <p className="subtitle">{data.tenant?.name || 'Tenant administrativa requerido'}</p>
      </header>

      <section className={styles.adminSummary}>
        <strong>{data.reports.length}</strong>
        <span>{data.error || `OTs total / ${pending} pendientes`}</span>
      </section>

      <AdminTable reports={data.reports} secretaries={[]} editableSecretary={false} />
    </main>
  );
}

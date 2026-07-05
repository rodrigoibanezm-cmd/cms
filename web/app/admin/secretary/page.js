import AdminTable from '../../../components/admin/AdminTable.js';
import { listSecretaryQueue } from '../../../lib/report_assignment.js';
import { getActiveTenant, listTenants } from '../../../lib/tenant_store.js';
import styles from '../admin.module.css';

export const dynamic = 'force-dynamic';

export default async function SecretaryQueuePage({ searchParams }) {
  const params = await searchParams;
  const fallback = await listTenants({ activeOnly: true, mode: 'secretary' });
  const secretaryId = params?.id || fallback[0]?.id || null;
  const tenant = secretaryId ? await getActiveTenant(secretaryId, 'secretary') : null;
  const reports = tenant ? await listSecretaryQueue(tenant.id) : [];

  return (
    <main className={styles.adminScreen}>
      <header className={styles.adminHeader}>
        <p className="eyebrow">CM Services</p>
        <h1>Cola secretaria</h1>
        <p className="subtitle">{tenant?.name || 'Tenant secretaria requerido'}</p>
      </header>

      <section className={styles.adminSummary}>
        <strong>{reports.length}</strong>
        <span>OTs asignadas</span>
      </section>

      <AdminTable reports={reports} secretaries={[]} editableSecretary={false} />
    </main>
  );
}

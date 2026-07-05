import AdminTable from '../../../components/admin/AdminTable.js';
import { listSecretaryQueue } from '../../../lib/report_assignment.js';
import { listTenants } from '../../../lib/tenant_store.js';
import styles from '../admin.module.css';

export const dynamic = 'force-dynamic';

export default async function SecretaryQueuePage({ searchParams }) {
  const params = await searchParams;
  const secretaries = await listTenants({ activeOnly: true, mode: 'secretary' });
  const secretaryId = params?.id || secretaries[0]?.id || null;
  const reports = secretaryId ? await listSecretaryQueue(secretaryId) : [];
  const current = secretaries.find((secretary) => secretary.id === secretaryId);

  return (
    <main className={styles.adminScreen}>
      <header className={styles.adminHeader}>
        <p className="eyebrow">CM Services</p>
        <h1>Cola secretaria</h1>
        <p className="subtitle">{current?.name || 'Sin secretaria seleccionada'}</p>
      </header>

      <nav className={styles.viewSwitch}>
        {secretaries.map((secretary) => (
          <a
            className={secretary.id === secretaryId ? styles.active : ''}
            href={`/admin/secretary?id=${secretary.id}`}
            key={secretary.id}
          >
            {secretary.name}
          </a>
        ))}
      </nav>

      <AdminTable reports={reports} secretaries={secretaries} />
    </main>
  );
}

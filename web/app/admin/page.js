import AdminCards from '../../components/admin/AdminCards.js';
import AdminTable from '../../components/admin/AdminTable.js';
import SecretaryAdmin from '../../components/admin/SecretaryAdmin.js';
import { listReports } from '../../lib/report_reads.js';
import { listTenants } from '../../lib/tenant_store.js';
import styles from './admin.module.css';

export const dynamic = 'force-dynamic';

export default async function AdminPage({ searchParams }) {
  const params = await searchParams;
  const reports = await listReports();
  const tenants = await listTenants({ activeOnly: true });
  const secretaries = tenants.filter((tenant) => tenant.mode === 'secretary');
  const view = params?.view === 'cards' ? 'cards' : 'table';

  return (
    <main className={styles.adminScreen}>
      <header className={styles.adminHeader}>
        <p className="eyebrow">CM Services</p>
        <h1>Admin de informes</h1>
        <p className="subtitle">Listado de OTs procesadas para revisar y aprobar.</p>
      </header>

      <section className={styles.adminSummary}>
        <strong>{reports.length}</strong>
        <span>OTs cargadas</span>
      </section>

      <SecretaryAdmin secretaries={tenants} />

      <nav className={styles.viewSwitch}>
        <a className={view === 'cards' ? styles.active : ''} href="/admin?view=cards">Tarjetas</a>
        <a className={view === 'table' ? styles.active : ''} href="/admin">Planilla</a>
      </nav>

      {view === 'table'
        ? <AdminTable reports={reports} secretaries={secretaries} />
        : <AdminCards reports={reports} secretaries={secretaries} />}
    </main>
  );
}

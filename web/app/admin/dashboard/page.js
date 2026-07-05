import {
  getDashboardMetrics,
  getDashboardTenant,
  listDashboardReports,
} from '../../../lib/tenant_dashboard.js';
import styles from '../admin.module.css';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({ searchParams }) {
  const params = await searchParams;
  const tenant = params?.id ? await getDashboardTenant(params.id) : null;
  const metrics = tenant ? await getDashboardMetrics() : [];
  const reports = tenant ? await listDashboardReports() : [];

  return (
    <main className={styles.adminScreen}>
      <header className={styles.adminHeader}>
        <p className="eyebrow">CM Services</p>
        <h1>Dashboard</h1>
        <p className="subtitle">{tenant?.name || 'Tenant dashboard requerido'}</p>
      </header>

      <section className={styles.adminSummary}>
        <strong>{reports.length}</strong>
        <span>OTs visibles</span>
      </section>

      <section className={styles.viewSwitch}>
        {metrics.map((item) => (
          <span key={item.current_state}>{item.current_state}: {item.count}</span>
        ))}
      </section>
    </main>
  );
}

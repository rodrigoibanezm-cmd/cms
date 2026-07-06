import DashboardCards from '../../components/dashboard/DashboardCards.js';
import { buildDashboardCounts } from '../../lib/dashboard_counts.js';
import { listDashboardReports } from '../../lib/tenant_dashboard.js';
import styles from './dashboard.module.css';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const reports = await listDashboardReports();
  const counts = buildDashboardCounts(reports);

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <p className="eyebrow">CM Services</p>
        <h1>Dashboard operacional</h1>
        <p className="subtitle">Vista general</p>
      </header>

      <DashboardCards counts={counts} />
    </main>
  );
}

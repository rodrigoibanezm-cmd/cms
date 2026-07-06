import DashboardCards from '../../components/dashboard/DashboardCards.js';
import DashboardPanel from '../../components/dashboard/DashboardPanel.js';
import { buildDashboardCounts } from '../../lib/dashboard_counts.js';
import { buildDashboardTimes } from '../../lib/dashboard_times.js';
import { listDashboardReports } from '../../lib/tenant_dashboard.js';
import styles from './dashboard.module.css';

export const dynamic = 'force-dynamic';

function minutesLabel(value) {
  if (value === null || value === undefined) return '-';
  if (value < 60) return `${value} min`;
  return `${Math.round(value / 60)} h`;
}

function topItems(map) {
  return Object.entries(map || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
}

export default async function DashboardPage() {
  const reports = await listDashboardReports();
  const counts = buildDashboardCounts(reports);
  const times = buildDashboardTimes(reports);

  const quality = [
    ['Verde', counts.semaforos.VERDE || 0],
    ['Amarillo', counts.semaforos.AMARILLO || 0],
    ['Rojo', counts.semaforos.ROJO || 0],
    ['Confidence promedio', counts.avgConfidence ? `${counts.avgConfidence}%` : '-'],
  ];

  const timing = [
    ['Espera admin', minutesLabel(times.admin)],
    ['Revisión secretaria', minutesLabel(times.secretary)],
    ['Total hasta aprobación', minutesLabel(times.total)],
    ['OT abierta más antigua', times.oldestOpen?.ot || '-'],
  ];

  const secretaries = topItems(counts.secretaries);

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <p className="eyebrow">CM Services</p>
        <h1>Dashboard operacional</h1>
        <p className="subtitle">Vista general</p>
      </header>

      <DashboardCards counts={counts} />
      <DashboardPanel title="Calidad" items={quality} />
      <DashboardPanel title="Tiempos promedio" items={timing} />
      <DashboardPanel title="Por secretaria" items={secretaries} />
    </main>
  );
}

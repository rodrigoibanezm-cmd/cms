import { headers } from 'next/headers';
import DashboardCards from '../../components/dashboard/DashboardCards.js';
import DashboardPanel from '../../components/dashboard/DashboardPanel.js';
import { buildDashboardCounts } from '../../lib/dashboard_counts.js';
import { buildDashboardTimes } from '../../lib/dashboard_times.js';
import { listDashboardReports } from '../../lib/tenant_dashboard.js';
import { requireRole, requireTenantAccess } from '../../lib/tenant_access.js';
import styles from './dashboard.module.css';

export const dynamic = 'force-dynamic';

const DASHBOARD_ROLES = ['admin', 'super_admin', 'dashboard'];

function minutesLabel(value) {
  if (value === null || value === undefined) return '-';
  if (value < 60) return `${value} min`;
  return `${Math.round(value / 60)} h`;
}

function topItems(map) {
  return Object.entries(map || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
}

function queryString(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null) search.set(key, value);
  }
  return search.toString();
}

async function requestFromPage(params) {
  const qs = queryString(params);
  return { headers: await headers(), url: `http://local/dashboard${qs ? `?${qs}` : ''}` };
}

function panels(counts, times) {
  return {
    quality: [
      ['Verde', counts.semaforos.VERDE || 0],
      ['Amarillo', counts.semaforos.AMARILLO || 0],
      ['Rojo', counts.semaforos.ROJO || 0],
      ['Confidence promedio', counts.avgConfidence ? `${counts.avgConfidence}%` : '-'],
    ],
    timing: [
      ['Espera admin', minutesLabel(times.admin)],
      ['Revisión secretaria', minutesLabel(times.secretary)],
      ['Total hasta aprobación', minutesLabel(times.total)],
      ['OT abierta más antigua', times.oldestOpen?.ot || '-'],
    ],
  };
}

export default async function DashboardPage({ searchParams }) {
  const params = await searchParams;
  const request = await requestFromPage(params);
  const access = requireRole(await requireTenantAccess(request), DASHBOARD_ROLES);
  const reports = await listDashboardReports(access.tenantId);
  const counts = buildDashboardCounts(reports);
  const times = buildDashboardTimes(reports);
  const data = panels(counts, times);

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <p className="eyebrow">CM Services</p>
        <h1>Dashboard operacional</h1>
        <p className="subtitle">Vista general</p>
      </header>

      <DashboardCards counts={counts} />
      <DashboardPanel title="Calidad" items={data.quality} />
      <DashboardPanel title="Tiempos promedio" items={data.timing} />
      <DashboardPanel title="Por secretaria" items={topItems(counts.secretaries)} />
    </main>
  );
}

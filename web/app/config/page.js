import { headers } from 'next/headers';
import OperationMenu from '../../components/admin/OperationMenu.js';
import { listTenants } from '../../lib/tenant_store.js';
import { requireRole, requireTenantAccess } from '../../lib/tenant_access.js';
import { linkableTenantTokens, tokenLinkForRole } from '../../lib/tenant_tokens.js';
import ConfigUsersPanel from './ConfigUsersPanel.js';
import styles from './config.module.css';

export const dynamic = 'force-dynamic';

function Stat({ label, value }) {
  return <div className={styles.card}><strong>{value}</strong><span>{label}</span></div>;
}

function queryString(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null) search.set(key, value);
  }
  return search.toString();
}

async function requireConfigAccess(params) {
  const qs = queryString(params);
  const request = { headers: await headers(), url: `http://local/config${qs ? `?${qs}` : ''}` };
  return requireRole(await requireTenantAccess(request), ['super_admin']);
}

function configAction(params) {
  const qs = queryString(params);
  return `/api/config/users${qs ? `?${qs}` : ''}`;
}

function baseUrl(headerList) {
  const proto = headerList.get('x-forwarded-proto') || 'https';
  const host = headerList.get('x-forwarded-host') || headerList.get('host') || '';
  return host ? `${proto}://${host}` : '';
}

function userLinks(tokens, base) {
  return Object.fromEntries(tokens.map((row) => {
    const path = tokenLinkForRole(row.role, row.token_plain);
    return [row.user_id, `${base}${path}`];
  }));
}

export default async function ConfigPage({ searchParams }) {
  const params = await searchParams;
  const headerList = await headers();
  await requireConfigAccess(params);
  const users = await listTenants({ activeOnly: false });
  const links = userLinks(await linkableTenantTokens(), baseUrl(headerList));
  const administrative = users.filter((user) => user.mode === 'secretary' && user.active);
  const admins = users.filter((user) => ['admin', 'super_admin'].includes(user.mode));

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <OperationMenu active="config" />
          <div><small className={styles.tenant}>CM Services</small><h1>Configuración</h1><p>Parámetros mínimos del flujo operativo</p></div>
        </div>
      </header>

      <section className={styles.grid}>
        <Stat label="Usuarios configurados" value={users.length} />
        <Stat label="Administrativas asignables" value={administrative.length} />
        <Stat label="Admins operación" value={admins.length} />
      </section>

      <ConfigUsersPanel users={users} action={configAction(params)} userLinks={links} />
    </main>
  );
}

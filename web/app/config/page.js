import { headers } from 'next/headers';
import OperationMenu from '../../components/admin/OperationMenu.js';
import { listTenants } from '../../lib/tenant_store.js';
import { requireRole, requireTenantAccess } from '../../lib/tenant_access.js';
import styles from './config.module.css';

export const dynamic = 'force-dynamic';

const roles = [
  ['secretary', 'Administrativa'],
  ['admin', 'Operación'],
  ['dashboard', 'Dashboard'],
  ['super_admin', 'Super admin'],
];

function roleLabel(mode) {
  return roles.find(([key]) => key === mode)?.[1] || mode;
}

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

function CreateUserForm({ action }) {
  return (
    <form className={styles.form} action={action} method="post">
      <input type="hidden" name="intent" value="create_user" />
      <input name="name" placeholder="Nombre" required />
      <input name="email" placeholder="Email" type="email" />
      <select name="mode" defaultValue="secretary">
        {roles.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select>
      <button type="submit">Crear</button>
    </form>
  );
}

function UserActions({ user, action }) {
  const nextActive = user.active ? 'false' : 'true';
  return (
    <div className={styles.row}>
      <form action={action} method="post">
        <input type="hidden" name="intent" value="set_active" />
        <input type="hidden" name="user_id" value={user.id} />
        <input type="hidden" name="active" value={nextActive} />
        <button type="submit">{user.active ? 'Desactivar' : 'Activar'}</button>
      </form>
      <form action={action} method="post">
        <input type="hidden" name="intent" value="remove_user" />
        <input type="hidden" name="user_id" value={user.id} />
        <button className={styles.secondary} type="submit">Borrar</button>
      </form>
    </div>
  );
}

function UserRow({ user, action }) {
  return (
    <tr>
      <td><strong>{user.name}</strong><br /><span className={styles.muted}>{user.email || '-'}</span></td>
      <td><span className={styles.badge}>{roleLabel(user.mode)}</span></td>
      <td>{user.active ? 'Activo' : 'Inactivo'}</td>
      <td><UserActions user={user} action={action} /></td>
    </tr>
  );
}

export default async function ConfigPage({ searchParams }) {
  const params = await searchParams;
  await requireConfigAccess(params);
  const users = await listTenants({ activeOnly: false });
  const administrative = users.filter((user) => user.mode === 'secretary' && user.active);
  const admins = users.filter((user) => ['admin', 'super_admin'].includes(user.mode));
  const action = configAction(params);

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

      <section className={styles.panel}>
        <h2>Usuarios operativos</h2>
        <CreateUserForm action={action} />
        <table className={styles.table}>
          <thead><tr><th>Usuario</th><th>Rol</th><th>Estado</th><th>Acción</th></tr></thead>
          <tbody>{users.map((user) => <UserRow key={user.id} user={user} action={action} />)}</tbody>
        </table>
      </section>
    </main>
  );
}

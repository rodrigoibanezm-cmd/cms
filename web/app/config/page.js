import OperationMenu from '../../components/admin/OperationMenu.js';
import { listTenants } from '../../lib/tenant_store.js';
import styles from './config.module.css';

export const dynamic = 'force-dynamic';

const roles = [
  ['secretary', 'Secretaria'],
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

function CreateUserForm() {
  return (
    <form className={styles.form} action="/api/config/users" method="post">
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

function UserRow({ user }) {
  const nextActive = user.active ? 'false' : 'true';
  return (
    <tr>
      <td><strong>{user.name}</strong><br /><span className={styles.muted}>{user.email || '-'}</span></td>
      <td><span className={styles.badge}>{roleLabel(user.mode)}</span></td>
      <td>{user.active ? 'Activo' : 'Inactivo'}</td>
      <td>
        <form className={styles.row} action="/api/config/users" method="post">
          <input type="hidden" name="intent" value="set_active" />
          <input type="hidden" name="user_id" value={user.id} />
          <input type="hidden" name="active" value={nextActive} />
          <button type="submit">{user.active ? 'Desactivar' : 'Activar'}</button>
        </form>
      </td>
    </tr>
  );
}

export default async function ConfigPage() {
  const users = await listTenants({ activeOnly: false });
  const secretaries = users.filter((user) => user.mode === 'secretary' && user.active);
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
        <Stat label="Secretarias asignables" value={secretaries.length} />
        <Stat label="Admins operación" value={admins.length} />
      </section>

      <section className={styles.panel}>
        <h2>Usuarios operativos</h2>
        <CreateUserForm />
        <table className={styles.table}>
          <thead><tr><th>Usuario</th><th>Rol</th><th>Estado</th><th>Acción</th></tr></thead>
          <tbody>{users.map((user) => <UserRow key={user.id} user={user} />)}</tbody>
        </table>
      </section>

      <section className={styles.panel}>
        <h2>V1 congelado</h2>
        <p className={styles.muted}>SLA, templates, tenant y mantenimiento quedan visibles como alcance de Config V1, pero sin edición fina todavía.</p>
      </section>
    </main>
  );
}

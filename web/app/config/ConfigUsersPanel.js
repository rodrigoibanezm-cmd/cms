import styles from './config.module.css';

const roles = [
  ['secretary', 'Administrativa'],
  ['admin', 'Operación'],
  ['dashboard', 'Dashboard'],
  ['super_admin', 'Super admin'],
];

function roleLabel(mode) {
  return roles.find(([key]) => key === mode)?.[1] || mode;
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

function UserLink({ user, action, issuedLink }) {
  const isIssued = issuedLink?.userId === user.id;
  return (
    <div className={styles.linkCell}>
      <form action={action} method="post">
        <input type="hidden" name="intent" value="issue_link" />
        <input type="hidden" name="user_id" value={user.id} />
        <button className={styles.secondary} type="submit">Copiar link</button>
      </form>
      {isIssued && <input readOnly value={issuedLink.url} />}
      {isIssued && <span className={styles.muted}>Copiar y pegar. No se vuelve a mostrar.</span>}
    </div>
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

function UserRow({ user, action, issuedLink }) {
  return (
    <tr>
      <td><strong>{user.name}</strong><br /><span className={styles.muted}>{user.email || '-'}</span></td>
      <td><span className={styles.badge}>{roleLabel(user.mode)}</span></td>
      <td>{user.active ? 'Activo' : 'Inactivo'}</td>
      <td><UserLink user={user} action={action} issuedLink={issuedLink} /></td>
      <td><UserActions user={user} action={action} /></td>
    </tr>
  );
}

export default function ConfigUsersPanel({ users, action, issuedLink }) {
  return (
    <section className={styles.panel}>
      <h2>Usuarios operativos</h2>
      <CreateUserForm action={action} />
      <table className={styles.table}>
        <thead><tr><th>Usuario</th><th>Rol</th><th>Estado</th><th>Link</th><th>Acción</th></tr></thead>
        <tbody>{users.map((user) => <UserRow key={user.id} user={user} action={action} issuedLink={issuedLink} />)}</tbody>
      </table>
    </section>
  );
}

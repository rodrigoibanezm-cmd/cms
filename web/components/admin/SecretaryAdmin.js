import styles from '../../app/admin/secretaryAdmin.module.css';

function tenantHref(tenant) {
  if (tenant.mode === 'secretary') return `/admin/secretary?id=${tenant.id}`;
  if (tenant.mode === 'dashboard') return `/admin/dashboard?id=${tenant.id}`;
  return '/admin';
}

export default function SecretaryAdmin({ secretaries }) {
  return (
    <section className={styles.panel}>
      <h2>Tenants</h2>
      <form className={styles.form} action="/api/admin/secretaries" method="post">
        <input type="hidden" name="return_to" value="/admin" />
        <input name="name" placeholder="Nombre" required />
        <select name="mode" defaultValue="secretary">
          <option value="admin">Admin</option>
          <option value="secretary">Secretaria</option>
          <option value="dashboard">Dashboard</option>
        </select>
        <button type="submit">Agregar</button>
      </form>
      <div className={styles.list}>
        {secretaries.map((tenant) => (
          <div className={styles.row} key={tenant.id}>
            <a href={tenantHref(tenant)}>{tenant.name} · {tenant.mode}</a>
            <form action="/api/admin/secretaries" method="post">
              <input type="hidden" name="return_to" value="/admin" />
              <input type="hidden" name="action" value="deactivate" />
              <input type="hidden" name="id" value={tenant.id} />
              <button type="submit">Sacar</button>
            </form>
          </div>
        ))}
      </div>
    </section>
  );
}

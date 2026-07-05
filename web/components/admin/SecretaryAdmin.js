import styles from '../../app/admin/secretaryAdmin.module.css';

export default function SecretaryAdmin({ secretaries }) {
  return (
    <section className={styles.panel}>
      <h2>Secretarias</h2>
      <form className={styles.form} action="/api/admin/secretaries" method="post">
        <input type="hidden" name="return_to" value="/admin" />
        <input name="name" placeholder="Nombre" required />
        <input name="email" placeholder="Email opcional" type="email" />
        <button type="submit">Agregar</button>
      </form>
      <div className={styles.list}>
        {secretaries.map((secretary) => (
          <div className={styles.row} key={secretary.id}>
            <span>{secretary.name}</span>
            <form action="/api/admin/secretaries" method="post">
              <input type="hidden" name="return_to" value="/admin" />
              <input type="hidden" name="action" value="deactivate" />
              <input type="hidden" name="id" value={secretary.id} />
              <button type="submit">Sacar</button>
            </form>
          </div>
        ))}
      </div>
    </section>
  );
}

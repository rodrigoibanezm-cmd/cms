import { withToken } from '../admin_v2_url_helpers.js';
import styles from '../../../app/admin-v2/header.module.css';

export default function Menu({ capabilities, token }) {
  return (
    <details className={styles.menu}>
      <summary aria-label="Abrir menú">☰</summary>
      <nav>
        {capabilities.showDashboard
          ? <a href={withToken('/dashboard', token)}>Dashboard</a>
          : null}
        <a className={styles.active} href={withToken('/admin-v2', token)}>Operación</a>
        {capabilities.showConfig
          ? <a href={withToken('/config', token)}>Configuración</a>
          : null}
        <a href="/">Salir</a>
      </nav>
    </details>
  );
}

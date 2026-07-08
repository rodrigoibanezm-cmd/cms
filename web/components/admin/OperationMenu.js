import styles from '../../app/admin/operationHeader.module.css';

function linkClass(active, key) {
  return active === key ? styles.active : undefined;
}

function withToken(path, token) {
  return token ? `${path}?token=${encodeURIComponent(token)}` : path;
}

export default function OperationMenu({ active = 'operation', token = '' }) {
  return (
    <details className={styles.menu}>
      <summary aria-label="Abrir menú">☰</summary>
      <nav className={styles.menuPanel}>
        <a className={linkClass(active, 'dashboard')} href={withToken('/dashboard', token)}>Dashboard</a>
        <a className={linkClass(active, 'operation')} href={withToken('/admin', token)}>Operación</a>
        <a className={linkClass(active, 'config')} href={withToken('/config', token)}>Configuración</a>
        <a href="/">Salir</a>
      </nav>
    </details>
  );
}

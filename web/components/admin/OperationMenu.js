import styles from '../../app/admin/operationHeader.module.css';

function linkClass(active, key) {
  return active === key ? styles.active : undefined;
}

export default function OperationMenu({ active = 'operation' }) {
  return (
    <details className={styles.menu}>
      <summary aria-label="Abrir menú">☰</summary>
      <nav className={styles.menuPanel}>
        <a className={linkClass(active, 'dashboard')} href="/dashboard">Dashboard</a>
        <a className={linkClass(active, 'operation')} href="/admin">Operación</a>
        <a className={linkClass(active, 'config')} href="/config">Configuración</a>
        <a href="/">Salir</a>
      </nav>
    </details>
  );
}

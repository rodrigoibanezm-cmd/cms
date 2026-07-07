import styles from '../../app/admin/operationHeader.module.css';

export default function OperationMenu() {
  return (
    <details className={styles.menu}>
      <summary aria-label="Abrir menú">☰</summary>
      <nav className={styles.menuPanel}>
        <a href="/dashboard">Dashboard</a>
        <a className={styles.active} href="/admin">Operación</a>
        <a href="/admin?view=config">Configuración</a>
        <a href="/">Cerrar sesión</a>
      </nav>
    </details>
  );
}
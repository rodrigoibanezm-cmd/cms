import OperationMenu from './OperationMenu.js';
import OperationSearch from './OperationSearch.js';
import styles from '../../app/admin/operationHeader.module.css';

export default function OperationHeader({ filters, label }) {
  const shown = label || { initials: '-', name: 'Usuario', role: 'Rol' };
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <OperationMenu token={filters.token} />
        <div>
          <small className={styles.tenant}>CM Services</small>
          <h1>Operación</h1>
          <p>Bandeja de trabajo del supervisor</p>
        </div>
      </div>
      <OperationSearch filters={filters} />
      <div className={styles.userBox}>
        <span className={styles.avatar}>{shown.initials}</span>
        <div>
          <strong>{shown.name}</strong>
          <small>{shown.role}</small>
        </div>
      </div>
    </header>
  );
}

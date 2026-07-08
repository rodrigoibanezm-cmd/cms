import OperationMenu from './OperationMenu.js';
import OperationSearch from './OperationSearch.js';
import styles from '../../app/admin/operationHeader.module.css';

export default function OperationHeader({
  filters,
  label,
  title = 'Operación',
  subtitle = 'Bandeja de trabajo del supervisor',
  searchAction = '/admin',
}) {
  const shown = label || { initials: '-', name: 'Usuario', role: 'Rol' };
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <OperationMenu token={filters.token} />
        <div>
          <small className={styles.tenant}>CM Services</small>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
      <OperationSearch filters={filters} action={searchAction} />
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

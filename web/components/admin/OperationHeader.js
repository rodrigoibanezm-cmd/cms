import OperationMenu from './OperationMenu.js';
import OperationSearch from './OperationSearch.js';
import styles from '../../app/admin/operationHeader.module.css';

export default function OperationHeader({ filters }) {
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
        <span className={styles.bell}>🔔</span>
        <span className={styles.avatar}>JR</span>
        <div>
          <strong>Juan Rodríguez</strong>
          <small>Administrador</small>
        </div>
        <span className={styles.gear}>⚙</span>
      </div>
    </header>
  );
}

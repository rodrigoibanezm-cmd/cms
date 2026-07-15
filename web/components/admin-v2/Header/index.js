import Menu from './Menu.js';
import Search from './Search.js';
import styles from '../../../app/admin-v2/header.module.css';

export default function Header({ capabilities, filters, label }) {
  const shown = label || { initials: '-', name: 'Usuario', role: 'Rol' };
  return (
    <header className={styles.header}>
      <div className={styles.identity}>
        <Menu capabilities={capabilities} token={filters.token} />
        <div>
          <small>CM Services</small>
          <h1>Operación</h1>
          <p>Bandeja de trabajo</p>
        </div>
      </div>
      <Search filters={filters} />
      <div className={styles.user}>
        <span>{shown.initials}</span>
        <div><strong>{shown.name}</strong><small>{shown.role}</small></div>
      </div>
    </header>
  );
}

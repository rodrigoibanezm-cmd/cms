import styles from '../../../app/admin-v2/header.module.css';

export default function Search({ filters }) {
  return (
    <form className={styles.search} action="/admin-v2" method="get">
      {filters.token ? <input type="hidden" name="token" value={filters.token} /> : null}
      <span aria-hidden="true">⌕</span>
      <input
        name="q"
        placeholder="Buscar OT, técnico, cliente, PDF o plantilla"
        defaultValue={filters.q || ''}
      />
      <details>
        <summary>Filtros</summary>
        <select name="state" defaultValue={filters.state || ''}>
          <option value="">Todos los estados</option>
          <option value="admin_queue">Pendientes</option>
          <option value="assigned_to_secretary">Esperando administrativa</option>
          <option value="secretary_review">En revisión</option>
          <option value="secretary_approved">Aprobadas</option>
          <option value="error">Requieren revisión</option>
        </select>
        <button type="submit">Aplicar</button>
      </details>
    </form>
  );
}

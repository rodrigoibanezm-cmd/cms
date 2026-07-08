import styles from '../../app/admin/operationSearch.module.css';

export default function OperationSearch({ filters, action = '/admin' }) {
  return (
    <form className={styles.search} action={action} method="get">
      {filters.token ? <input type="hidden" name="token" value={filters.token} /> : null}
      <input
        name="q"
        placeholder="Buscar OT, técnico, cliente, PDF, plantilla..."
        defaultValue={filters.q || ''}
      />
      <button type="submit" aria-label="Buscar">⌕</button>
      <details className={styles.filters}>
        <summary>Filtros</summary>
        <select name="state" defaultValue={filters.state || ''}>
          <option value="">Todos los estados</option>
          <option value="admin_queue">Pendientes</option>
          <option value="assigned_to_secretary">Esperando secretaria</option>
          <option value="secretary_review">En revisión</option>
          <option value="secretary_approved">Aprobadas</option>
          <option value="error">Requieren revisión</option>
        </select>
      </details>
    </form>
  );
}

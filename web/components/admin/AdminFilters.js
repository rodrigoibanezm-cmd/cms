import styles from '../../app/admin/adminFilters.module.css';

const STATES = [
  ['processing', 'Procesando'],
  ['admin_queue', 'Cola admin'],
  ['assigned_to_secretary', 'Asignada'],
  ['secretary_review', 'En revisión'],
  ['secretary_approved', 'Aprobada'],
  ['closed', 'Cerrada'],
  ['error', 'Error'],
];

export default function AdminFilters({ filters, secretaries, view }) {
  return (
    <form className={styles.filters} action="/admin" method="get">
      <input type="hidden" name="view" value={view} />
      <input name="ot" placeholder="OT" defaultValue={filters.ot || ''} />
      <input name="tech" placeholder="Técnico" defaultValue={filters.tech || ''} />
      <select name="state" defaultValue={filters.state || ''}>
        <option value="">Todos los estados</option>
        {STATES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <select name="tenant_id" defaultValue={filters.tenant_id || ''}>
        <option value="">Todas las administrativas</option>
        {secretaries.map((tenant) => <option key={tenant.id} value={tenant.id}>{tenant.name}</option>)}
      </select>
      <div className={styles.actions}>
        <button type="submit">Filtrar</button>
        <a href={view === 'cards' ? '/admin?view=cards' : '/admin'}>Limpiar</a>
      </div>
    </form>
  );
}

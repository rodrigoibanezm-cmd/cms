import styles from '../../app/dashboard/dashboard.module.css';

export default function DashboardCards({ counts }) {
  const states = counts.states || {};
  const items = [
    ['OTs cargadas', counts.total],
    ['OTs hoy', counts.today],
    ['Cola admin', states.admin_queue || 0],
    ['Asignadas', states.assigned_to_secretary || 0],
    ['Aprobadas', states.secretary_approved || 0],
    ['Errores', states.error || 0],
  ];

  return (
    <section className={styles.grid}>
      {items.map(([label, value]) => (
        <article className={styles.card} key={label}>
          <strong>{value ?? '-'}</strong>
          <span>{label}</span>
        </article>
      ))}
    </section>
  );
}

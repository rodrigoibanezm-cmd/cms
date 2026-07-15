import styles from '../../../app/admin-v2/queue.module.css';

export default function EmptyState() {
  return (
    <section className={styles.empty}>
      <strong>No hay OT para mostrar</strong>
      <span>Prueba cambiando la búsqueda o los filtros.</span>
    </section>
  );
}

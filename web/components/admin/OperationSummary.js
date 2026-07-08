import styles from '../../app/admin/operationSummary.module.css';

function countPending(reports) {
  return reports.filter((report) => !['secretary_approved', 'closed'].includes(report.current_state)).length;
}

function countWaiting(reports) {
  return reports.filter((report) => (
    ['assigned_to_secretary', 'secretary_review'].includes(report.current_state)
  )).length;
}

function countReview(reports) {
  return reports.filter((report) => (
    report.current_state === 'error' || Number(report.confidence_score || 100) < 60
  )).length;
}

export default function OperationSummary({ reports }) {
  const items = [
    ['▣', reports.length, 'OTs totales'],
    ['◷', countPending(reports), 'Pendientes'],
    ['♙', countWaiting(reports), 'Esperando administrativa'],
    ['!', countReview(reports), 'Requieren revisión'],
  ];

  return (
    <section className={styles.summary}>
      {items.map(([icon, value, label]) => (
        <div className={styles.item} key={label}>
          <span>{icon}</span>
          <strong>{value}</strong>
          <small>{label}</small>
        </div>
      ))}
    </section>
  );
}

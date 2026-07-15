import EmptyState from '../EmptyState/index.js';
import QueueRow from '../QueueRow/index.js';
import styles from '../../../app/admin-v2/queue.module.css';

export default function Queue({
  canAssign,
  reports,
  secretaries,
  showPdf,
  token,
}) {
  if (!reports.length) return <EmptyState />;
  return (
    <section className={styles.surface}>
      <table className={styles.table}>
        <thead><tr>
          <th>OT</th><th>Ingreso</th><th>Técnico</th><th>Calidad XLS</th>
          <th>Estado</th><th>Administrativa</th><th>Tiempo</th>
          {showPdf ? <th>PDF</th> : null}<th>Entrada</th>
        </tr></thead>
        <tbody>
          {reports.map((report) => (
            <QueueRow
              canAssign={canAssign}
              key={report.id}
              report={report}
              secretaries={secretaries}
              showPdf={showPdf}
              token={token}
            />
          ))}
        </tbody>
      </table>
    </section>
  );
}

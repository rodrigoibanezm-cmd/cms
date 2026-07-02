import styles from '../../app/admin/adminCards.module.css';
import { reviewLabel, semaforoClass } from './admin_helpers.js';

export default function AdminCards({ reports }) {
  return (
    <div className={styles.adminList}>
      {reports.map((report) => (
        <article className={styles.adminCard} key={report.id}>
          <div className={styles.adminCardTop}>
            <div>
              <p className={styles.adminKicker}>OT</p>
              <h2>{report.ot || '-'}</h2>
            </div>
            <span className={semaforoClass(styles, report.semaforo)}>
              {report.semaforo || 'SIN DATO'}
            </span>
          </div>

          <div className={styles.adminGrid}>
            <div><span>Estado</span><strong>{report.status}</strong></div>
            <div><span>Revisión</span><strong>{reviewLabel(report.review_status)}</strong></div>
            <div><span>Confianza</span><strong>{report.confidence_score ?? '-'}</strong></div>
            <div><span>XLS</span><strong>{report.excel_url ? 'Listo' : 'Pendiente'}</strong></div>
          </div>

          <div className={styles.adminActions}>
            <a className={styles.adminButton} href={`/admin/report?id=${report.id}`}>
              Ver revisión
            </a>
            {report.excel_url ? (
              <a className={styles.adminLink} href={report.excel_url} target="_blank">
                Abrir XLS
              </a>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

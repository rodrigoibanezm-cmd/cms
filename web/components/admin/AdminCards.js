import styles from '../../app/admin/adminCards.module.css';
import AssignSecretaryForm from './AssignSecretaryForm.js';
import {
  dateLabel,
  priorityLabel,
  semaforoClass,
  workflowLabel,
} from './admin_helpers.js';

export default function AdminCards({ reports, secretaries }) {
  return (
    <div className={styles.adminList}>
      {reports.map((report) => (
        <article className={styles.adminCard} key={report.id}>
          <div className={styles.adminCardTop}>
            <div>
              <p className={styles.adminKicker}>OT</p>
              <h2>{report.ot || '-'}</h2>
            </div>
            <span className={semaforoClass(styles, report.semaforo)}>{report.semaforo || '-'}</span>
          </div>

          <div className={styles.adminGrid}>
            <div><span>Estado</span><strong>{workflowLabel(report.current_state)}</strong></div>
            <div><span>Fecha</span><strong>{dateLabel(report.updated_at || report.created_at)}</strong></div>
            <div><span>Prioridad</span><strong>{priorityLabel(report.priority)}</strong></div>
            <div><span>Secretaria</span><strong>{report.tenant_name || '-'}</strong></div>
          </div>

          <div className={styles.adminActions}>
            <a className={styles.adminButton} href={`/admin/report?id=${report.id}`}>Revisar</a>
            <AssignSecretaryForm report={report} secretaries={secretaries} returnTo="/admin" />
          </div>
        </article>
      ))}
    </div>
  );
}

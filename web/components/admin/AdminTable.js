import styles from '../../app/admin/adminTable.module.css';
import AssignSecretaryForm from './AssignSecretaryForm.js';
import { reviewLabel, semaforoClass, workflowLabel } from './admin_helpers.js';

export default function AdminTable({ reports, secretaries }) {
  return (
    <div className={styles.adminTableWrap}>
      <table className={styles.adminTable}>
        <thead>
          <tr>
            <th>OT</th>
            <th>Semáforo</th>
            <th>Workflow</th>
            <th>Dueño</th>
            <th>Revisión</th>
            <th>XLS</th>
            <th>Asignar</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td><strong>{report.ot || '-'}</strong></td>
              <td>
                <span className={semaforoClass(styles, report.semaforo)}>
                  {report.semaforo || '-'}
                </span>
              </td>
              <td>{workflowLabel(report.current_state)}</td>
              <td>{report.current_owner_name || report.current_owner_type}</td>
              <td>{reviewLabel(report.review_status)}</td>
              <td>{report.excel_url ? 'Listo' : 'Pendiente'}</td>
              <td>
                <AssignSecretaryForm report={report} secretaries={secretaries} returnTo="/admin?view=table" />
              </td>
              <td className={styles.tableActions}>
                <a href={`/admin/report?id=${report.id}`}>Revisar</a>
                {report.excel_url ? <a href={report.excel_url} target="_blank">XLS</a> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

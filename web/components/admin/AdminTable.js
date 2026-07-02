import styles from '../../app/admin/adminTable.module.css';
import { reviewLabel, semaforoClass } from './admin_helpers.js';

export default function AdminTable({ reports }) {
  return (
    <div className={styles.adminTableWrap}>
      <table className={styles.adminTable}>
        <thead>
          <tr>
            <th>OT</th>
            <th>Semáforo</th>
            <th>Estado</th>
            <th>Revisión</th>
            <th>Conf.</th>
            <th>XLS</th>
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
              <td>{report.status}</td>
              <td>{reviewLabel(report.review_status)}</td>
              <td>{report.confidence_score ?? '-'}</td>
              <td>{report.excel_url ? 'Listo' : 'Pendiente'}</td>
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

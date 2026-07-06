import styles from '../../app/admin/adminTable.module.css';
import AssignSecretaryForm from './AssignSecretaryForm.js';
import {
  dateLabel,
  pdfReady,
  priorityLabel,
  workflowLabel,
} from './admin_helpers.js';

function SecretaryCell({ report, secretaries, editable }) {
  if (!editable) return report.tenant_name || '-';
  return <AssignSecretaryForm report={report} secretaries={secretaries} returnTo="/admin?view=table" />;
}

function PdfAction({ report }) {
  if (pdfReady(report)) return <a href={`/api/admin/reports/${report.id}/pdf`}>PDF</a>;
  return <span className={styles.disabled}>PDF</span>;
}

export default function AdminTable({ reports, secretaries, editableSecretary = true }) {
  return (
    <div className={styles.adminTableWrap}>
      <table className={styles.adminTable}>
        <thead>
          <tr>
            <th>OT</th>
            <th>Estado</th>
            <th>Técnico</th>
            <th>Fecha</th>
            <th>Prioridad</th>
            <th>Administrativa</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td><strong>{report.ot || '-'}</strong></td>
              <td>{workflowLabel(report.current_state)}</td>
              <td>{report.technician_name || '-'}</td>
              <td>{dateLabel(report.updated_at || report.created_at)}</td>
              <td>{priorityLabel(report.priority)}</td>
              <td><SecretaryCell report={report} secretaries={secretaries} editable={editableSecretary} /></td>
              <td className={styles.tableActions}>
                <a href={`/admin/report?id=${report.id}`}>Revisar</a>
                <PdfAction report={report} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

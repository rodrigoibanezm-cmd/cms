import styles from '../../app/admin/adminTable.module.css';
import AssignSecretaryForm from './AssignSecretaryForm.js';
import {
  dateLabel,
  pdfReady,
  priorityLabel,
  semaforoClass,
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

function ApproveAction({ report, enabled, returnTo }) {
  if (!enabled || report.current_state !== 'assigned_to_secretary') return null;
  return (
    <form action={`/api/secretary/reports/${report.id}/approve`} method="post">
      <input type="hidden" name="secretary_id" value={report.tenant_id || report.current_owner_id || ''} />
      <input type="hidden" name="return_to" value={returnTo} />
      <button type="submit">Aprobar OT</button>
    </form>
  );
}

export default function AdminTable({
  reports,
  secretaries,
  editableSecretary = true,
  approveEnabled = false,
  returnTo = '/admin?view=table',
}) {
  return (
    <div className={styles.adminTableWrap}>
      <table className={styles.adminTable}>
        <thead>
          <tr>
            <th>OT</th>
            <th>Estado</th>
            <th>Semáforo</th>
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
              <td><span className={semaforoClass(styles, report.semaforo)}>{report.semaforo || '-'}</span></td>
              <td>{dateLabel(report.updated_at || report.created_at)}</td>
              <td>{priorityLabel(report.priority)}</td>
              <td><SecretaryCell report={report} secretaries={secretaries} editable={editableSecretary} /></td>
              <td className={styles.tableActions}>
                <a href={`/admin/report?id=${report.id}`}>Revisar</a>
                <PdfAction report={report} />
                <ApproveAction report={report} enabled={approveEnabled} returnTo={returnTo} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
